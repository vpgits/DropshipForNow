"use client";
import { useState } from 'react';
import SearchForm from './Components/SearchForm';
import ProductList from './Components/ProductList';
import { saveAs } from 'file-saver'; // Import file-saver to save the CSV file
import Papa from 'papaparse'; // Import papaparse to convert JSON to CSV

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
    // Convert products array to CSV
    const csv = Papa.unparse(products);

    // Create a Blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Trigger the download using file-saver
    saveAs(blob, 'products.csv');
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
