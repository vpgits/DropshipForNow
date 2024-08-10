import puppeteer from 'puppeteer';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function scrapeAliExpress(searchTerm) {
  const cacheKey = `aliexpress:${searchTerm}`;
  const cachedResults = await redis.get(cacheKey);

  if (cachedResults) {
    return JSON.parse(cachedResults);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchTerm)}`);

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.product-item')).map(el => ({
      name: el.querySelector('.product-title').innerText,
      price: el.querySelector('.product-price').innerText,
      image: el.querySelector('.product-img img').src,
      url: el.querySelector('a').href,
    }));
  });

  await browser.close();

  // Cache results for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(products));

  return products;
}