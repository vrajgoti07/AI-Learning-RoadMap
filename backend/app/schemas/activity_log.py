from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class ActivityLogBase(BaseModel):
    user_id: str
    action: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogResponse(ActivityLogBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
