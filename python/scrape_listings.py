import urllib.request
from bs4 import BeautifulSoup
from scrape_property_details import scrape_property_details
import time

def scrape_property_listings(base_url, output_file):
    """Scrapes property listings from Daft.ie and saves the data to a file."""
    page_index = 0
    has_properties = True  # Flag to continue scraping

    with open(output_file, 'w', encoding='utf-8') as file:
        while has_properties:
            url = base_url.format(page_index)
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'})

            try:
                resp = urllib.request.urlopen(req)
                content = resp.read()
                soup = BeautifulSoup(content, 'html.parser')

                # Extract property data
                properties = soup.find_all('li', class_='sc-57faabb7-2')

                if not properties:
                    print('No more properties found. Stopping scraping.')
                    has_properties = False
                    break

                for prop in properties:
                    try:
                        # Extract address
                        address = prop.find('div', {'data-tracking': 'srp_address'})
                        if address is None:
                            print("Address not found in the property listing.")
                            continue
                        address = address.get_text(strip=True)

                        # Extract price
                        price = prop.find('div', {'data-tracking': 'srp_price'})    
                        if price is None:
                            print("Price not found in the property listing.")
                            continue
                        price = price.get_text(strip=True)

                        # Extract other metadata
                        meta = prop.find('div', {'data-tracking': 'srp_meta'})
                        if meta is None:
                            print("Metadata not found in the property listing.")
                            continue
                        meta = meta.get_text(strip=True)

                        # Extract property link
                        link_tag = prop.find('a', href=True)
                        if link_tag is None:
                            print("Property link not found in the property listing.")
                            continue
                        
                        link = link_tag['href']
                        if not link.startswith('http'):
                            link = 'https://www.daft.ie' + link

                        # Fetch property details from the individual property page
                        property_details = scrape_property_details(link)

                        # Write the extracted data to the text file
                        file.write(f'Address: {address}\n')
                        file.write(f'Price: {price}\n')
                        file.write(f'Metadata: {meta}\n')
                        file.write(f'Details: {property_details}\n')
                        file.write('-' * 30 + '\n')

                    except AttributeError:
                        print("Error processing a property listing.")
                        continue

                print(f'Page starting from index {page_index} scraped successfully.')

                page_index += 20  # Move to the next page
                time.sleep(1)  # delay

            except Exception as e:
                print(f'Error fetching page starting from index {page_index}: {e}')
                break
