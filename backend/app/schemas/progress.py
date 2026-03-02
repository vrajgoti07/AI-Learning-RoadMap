from pydantic import BaseModel
from typing import Optional

class ProgressUpdate(BaseModel):
    node_id: str
    is_completed: bool
