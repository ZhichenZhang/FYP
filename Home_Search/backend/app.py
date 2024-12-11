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
        search_term = request.args.get('searchTerm', '').lower()

        collection = get_properties_collection("daft")
        # Calculate the number of documents to skip
        skip = (page - 1) * limit

        # Apply search filter if search term is provided
        query = {}
        if search_term:
            query = {
                "$or": [
                    {"address": {"$regex": search_term, "$options": "i"}},
                    {"property_type": {"$regex": search_term, "$options": "i"}},
                    {"price": {"$regex": search_term, "$options": "i"}},  # Search by price
                    {"bedrooms": {"$regex": search_term, "$options": "i"}},  # Search by bedrooms
                    {"bathrooms": {"$regex": search_term, "$options": "i"}}  # Search by bathrooms
                ]
            }

        # Query the database
        total_properties = collection.count_documents(query)
        properties = list(collection.find(query, {"_id": 0}).skip(skip).limit(limit))

        return jsonify({
            "properties": properties,
            "total": total_properties
        })
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
