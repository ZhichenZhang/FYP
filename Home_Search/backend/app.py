from flask import Flask, jsonify, request
from flask_cors import CORS
from database_utils import get_properties_collection
import re
import time

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (so React can call Flask)

def parse_search_query(search_term):
    """
    Advanced query parsing for property search.
    The chatbot/LLM provides a refined string like:
    "house 3 bed 3 bath under 400k dublin"
    We convert that into a MongoDB query.
    """

    # Normalize text
    search_term = search_term.lower().strip()

    # Extract all locations from the search term first - expanded list with more towns
    locations = [
        # Counties
        "carlow", "cavan", "clare", "cork", "donegal", "dublin", "galway", "kerry",
        "kildare", "kilkenny", "laois", "leitrim", "limerick", "longford", "louth",
        "mayo", "meath", "monaghan", "offaly", "roscommon", "sligo", "tipperary",
        "waterford", "westmeath", "wexford", "wicklow", "antrim", "armagh", "down", 
        "fermanagh", "londonderry", "tyrone",
        # Major towns and cities
        "athlone", "mullingar", "tullamore", "portlaoise", "naas", "navan", "drogheda", "dundalk",
        "swords", "bray", "greystones", "arklow", "gorey", "enniscorthy", "wexford", "kilkenny",
        "carlow", "athy", "newbridge", "kildare", "maynooth", "celbridge", "leixlip", "lucan",
        "clondalkin", "tallaght", "dun laoghaire", "balbriggan", "skerries", "malahide", "howth",
        "sutton", "raheny", "clontarf", "killester", "fairview", "drumcondra", "phibsborough",
        "cabra", "blanchardstown", "castleknock", "chapelizod", "palmerstown", "ballyfermot",
        "inchicore", "kilmainham", "dolphins barn", "crumlin", "walkinstown", "terenure",
        "rathfarnham", "churchtown", "dundrum", "ballinteer", "sandyford", "stepaside",
        "leopardstown", "foxrock", "cabinteely", "killiney", "dalkey", "sandycove", "glasthule",
        "monkstown", "blackrock", "booterstown", "ballsbridge", "donnybrook", "ranelagh",
        "rathmines", "harold's cross", "rathgar", "milltown", "clonskeagh", "goatstown",
        "stillorgan", "kilmacud", "mount merrion", "deansgrange", "dun laoghaire", "glasnevin",
        "santry", "beaumont", "artane", "killester", "coolock", "darndale", "donaghmede",
        "kilbarrack", "raheny", "clontarf", "east wall", "north wall", "kilshane", "mulhuddart"
    ]
    
    # Find all locations mentioned in the search term
    detected_locations = []
    for loc in locations:
        if re.search(r'\b' + loc + r'\b', search_term, re.IGNORECASE):
            detected_locations.append(loc)
    
    # Create a modified search term with locations removed
    # This prevents locations from being processed in the normal segment loop
    modified_search_term = search_term
    for loc in detected_locations:
        modified_search_term = re.sub(r'\b' + loc + r'\b', '', modified_search_term, flags=re.IGNORECASE)
    
    # split on some words like 'and', 'with', commas, etc.
    segments = re.split(r'\band\b|\bwith\b|,', modified_search_term)
    
    # Start with an $and query container
    query = {"$and": []}

    # Price range helper (under/over/between)
    price_ranges = {
        'under': lambda price: {"price_numeric": {"$lte": price}},
        'over': lambda price: {"price_numeric": {"$gte": price}},
        'between': lambda minp, maxp: {
            "price_numeric": {"$gte": minp, "$lte": maxp}
        }
    }

    # Regex to detect "under 400k", "over 300k", "between 200k and 300k"
    price_patterns = [
        r'under\s*(\d+)\s*k',
        r'over\s*(\d+)\s*k',
        r'between\s*(\d+)\s*k\s*and\s*(\d+)\s*k'
    ]

    # Property type synonyms
    # If user says "house", we also match "detached", "semi-detached", "terraced".
    property_types = {
        "house": ["house", "detached", "semi-detached", "terraced", "townhouse","bungalow"],
        "apartment": ["apartment", "flat"],
        "detached": ["detached"],
        "terraced": ["terraced","end of terraced"],
        "semi-detached": ["semi-detached"],
        "townhouse": ["townhouse"],
        "bungalow": ["bungalow"]
    }

    # Common features we might see
    feature_keywords = ['garden', 'parking', 'balcony', 'view', 'garage', 'pool']
    
    def add_condition(cond):
        """Helper to append a sub-condition into the $and list."""
        if cond is not None and cond not in query["$and"]:
            query["$and"].append(cond)

    # Process non-location segments
    for seg in segments:
        seg = seg.strip()
        if not seg:  # Skip empty segments
            continue
            
        matched_segment = False

        # 1) Price Patterns
        for pattern in price_patterns:
            match = re.search(pattern, seg)
            if match:
                matched_segment = True
                if 'under' in pattern:
                    # e.g. "under 400k"
                    price_val = int(match.group(1)) * 1000
                    add_condition(price_ranges['under'](price_val))
                elif 'over' in pattern:
                    # e.g. "over 300k"
                    price_val = int(match.group(1)) * 1000
                    add_condition(price_ranges['over'](price_val))
                elif 'between' in pattern:
                    # e.g. "between 200k and 300k"
                    min_price = int(match.group(1)) * 1000
                    max_price = int(match.group(2)) * 1000
                    add_condition(price_ranges['between'](min_price, max_price))
                break

        # Also handle if user just typed "300k" (with no "under"/"over/between")
        if not matched_segment:
            standalone_price = re.match(r'^(\d+)\s*k$', seg)
            if standalone_price:
                matched_segment = True
                price_val = int(standalone_price.group(1)) * 1000
                # by default, treat "300k" as "under 300k"
                add_condition(price_ranges['under'](price_val))

        # 2) Property type synonyms
        for main_type, synonyms in property_types.items():
            # If seg includes "house", "detached", etc.
            for syn in synonyms:
                if syn in seg:
                    matched_segment = True
                    # We'll do a regex OR across synonyms
                    # e.g. if user typed "house", we search "house|detached|semi-detached|terraced"
                    type_regex = "|".join(property_types[main_type])
                    add_condition({"property_type": {"$regex": type_regex, "$options": "i"}})
                    break

        # 3) Bedrooms / Bathrooms
        # e.g. "3 bed", "4 bedroom", "2 bath", "3 bathrooms"
        bedroom_match = re.search(r'(\d+)\s*bed', seg)
        if bedroom_match:
            matched_segment = True
            bed_num = bedroom_match.group(1)
            # If "bedrooms" is stored as a string or number, adapt as needed
            add_condition({"bedrooms": {"$regex": bed_num, "$options": "i"}})

        bathroom_match = re.search(r'(\d+)\s*bath', seg)
        if bathroom_match:
            matched_segment = True
            bath_num = bathroom_match.group(1)
            add_condition({"bathrooms": {"$regex": bath_num, "$options": "i"}})

        # 4) Features (garden, parking, etc.)
        for keyword in feature_keywords:
            if keyword in seg:
                matched_segment = True
                add_condition({
                    "$or": [
                        {"description": {"$regex": keyword, "$options": "i"}},
                        {"features":    {"$regex": keyword, "$options": "i"}}
                    ]
                })

        # 5) If none of the above matched, do a fallback text match
        #    This ensures the user typed something that we still catch in address, description, etc.
        if not matched_segment and seg:
            add_condition({
                "$or": [
                    {"address":      {"$regex": seg, "$options": "i"}},
                    {"description":  {"$regex": seg, "$options": "i"}},
                    {"features":     {"$regex": seg, "$options": "i"}},
                    {"property_type":{"$regex": seg, "$options": "i"}}
                ]
            })

    # Handle locations as a separate OR condition
    if detected_locations:
        location_conditions = []
        for loc in detected_locations:
            location_conditions.append({
                "$or": [
                    {"address": {"$regex": loc, "$options": "i"}},
                    {"county": {"$regex": loc, "$options": "i"}},
                    {"description": {"$regex": "\\bin " + loc + "\\b", "$options": "i"}}
                ]
            })
        
        # Add a combined location OR condition
        if location_conditions:
            add_condition({"$or": location_conditions})

    # If $and is empty (meaning user gave us nothing?), fallback again
    if len(query["$and"]) == 0:
        # just do a broad match on entire search_term
        query = {
            "$or": [
                {"address":      {"$regex": search_term, "$options": "i"}},
                {"description":  {"$regex": search_term, "$options": "i"}},
                {"features":     {"$regex": search_term, "$options": "i"}},
                {"property_type":{"$regex": search_term, "$options": "i"}}
            ]
        }

    print(f"Generated query for '{search_term}': {query}")
    return query

@app.route('/api/properties', methods=['GET'])
def get_properties():
    try:
        # Retrieve pagination and searchTerm from query params
        limit = int(request.args.get('limit', 20)) 
        page = int(request.args.get('page', 1))     
        search_term = request.args.get('searchTerm', '').strip()

        collection = get_properties_collection("daft")

        # Calculate skip for pagination
        skip = (page - 1) * limit

        # Build query if there's a search term
        if search_term:
            query = parse_search_query(search_term)
        else:
            query = {}

        # Timing the database query
        start_time = time.time()

        # Query the database
        total_properties = collection.count_documents(query)
        properties = list(
            collection
            .find(query, {"_id": 0})
            .skip(skip)
            .limit(limit)
        )

         # TIMING END: Calculate query time
        query_time_ms = (time.time() - start_time) * 1000  # Convert to milliseconds
        print(f"Database Query Time: {query_time_ms:.2f}ms for query: {query}")


        return jsonify({
            "properties": properties,
            "total": total_properties,
            "queryUsed": query  
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
