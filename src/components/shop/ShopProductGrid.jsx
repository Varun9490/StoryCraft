'use client';

import ProductCard from './ProductCard';

export default function ShopProductGrid({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
            ))}
        </div>
    );
}
