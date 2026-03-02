from app.database.connection import db
from app.schemas.activity_log import ActivityLogCreate
from datetime import datetime
from fastapi import Request

activity_logs_collection = db.activity_logs

async def log_activity(
    user_id: str, 
    action: str, 
    details: dict = None, 
    request: Request = None
):
    """
    Logs a user activity to the database.
    """
    log_data = {
        "user_id": str(user_id),
        "action": action,
        "details": details or {},
        "created_at": datetime.utcnow()
    }

    if request:
        log_data["ip_address"] = request.client.host
        log_data["user_agent"] = request.headers.get("user-agent")

    await activity_logs_collection.insert_one(log_data)
    return True
