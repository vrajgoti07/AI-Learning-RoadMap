from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user_object
from app.database.connection import db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/activity", tags=["Activity"])
activity_logs_collection = db.activity_logs

@router.get("/")
async def get_activity_logs(current_user: dict = Depends(get_current_user_object)):
    """
    Fetch activity logs for the current user.
    """
    try:
        # Fetch logs and sort by newest first
        cursor = activity_logs_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", -1).limit(50)
        logs = await cursor.to_list(length=50)
        
        # Format logs for frontend
        for log in logs:
            log["_id"] = str(log["_id"])
            if "created_at" in log:
                log["created_at"] = log["created_at"].isoformat()
                
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity logs: {str(e)}")
