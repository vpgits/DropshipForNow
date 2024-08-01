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
    
    # Extract rating and reviews
    rating_div = soup.find('div', class_='feedback-section')
    rating = rating_div.find('strong').text.strip() if rating_div and rating_div.find('strong') else 'Rating Not Found'
    reviews = rating_div.find('a').text.strip() if rating_div and rating_div.find('a') else 'Reviews Not Found'

    # Extract amount sold
    orders_div = soup.find('span', class_='order-num')
    orders = orders_div.text.strip() if orders_div else 'Orders Not Found'
    
    # Generate a unique handle from the title (for example purposes)
    handle = title.lower().replace(' ', '-').replace('/', '-').replace('&', 'and')

    product_data = {
        'Handle': handle,
        'Title': title,
        'Description': description,
        'Price': price,
        'Rating': rating,
        'Reviews': reviews,
        'Orders Sold': orders,
        'Image URL': image_url
    }
    
    return product_data

def save_to_csv(product_data):
    # Create a DataFrame
    df = pd.DataFrame([product_data])
    
    # Save to CSV
    df.to_csv('aliexpress_product_data.csv', index=False)
    print('CSV file has been created: aliexpress_product_data.csv')

def main():
    # Get the URL from the user
    url = input('Enter the AliExpress product URL: ')
    
    # Fetch and process product data
    product_data = get_product_data(url)
    
    # Save the data to a CSV file
    save_to_csv(product_data)

if __name__ == '__main__':
    main()
