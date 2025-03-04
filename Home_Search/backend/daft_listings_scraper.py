import urllib.request
from bs4 import BeautifulSoup
from daft_property_details_scraper import scrape_daft_details
from database_utils import get_properties_collection
import time

properties_collection = get_properties_collection('daft')

def scrape_daft_listings(base_url):

    page_index = 0
    has_properties = True

    while has_properties:
        url = base_url.format(page_index)
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': (
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) '
                    'Chrome/107.0.0.0 Safari/537.36'
                )
            }
        )

        try:
            resp = urllib.request.urlopen(req)
            content = resp.read()
            soup = BeautifulSoup(content, 'html.parser')

            # -----------------------------------------------------------------
            # NEW: Updated anchor class or approach to find property links
            # -----------------------------------------------------------------
            properties = soup.find_all('a', class_='sc-b457dee4-17 kUEIAW')

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

                    # Convert relative URL to absolute if needed
                    if not link.startswith('http'):
                        link = 'https://www.daft.ie' + link

                    # Fetch full details from the property page
                    details = scrape_daft_details(link)
                    if details:
                        # Upsert into MongoDB
                        properties_collection.update_one(
                            {'link': link},
                            {'$set': details},
                            upsert=True
                        )

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
    scrape_daft_listings(base_url)
