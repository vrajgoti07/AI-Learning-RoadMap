from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from app.schemas.notification import NotificationResponse
from app.core.deps import get_current_user
from app.database.connection import notifications_collection

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(current_user: dict = Depends(get_current_user)):
    cursor = notifications_collection.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.put("/{id}/read")
def mark_as_read(id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = notifications_collection.update_one(
            {"_id": ObjectId(id), "user_id": current_user["_id"]},
            {"$set": {"is_read": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"status": "success", "message": "Notification marked as read"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Notification ID")
