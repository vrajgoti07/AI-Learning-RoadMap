from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import jwt, JWTError
from bson import ObjectId
from app.core.config import settings
from bson import ObjectId
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user
from app.database.connection import users_collection
from app.services.email import send_welcome_email, send_password_reset_email
from pydantic import BaseModel

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, background_tasks: BackgroundTasks):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "email": user.email,
        "name": user.name,
        "hashed_password": get_password_hash(user.password),
        "role": "USER",
        "plan": "GO",
        "theme_preference": "dark",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(new_user)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    return created_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Also support JSON login by letting the frontend post as form-data
    user = users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
def login_json(request: LoginRequest):
    user = users_collection.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = users_collection.find_one({"email": request.email})
    if not user:
        # To prevent email enumeration, return a success response even if not found
        return {"message": "If an account exists with that email, a reset link has been sent."}
        
    # Generate a secure reset token valid for 30 minutes
    expires = timedelta(minutes=30)
    reset_token = create_access_token(
        data={"sub": request.email, "type": "reset_password"},
        expires_delta=expires
    )
    
    # Using front-end URL (default vite port 5173 is assumed here, but can come from settings)
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    background_tasks.add_task(send_password_reset_email, request.email, user.get("name", "User"), reset_link)
    
    return {"message": "If an account exists with that email, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "reset_password":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    hashed_password = get_password_hash(request.new_password)
    users_collection.update_one(
        {"email": email},
        {"$set": {
            "hashed_password": hashed_password, 
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
