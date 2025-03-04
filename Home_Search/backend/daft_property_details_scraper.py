import urllib.request
from bs4 import BeautifulSoup
import re

def scrape_daft_details(link):
    """Fetches and parses the property details from a given link, returning structured data."""
    try:
        req = urllib.request.Request(
            link,
            headers={
                'User-Agent': (
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) '
                    'Chrome/107.0.0.0 Safari/537.36'
                )
            }
        )
        resp = urllib.request.urlopen(req)
        content = resp.read()

        soup = BeautifulSoup(content, 'html.parser')

        # ---------------------------------------------------------------------
        # 1. Extract address
        # ---------------------------------------------------------------------
        address_tag = soup.find('h1', {'data-testid': 'address'})
        address = address_tag.get_text(strip=True) if address_tag else 'Address not available.'

        # ---------------------------------------------------------------------
        # 2. Extract price
        # ---------------------------------------------------------------------
        price_div = soup.find('div', {'data-testid': 'price'})
        price_tag = price_div.find('h2') if price_div else None
        price = price_tag.get_text(strip=True) if price_tag else 'Price not available.'

        # ---------------------------------------------------------------------
        # 3. Extract bedrooms, bathrooms, floor area, property type
        # ---------------------------------------------------------------------
        beds_tag = soup.find('p', {'data-testid': 'beds'})
        beds = beds_tag.get_text(strip=True) if beds_tag else 'Beds not available.'

        baths_tag = soup.find('p', {'data-testid': 'baths'})
        baths = baths_tag.get_text(strip=True) if baths_tag else 'Baths not available.'

        floor_area_tag = soup.find('p', {'data-testid': 'floor-area'})
        floor_area = floor_area_tag.get_text(strip=True) if floor_area_tag else 'Floor area not available.'

        property_type_tag = soup.find('p', {'data-testid': 'property-type'})
        property_type = property_type_tag.get_text(strip=True) if property_type_tag else 'Property type not available.'

        # ---------------------------------------------------------------------
        # 4. Extract the description
        # ---------------------------------------------------------------------
        description_tag = soup.find('div', {'data-testid': 'description'})
        if description_tag:
            # Remove any <h2> heading inside
            description_heading = description_tag.find('h2')
            if description_heading:
                description_heading.extract()
            description = description_tag.get_text(strip=True)
        else:
            description = 'Description not available.'

        # ---------------------------------------------------------------------
        # 5. Extract property features
        # ---------------------------------------------------------------------
        features_list = []
        features_div = soup.find('div', {'data-testid': 'features'})
        if features_div:
            feature_items = features_div.find_all('li')
            features_list = [item.get_text(strip=True) for item in feature_items]
        else:
            # Not all listings have this
            pass

        # ---------------------------------------------------------------------
        # 6. Extract map link (if available)
        # ---------------------------------------------------------------------
        map_link_tag = soup.find('a', {'data-testid': 'streetview-button'})
        map_link = map_link_tag['href'] if map_link_tag else None

        # ---------------------------------------------------------------------
        # 7.Extract BER rating
        # ---------------------------------------------------------------------
        # Potentially found under data-testid="ber"
        ber_rating = 'BER not available.'
        ber_div = soup.find('div', {'data-testid': 'ber'})
        if ber_div:
            # Approach 1: aria-label="BER B2"
            aria_div = ber_div.find(attrs={'aria-label': True})
            if aria_div:
                ber_rating = aria_div['aria-label']  # e.g. "BER B2"
            else:
                # Approach 2: <svg><title>ber_B2_large</title></svg>
                svg_tag = ber_div.find('svg')
                if svg_tag and svg_tag.find('title'):
                    title_text = svg_tag.find('title').get_text(strip=True)
                    # Might be "ber_B2_large" => parse "B2"
                    match = re.search(r'ber_(\w+)_large', title_text, re.IGNORECASE)
                    if match:
                        ber_rating = f"BER {match.group(1)}"

        # ---------------------------------------------------------------------
        # 8.Extract date entered
        # ---------------------------------------------------------------------
        date_entered = 'Date not available.'
        stats_div = soup.find('div', {'data-testid': 'statistics'})
        if stats_div:
            # Look for DD/MM/YYYY
            match = re.search(r'(\d{2}/\d{2}/\d{4})', stats_div.get_text())
            if match:
                date_entered = match.group(1)

        # ---------------------------------------------------------------------
        # Assemble final structured data
        # ---------------------------------------------------------------------
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
            'link': link,
            # New fields
            'ber_rating': ber_rating,
            'date_entered': date_entered
        }

        return property_details

    except Exception as e:
        print(f'Error fetching property details from {link}: {e}')
        return None
