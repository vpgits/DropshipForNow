import ProductCard from './ProductCard';

export default function ProductList({ products, onExport }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products && products.length ? products.map((product) => (
          <ProductCard key={product.id} product={product} />
        )): <h1>No results found</h1>}
      </div>
      {products.length > 0 && (
        <button
          onClick={onExport}
          className="mt-4 p-2 bg-green-500 text-white rounded"
        >
          Export to CSV
        </button>
      )}
    </div>
  );
}