import csv
from datetime import datetime
import time
import random
import requests
from bs4 import BeautifulSoup
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

# Configuration variables
LLAMA_API_URL = "http://localhost:8080/generate"  # Replace with actual Llama model URL
ALIEXPRESS_SEARCH_URL = "https://www.aliexpress.com/wholesale"

def configure_headers():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    return headers

def configure_llama_model():
    model = OllamaLLM(model="llama3")
    return model

def ai_analyze_prompt(prompt):
    payload = ChatPromptTemplate.from_template(
        f"Extract key search terms from this prompt: {prompt}\nKey terms:"
    )
    response = configure_llama_model().invoke(payload)
    key_terms = response.strip().split(", ")
    print(f"The response is {key_terms}")
    return key_terms

def search_aliexpress(key_terms):

    headers = configure_headers()
    search_url = f"{ALIEXPRESS_SEARCH_URL}?SearchText={'+'.join(key_terms)}"
    try:
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        product_links = []
        for item in soup.find_all('a'):
            href = item.get('href')
            if href and href.startswith("/item"):
                product_links.append("https://www.aliexpress.com" + href)
        
        return product_links
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return []

def extract_product_data(url):
    headers = configure_headers()
    
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title = soup.find('h1', class_='product-title-text').text.strip()
        price = soup.find('span', class_='product-price-value').text.strip()
        description = soup.find('div', class_='product-description').text.strip()
        
        product_data = {
            "Handle": f"product-{random.randint(1000, 9999)}",
            "Title": title,
            "Body (HTML)": f"<p>{description}</p>",
            "Vendor": "AliExpress",
            "Type": "",
            "Tags": "",
            "Published": "TRUE",
            "Option1 Name": "Size",
            "Option1 Value": "One Size",
            "Option2 Name": "Color",
            "Option2 Value": "Default",
            "Variant SKU": f"SKU-{random.randint(1000, 9999)}",
            "Variant Price": price,
            "Variant Inventory Qty": str(random.randint(10, 100)),
            "Image Src": soup.find('img', class_='magnifier-image')['src'],
        }
        
        return product_data

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

def create_csv_file(prompt, data):
    filename = f"ai_analyzed_{prompt.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())

            writer.writeheader()
            for product in data:
                writer.writerow(product)
        
        print(f"CSV file '{filename}' has been created.")
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")

def main():
    prompt = input("Enter a product prompt: ")
    key_terms = ai_analyze_prompt(prompt)
    product_links = search_aliexpress(key_terms)
    
    data = []
    for link in product_links:
        product_data = extract_product_data(link)
        if product_data:
            data.append(product_data)
            time.sleep(random.uniform(2, 5))  # Polite scraping
    
    if data:
        create_csv_file(prompt, data)
    else:
        print("No product data found.")

if __name__ == "__main__":
    main()
