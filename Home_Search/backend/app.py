from flask import Flask, jsonify, request
from flask_cors import CORS
from database_utils import get_properties_collection

app = Flask(__name__)
CORS(app)  # Add CORS support

@app.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        # Retrieve pagination and search parameters
        limit = int(request.args.get('limit', 20))  # Default limit of 20 properties per page
        page = int(request.args.get('page', 1))  # Default to page 1
        search_term = request.args.get('searchTerm', '').lower()  # Default to empty if not provided
        
        # Retrieve filter parameters
        min_price = int(request.args.get('min_price', 0))
        max_price = int(request.args.get('max_price', 1_000_000_000))
        bedrooms = int(request.args.get('bedrooms', 0))
        bathrooms = int(request.args.get('bathrooms', 0))
        
        collection = get_properties_collection("daft")
        skip = (page - 1) * limit

        # Apply search filter if search term is provided
        query = {
            "price": {"$gte": min_price, "$lte": max_price},
            "bedrooms": {"$gte": bedrooms},
            "bathrooms": {"$gte": bathrooms}
        }

        # Extend the query to include the search term if it is provided
        if search_term:
            search_filter = {
                "$or": [
                    {"address": {"$regex": search_term, "$options": "i"}},
                    {"property_type": {"$regex": search_term, "$options": "i"}}
                ]
            }
            query = {**query, **search_filter}  # Combine the search and filter conditions

        # Execute the query
        total_properties = collection.count_documents(query)
        properties = list(collection.find(query, {"_id": 0}).skip(skip).limit(limit))

        # Return the result
        return jsonify({
            "properties": properties,
            "total": total_properties
        })
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
