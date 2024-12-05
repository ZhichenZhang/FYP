from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

db_username = os.getenv("MONGO_DB_USERNAME")
db_password = os.getenv("MONGO_DB_PASSWORD")
db_cluster_url = os.getenv("MONGO_DB_CLUSTER_URL")
db_name = os.getenv("MONGO_DB_NAME")

# Connection string
connection_string = f"mongodb+srv://{db_username}:{db_password}@{db_cluster_url}/{db_name}?retryWrites=true&w=majority"
client = MongoClient(connection_string)
db = client[db_name]

def get_properties_collection(collection_name):
    return db[collection_name]

if __name__ == "__main__":
    try:
        collection = get_properties_collection("properties")
        print(f"Collection '{collection.name}' accessed successfully.")
    except Exception as e:
        print(f"Failed to access collection: {e}")
