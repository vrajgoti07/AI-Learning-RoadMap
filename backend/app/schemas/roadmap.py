from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime

class RoadmapCreate(BaseModel):
    topic: str

class RoadmapResponse(RoadmapCreate):
    id: str = Field(alias="_id")
    user_id: str
    roadmap_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
