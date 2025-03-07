# File: tests/test_integration.py
import pytest
import json
import os
from app import app
from unittest.mock import patch, MagicMock
import mongomock

@pytest.fixture
def client():
    """Flask test client with mock database"""
    # Configure app for testing
    app.config['TESTING'] = True
    app.config['DEBUG'] = False
    
    # Set up mock MongoDB connection
    with patch('database_utils.MongoClient') as mock_mongo:
        # Create mongomock client
        mock_client = mongomock.MongoClient()
        mock_mongo.return_value = mock_client
        
        # Create test database and collection
        db = mock_client['test_db']
        collection = db['daft']
        
        # Insert test data
        collection.insert_many([
            {
                "address": "123 Main St, Dublin 1",
                "price": "€350,000",
                "price_numeric": 350000,
                "bedrooms": "3 Bed",
                "bedrooms_numeric": 3,
                "bathrooms": "2 Bath",
                "property_type": "Semi-Detached",
                "description": "Beautiful house with garden and parking",
                "features": ["Garden", "Parking", "Central Heating"]
            },
            {
                "address": "45 High Street, Dublin 2",
                "price": "€450,000",
                "price_numeric": 450000,
                "bedrooms": "4 Bed",
                "bedrooms_numeric": 4,
                "bathrooms": "3 Bath",
                "property_type": "Detached",
                "description": "Spacious family home with large garden",
                "features": ["Garden", "Garage", "Fireplace"]
            },
            {
                "address": "78 Church Road, Cork",
                "price": "€275,000",
                "price_numeric": 275000,
                "bedrooms": "2 Bed",
                "bedrooms_numeric": 2,
                "bathrooms": "1 Bath",
                "property_type": "Terraced",
                "description": "Cozy terraced house in city center",
                "features": ["Renovated", "City Center"]
            }
        ])
        
        # Patch the get_properties_collection function
        with patch('app.get_properties_collection') as mock_get_collection:
            mock_get_collection.return_value = collection
            
            # Create test client
            with app.test_client() as client:
                yield client

def test_search_flow(client):
    """Test the complete search flow"""
    # Test 1: All properties
    response = client.get('/api/properties')
    data = json.loads(response.data)
    assert len(data['properties']) == 3
    
    # Test 2: Filter by location
    response = client.get('/api/properties?searchTerm=dublin')
    data = json.loads(response.data)
    assert len(data['properties']) == 2
    assert all("Dublin" in prop['address'] for prop in data['properties'])
    
    # Test 3: Filter by bedrooms
    response = client.get('/api/properties?searchTerm=3+bed')
    data = json.loads(response.data)
    assert len(data['properties']) == 1
    assert data['properties'][0]['bedrooms'] == "3 Bed"
    
    # Test 4: Filter by price
    response = client.get('/api/properties?searchTerm=under+300k')
    data = json.loads(response.data)
    assert len(data['properties']) == 1
    assert data['properties'][0]['price'] == "€275,000"
    
    # Test 5: Complex filter
    response = client.get('/api/properties?searchTerm=dublin+3+bed+under+400k')
    data = json.loads(response.data)
    assert len(data['properties']) == 1
    assert "Dublin" in data['properties'][0]['address']
    assert data['properties'][0]['bedrooms'] == "3 Bed"
    assert data['properties'][0]['price'] == "€350,000"

def test_pagination(client):
    """Test pagination functionality"""
    # Get page 1 with limit 2
    response = client.get('/api/properties?limit=2&page=1')
    data = json.loads(response.data)
    assert len(data['properties']) == 2
    assert data['total'] == 3
    
    # Get page 2 with limit 2
    response = client.get('/api/properties?limit=2&page=2')
    data = json.loads(response.data)
    assert len(data['properties']) == 1
    assert data['total'] == 3

@patch('app.parse_search_query')
def test_search_query_parsing_integration(mock_parse_search_query, client):
    """Test that search query parsing is called correctly"""
    # Configure mock
    mock_parse_search_query.return_value = {"$and": [{"property_type": {"$regex": "house", "$options": "i"}}]}
    
    # Call API with search term
    client.get('/api/properties?searchTerm=house+in+dublin')
    
    # Verify parse_search_query was called with correct argument
    mock_parse_search_query.assert_called_once_with('house in dublin')  # + is converted to space