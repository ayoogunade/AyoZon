import pymongo
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get MongoDB URI
MONGO_URI = os.getenv("MONGO_URI")

try:
    # Connect to MongoDB
    client = pymongo.MongoClient(MONGO_URI)

    # List databases
    print("Databases:", client.list_database_names())
except pymongo.errors.ConnectionError as e:
    print("Connection error:", e)
