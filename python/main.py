from scrape_listings import scrape_property_listings

if __name__ == "__main__":
    # Base URL for property listings
    base_url = 'https://www.daft.ie/property-for-sale/ireland?from={}&pageSize=20'
    
    # Output file where scraped data will be saved
    output_file = 'property_data.txt'
    
    # Start scraping
    scrape_property_listings(base_url, output_file)
