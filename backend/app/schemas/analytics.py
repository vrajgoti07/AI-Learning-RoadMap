from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict

class LearningProgressBase(BaseModel):
    user_id: str
    topic: str
    # Aggregated metrics for this topic
    total_quizzes_taken: int = 0
    total_score: float = 0.0
    average_score: float = 0.0
    time_spent_minutes: int = 0
    nodes_completed: int = 0
    
    last_activity_date: datetime = datetime.utcnow()

class LearningProgressCreate(LearningProgressBase):
    pass

class LearningProgressResponse(LearningProgressBase):
    id: str

    model_config = ConfigDict(populate_by_name=True)

class OverallAnalyticsResponse(BaseModel):
    total_xp: int
    current_level: int
    streak: int
    # Top 3 highest performing topics
    top_skills: list[dict]
    # Top 3 lowest performing topics
    skills_to_improve: list[dict]
    # General progression over time (for charts)
    recent_activity: list[dict]
