from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user_object
from app.services.ai_predict_service import generate_predictions
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI Predictive Engine"])

class AIRecommendationResponse(BaseModel):
    skill_gaps: list[str]
    recommended_topics: list[str]
    reasoning: str

@router.post("/recommend", response_model=AIRecommendationResponse)
async def get_ai_recommendations(current_user: dict = Depends(get_current_user_object)):
    """
    Analyzes user profile and returns recommended learning paths based on weaknesses and current level.
    """
    try:
        current_level = current_user.get("level", 1)
        skill_profile = current_user.get("skill_profile", {})
        weak_topics = current_user.get("weak_topics", [])
        
        # Only pass topics marked as 'advanced' to represent mastered domains
        mastered = {k: v for k, v in skill_profile.items() if v == 'advanced'}
        
        predictions = generate_predictions(mastered, weak_topics, current_level)
        return predictions
    except Exception as e:
        print(f"Failed to generate recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI recommendations.")
