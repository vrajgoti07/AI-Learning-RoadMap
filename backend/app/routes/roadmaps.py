from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from bson import ObjectId
from datetime import datetime
from app.schemas.roadmap import RoadmapCreate, RoadmapResponse, RoadmapRefineRequest, RoadmapUpdate
from app.schemas.progress import ProgressUpdate
from app.core.deps import get_current_user_object
from app.services.activity_log_service import log_activity
from app.database.connection import roadmaps_collection
from app.services.ai_service import generate_roadmap_json
from app.services.youtube_service import search_youtube_channels
from app.services.notification_service import create_notification
from celery.result import AsyncResult
from app.core.limiter import limiter

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def create_roadmap(request: Request, roadmap: RoadmapCreate, current_user: dict = Depends(get_current_user_object)):
    # Plan enforcement
    plan = current_user.get("plan", "GO")
    
    if plan == "GO":
        count = await roadmaps_collection.count_documents({"user_id": current_user["_id"]})
        if count >= 5:
            raise HTTPException(status_code=403, detail="Free plan limit reached. Upgrade to PRO to create more roadmaps.")
    
    # Create initial "processing" document in MongoDB
    new_roadmap = {
        "user_id": current_user["_id"],
        "topic": roadmap.topic,
        "roadmap_data": {}, 
        "status": "processing",
        "is_pinned": False,
        "is_archived": False,
        "is_public": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await roadmaps_collection.insert_one(new_roadmap)
    roadmap_id_str = str(result.inserted_id)

    # 1. Provide Initial Context
    user_skill_level = current_user.get("skill_profile", {}).get(roadmap.topic.lower(), "beginner")
    weak_topics = current_user.get("weak_topics", [])
    completed_topics = current_user.get("completed_topics", [])

    try:
        # 2. Generate Roadmap via Gemini synchronously
        generated_data = generate_roadmap_json(
            topic=roadmap.topic,
            skill_level=user_skill_level,
            weak_topics=weak_topics,
            completed_topics=completed_topics,
            avg_score=0.0
        )
        
        if not generated_data or not generated_data.get("nodes"):
            raise Exception("Failed to generate robust AI content.")

        # 3. Enrich nodes with YouTube Videos
        nodes = generated_data.get("nodes", [])
        roadmap_topic = generated_data.get("topic", roadmap.topic)
        
        if nodes:
            search_query = roadmap_topic
            try:
                 top_videos = search_youtube_channels(search_query, max_results=5) 
                 for i, node in enumerate(nodes):
                     if i == 0:
                         node["videos"] = top_videos
                     else:
                         node["videos"] = []
            except Exception as e:
                 print(f"YouTube search error: {e}")
                 for node in nodes:
                     node["videos"] = []

        # 4. Save Complete Roadmap to DB
        await roadmaps_collection.update_one(
            {"_id": result.inserted_id},
            {
                "$set": {
                    "roadmap_data": generated_data,
                    "topic": roadmap_topic,
                    "status": "completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # 5. Notify User & Log
        await create_notification(
            user_id=current_user["_id"],
            message=f"Success! Your roadmap for '{roadmap_topic}' is ready.",
            type="zap"
        )
        await log_activity(
            user_id=str(current_user["_id"]),
            action="GENERATE_ROADMAP",
            details={"topic": roadmap.topic, "roadmap_id": roadmap_id_str}
        )
        
        return {"status": "completed", "roadmap_id": roadmap_id_str, "topic": roadmap_topic}

    except Exception as e:
        error_msg = str(e)
        print(f"Roadmap Generation Failed for {roadmap.topic}: {error_msg}")
        await roadmaps_collection.update_one(
            {"_id": result.inserted_id},
            {
                "$set": {
                    "status": "failed",
                    "error_message": error_msg,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        # Notify failure
        await create_notification(
            user_id=current_user["_id"],
            message=f"Failed to generate roadmap for '{roadmap.topic}'. Please try again.",
            type="error"
        )
        raise HTTPException(status_code=500, detail="Failed to generate AI roadmap.")

@router.get("/status/{roadmap_id}")
async def get_roadmap_status(roadmap_id: str, current_user: dict = Depends(get_current_user_object)):
    """Polling endpoint for frontend to check generation status."""
    try:
        doc = await roadmaps_collection.find_one({"_id": ObjectId(roadmap_id), "user_id": current_user["_id"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
            
        return {
            "roadmap_id": str(doc["_id"]),
            "status": doc.get("status", "completed"), # Fallback to completed for older docs
            "topic": doc.get("topic", ""),
            "error_message": doc.get("error_message")
        }
    except Exception:
        raise HTTPException(status_code=404, detail="Roadmap not found")

@router.get("", response_model=List[RoadmapResponse])
async def get_user_roadmaps(archived: bool = False, current_user: dict = Depends(get_current_user_object)):
    # Sort by is_pinned (desc) then created_at (desc)
    query = {
        "user_id": current_user["_id"],
        "is_archived": archived if archived else {"$ne": True}
    }
    
    cursor = roadmaps_collection.find(query).sort([("is_pinned", -1), ("created_at", -1)])
    
    results = await cursor.to_list(length=None)
    for doc in results:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
    return results

@router.get("/{id}", response_model=RoadmapResponse)
async def get_roadmap(id: str, current_user: dict = Depends(get_current_user_object)):
    try:
        doc = await roadmaps_collection.find_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
        return doc
    except Exception:
        raise HTTPException(status_code=404, detail="Roadmap not found")

@router.post("/{id}/refine", response_model=RoadmapResponse)
@limiter.limit("5/minute")
async def refine_roadmap(request: Request, id: str, refine_req: RoadmapRefineRequest, current_user: dict = Depends(get_current_user_object)):
    try:
        # 1. Fetch existing
        doc = await roadmaps_collection.find_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
            
        # 2. Extract original data and pass to AI
        original_data = doc.get("roadmap_data", {})
        from app.services.ai_service import refine_roadmap_json
        refined_data = refine_roadmap_json(original_data, refine_req.prompt)
        
        # 3. Handle potential YouTube Video re-fetching
        nodes = refined_data.get("nodes", [])
        new_topic = refined_data.get("topic", doc.get("topic"))
        
        if nodes:
            search_query = f"top best {new_topic} full length course channel tutorial"
            try:
                top_videos = search_youtube_videos(search_query, max_results=5) 
                for i, node in enumerate(nodes):
                    if i == 0:
                        node["videos"] = top_videos
                    else:
                        node["videos"] = []
            except Exception as e:
                print(f"YouTube search error during refinement: {e}")
                for node in nodes:
                    node["videos"] = []
                    
        # 4. Update the document in MongoDB
        update_data = {
            "roadmap_data": refined_data,
            "topic": new_topic,
            "updated_at": datetime.utcnow()
        }
        
        await roadmaps_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
        # 5. Log the activity 
        await log_activity(
            user_id=str(current_user["_id"]),
            action="REFINE_ROADMAP",
            details={"roadmap_id": id, "prompt": refine_req.prompt}
        )
        
        # Return updated document
        doc.update(update_data)
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
        return doc
        
    except Exception as e:
        print(f"Refinement error: {e}")
        raise HTTPException(status_code=400, detail="Failed to refine roadmap")

@router.patch("/{id}", response_model=RoadmapResponse)
async def update_roadmap(id: str, roadmap_update: RoadmapUpdate, current_user: dict = Depends(get_current_user_object)):
    try:
        # 1. Verify ownership
        existing = await roadmaps_collection.find_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if not existing:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        # 2. Prepare update data
        update_data = {k: v for k, v in roadmap_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        update_data["updated_at"] = datetime.utcnow()
        
        # 3. Apply update
        await roadmaps_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
        # 4. Fetch and return updated
        updated = await roadmaps_collection.find_one({"_id": ObjectId(id)})
        updated["_id"] = str(updated["_id"])
        updated["id"] = updated["_id"]
        return updated
        
    except Exception as e:
        print(f"Update error: {e}")
        raise HTTPException(status_code=400, detail="Failed to update roadmap")

@router.patch("/{id}/progress")
async def update_roadmap_progress(id: str, progress: ProgressUpdate, current_user: dict = Depends(get_current_user_object)):
    try:
        # Find the roadmap ensures it belongs to the user
        roadmap = await roadmaps_collection.find_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        # We need to maintain a set or list of completed node IDs
        completed_nodes = roadmap.get("completed_nodes", [])
        
        if progress.is_completed:
            if progress.node_id not in completed_nodes:
                completed_nodes.append(progress.node_id)
        else:
            if progress.node_id in completed_nodes:
                completed_nodes.remove(progress.node_id)
                
        await roadmaps_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"completed_nodes": completed_nodes, "updated_at": datetime.utcnow()}}
        )
        
        # Log Progress Update
        await log_activity(
            user_id=str(current_user["_id"]),
            action="UPDATE_PROGRESS",
            details={"roadmap_id": id, "node_id": progress.node_id, "is_completed": progress.is_completed}
        )

        roadmap["completed_nodes"] = completed_nodes
        roadmap["_id"] = str(roadmap["_id"])
        roadmap["id"] = roadmap["_id"]
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to update progress")

@router.delete("/{id}")
async def delete_roadmap(id: str, current_user: dict = Depends(get_current_user_object)):
    try:
        result = await roadmaps_collection.delete_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        return {"status": "success", "message": "Roadmap deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Roadmap ID")
