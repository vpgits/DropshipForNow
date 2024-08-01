import requests
from bs4 import BeautifulSoup
import pandas as pd

def get_product_data(url):
    # Send a request to the AliExpress product page
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract product data
    title = soup.find('h1', class_='title--wrap--UUHae_g').text.strip() if soup.find('h1', class_='title--wrap--UUHae_g') else 'Title Not Found'
    description = soup.find('div', class_='description--wrap--LscZ0He').text.strip() if soup.find('div', class_='description--wrap--LscZ0He') else 'Description Not Found'
    price = soup.find('span', class_='price--current--I3Zeidd product-price-current').text.strip() if soup.find('span', class_='price--current--I3Zeidd product-price-current') else 'Price Not Found'
    image_url = soup.find('img', class_='image-view--previewWrap--ZnAzr0D')['src'] if soup.find('img', class_='image-view--previewWrap--ZnAzr0D') else 'Image Not Found'
    
    # Generate a unique handle from the title (for example purposes)
    handle = title.lower().replace(' ', '-').replace('/', '-').replace('&', 'and')

    product_data = {
        'Handle': handle,
        'Title': title,
        'Body (HTML)': description,
        'Vendor': 'AliExpress',
        'Type': 'Product',
        'Tags': '',  # Add tags if needed
        'Published': 'TRUE',
        'Option1 Name': '',  # Add options if applicable
        'Option1 Value': '',  # Add options if applicable
        'Variant SKU': '',  # Add SKU if available
        'Variant Grams': '',  # Add weight if available
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '',  # Add inventory quantity if available
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': price,
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',  # Add barcode if available
        'Image Src': image_url
    }
    
    return product_data

def save_to_csv(product_data):
    # Create a DataFrame
    df = pd.DataFrame([product_data])
    
    # Save to CSV
    df.to_csv('shopify_import.csv', index=False)
    print('CSV file has been created: shopify_import.csv')

def main():
    # Get the URL from the user
    url = input('Enter the AliExpress product URL: ')
    
    # Fetch and process product data
    product_data = get_product_data(url)
    
    # Save the data to a CSV file
    save_to_csv(product_data)

if __name__ == '__main__':
    main()
