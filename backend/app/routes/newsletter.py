from fastapi import APIRouter, HTTPException, status
from app.schemas.newsletter import NewsletterCreate
from app.database.connection import newsletters_collection
from datetime import datetime

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

@router.post("/subscribe")
async def subscribe_to_newsletter(newsletter: NewsletterCreate):
    # Check if already subscribed
    existing = await newsletters_collection.find_one({"email": newsletter.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already subscribed to our newsletter."
        )
    
    # Store subscription
    new_subscription = {
        "email": newsletter.email,
        "subscribed_at": datetime.utcnow()
    }
    
    await newsletters_collection.insert_one(new_subscription)
    
    return {"message": "Successfully subscribed to the newsletter!"}
