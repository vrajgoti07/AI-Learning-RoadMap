from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from app.schemas.roadmap import RoadmapCreate, RoadmapResponse
from app.core.deps import get_current_user
from app.database.connection import roadmaps_collection
from app.services.ai_service import generate_roadmap_json
from app.services.youtube_service import search_youtube_videos

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.post("", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def create_roadmap(roadmap: RoadmapCreate, current_user: dict = Depends(get_current_user)):
    # Plan enforcement
    plan = current_user.get("plan", "GO")
    
    if plan == "GO":
        count = roadmaps_collection.count_documents({"user_id": current_user["_id"]})
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
    # We'll fetch videos for the first 5 milestones to provide more value
    nodes = generated_data.get("nodes", [])
    roadmap_topic = generated_data.get("topic", roadmap.topic)
    
    for i, node in enumerate(nodes):
        if i < 5: # Increased to 5 nodes to provide more visual content
            node_label = node.get('label', '')
            search_query = f"{roadmap_topic} {node_label} tutorial"
            node["videos"] = search_youtube_videos(search_query)
        else:
            node["videos"] = []
    
    new_roadmap = {
        "user_id": current_user["_id"],
        "topic": roadmap_topic,
        "roadmap_data": generated_data,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = roadmaps_collection.insert_one(new_roadmap)
    created = roadmaps_collection.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    created["id"] = created["_id"]
    return created

@router.get("", response_model=List[RoadmapResponse])
def get_user_roadmaps(current_user: dict = Depends(get_current_user)):
    cursor = roadmaps_collection.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
        results.append(doc)
    return results

@router.get("/{id}", response_model=RoadmapResponse)
def get_roadmap(id: str, current_user: dict = Depends(get_current_user)):
    try:
        doc = roadmaps_collection.find_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
        return doc
    except Exception:
        raise HTTPException(status_code=404, detail="Roadmap not found")

@router.delete("/{id}")
def delete_roadmap(id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = roadmaps_collection.delete_one({"_id": ObjectId(id), "user_id": current_user["_id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        return {"status": "success", "message": "Roadmap deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Roadmap ID")
