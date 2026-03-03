from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from app.schemas.roadmap import RoadmapCreate, RoadmapResponse, RoadmapRefineRequest, RoadmapUpdate
from app.schemas.progress import ProgressUpdate
from app.core.deps import get_current_user_object
from app.services.activity_log_service import log_activity
from app.database.connection import roadmaps_collection
from app.services.ai_service import generate_roadmap_json
from app.services.youtube_service import search_youtube_videos
from app.services.notification_service import create_notification

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.post("", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
async def create_roadmap(roadmap: RoadmapCreate, current_user: dict = Depends(get_current_user_object)):
    # Plan enforcement
    plan = current_user.get("plan", "GO")
    
    if plan == "GO":
        count = await roadmaps_collection.count_documents({"user_id": current_user["_id"]})
        if count >= 5:
            raise HTTPException(status_code=403, detail="Free plan limit reached. Upgrade to PRO to create more roadmaps.")
    
    # 1. Generate Roadmap via Gemini
    generated_data = generate_roadmap_json(roadmap.topic)
    
    if not generated_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate roadmap content. Please try again later."
        )
    
    # 2. Enrich nodes with YouTube Videos
    # Fetch exactly ONE set of 6 highly relevant, top-level full courses for the entire roadmap.
    nodes = generated_data.get("nodes", [])
    roadmap_topic = generated_data.get("topic", roadmap.topic)
    
    if nodes:
        # Instead of 15 scattered videos across 5 searches, do 1 high-quality search
        # Query specifically for full course channels to get the absolute best tutorials
        search_query = f"top best {roadmap_topic} full length course channel tutorial"
        try:
             # We fetch EXACTLY 5 top-tier videos for the sidebar, attached to the first node.
             top_videos = search_youtube_videos(search_query, max_results=5) 
             for i, node in enumerate(nodes):
                 if i == 0:
                     node["videos"] = top_videos
                 else:
                     node["videos"] = []
        except Exception as e:
             print(f"YouTube search error: {e}")
             for node in nodes:
                 node["videos"] = []
    
    new_roadmap = {
        "user_id": current_user["_id"],
        "topic": roadmap_topic,
        "roadmap_data": generated_data,
        "is_pinned": False,
        "is_archived": False,
        "is_public": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await roadmaps_collection.insert_one(new_roadmap)
    
    # Log Roadmap Generation
    await log_activity(
        user_id=str(current_user["_id"]),
        action="GENERATE_ROADMAP",
        details={"topic": roadmap_topic, "roadmap_id": str(result.inserted_id)}
    )

    # Trigger notification
    await create_notification(
        user_id=current_user["_id"],
        message=f"Success! Your roadmap for '{roadmap_topic}' is ready.",
        type="zap"
    )

    created = await roadmaps_collection.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    created["id"] = created["_id"]
    return created

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
async def refine_roadmap(id: str, refine_req: RoadmapRefineRequest, current_user: dict = Depends(get_current_user_object)):
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
