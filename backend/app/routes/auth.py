import random
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import jwt, JWTError
from bson import ObjectId
from app.core.config import settings
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth_schema import Token, RefreshTokenRequest, OTPVerificationRequest
from app.schemas.user import LoginRequest
from app.core import security, deps
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.deps import get_current_user, get_current_user_object
from app.database.connection import users_collection, redis_client
from app.services.email import send_welcome_email, send_password_reset_email
from app.services.activity_log_service import log_activity
from pydantic import BaseModel

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/auth", tags=["Auth"])

import requests

class GoogleLoginRequest(BaseModel):
    credential: str = None
    access_token: str = None

@router.post("/google", response_model=Token)
async def google_auth(request: GoogleLoginRequest, req: Request, background_tasks: BackgroundTasks):
    try:
        email = None
        name = None

        if request.credential:
            # Verify the ID token from Google
            idinfo = id_token.verify_oauth2_token(
                request.credential, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
        elif request.access_token:
            # Verify Access Token via Google's tokeninfo endpoint
            response = requests.get(
                f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.access_token}"
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google access token")
            
            user_data = response.json()
            email = user_data['email']
            name = user_data.get('name', email.split('@')[0])
        else:
            raise HTTPException(status_code=400, detail="Missing Google credentials")
        
        # Check if user exists
        user = await users_collection.find_one({"email": email})
        
        if not user:
            # Create new user if they don't exist
            new_user = {
                "email": email,
                "name": name,
                "hashed_password": "", # Google users don't have a local password initially
                "role": "USER",
                "plan": "GO",
                "theme_preference": "dark",
                "xp": 0,
                "level": 1,
                "skill_profile": {},
                "weak_topics": [],
                "strong_topics": [],
                "completed_topics": [],
                "learning_streak": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await users_collection.insert_one(new_user)
            user = await users_collection.find_one({"_id": result.inserted_id})

            # Send welcome email for NEW Google users
            background_tasks.add_task(send_welcome_email, email, name)
        
        # Generate our own tokens
        access_token = create_access_token(data={"sub": str(user["_id"])})
        refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

        # Log Login/Signup
        await log_activity(
            user_id=str(user["_id"]),
            action="GOOGLE_AUTH",
            details={"email": email},
            request=req
        )

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    except Exception as e:
        # Invalid token or other error
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}",
        )

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, background_tasks: BackgroundTasks, request: Request):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "email": user.email,
        "name": user.name,
        "hashed_password": get_password_hash(user.password),
        "role": "USER",
        "plan": "GO",
        "theme_preference": "dark",
        "xp": 0,
        "level": 1,
        "skill_profile": {},
        "weak_topics": [],
        "strong_topics": [],
        "completed_topics": [],
        "learning_streak": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(new_user)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, user.email, user.name)

    # Log Signup
    await log_activity(
        user_id=str(created_user["_id"]),
        action="SIGNUP",
        details={"email": user.email},
        request=request
    )
    
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    # Also support JSON login by letting the frontend post as form-data
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    # Log Login
    await log_activity(
        user_id=str(user["_id"]),
        action="LOGIN",
        details={"email": form_data.username},
        request=request
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
async def login_json(request: LoginRequest, req: Request = None): # Renamed request to req to avoid conflict
    user = await users_collection.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    # Log Login
    await log_activity(
        user_id=str(user["_id"]),
        action="LOGIN",
        details={"email": request.email},
        request=req
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: RefreshTokenRequest):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(request.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise credentials_exception
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = await users_collection.find_one({"email": request.email})
    if not user:
        # To prevent email enumeration, return a success response even if not found
        return {"message": "If an account exists with that email, an OTP has been sent."}
        
    # Rate limit check (e.g. 60 seconds)
    last_requested = await redis_client.get(f"otp_cooldown:{request.email}")
    if last_requested:
        raise HTTPException(status_code=429, detail="Please wait before requesting another OTP.")

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP valid for 5 minutes
    await redis_client.setex(f"otp:{request.email}", 300, otp)
    # Set a 60-second cooldown
    await redis_client.setex(f"otp_cooldown:{request.email}", 60, "1")
    
    # Send email
    background_tasks.add_task(send_password_reset_email, request.email, user.get("name", "User"), otp)
    
    return {"message": "If an account exists with that email, an OTP has been sent."}

@router.post("/verify-otp")
async def verify_otp(request: OTPVerificationRequest):
    stored_otp = await redis_client.get(f"otp:{request.email}")
    
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
        
    # OTP is valid, delete it to prevent reuse
    await redis_client.delete(f"otp:{request.email}")
    
    # Generate a temporary reset token valid for 15 minutes
    expires = timedelta(minutes=15)
    reset_token = create_access_token(
        data={"sub": request.email, "type": "reset_password"},
        expires_delta=expires
    )
    
    return {"reset_token": reset_token, "message": "OTP verified successfully. Proceed to reset password."}

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

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    hashed_password = get_password_hash(request.new_password)
    await users_collection.update_one(
        {"email": email},
        {"$set": {
            "hashed_password": hashed_password, 
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_object)):
    return current_user
