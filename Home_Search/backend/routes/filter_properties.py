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
    Filter properties from the database where values are strings.
    We parse the digits from the user query and from each document to do comparisons.
    """
    collection = get_properties_collection("daft")
    
   
    price_match = re.search(r'(\d[\d,.]*)\s*(k|thousand|million|m|€|euro|eur)?', query.lower())
    bedroom_match = re.search(r'(\d+)\s*(\+)?\s*(bed|bedroom|bedrooms)', query.lower())
    
   
    mongo_query = {}
    
    
    if price_match or "price" in query.lower() or "under" in query.lower() or "€" in query:
        
        if price_match:
            price_value = price_match.group(1).replace(',', '').replace('.', '')
            price_unit = price_match.group(2) if price_match.group(2) else ""
            
          
            price = int(price_value)
        
            if price_unit and ('k' in price_unit or 'thousand' in price_unit):
                price *= 1000
            elif price_unit and ('m' in price_unit or 'million' in price_unit):
                price *= 1000000
                
            if "under" in query.lower() or "less than" in query.lower() or "below" in query.lower():
                mongo_query = {
                    "price": {"$regex": f".*\\d.*"}  
                }

            else:
                mongo_query = {
                    "price": {"$regex": f".*\\d.*"} 
                }
        else:
            mongo_query = {
                "price": {"$regex": f".*\\d.*"}  
            }
    
    # Process bedroom filters
    elif bedroom_match:
        bed_count = int(bedroom_match.group(1))
        is_plus = bedroom_match.group(2) == "+"
        
        bedroom_pattern = f"{'[0-9]+' if is_plus else bed_count}"
        mongo_query = {
            "bedrooms": {"$regex": bedroom_pattern, "$options": "i"}
        }

    docs = list(collection.find(mongo_query))
    filtered_results = []
    
    for doc in docs:
        should_include = True
        
        # Price filtering
        if price_match and "price" in doc:
            # Extract numeric value from the price field
            doc_price_str = doc["price"] if isinstance(doc["price"], str) else str(doc["price"])
            doc_price_match = re.search(r'[\d,]+', doc_price_str)
            
            if doc_price_match:
                # Convert to numeric
                doc_price = int(doc_price_match.group(0).replace(',', ''))
                
                # Apply the filter
                if "under" in query.lower() or "less than" in query.lower() or "below" in query.lower():
                    should_include = doc_price <= price
                else:
                    #look for properties around this price (±10%)
                    should_include = (doc_price >= price * 0.9) and (doc_price <= price * 1.1)
        
        # Bedroom filtering
        elif bedroom_match and "bedrooms" in doc:
            doc_bed_str = doc["bedrooms"] if isinstance(doc["bedrooms"], str) else str(doc["bedrooms"])
            doc_bed_match = re.search(r'(\d+)', doc_bed_str)
            
            if doc_bed_match:
                doc_beds = int(doc_bed_match.group(1))
                
                # Apply the filter
                if is_plus:  # For "3+ bedrooms"
                    should_include = doc_beds >= bed_count
                else:        # For "3 bedrooms"
                    should_include = doc_beds == bed_count
        
        if should_include:
            # Ensure the document has an ID
            if "_id" in doc:
                # Convert ObjectId to string
                doc["id"] = str(doc["_id"])
                del doc["_id"]
            
            filtered_results.append(doc)
    
    return filtered_results