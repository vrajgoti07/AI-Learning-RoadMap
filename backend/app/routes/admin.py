from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from app.schemas.user import UserResponse
from app.core.deps import get_current_admin
from app.database.connection import users_collection, roadmaps_collection

router = APIRouter(prefix="/admin", tags=["Admin"])
users_router = APIRouter(prefix="/users", tags=["Admin User Management"])

# Admin Analytics
@router.get("/stats")
def get_admin_stats(current_admin: dict = Depends(get_current_admin)):
    total_users = users_collection.count_documents({})
    total_roadmaps = roadmaps_collection.count_documents({})
    pro_users = users_collection.count_documents({"plan": {"$in": ["PRO", "PLUS", "PRO PLUS"]}})
    
    return {
        "total_users": total_users,
        "total_roadmaps": total_roadmaps,
        "premium_users": pro_users
    }

@router.get("/plan-distribution")
def get_plan_distribution(current_admin: dict = Depends(get_current_admin)):
    pipeline = [
        {"$group": {"_id": "$plan", "count": {"$sum": 1}}}
    ]
    distribution = list(users_collection.aggregate(pipeline))
    return [{"plan": d["_id"], "count": d["count"]} for d in distribution]

@router.get("/roadmap-trends")
def get_roadmap_trends(current_admin: dict = Depends(get_current_admin)):
    # Simplified aggregate for the example
    pipeline = [
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}},
        {"$limit": 7}
    ]
    trends = list(roadmaps_collection.aggregate(pipeline))
    return [{"date": d["_id"], "count": d["count"]} for d in trends]

@router.get("/recent-activity")
def get_recent_activity(current_admin: dict = Depends(get_current_admin)):
    recent_users = list(users_collection.find().sort("created_at", -1).limit(5))
    recent_roadmaps = list(roadmaps_collection.find().sort("created_at", -1).limit(5))
    
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
            user = users_collection.find_one({"_id": r.get("user_id")})
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

# User Management (Admin Only)
@users_router.get("", response_model=List[UserResponse])
def get_all_users(current_admin: dict = Depends(get_current_admin)):
    cursor = users_collection.find().limit(100)
    users = []
    for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@users_router.put("/{id}/promote")
def promote_user(id: str, current_admin: dict = Depends(get_current_admin)):
    try:
        users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": "ADMIN"}}
        )
        return {"status": "success", "message": "User promoted to ADMIN"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

@users_router.put("/{id}/ban")
def ban_user(id: str, current_admin: dict = Depends(get_current_admin)):
    try:
        users_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": "BANNED"}}
        )
        return {"status": "success", "message": "User has been banned"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
