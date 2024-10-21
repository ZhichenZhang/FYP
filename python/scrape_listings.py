import urllib.request
from bs4 import BeautifulSoup
from scrape_property_details import scrape_property_details
from database import get_properties_collection
import time

properties_collection = get_properties_collection()

def scrape_property_listings(base_url):
    """Scrapes property listings from Daft.ie and stores them in MongoDB."""
    page_index = 0
    has_properties = True  # Flag to continue scraping

    while has_properties:
        url = base_url.format(page_index)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'})

        try:
            resp = urllib.request.urlopen(req)
            content = resp.read()
            soup = BeautifulSoup(content, 'html.parser')

            # Extract property data
            properties = soup.find_all('a', class_='sc-57faabb7-16 fOhOaE')

            if not properties:
                print('No more properties found. Stopping scraping.')
                has_properties = False
                break

            for prop in properties:
                try:
                    # Extract property link
                    link = prop.get('href')
                    if not link:
                        print("Property link not found in the property listing.")
                        continue

                    # Convert relative URL to absolute URL
                    if not link.startswith('http'):
                        link = 'https://www.daft.ie' + link

                    # Fetch property details from the individual property page
                    details = scrape_property_details(link)
                    if details:
                        # Prepare the property data dictionary
                        property_data = {
                            'address': details.get('address', 'Address not available'),
                            'price': details.get('price', 'Price not available'),
                            'bedrooms': details.get('bedrooms', 'Bedrooms not available'),
                            'bathrooms': details.get('bathrooms', 'Bathrooms not available'),
                            'area': details.get('area', 'Area not available'),
                            'property_type': details.get('property_type', 'Property type not available'),
                            'description': details.get('description', 'Description not available'),
                            'features': details.get('features', []),
                            'map_link': details.get('map_link'),
                            'link': details.get('link')
                        }

                        # Upsert into MongoDB: update the existing entry or insert if not found
                        properties_collection.update_one(
                            {'link': link},     # Find a document with this link
                            {'$set': property_data},  # Update the document with the property data
                            upsert=True          # Insert if no document matches the filter
                        )

                except AttributeError as e:
                    print(f"Error processing a property listing: {e}")
                    continue

            print(f'Page starting from index {page_index} scraped successfully.')

            page_index += 20  # Move to the next page
            time.sleep(1)  # Optional delay

        except Exception as e:
            print(f'Error fetching page starting from index {page_index}: {e}')
            break
