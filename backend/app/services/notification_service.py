from app.database.connection import notifications_collection
from app.websockets.manager import manager
from datetime import datetime
from bson import ObjectId

async def create_notification(user_id: str, message: str, type: str = "info"):
    """
    Creates a notification in the database and pushes it via WebSocket if the user is online.
    """
    notification_doc = {
        "user_id": user_id if isinstance(user_id, str) else str(user_id),
        "message": message,
        "type": type,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    # 1. Save to MongoDB
    result = await notifications_collection.insert_one(notification_doc)
    notification_doc["_id"] = str(result.inserted_id)
    
    # 2. Push via WebSocket
    await manager.send_personal_message({
        "type": "notification",
        "data": {
            "id": notification_doc["_id"],
            "message": message,
            "notification_type": type,
            "created_at": notification_doc["created_at"].isoformat()
        }
    }, str(user_id))

    return notification_doc
