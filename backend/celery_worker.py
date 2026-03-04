import os
import asyncio
from celery import Celery
from app.core.config import settings
from app.services.ai_service import generate_roadmap_json
from app.services.youtube_service import search_youtube_videos
from app.database.connection import roadmaps_collection, users_collection
from app.services.notification_service import create_notification
from bson import ObjectId
from datetime import datetime

# Initialize Celery
# If REDIS_URL is strictly async in settings (e.g. from aioredis), Celery needs a sync compatible URL.
# Usually standard redis:// works for Celery.
celery_app = Celery(
    "pathfinder_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

def run_async(coro):
    """Helper to run async code synchronously inside a Celery task."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

@celery_app.task(bind=True, name="generate_roadmap_task")
def generate_roadmap_task(self, user_id: str, topic: str, roadmap_id: str):
    """
    Background task to generate AI roadmap, fetch YouTube videos, 
    and save the completed roadmap to MongoDB.
    """
    try:
        # 1. Update status to processing
        run_async(roadmaps_collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {"$set": {"status": "processing"}}
        ))

        # 2. Get User Context (for AI personalization)
        user = run_async(users_collection.find_one({"_id": ObjectId(user_id)}))
        if not user:
             raise Exception("User not found for roadmap generation")

        user_skill_level = user.get("skill_profile", {}).get(topic.lower(), "beginner")
        weak_topics = user.get("weak_topics", [])
        completed_topics = user.get("completed_topics", [])
        # Defaulting avg score to 0.0 for baseline, could fetch from analytics later
        avg_score = 0.0

        # 3. Generate Roadmap via Gemini
        generated_data = generate_roadmap_json(
            topic=topic,
            skill_level=user_skill_level,
            weak_topics=weak_topics,
            completed_topics=completed_topics,
            avg_score=avg_score
        )
        
        if not generated_data or not generated_data.get("nodes"):
            raise Exception("Failed to generate robust AI content.")

        # 4. Enrich nodes with YouTube Videos
        nodes = generated_data.get("nodes", [])
        roadmap_topic = generated_data.get("topic", topic)
        
        if nodes:
            search_query = f"top best {roadmap_topic} full length course channel tutorial"
            try:
                 top_videos = search_youtube_videos(search_query, max_results=5) 
                 for i, node in enumerate(nodes):
                     if i == 0:
                         node["videos"] = top_videos
                     else:
                         node["videos"] = []
            except Exception as e:
                 print(f"YouTube search error inside Celery: {e}")
                 for node in nodes:
                     node["videos"] = []

        # 5. Save Complete Roadmap to DB
        run_async(roadmaps_collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {
                "$set": {
                    "roadmap_data": generated_data,
                    "topic": roadmap_topic,
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        ))

        # 6. Notify User
        run_async(create_notification(
            user_id=ObjectId(user_id),
            message=f"Success! Your roadmap for '{roadmap_topic}' is ready.",
            type="zap"
        ))

        return {"status": "completed", "roadmap_id": roadmap_id, "topic": roadmap_topic}

    except Exception as e:
        # Mark as failed in DB
        error_msg = str(e)
        print(f"Celery Task Failed generating roadmap for {topic}: {error_msg}")
        run_async(roadmaps_collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {
                "$set": {
                    "status": "failed",
                    "error_message": error_msg,
                    "updated_at": datetime.utcnow()
                }
            }
        ))
        run_async(create_notification(
            user_id=ObjectId(user_id),
            message=f"Failed to generate roadmap for '{topic}'. Please try again.",
            type="error"
        ))
        
        raise
