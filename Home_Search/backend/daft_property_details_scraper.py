import urllib.request
from bs4 import BeautifulSoup

def scrape_daft_details(link):
    """Fetches and parses the property details from a given link, returning structured data."""
    try:
        req = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'})
        resp = urllib.request.urlopen(req)
        content = resp.read()

        soup = BeautifulSoup(content, 'html.parser')

        # Extract address
        address_tag = soup.find('h1', {'data-testid': 'address'})
        address = address_tag.get_text(strip=True) if address_tag else 'Address not available.'

        # Extract price
        price_div = soup.find('div', {'data-testid': 'price'})
        price_tag = price_div.find('h2') if price_div else None
        price = price_tag.get_text(strip=True) if price_tag else 'Price not available.'

        # Extract bedrooms, bathrooms, and floor area
        beds_tag = soup.find('p', {'data-testid': 'beds'})
        beds = beds_tag.get_text(strip=True) if beds_tag else 'Beds not available.'

        baths_tag = soup.find('p', {'data-testid': 'baths'})
        baths = baths_tag.get_text(strip=True) if baths_tag else 'Baths not available.'

        floor_area_tag = soup.find('p', {'data-testid': 'floor-area'})
        floor_area = floor_area_tag.get_text(strip=True) if floor_area_tag else 'Floor area not available.'

        # Extract property type
        property_type_tag = soup.find('p', {'data-testid': 'property-type'})
        property_type = property_type_tag.get_text(strip=True) if property_type_tag else 'Property type not available.'

        # Extract the description without including the heading
        description_tag = soup.find('div', {'data-testid': 'description'})
        if description_tag:
            # Extracting all text inside the div, excluding the heading
            description_heading = description_tag.find('h2')
            if description_heading:
                description_heading.extract()  # Remove the heading
            description = description_tag.get_text(strip=True)
        else:
            description = 'Description not available.'

        # Extract property features
        features_list = []
        features_div = soup.find('div', {'data-testid': 'features'})
        if features_div:
            feature_items = features_div.find_all('li')
            features_list = [item.get_text(strip=True) for item in feature_items]
        else:
            print(f'Features list not found for property: {link}')

        # Extract map link (if available)
        map_link_tag = soup.find('a', {'data-testid': 'streetview-button'})
        map_link = map_link_tag['href'] if map_link_tag else None

        # Collect structured data
        property_details = {
            'address': address,
            'price': price,
            'bedrooms': beds,
            'bathrooms': baths,
            'area': floor_area,
            'property_type': property_type,
            'description': description,
            'features': features_list,
            'map_link': map_link,
            'link': link
        }

        return property_details

    except Exception as e:
        print(f'Error fetching property details from {link}: {e}')
        return None
