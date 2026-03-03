from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from app.schemas.notification import NotificationResponse
from app.core.deps import get_current_user_object
from app.database.connection import notifications_collection

from app.services.notification_service import create_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/test")
async def send_test_notification(current_user: dict = Depends(get_current_user_object)):
    """
    Endpoint for testing real-time WebSockets.
    """
    await create_notification(
        user_id=current_user["_id"],
        message="This is a real-time test notification!",
        type="zap"
    )
    return {"status": "success", "message": "Test notification sent via WebSocket"}

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(current_user: dict = Depends(get_current_user_object)):
    cursor = notifications_collection.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    results = await cursor.to_list(length=None)
    for doc in results:
        doc["_id"] = str(doc["_id"])
    return results

@router.put("/{id}/read")
async def mark_as_read(id: str, current_user: dict = Depends(get_current_user_object)):
    try:
        result = await notifications_collection.update_one(
            {"_id": ObjectId(id), "user_id": current_user["_id"]},
            {"$set": {"is_read": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"status": "success", "message": "Notification marked as read"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Notification ID")
@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user_object)):
    await notifications_collection.update_many(
        {"user_id": current_user["_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"status": "success", "message": "All notifications marked as read"}
