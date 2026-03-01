from pymongo import MongoClient
import pymongo
from app.core.config import settings

client = MongoClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# Collections
users_collection = db["users"]
roadmaps_collection = db["roadmaps"]
notifications_collection = db["notifications"]
analytics_collection = db["analytics"]

# Create indexes
users_collection.create_index([("email", pymongo.ASCENDING)], unique=True)
roadmaps_collection.create_index([("user_id", pymongo.ASCENDING)])
notifications_collection.create_index([("user_id", pymongo.ASCENDING)])

def get_db():
    return db
