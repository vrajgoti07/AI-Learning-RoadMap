from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import List
from bson import ObjectId
from datetime import datetime
from app.schemas.user import UserResponse
from app.core.deps import get_current_admin
from app.database.connection import users_collection, roadmaps_collection
from app.services.activity_log_service import activity_logs_collection
from app.schemas.activity_log import ActivityLogResponse
from app.services.email import send_newsletter_bulk, send_ban_email, send_unban_email
from app.services.notification_service import create_notification

class NewsletterBlastRequest(BaseModel):
    subject: str
    content: str

router = APIRouter(prefix="/admin", tags=["Admin"])
users_router = APIRouter(prefix="/users", tags=["Admin User Management"])

# Admin Analytics
@router.get("/stats")
async def get_admin_stats(current_admin: dict = Depends(get_current_admin)):
    total_users = await users_collection.count_documents({})
    total_roadmaps = await roadmaps_collection.count_documents({})
    pro_users = await users_collection.count_documents({"plan": {"$in": ["PRO", "PLUS", "PRO PLUS"]}})
    
    return {
        "total_users": total_users,
        "total_roadmaps": total_roadmaps,
        "premium_users": pro_users
    }

@router.get("/plan-distribution")
async def get_plan_distribution(current_admin: dict = Depends(get_current_admin)):
    pipeline = [
        {"$group": {"_id": "$plan", "count": {"$sum": 1}}}
    ]
    distribution = await users_collection.aggregate(pipeline).to_list(length=None)
    return [{"plan": d["_id"], "count": d["count"]} for d in distribution]

@router.get("/roadmap-trends")
async def get_roadmap_trends(current_admin: dict = Depends(get_current_admin)):
    # Simplified aggregate for the example
    pipeline = [
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}},
        {"$limit": 7}
    ]
    trends = await roadmaps_collection.aggregate(pipeline).to_list(length=None)
    return [{"date": d["_id"], "count": d["count"]} for d in trends]

@router.get("/recent-activity")
async def get_recent_activity(current_admin: dict = Depends(get_current_admin)):
    recent_users = await users_collection.find().sort("created_at", -1).limit(5).to_list(length=None)
    recent_roadmaps = await roadmaps_collection.find().sort("created_at", -1).limit(5).to_list(length=None)
    
    activity = []
    
    for u in recent_users:
        if "created_at" in u and u["created_at"]:
            activity.append({
                "id": f"u_{u['_id']}",
                "user": u.get("name", u.get("email")),
                "action": "Joined Application",
                "date": u["created_at"].strftime("%Y-%m-%d %H:%M"),
                "status": "success",
                "timestamp": u["created_at"].timestamp()
            })
            
    for r in recent_roadmaps:
        if "created_at" in r and r["created_at"]:
            user = await users_collection.find_one({"_id": r.get("user_id")})
            username = user.get("name") if user else "A User"
            action_text = f"Generated {r.get('topic', 'AI')} Path"
            
            activity.append({
                "id": f"r_{r['_id']}",
                "user": username,
                "action": action_text[:30] + "..." if len(action_text) > 30 else action_text,
                "date": r["created_at"].strftime("%Y-%m-%d %H:%M"),
                "status": "info",
                "timestamp": r["created_at"].timestamp()
            })
            
    activity.sort(key=lambda x: x["timestamp"], reverse=True)
    return activity[:5]

@router.get("/activity-logs", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    limit: int = 50, 
    current_admin: dict = Depends(get_current_admin)
):
    cursor = activity_logs_collection.find().sort("created_at", -1).limit(limit)
    logs = await cursor.to_list(length=None)
    for log in logs:
        log["id"] = str(log["_id"])
    return logs

# User Management (Admin Only)
@users_router.get("", response_model=List[UserResponse])
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    cursor = users_collection.find().limit(100)
    users = await cursor.to_list(length=None)
    for user in users:
        user["_id"] = str(user["_id"])
    return users

@users_router.put("/{id}/promote")
async def promote_user(id: str, background_tasks: BackgroundTasks, current_admin: dict = Depends(get_current_admin)):
    try:
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        await users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": "ADMIN"}}
        )
        
        # Trigger notification
        await create_notification(
            user_id=id,
            message="Your account has been promoted to Admin!",
            type="crown"
        )
        
        return {"status": "success", "message": "User promoted to admin"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail="Invalid user ID or update failed")

@users_router.put("/{id}/demote")
async def demote_user(id: str, background_tasks: BackgroundTasks, current_admin: dict = Depends(get_current_admin)):
    try:
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": "USER"}}
        )
        # Trigger notification
        await create_notification(
            user_id=id,
            message="Your admin privileges have been revoked.",
            type="alert"
        )
        return {"status": "success", "message": "Admin privileges revoked"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail="Invalid user ID or update failed")

@users_router.put("/{id}/ban")
async def ban_user(id: str, background_tasks: BackgroundTasks, current_admin: dict = Depends(get_current_admin)):
    try:
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        await users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": "BANNED"}}
        )
        
        # Trigger notification
        await create_notification(
            user_id=id,
            message="Your account has been suspended for violating terms.",
            type="alert"
        )
        
        # Send notification email
        background_tasks.add_task(send_ban_email, user["email"], user.get("name", user["email"]))
        
        return {"status": "success", "message": "User has been banned"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail="Invalid user ID or update failed")

@users_router.put("/{id}/unban")
async def unban_user(id: str, background_tasks: BackgroundTasks, current_admin: dict = Depends(get_current_admin)):
    try:
        user = await users_collection.find_one({"_id": ObjectId(id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": "USER"}}
        )

        # Trigger notification
        await create_notification(
            user_id=id,
            message="Welcome back! Your account has been reinstated.",
            type="zap"
        )

        # Send notification email
        background_tasks.add_task(send_unban_email, user["email"], user.get("name", user["email"]))

        return {"status": "success", "message": "User has been unbanned"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail="Invalid user ID or update failed")
@router.post("/newsletter/send")
async def send_newsletter_blast(
    request: NewsletterBlastRequest, 
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(get_current_admin)
):
    """
    Triggers a newsletter blast to all subscribers.
    Executed in the background to avoid blocking the request.
    """
    background_tasks.add_task(send_newsletter_bulk, request.subject, request.content)
    
    return {"status": "success", "message": "Newsletter broadcast started in the background."}
