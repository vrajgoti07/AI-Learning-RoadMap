from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    role: str
    plan: str
    theme_preference: str
    profile_pic: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ThemeUpdateRequest(BaseModel):
    theme: str

class PlanUpgradeRequest(BaseModel):
    plan: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
