from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.websockets.manager import manager
from app.core.security import decode_access_token
from app.database.connection import users_collection
from bson import ObjectId

router = APIRouter()

@router.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    user_id = None
    try:
        # 1. Verify Token
        payload = decode_access_token(token)
        if not payload:
            await websocket.close(code=1008) # Policy Violation
            return
            
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            return

        # 2. Connect
        await manager.connect(user_id, websocket)
        
        # 3. Keep connection alive and listen for messages (client-side ping/pongs)
        try:
            while True:
                data = await websocket.receive_text()
                # We don't expect messages from client yet, but keep it open
                pass
        except WebSocketDisconnect:
            manager.disconnect(user_id, websocket)
            
    except Exception as e:
        print(f"WebSocket Error: {e}")
        if user_id:
            manager.disconnect(user_id, websocket)
        await websocket.close(code=1011) # Internal Error
