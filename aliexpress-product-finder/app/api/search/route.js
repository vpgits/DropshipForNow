import { scrapeAliExpress } from '@/lib/scraper';
import { analyzeProducts } from '@/lib/aiAnalyzer';
import { rateLimiter } from '@/lib/rateLimiter';

export default async function handler(req, res) {
  if (req.method === 'POST') {
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

      res.status(200).json(topProducts);
    } catch (error) {
      console.error('Search failed:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}