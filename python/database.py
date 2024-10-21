from pymongo import MongoClient
import os

# Get database credentials from environment variables or replace them with the actual values for development purposes
db_username = os.getenv("MONGO_DB_USERNAME", "Zhichen")
db_password = os.getenv("MONGO_DB_PASSWORD", "Logo816923")
db_cluster_url = os.getenv("MONGO_DB_CLUSTER_URL", "homesdb.4xuxt.mongodb.net")
db_name = os.getenv("MONGO_DB_NAME", "homesdb")

# Connection string
connection_string = f"mongodb+srv://{db_username}:{db_password}@{db_cluster_url}/{db_name}?retryWrites=true&w=majority"

# Create a MongoDB client
client = MongoClient(connection_string)

# Access the specific database
db = client[db_name]

# Access specific collections
properties_collection = db['properties']

def get_db():
    return db

def get_properties_collection():
    return properties_collection
