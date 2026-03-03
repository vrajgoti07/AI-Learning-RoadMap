from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, users, roadmaps, admin, notifications, subscriptions, websocket, newsletter
from app.services.inbound_email_service import poll_inbound_emails
import os
import asyncio

app = FastAPI(title="PathFinder AI API", version="1.0.0")

# Ensure uploads directory exists
UPLOAD_DIR = "uploads/profiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# CORS middleware for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL (e.g., http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix as expected by frontend
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(admin.users_router, prefix="/api")
app.include_router(roadmaps.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    print("Starting background services...")
    # Start the email poller in the background
    asyncio.create_task(poll_inbound_emails())
app.include_router(websocket.router)
app.include_router(admin.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to PathFinder AI Backend API. API paths are at /api"}
