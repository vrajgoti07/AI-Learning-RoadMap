from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime

class RoadmapCreate(BaseModel):
    topic: str

class RoadmapRefineRequest(BaseModel):
    prompt: str

class RoadmapUpdate(BaseModel):
    topic: str | None = None
    is_pinned: bool | None = None
    is_archived: bool | None = None
    is_public: bool | None = None

class RoadmapResponse(RoadmapCreate):
    id: str = Field(alias="_id")
    user_id: str
    roadmap_data: Dict[str, Any]
    completed_nodes: list[str] = []
    is_pinned: bool = False
    is_archived: bool = False
    is_public: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
