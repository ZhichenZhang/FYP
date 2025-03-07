# File: tests/test_scrapers.py
import pytest
from unittest.mock import patch, MagicMock
from io import BytesIO
from bs4 import BeautifulSoup
from daft_property_details_scraper import scrape_daft_details
from daft_listings_scraper import scrape_daft_listings

@patch('urllib.request.urlopen')
def test_scrape_daft_details(mock_urlopen):
    """Test property details scraper"""
    # Create mock HTML content
    mock_html = """
    <html>
    <head><title>Test Property</title></head>
    <body>
        <h1 data-testid="address">123 Test Street, Dublin</h1>
        <div data-testid="price"><h2>€395,000</h2></div>
        <p data-testid="beds">3 Bed</p>
        <p data-testid="baths">2 Bath</p>
        <p data-testid="floor-area">110 m²</p>
        <p data-testid="property-type">Semi-Detached</p>
        <div data-testid="description">A lovely property in Dublin city.</div>
        <div data-testid="features">
            <li>Garden</li>
            <li>Parking</li>
        </div>
        <a data-testid="streetview-button" href="https://maps.example.com/view">View Map</a>
        <div data-testid="ber">
            <div aria-label="BER B2"></div>
        </div>
        <div data-testid="statistics">
            Added on 12/01/2023
        </div>
    </body>
    </html>
    """
    
    # Configure the mock to return our HTML
    mock_response = MagicMock()
    mock_response.read.return_value = mock_html.encode('utf-8')
    mock_urlopen.return_value = mock_response
    
    # Call the function
    result = scrape_daft_details("https://example.com/property")
    
    # Check the parsed data
    assert result is not None
    assert result['address'] == "123 Test Street, Dublin"
    assert result['price'] == "€395,000"
    assert result['bedrooms'] == "3 Bed"
    assert result['bathrooms'] == "2 Bath"
    assert result['area'] == "110 m²"
    assert result['property_type'] == "Semi-Detached"
    assert result['description'] == "A lovely property in Dublin city."
    assert len(result['features']) == 2
    assert "Garden" in result['features']
    assert result['map_link'] == "https://maps.example.com/view"
    assert result['ber_rating'] == "BER B2"
    assert result['date_entered'] == "12/01/2023"

@patch('urllib.request.urlopen')
def test_scrape_daft_details_missing_data(mock_urlopen):
    """Test scraper with missing data elements"""
    # Create mock HTML with missing elements
    mock_html = """
    <html>
    <body>
        <h1 data-testid="address">123 Test Street, Dublin</h1>
        <div data-testid="price"><h2>€395,000</h2></div>
        <!-- Missing beds, baths, etc. -->
    </body>
    </html>
    """
    
    # Configure the mock to return our HTML
    mock_response = MagicMock()
    mock_response.read.return_value = mock_html.encode('utf-8')
    mock_urlopen.return_value = mock_response
    
    # Call the function
    result = scrape_daft_details("https://example.com/property")
    
    # Check the parsed data handles missing elements
    assert result is not None
    assert result['address'] == "123 Test Street, Dublin"
    assert result['price'] == "€395,000"
    assert result['bedrooms'] == "Beds not available."
    assert result['bathrooms'] == "Baths not available."
    assert result['description'] == "Description not available."
    assert result['features'] == []  # Empty list for missing features

@patch('urllib.request.urlopen')
def test_scrape_daft_details_error_handling(mock_urlopen):
    """Test scraper error handling"""
    # Configure the mock to raise an exception
    mock_urlopen.side_effect = Exception("Network error")
    
    # Call the function
    result = scrape_daft_details("https://example.com/property")
    
    # Should return None on error
    assert result is None

@patch('daft_listings_scraper.scrape_daft_details')
@patch('urllib.request.urlopen')
@patch('daft_listings_scraper.get_properties_collection')
def test_scrape_daft_listings(mock_get_collection, mock_urlopen, mock_scrape_details):
    """Test listings scraper"""
    # Mock collection
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    
    # Mock HTML content for listings page
    mock_html = """
    <html>
    <body>
        <a class="sc-b457dee4-17 kUElAW" href="/property/123"></a>
        <a class="sc-b457dee4-17 kUElAW" href="/property/456"></a>
    </body>
    </html>
    """
    
    # Configure mock response
    mock_response = MagicMock()
    mock_response.read.return_value = mock_html.encode('utf-8')
    mock_urlopen.return_value = mock_response
    
    # Mock property details
    mock_scrape_details.return_value = {
        'address': '123 Test Street, Dublin',
        'price': '€395,000',
        'bedrooms': '3 Bed',
        'bathrooms': '2 Bath',
        'link': 'https://www.daft.ie/property/123'
    }
    
    # Call function with limited max_page_index for testing
    scrape_daft_listings('https://example.com/listings?from={}', max_page_index=0)
    
    # Verify scrape_daft_details was called for both links
    assert mock_scrape_details.call_count >= 2