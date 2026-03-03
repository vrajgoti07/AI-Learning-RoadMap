from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from bson import ObjectId
from datetime import datetime
import os
import shutil
from app.schemas.user import ThemeUpdateRequest, ChangePasswordRequest, PlanUpgradeRequest, ProfileUpdateRequest
from app.core.deps import get_current_user_object
from app.core.security import verify_password, get_password_hash
from app.database.connection import users_collection

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/theme")
async def update_theme(request: ThemeUpdateRequest, current_user: dict = Depends(get_current_user_object)):
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"theme_preference": request.theme, "updated_at": datetime.utcnow()}}
    )
    return {"status": "success", "message": "Theme updated successfully"}

@router.put("/profile")
async def update_profile(request: ProfileUpdateRequest, current_user: dict = Depends(get_current_user_object)):
    update_data = {"updated_at": datetime.utcnow()}
    if request.name is not None:
        update_data["name"] = request.name
    if request.bio is not None:
        update_data["bio"] = request.bio
        
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    return {"status": "success", "message": "Profile updated successfully"}

@router.put("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user_object)):
    if not verify_password(request.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    new_hashed_password = get_password_hash(request.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"hashed_password": new_hashed_password, "updated_at": datetime.utcnow()}}
    )
    return {"status": "success", "message": "Password updated successfully"}

@router.put("/upgrade-plan")
async def upgrade_plan(request: PlanUpgradeRequest, current_user: dict = Depends(get_current_user_object)):
    allowed_plans = ["GO", "PRO", "PLUS", "PRO PLUS"]
    if request.plan not in allowed_plans:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
        
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"plan": request.plan, "updated_at": datetime.utcnow()}}
    )
    return {"status": "success", "message": f"Successfully upgraded to {request.plan} plan"}

@router.post("/profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), current_user: dict = Depends(get_current_user_object)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{current_user['_id']}_{int(datetime.utcnow().timestamp())}.{file_ext}"
    file_path = os.path.join("uploads", "profiles", filename)
    
    # Save file
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user in DB
    pic_url = f"/uploads/profiles/{filename}"
    
    # Delete old profile pic if exists
    if current_user.get("profile_pic"):
        old_path = current_user["profile_pic"].lstrip("/")
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except:
                pass

    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"profile_pic": pic_url, "updated_at": datetime.utcnow()}}
    )
    
    return {"status": "success", "profile_pic": pic_url}

@router.delete("/profile-picture")
async def delete_profile_picture(current_user: dict = Depends(get_current_user_object)):
    if current_user.get("profile_pic"):
        file_path = current_user["profile_pic"].lstrip("/")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
    
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"profile_pic": None, "updated_at": datetime.utcnow()}}
    )
    
    return {"status": "success", "message": "Profile picture removed"}

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user_object)):
    # Delete profile picture if it exists
    if current_user.get("profile_pic"):
        file_path = current_user["profile_pic"].lstrip("/")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
                
    # Delete user from database
    result = await users_collection.delete_one({"_id": ObjectId(current_user["_id"])})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": "Account deleted successfully"}
