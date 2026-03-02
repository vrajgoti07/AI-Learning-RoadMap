from pydantic import BaseModel
from typing import Optional

class CreateOrderRequest(BaseModel):
    amount: int
    currency: str = "INR"

class OrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
