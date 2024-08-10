import puppeteer from 'puppeteer';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function scrapeAliExpress(searchTerm) {
  const cacheKey = `aliexpress:${searchTerm}`;
  
  // Fetch cached results
  const cachedResults = await redis.get(cacheKey);
  
  // If cache exists, parse it as JSON and return
  if (cachedResults) {
    try {
      return JSON.parse(cachedResults);
    } catch (error) {
      console.error('Error parsing cached results:', error);
      // If parsing fails, we proceed to scrape the data again
    }
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchTerm)}`);

  const defaultImageUrl = '/images/default-image.jpg'; // Path to your default image
  const products = await page.evaluate((defaultImageUrl) => {
    return Array.from(document.querySelectorAll('.search-item-card-wrapper-gallery')).map(el => ({
      name: el.querySelector('.multi--titleText--nXeOvyr')?.innerText || 'No name available',
      price: el.querySelector('.multi--price-sale--U-S0jtj')?.innerText || 'No price available',
      image: el.querySelector('.images--item--3XZa6xf img')?.src || defaultImageUrl,
      url: el.querySelector('a')?.href || 'No URL available',
    }));
  }, defaultImageUrl);

  await browser.close();

  // Cache the results for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  
  return products;
}

