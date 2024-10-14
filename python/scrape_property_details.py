import urllib.request
from bs4 import BeautifulSoup

def scrape_property_details(link):
    """Fetches and parses the property details from a given link."""
    try:
        req = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'})
        resp = urllib.request.urlopen(req)
        content = resp.read()

        soup = BeautifulSoup(content, 'html.parser')

        
        description = soup.find('div', class_='description-class')  
        features = soup.find('div', class_='features-class')  

        if description and features:
            return f'Description: {description.get_text(strip=True)}\nFeatures: {features.get_text(strip=True)}'
        else:
            return 'Details not available.'

    except Exception as e:
        print(f'Error fetching property details from {link}: {e}')
        return 'Details not available.'
