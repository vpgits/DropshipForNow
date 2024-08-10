import puppeteer from 'puppeteer';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function scrapeAliExpress(searchTerm) {
  const cacheKey = `aliexpress:${searchTerm}`;
  const cachedResults = await redis.get(cacheKey);


  if (cachedResults?.length > 0) {
    return cachedResults;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchTerm)}`);

  // Debug

  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // await page.evaluate(() => {
  //   const items = Array.from(document.querySelectorAll('.search-item-card-wrapper-gallery'));
    
  //   items.map(el => {
  //     console.log(el.querySelector('.images--item--3XZa6xf .img'));  // Log image element
  //     console.log(el.querySelector('.images--item--3XZa6xf'));      // Log parent of image element
  //     console.log(el.querySelector('.images--item--3XZa6xf')?.src);  
  //   });
  // });

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.search-item-card-wrapper-gallery')).map(el => ({
      name: el.querySelector('.multi--titleText--nXeOvyr').innerText,
      price: el.querySelector('.multi--price-sale--U-S0jtj').innerText,
      image: el.querySelector('.images--item--3XZa6xf')?.src,
      url: el.querySelector('a').href,
    }));
  });

  await browser.close();

  // Cache results for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  return products;
}