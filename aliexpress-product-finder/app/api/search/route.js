"use server";
import { scrapeAliExpress } from '@/lib/scraper';
import { analyzeProducts } from '@/lib/aiAnalyzer';
import { rateLimiter } from '@/lib/rateLimiter';
import { NextResponse } from 'next/server';

// Named export for the POST method
export async function POST(request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter(request);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
    }
    
    const { searchTerm } = await request.json();
    console.log(searchTerm)
    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    const scrapedProducts = await scrapeAliExpress(searchTerm);
    const analyzedProducts = await analyzeProducts(scrapedProducts);
    const topProducts = analyzedProducts.slice(0, 15); // Get top 15 products

    return NextResponse.json(topProducts, { status: 200 });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
