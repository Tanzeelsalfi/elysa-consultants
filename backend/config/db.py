import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

_client = None
_db = None


def get_db():
    """Return a MongoDB database instance, creating the connection lazily."""
    global _client, _db
    if _db is not None:
        return _db

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI environment variable is not set.")

    _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db_name = os.getenv("MONGO_DB_NAME", "architectDB")
    _db = _client[db_name]
    return _db


def seed_projects_if_empty(db):
    """Seed a few sample projects if the projects collection is empty."""
    if db.projects.count_documents({}) > 0:
        return

    sample_projects = [
        {
            "title": "Modern Office Complex",
            "description": "A state-of-the-art office building with sustainable design principles.",
            "category": "Commercial",
            "imageUrl": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "title": "Luxury Residential Villa",
            "description": "An elegant private villa blending contemporary aesthetics with local materials.",
            "category": "Residential",
            "imageUrl": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "title": "Community Cultural Centre",
            "description": "A multi-purpose cultural hub designed for arts, education, and community gatherings.",
            "category": "Public",
            "imageUrl": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
    ]
    db.projects.insert_many(sample_projects)
    print("✅ Seeded sample projects.")


def seed_employees_if_empty(db):
    """Seed sample employees if the employees collection is empty."""
    if db.employees.count_documents({}) > 0:
        return

    sample_employees = [
        {
            "name": "Aakhoon Rashiq",
            "role": "Principal Architect",
            "bio": "Lead designer with over 15 years of experience in commercial and residential projects.",
            "imageUrl": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
        {
            "name": "Sara Ahmed",
            "role": "Interior Designer",
            "bio": "Specialist in sustainable interiors and biophilic design.",
            "imageUrl": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        },
    ]
    db.employees.insert_many(sample_employees)
    print("✅ Seeded sample employees.")
