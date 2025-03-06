from daft_listings_scraper import scrape_daft_listings

if __name__ == "__main__":
    # Base URL for Daft listings
    base_url_daft = 'https://www.daft.ie/property-for-sale/ireland?from={}&pageSize=20'
    scrape_daft_listings(base_url_daft)


