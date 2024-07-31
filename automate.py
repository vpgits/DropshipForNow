from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random
import requests
from bs4 import BeautifulSoup
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

LLAMA_API_URL = "http://localhost:8080/generate"
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
    prompt_template = PromptTemplate.from_template(
        f"Extract key search terms from this prompt: {prompt}\nKey terms:"
    )
    formatted_prompt = prompt_template.format_prompt().to_string()
    response = configure_llama_model().invoke(formatted_prompt)
    key_terms = response.strip().split(", ")
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
        return None

@app.route('/api/search', methods=['POST'])
def search_products():
    prompt = request.json.get('prompt')
    print(prompt)
    key_terms = ai_analyze_prompt(prompt)
    product_links = search_aliexpress(key_terms)
    
    data = []
    for link in product_links:
        product_data = extract_product_data(link)
        if product_data:
            data.append(product_data)
            time.sleep(random.uniform(2, 5))  # Polite scraping
    
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
