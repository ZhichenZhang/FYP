import re
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

db_username = os.getenv("MONGO_DB_USERNAME")
db_password = os.getenv("MONGO_DB_PASSWORD")
db_cluster_url = os.getenv("MONGO_DB_CLUSTER_URL")
db_name = os.getenv("MONGO_DB_NAME")

connection_string = f"mongodb+srv://{db_username}:{db_password}@{db_cluster_url}/{db_name}?retryWrites=true&w=majority"
client = MongoClient(connection_string)
db = client[db_name]

def get_properties_collection(collection_name):
    return db[collection_name]

def filter_properties(query):
    """
    Filter properties from the 'daft' collection where 'bedrooms' and 'price' are strings.
    We parse the digits from the user query and from each document to do comparisons.
    """
    collection = get_properties_collection("daft")
    
    # We'll gather potential docs with 'bedrooms' or 'price' if we see those words in the query
    docs = list(collection.find())  # or filter with a broad $regex if you want fewer docs

    # e.g. "Show me houses with 3+ bedrooms" or "Properties under 400000"
    # We'll parse the first integer we see in the query
    match = re.search(r'(\d+)', query)
    if not match:
        # If no integer is found, we won't do numeric filtering
        # You could return everything or an empty list, up to you
        return docs
    
    user_number = int(match.group(1))
    
    filtered = []
    
    # If "bedroom" is in the query, do a bedroom filter
    if "bedroom" in query.lower():
        for doc in docs:
            # doc['bedrooms'] might be "4 Bed", "3 bedroom", etc.
            if 'bedrooms' in doc and isinstance(doc['bedrooms'], str):
                bed_match = re.search(r'(\d+)', doc['bedrooms'])
                if bed_match:
                    doc_bed_count = int(bed_match.group(1))
                    # If user said "3+ bedrooms," we interpret as doc_bed_count >= 3
                    if doc_bed_count >= user_number:
                        filtered.append(doc)
        return filtered

    # If "price" or "under" is in the query, do a price filter
    if "price" in query.lower() or "under" in query.lower():
        for doc in docs:
            # doc['price'] might be "€695,000" or "695000"
            if 'price' in doc and isinstance(doc['price'], str):
                # remove non-digits
                price_digits = re.sub(r'[^\d]', '', doc['price'])
                if price_digits.isdigit():
                    doc_price = int(price_digits)
                    # If user said "under 400000," we interpret as doc_price <= 400000
                    if doc_price <= user_number:
                        filtered.append(doc)
        return filtered

    # If we didn't match "bedroom" or "price" in the query, just return all docs or empty
    return docs
