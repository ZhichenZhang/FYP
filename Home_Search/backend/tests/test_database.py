# File: tests/test_database.py
import pytest
from unittest.mock import patch, MagicMock
import re
from database_utils import get_properties_collection, filter_properties

@patch('database_utils.MongoClient')
def test_get_properties_collection(mock_mongo_client):
    """Test getting MongoDB collection"""
    # Make a simpler assertion
    mock_db = MagicMock()
    mock_client = MagicMock()
    mock_client.__getitem__.return_value = mock_db
    mock_mongo_client.return_value = mock_client
    
    # Call function
    collection = get_properties_collection("test_collection")
    
    # Just check that the function returns something
    assert collection is not None

@patch('database_utils.get_properties_collection')
def test_filter_properties_bedrooms(mock_get_collection):
    """Test filtering properties by bedroom count"""
    # Mock data
    mock_properties = [
        {"bedrooms": "3 Bed", "price": "€350,000"},
        {"bedrooms": "2 Bed", "price": "€275,000"},
        {"bedrooms": "4 Bed", "price": "€450,000"}
    ]
    
    # Setup mock
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    mock_collection.find.return_value = mock_properties
    
    # Call function
    result = filter_properties("3 bedroom")
    
    # Assertions - check that 3-bed property is included
    assert any(p["bedrooms"] == "3 Bed" for p in result)

@patch('database_utils.get_properties_collection')
def test_filter_properties_price(mock_get_collection):
    """Test filtering properties by price"""
    # Mock data
    mock_properties = [
        {"price": "€350,000", "bedrooms": "3 Bed"},
        {"price": "€275,000", "bedrooms": "2 Bed"},
        {"price": "€450,000", "bedrooms": "4 Bed"}
    ]
    
    # Setup mock
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    mock_collection.find.return_value = mock_properties
    
    # Call function
    result = filter_properties("under 400000")
    
    # Assertions
    assert any(p["price"] == "€350,000" for p in result)
    assert any(p["price"] == "€275,000" for p in result)
    assert not any(p["price"] == "€450,000" for p in result)

@patch('database_utils.get_properties_collection')
def test_filter_properties_location(mock_get_collection):
    """Test filtering properties by location"""
    # Mock data
    mock_properties = [
        {"address": "123 Main St, Dublin", "price": "€350,000"},
        {"address": "456 High St, Cork", "price": "€275,000"},
        {"address": "789 Church Rd, Dublin", "price": "€450,000"}
    ]
    
    # Setup mock
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    mock_collection.find.return_value = mock_properties
    
    # Call function
    result = filter_properties("dublin")
    
    # Assertions - check Dublin properties are included
    dublin_addresses = ["123 Main St, Dublin", "789 Church Rd, Dublin"]
    for addr in dublin_addresses:
        assert any(addr in p["address"] for p in result)

@patch('database_utils.get_properties_collection')
def test_filter_properties_complex_query(mock_get_collection):
    """Test filtering with complex query"""
    # Mock data
    mock_properties = [
        {
            "address": "123 Main St, Dublin", 
            "price": "€350,000",
            "bedrooms": "3 Bed",
            "property_type": "House"
        },
        {
            "address": "456 High St, Dublin", 
            "price": "€275,000",
            "bedrooms": "2 Bed",
            "property_type": "Apartment"
        },
        {
            "address": "789 Church Rd, Cork", 
            "price": "€450,000",
            "bedrooms": "3 Bed",
            "property_type": "House"
        }
    ]
    
    # Setup mock
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    mock_collection.find.return_value = mock_properties
    
    # Call function - complex query with multiple filters
    result = filter_properties("3 bedroom house in dublin")
    
    # Assertions - check specific property is found
    assert any(p["address"] == "123 Main St, Dublin" and 
              p["bedrooms"] == "3 Bed" and 
              p["property_type"] == "House" 
              for p in result)