"use client";
import { useState } from 'react';
import SearchForm from './Components/SearchForm';
import ProductList from './Components/ProductList';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchTerms) => {
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchTerms),
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const handleExport = () => {
    // Implement CSV export logic
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AliExpress Product Finder</h1>
      <SearchForm onSearch={handleSearch} />
      {loading ? (
        <p>Searching for winning products...</p>
      ) : (
        <ProductList products={products} onExport={handleExport} />
      )}
    </div>
  );
}