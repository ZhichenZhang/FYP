from bs4 import BeautifulSoup
import requests

def scrape_myhome_details(property_url):
    """Scrapes the details of a single property from MyHome."""
    try:
        property_response = requests.get(property_url)
        property_response.raise_for_status()
        property_soup = BeautifulSoup(property_response.text, 'html.parser')

        # Extract detailed information from the property page
        bedrooms = "Bedrooms not available"
        bathrooms = "Bathrooms not available"
        area = "Area not available"
        eircode = "Eircode not available"
        description = "Description not available"
        map_link = "Map link not available"

        # Extract bedrooms
        bedroom_tag = property_soup.find("span", class_="info-strip--divider", text=lambda t: t and "bed" in t.lower())
        if bedroom_tag:
            bedrooms = bedroom_tag.text.strip()

        # Extract bathrooms
        bathroom_tag = property_soup.find("span", class_="info-strip--divider", text=lambda t: t and "bath" in t.lower())
        if bathroom_tag:
            bathrooms = bathroom_tag.text.strip()

        # Extract area
        area_tag = property_soup.find("span", class_="info-strip--divider", text=lambda t: t and "m" in t)
        if area_tag:
            area = area_tag.text.strip()

        # Extract eircode
        eircode_tag = property_soup.find("b", class_="info-strip--divider")
        if eircode_tag and len(eircode_tag.text.strip()) == 7:
            eircode = eircode_tag.text.strip()

        # Extract description
        description_tag = property_soup.find("section", class_="brochure__details--description-content")
        if description_tag:
            description = description_tag.text.strip()

        # Extract map link
        map_tag = property_soup.find("img", class_="brochure__static-map")
        if map_tag:
            map_link = map_tag["src"]

        # Return the extracted property details as a dictionary
        return {
            'bedrooms': bedrooms,
            'bathrooms': bathrooms,
            'area': area,
            'eircode': eircode,
            'description': description,
            'map_link': map_link,
        }

    except Exception as e:
        print(f"Error while retrieving additional property details: {e}")
        return None
