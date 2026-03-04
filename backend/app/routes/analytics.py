from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user_object
from app.database.connection import users_collection, learning_progress_collection
from app.schemas.analytics import OverallAnalyticsResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=OverallAnalyticsResponse)
async def get_analytics_dashboard(current_user: dict = Depends(get_current_user_object)):
    user_id = current_user["_id"]
    
    # Generate Top/Weak tools natively from user schema
    skill_profile = current_user.get("skill_profile", {})
    
    # Instead of full aggregations, we'll build a fast summary from the new user schema and learning_progress
    top_skills = [{"topic": k, "level": "advanced"} for k, v in skill_profile.items() if v == "advanced"]
    skills_to_improve = [{"topic": topic, "level": "needs work"} for topic in current_user.get("weak_topics", [])]
    
    # We want to show a 7-day activity graph on the frontend
    # Let's aggregate time/scores from learning_progress for the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # In a full build, this would be a MongoDB aggregation pipeline on `quiz_attempts` or `activity_logs`.
    # For now, we return a mock recent activity structure matching Recharts expectations.
    recent_activity = [
         {"day": (datetime.utcnow() - timedelta(days=i)).strftime("%a"), "xp": current_user.get("xp", 0) // 7 + (i*5)}
         for i in range(6, -1, -1)
    ]

    return {
        "total_xp": current_user.get("xp", 0),
        "current_level": current_user.get("level", 1),
        "streak": current_user.get("learning_streak", 0),
        "top_skills": top_skills,
        "skills_to_improve": skills_to_improve,
        "recent_activity": recent_activity
    }
