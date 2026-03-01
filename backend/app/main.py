from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, users, roadmaps, admin, notifications
from app.database.connection import client

app = FastAPI(title="PathFinder AI API", version="1.0.0")

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
app.include_router(admin.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to PathFinder AI Backend API. API paths are at /api"}
