import csv
import requests
from bs4 import BeautifulSoup
import re

def get_product_info(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract basic product information with checks
    title_tag = soup.find('h1', class_='product-title-text')
    price_tag = soup.find('span', class_='product-price-value')
    description_tag = soup.find('div', class_='product-description')
    
    if not title_tag or not price_tag or not description_tag:
        raise ValueError("Unable to find product information on the page")
    
    title = title_tag.text.strip()
    price = price_tag.text.strip()
    description = description_tag.text.strip()
    
    # Extract image URLs
    image_container = soup.find('div', class_='images-view-list')
    if not image_container:
        raise ValueError("Unable to find image container on the page")
    
    image_urls = [img['src'] for img in image_container.find_all('img')]
    
    return {
        'Title': title,
        'Body HTML': description,
        'Vendor': 'AliExpress',
        'Type': 'Physical',
        'Price': price,
        'Image Src': ','.join(image_urls)
    }

def create_shopify_csv(product_info, filename='shopify_product.csv'):
    fieldnames = ['Handle', 'Title', 'Body HTML', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category', 'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN', 'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels', 'Google Shopping / Condition', 'Google Shopping / Custom Product', 'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1', 'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3', 'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit', 'Variant Tax Code', 'Cost per item']

    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        
        row = {field: '' for field in fieldnames}
        row.update(product_info)
        row['Handle'] = re.sub(r'[^a-zA-Z0-9]+', '-', product_info['Title'].lower())
        row['Published'] = 'TRUE'
        row['Variant Inventory Policy'] = 'continue'
        row['Variant Fulfillment Service'] = 'manual'
        row['Variant Requires Shipping'] = 'TRUE'
        row['Variant Taxable'] = 'TRUE'
        
        writer.writerow(row)

# Example usage
try:
    aliexpress_url = input("Enter the AliExpress product URL: ")
    product_info = get_product_info(aliexpress_url)
    create_shopify_csv(product_info)
    print("CSV file created successfully.")
except ValueError as e:
    print(f"Error: {e}")
