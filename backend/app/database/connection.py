from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
import asyncio
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# Redis Cache
class FakeRedis:
    def __init__(self):
        self.data = {}
        print("⚠️ Redis not found. Using FakeRedis (in-memory) fallback.")

    async def get(self, key: str):
        return self.data.get(key)

    async def setex(self, key: str, time: int, value: str):
        self.data[key] = value
        # For development, we don't strictly need expiration logic here
        return True

    async def delete(self, key: str):
        if key in self.data:
            del self.data[key]
        return True

    async def ping(self):
        return True

async def get_redis_client():
    client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        # Try to ping redis to see if it's alive
        # We use a short timeout so it doesn't hang the app startup
        await asyncio.wait_for(client.ping(), timeout=1.0)
        return client
    except (Exception, asyncio.TimeoutError):
        return FakeRedis()

# Initialize redis_client. 
# Note: Since this is at module level, we can't easily use await here without a wrapper 
# or initializing it lazily. 
# However, we can use a proxy or just initialize it as FakeRedis if it fails once.

# For now, let's use a simpler approach: 
# We'll export a redis_client that tries to use the real one and falls back on error.
# But auth.py uses 'await redis_client.get(...)'.

class RedisProxy:
    def __init__(self, url):
        self.url = url
        self._client = None
        self._is_fake = False

    async def _get_client(self):
        if self._client is None:
            try:
                client = aioredis.from_url(self.url, decode_responses=True)
                await asyncio.wait_for(client.ping(), timeout=2.0)
                self._client = client
                self._is_fake = False
            except Exception:
                self._client = FakeRedis()
                self._is_fake = True
        return self._client

    async def get(self, name):
        client = await self._get_client()
        return await client.get(name)

    async def setex(self, name, time, value):
        client = await self._get_client()
        return await client.setex(name, time, value)

    async def delete(self, name):
        client = await self._get_client()
        return await client.delete(name)

redis_client = RedisProxy(settings.REDIS_URL)

# Collections
users_collection = db["users"]
roadmaps_collection = db["roadmaps"]
notifications_collection = db["notifications"]
analytics_collection = db["analytics"]
newsletters_collection = db["newsletters"]
quiz_attempts_collection = db["quiz_attempts"]
learning_progress_collection = db["learning_progress"]


def get_db():
    return db
