import urllib.request
from bs4 import BeautifulSoup
from daft_property_details_scraper import scrape_daft_details
from database_utils import get_properties_collection
import time
import re  # <-- you'll need re for stripping out digits

properties_collection = get_properties_collection('daft')

def scrape_daft_listings(base_url, max_page_index=12740):
    page_index = 0
    has_properties = True

    while has_properties and page_index <= max_page_index:
        url = base_url.format(page_index)
        req = urllib.request.Request(
            url,
            headers={'User-Agent': "Brave/1.49.120"}
        )

        try:
            resp = urllib.request.urlopen(req)
            content = resp.read()
            soup = BeautifulSoup(content, 'html.parser')

            # Adjust this selector if Daft changes their classes again
            properties = soup.find_all('a', class_='sc-b457dee4-17 kUElAW')

            if not properties:
                print('No more properties found. Stopping scraping.')
                has_properties = False
                break

            for prop in properties:
                try:
                    link = prop.get('href')
                    if not link:
                        print("Property link not found in the property listing.")
                        continue

                    # Convert relative URL
                    if not link.startswith('http'):
                        link = 'https://www.daft.ie' + link

                    # Fetch property details (strings, etc.)
                    details = scrape_daft_details(link)
                    if details:
                        # ----------------------------------------------
                        # 1) Parse numeric price
                        # ----------------------------------------------
                        price_str = details.get('price', '')  # e.g. "€695,000"
                        digits = re.sub(r'[^\d]', '', price_str)  # => "695000"
                        if digits.isdigit():
                            details['price_numeric'] = int(digits)
                        else:
                            details['price_numeric'] = None

                        # ----------------------------------------------
                        # 2) Parse numeric bedrooms
                        # ----------------------------------------------
                        beds_str = details.get('bedrooms', '')  # e.g. "3 Bed"
                        bed_match = re.search(r'(\d+)', beds_str)
                        if bed_match:
                            details['bedrooms_numeric'] = int(bed_match.group(1))
                        else:
                            details['bedrooms_numeric'] = None

                        # ----------------------------------------------
                        # 3) Now upsert into MongoDB
                        # ----------------------------------------------
                        properties_collection.update_one(
                            {'link': link},
                            {'$set': details},
                            upsert=True
                        )
                        print(f"Scraped property at address: {details['address']}")
                except AttributeError as e:
                    print(f"Error processing a property listing: {e}")
                    continue

            print(f'Page starting from index {page_index} scraped successfully.')
            page_index += 20  # Next page
            time.sleep(1)     # Optional delay

        except Exception as e:
            print(f'Error fetching page starting from index {page_index}: {e}')
            break

if __name__ == "__main__":
    base_url = 'https://www.daft.ie/property-for-sale/ireland?from={}&pageSize=20'
    scrape_daft_listings(base_url, max_page_index=12740)
