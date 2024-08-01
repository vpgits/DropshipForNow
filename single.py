from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from lxml import html
import time
import json
import requests
from bs4 import BeautifulSoup
import pandas as pd
import re

# from prod_spec import get_product_specs  # Ensure you have this module or replace with relevant code

# Variables to change according to preferences
myUrl = 'https://www.aliexpress.com/w/wholesale-fitness-products.html?spm=a2g0o.productlist.auto_suggest.2.5297338cHL9JXh'
output_file = 'products.json'
category = 'fitness'

def add_to_main_list(lst, main):
    for i in lst:
        if i[0] == '/':
            main.append('https:' + i.strip())
        else:
            main.append(i.strip())

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

def save_to_json(product_data):
    with open(output_file, 'w', encoding='utf8') as fout:
        json.dump(product_data, fout, ensure_ascii=False)
    print(f'JSON file has been created: {output_file}')

def main():
    profile = webdriver.FirefoxProfile('./7t2bdg4x.Selenium_AL')
    browser = webdriver.Firefox(profile)
    
    titles = []
    stores = []
    prices = []
    reviews = []
    nb_solds = []
    thumbnail_links = []
    prod_links = []

    print('Finding products, please wait')

    for page_nb in range(1, 2):
        browser.get(myUrl + '&page={}'.format(page_nb))

        # Scroll down page slowly to wait for hidden products to show
        start_time = time.time()
        seconds = 5

        while True:
            current_time = time.time()
            elapsed_time = current_time - start_time

            browser.find_element_by_tag_name('body').send_keys(Keys.PAGE_DOWN)
            time.sleep(0.5)

            if elapsed_time > seconds:
                break

        # Get HTML content
        tree = html.fromstring(browser.page_source)

        # Get data
        title = tree.xpath('//a[@class="item-title"]/@title')
        store = tree.xpath('//a[@class="store-name"]/text()')
        price = tree.xpath('//span[@class="price-current"]/text()')
        review = tree.xpath('//span[@class="rating-value"]/text()')
        nb_sold = tree.xpath('//a[@class="sale-value-link"]/text()')
        thumbnail_link = tree.xpath('//img[@class="item-img"]/@src')
        prod_link = tree.xpath('//a[@class="item-title"]/@href')

        # Append collected data from iteration to the main list
        add_to_main_list(title, titles)
        add_to_main_list(store, stores)
        add_to_main_list(price, prices)
        add_to_main_list(review, reviews)
        add_to_main_list(nb_sold, nb_solds)
        add_to_main_list(thumbnail_link, thumbnail_links)
        add_to_main_list(prod_link, prod_links)

    products = list(zip(titles, stores, prices, reviews, nb_solds, thumbnail_links, prod_links))
    prods = []

    for el in products:
        di = {}
        di['title'], di['store'], temp_price, temp_review, temp_nb_sold, di['thumbnail_link'], di['prod_link'] = el
        
        # Turn price and number sold to numbers
        temp_price_lst = re.findall('\d+', temp_price)
        el = ''.join(temp_price_lst[:-1])
        di['price'] = float(el + '.' + temp_price_lst[-1])

        # Reviews in float format
        di['review'] = float(temp_review)
        
        # Number sold in int format
        di['nb_sold'] = int(re.findall('\d+', temp_nb_sold)[0])
        di['category'] = category
        prods.append(di)

    # Get product specifications
    prod_no = 1
    prod_total = len(prods)
    print(f'Found {len(prods)} products')

    for prod in prods:
        link = prod['prod_link']
        product_data = get_product_data(link)
        prod.update(product_data)
        print(f'Scraped {prod_no}/{prod_total} of products')
        prod_no += 1

    browser.close()
    
    save_to_json(prods)
    print(f'Finished scraping {len(prods)} products')

if __name__ == '__main__':
    main()
