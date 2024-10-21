# main.py
from scrape_listings import scrape_property_listings

if __name__ == "__main__":
    # Base URL for property listings
    base_url = 'https://www.daft.ie/property-for-sale/ireland?from={}&pageSize=20'

    # Start scraping and storing data
    scrape_property_listings(base_url)
