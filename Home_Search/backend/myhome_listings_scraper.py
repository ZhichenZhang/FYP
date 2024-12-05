from bs4 import BeautifulSoup
import requests
import time
from database_utils import get_properties_collection  # Import your database utility function
from myhome_property_details_scraper import scrape_myhome_details  # Import detailed scraper

# Get the MongoDB collection
db_collection = get_properties_collection('myhome')  # Use 'myhome' collection

# Function to get property details from a specific page
def get_property_details(page_num):
    base_url = f"https://www.myhome.ie/residential/ireland/property-for-sale?page={page_num}"
    properties = []
    try:
        # Request the page content
        response = requests.get(base_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find all property cards
        property_cards = soup.select("div.card.property-card")
        print(f"Number of property cards found on page {page_num}: {len(property_cards)}")

        for card in property_cards:
            try:
                # Extract property link
                link_tag = card.find("a")
                link = link_tag["href"] if link_tag else "Link not available"
                full_link = f"https://www.myhome.ie{link}" if link != "Link not available" else link

                # Extract price
                price_tag = card.select_one("h2.card-title")
                price = price_tag.text.strip() if price_tag else "Price not available"

                # Extract address
                address_tag = card.select_one("h3.card-text")
                address = address_tag.text.strip() if address_tag else "Address not available"

                # Use the `scrape_myhome_details` function to get more details
                details = scrape_myhome_details(full_link) if link != "Link not available" else {}

                # Merge basic details and detailed information
                property_data = {
                    'address': address,
                    'price': price,
                    'link': full_link,
                    'bedrooms': details.get('bedrooms', 'Bedrooms not available'),
                    'bathrooms': details.get('bathrooms', 'Bathrooms not available'),
                    'area': details.get('area', 'Area not available'),
                    'eircode': details.get('eircode', 'Eircode not available'),
                    'description': details.get('description', 'Description not available'),
                    'map_link': details.get('map_link', 'Map link not available'),
                }

                # Insert or update the property data in MongoDB
                db_collection.update_one(
                    {'link': full_link},     # Filter by unique link
                    {'$set': property_data},  # Update the document with the property data
                    upsert=True               # Insert if it doesn't exist
                )
                print(f"Inserted/updated property: {address}")

                # Append the property details to the list
                properties.append(property_data)

            except Exception as e:
                print(f"Error occurred while processing a property card: {e}")

    except Exception as e:
        print(f"Error while loading page {page_num}: {e}")

    return properties

# Main function to scrape multiple pages
def scrape_myhome_listings(base_url, max_pages=5):
    for page_num in range(1, max_pages + 1):
        print(f"Scraping page {page_num} of MyHome listings...")
        get_property_details(page_num)
        time.sleep(1)  # Optional delay between requests

    print("Scraping complete. Data saved to MongoDB.")
