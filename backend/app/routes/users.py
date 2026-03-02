from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.schemas.user import ThemeUpdateRequest, ChangePasswordRequest, PlanUpgradeRequest
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
