from bs4 import BeautifulSoup
import urllib.request

def scrape_property_details(link):
    """Fetches and parses the property details from a given link."""
    try:
        req = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'})
        resp = urllib.request.urlopen(req)
        content = resp.read()

        soup = BeautifulSoup(content, 'html.parser')

        # Extracting the description using data-testid attribute
        description_div = soup.find('div', {'data-testid': 'description'})
        description = description_div.get_text(strip=True) if description_div else 'Description not available.'

        features_div = soup.find('div', class_='sc-9eebe19d-4 bdZnCt')
        features = features_div.get_text(strip=True) if features_div else 'Features not available.'

        return f'Description: {description}\nFeatures: {features}'

    except Exception as e:
        print(f'Error fetching property details from {link}: {e}')
        return 'Details not available.'
