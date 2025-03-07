import pytest
import json
from app import app, parse_search_query
from unittest.mock import patch, MagicMock

@pytest.fixture
def client():
    """Flask test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_parse_search_query_empty():
    """Test parsing an empty query"""
    query = parse_search_query("")
    assert isinstance(query, dict)
    assert "$or" in query

def test_parse_search_query_location():
    """Test parsing query with location"""
    query = parse_search_query("dublin")
    assert "$and" in query
    # Should have at least one condition
    assert len(query["$and"]) > 0

def test_parse_search_query_beds():
    """Test parsing query with bedroom specification"""
    query = parse_search_query("3 bed house")
    assert "$and" in query
    
    # Check for bedroom condition
    bed_match = False
    for condition in query["$and"]:
        if "bedrooms" in condition:
            bed_match = True
            break
    assert bed_match, "Bedroom condition not found in query"

def test_parse_search_query_price():
    """Test parsing query with price specification"""
    query = parse_search_query("house under 400k")
    assert "$and" in query
    
    # Check for price condition
    price_match = False
    for condition in query["$and"]:
        if "price_numeric" in condition:
            price_match = True
            assert "$lte" in condition["price_numeric"]
            assert condition["price_numeric"]["$lte"] == 400000
            break
    assert price_match, "Price condition not found in query"

@patch('app.get_properties_collection')
def test_get_properties_no_params(mock_get_collection, client):
    """Test /api/properties endpoint with no parameters"""
    # Mock database collection
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    
    # Mock the find method to return test data
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = [
        {
            "address": "123 Main St, Dublin",
            "price": "€350,000",
            "bedrooms": "3 Bed",
            "bathrooms": "2 Bath"
        }
    ]
    mock_collection.find.return_value = mock_cursor
    mock_collection.count_documents.return_value = 1
    
    # Test the endpoint
    response = client.get('/api/properties')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Check response structure
    assert 'properties' in data
    assert 'total' in data
    assert 'queryUsed' in data
    assert data['total'] == 1

@patch('app.get_properties_collection')
def test_get_properties_with_search(mock_get_collection, client):
    """Test /api/properties endpoint with search parameter"""
    # Mock database collection
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    
    # Mock find method
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = [
        {
            "address": "123 Main St, Dublin",
            "price": "€350,000",
            "bedrooms": "3 Bed",
            "bathrooms": "2 Bath"
        }
    ]
    mock_collection.find.return_value = mock_cursor
    mock_collection.count_documents.return_value = 1
    
    # Test with search parameter
    response = client.get('/api/properties?searchTerm=dublin+3+bed')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Verify MongoDB query contains Dublin and 3 bed
    search_query = mock_collection.find.call_args[0][0]
    assert "$and" in search_query
    
    # Check properties in response
    assert len(data['properties']) == 1
    assert data['properties'][0]['address'] == "123 Main St, Dublin"

@patch('app.get_properties_collection')
def test_get_properties_pagination(mock_get_collection, client):
    """Test /api/properties endpoint pagination"""
    # Mock database collection
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    
    # Mock find method
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = [{"address": f"Property {i}"} for i in range(10)]
    mock_collection.find.return_value = mock_cursor
    mock_collection.count_documents.return_value = 30
    
    # Test with pagination parameters
    response = client.get('/api/properties?page=2&limit=10')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Check pagination
    assert data['total'] == 30
    assert len(data['properties']) == 10
    
    # Verify skip and limit
    mock_cursor.skip.assert_called_once_with(10)
    mock_cursor.limit.assert_called_once_with(10)

@patch('app.get_properties_collection')
def test_get_properties_error(mock_get_collection, client):
    """Test error handling in /api/properties endpoint"""
    # Mock database to raise exception
    mock_get_collection.side_effect = Exception("Database error")
    
    # Test endpoint with error
    response = client.get('/api/properties')
    assert response.status_code == 500
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Database error' in data['error']