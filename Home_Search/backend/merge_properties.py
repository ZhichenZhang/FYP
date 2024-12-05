# merge_properties.py
from python.database_utils import get_properties_collection

def merge_properties():
    """Merge properties from Daft.ie and MyHome.ie, ensuring no duplicates."""
    print("Merging properties from Daft and MyHome...")
    properties_collection = get_properties_collection()

    # Placeholder for merging logic
    all_properties = list(properties_collection.find())
    unique_properties = {}
    
    # Add properties to a dictionary to remove duplicates
    for property in all_properties:
        key = (property['address'], property['price'])
        if key not in unique_properties:
            unique_properties[key] = property

    # Create a new collection or update an existing collection for merged properties
    merged_collection = properties_collection.database['merged_properties']
    merged_collection.delete_many({})  # Clear out old data if necessary

    # Insert merged unique properties
    merged_collection.insert_many(unique_properties.values())

    print("Merging complete. Merged properties saved.")
