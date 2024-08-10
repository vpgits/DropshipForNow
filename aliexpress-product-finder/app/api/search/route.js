"use server";
import { scrapeAliExpress } from '@/lib/scraper';
import { analyzeProducts } from '@/lib/aiAnalyzer';
import { rateLimiter } from '@/lib/rateLimiter';

// Named export for the POST method
export async function POST(req, res) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(req);
    if (!rateLimitResult.success) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    const searchTerm = req.body.searchTerm;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const scrapedProducts = await scrapeAliExpress(searchTerm);
    const analyzedProducts = await analyzeProducts(scrapedProducts);
    const topProducts = analyzedProducts.slice(0, 15); // Get top 15 products

    return res.status(200).json(topProducts);
  } catch (error) {
    console.error('Search failed:', error);
    return res.status(500).json({ error: 'Failed to search products' });
  }
}


