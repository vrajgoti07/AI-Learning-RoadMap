from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from app.schemas.quiz import QuizSubmitRequest, QuizAttemptResponse
from app.core.deps import get_current_user_object
from app.database.connection import quiz_attempts_collection, users_collection
from app.services.activity_log_service import log_activity
import math

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.post("/submit", response_model=QuizAttemptResponse)
async def submit_quiz(request: QuizSubmitRequest, current_user: dict = Depends(get_current_user_object)):
    try:
        # 1. Calculate Score
        total_questions = len(request.questions)
        if total_questions == 0:
            raise HTTPException(status_code=400, detail="No questions submitted")
            
        correct_answers = sum(1 for q in request.questions if q.is_correct)
        score_percentage = (correct_answers / total_questions) * 100
        
        # 2. Gamification: Calculate XP
        xp_gained = 10 # Base XP for completing a node quiz
        if score_percentage >= 90:
            xp_gained += 5 # Bonus XP for excellence
            
        # 3. Update User Profile (XP, Level, Skills)
        user_id = current_user["_id"]
        current_xp = current_user.get("xp", 0) + xp_gained
        # Level formula: level = floor(xp / 100) + 1 (Start at level 1)
        new_level = math.floor(current_xp / 100) + 1
        
        weak_topics = current_user.get("weak_topics", [])
        strong_topics = current_user.get("strong_topics", [])
        skill_profile = current_user.get("skill_profile", {})
        
        topic_lower = request.topic.lower()
        
        # Skill Adjustment Logic
        if score_percentage < 50:
            if topic_lower not in weak_topics:
                weak_topics.append(topic_lower)
            if topic_lower in strong_topics:
                strong_topics.remove(topic_lower)
            skill_profile[topic_lower] = "beginner"
        elif score_percentage > 80:
            if topic_lower not in strong_topics:
                strong_topics.append(topic_lower)
            if topic_lower in weak_topics:
                weak_topics.remove(topic_lower)
            skill_profile[topic_lower] = "advanced"
        else:
            # Intermediate performance
            if topic_lower in weak_topics:
                weak_topics.remove(topic_lower)
            skill_profile[topic_lower] = "intermediate"
            
        # 4. Save User Updates
        await users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "xp": current_xp,
                "level": new_level,
                "weak_topics": weak_topics,
                "strong_topics": strong_topics,
                "skill_profile": skill_profile,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # 5. Save Quiz Attempt
        attempt_doc = {
            "user_id": user_id,
            "roadmap_id": request.roadmap_id,
            "topic": request.topic,
            "node_id": request.node_id,
            "questions": [q.dict() for q in request.questions],
            "score": score_percentage,
            "xp_gained": xp_gained,
            "attempted_at": datetime.utcnow()
        }
        
        result = await quiz_attempts_collection.insert_one(attempt_doc)
        
        # 6. Log Activity
        await log_activity(
            user_id=str(user_id),
            action="QUIZ_SUBMIT",
            details={"topic": request.topic, "score": score_percentage, "xp_gained": xp_gained}
        )
        
        # Return Response
        created_attempt = await quiz_attempts_collection.find_one({"_id": result.inserted_id})
        created_attempt["_id"] = str(created_attempt["_id"])
        created_attempt["user_id"] = str(created_attempt["user_id"])
        return created_attempt

    except Exception as e:
        print(f"Quiz submission error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process quiz submission")

@router.get("/history", response_model=List[QuizAttemptResponse])
async def get_quiz_history(current_user: dict = Depends(get_current_user_object)):
    cursor = quiz_attempts_collection.find({"user_id": current_user["_id"]}).sort("attempted_at", -1)
    results = await cursor.to_list(length=50) # Limit to last 50 attempts
    
    for doc in results:
        doc["_id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
        
    return results
