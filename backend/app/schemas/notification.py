from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str = Field(alias="_id")
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        populate_by_name = True
