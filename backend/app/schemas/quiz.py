from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QuestionResult(BaseModel):
    question: str
    selected_answer: str
    correct_answer: str
    is_correct: bool

class QuizSubmitRequest(BaseModel):
    roadmap_id: str
    topic: str
    node_id: str
    questions: List[QuestionResult]

class QuizAttemptResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    roadmap_id: str
    topic: str
    node_id: str
    questions: List[QuestionResult]
    score: float
    xp_gained: int
    attempted_at: datetime
    
    class Config:
        populate_by_name = True
