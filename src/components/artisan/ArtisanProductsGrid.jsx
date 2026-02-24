'use client';

import ProductCard from '@/components/shop/ProductCard';

export default function ArtisanProductsGrid({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-4xl mb-3 opacity-20">🎨</div>
                <p className="text-white/30 text-sm">No products yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
            ))}
        </div>
    );
}
