from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.subscription import CreateOrderRequest, OrderResponse, VerifyPaymentRequest
from app.services.activity_log_service import log_activity
from app.core.deps import get_current_user_object
from app.database.connection import users_collection
from app.core.config import settings
import razorpay
import hmac
import hashlib
from datetime import datetime

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@router.post("/create-order", response_model=OrderResponse)
async def create_order(request: CreateOrderRequest, current_user: dict = Depends(get_current_user_object)):
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Razorpay credentials not configured on the server."
        )

    try:
        # Create Razorpay Order
        order_data = {
            "amount": request.amount * 100, # Razorpay expects amount in paise
            "currency": request.currency,
            "receipt": f"receipt_{current_user['_id']}",
            "notes": {
                "user_id": current_user["_id"],
                "email": current_user["email"]
            }
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        return OrderResponse(
            order_id=razorpay_order["id"],
            amount=razorpay_order["amount"],
            currency=razorpay_order["currency"]
        )
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail="Could not initialize payment order")


@router.post("/verify")
async def verify_payment(request: VerifyPaymentRequest, current_user: dict = Depends(get_current_user_object)):
    try:
        # 1. Verify Signature manually
        # Expected signature = HMAC-SHA256(order_id + "|" + payment_id, secret_key)
        message = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        
        generated_signature = hmac.new(
            key=settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            msg=message.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()

        if generated_signature != request.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
            
        # 2. Signature is valid -> Upgrade User Plan
        result = await users_collection.update_one(
            {"_id": current_user["_id"]}, # current_user["_id"] is already ObjectId
            {"$set": {"plan": "PRO", "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count == 0 and current_user.get("plan") != "PRO":
            raise HTTPException(status_code=500, detail="Failed to upgrade user plan records")

        # Log Payment Success
        await log_activity(
            user_id=str(current_user["_id"]),
            action="UPGRADE_PLAN",
            details={"order_id": request.razorpay_order_id, "plan": "PRO"}
        )

        return {"status": "success", "message": "Payment verified. Upgraded to PRO tier successfully."}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Payment verification error: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")
