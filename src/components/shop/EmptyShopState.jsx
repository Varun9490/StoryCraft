'use client';

import Link from 'next/link';

export default function EmptyShopState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="text-7xl mb-6 opacity-20">🏺</div>
            <h3
                className="text-2xl font-semibold text-white/60 mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                No crafts found
            </h3>
            <p className="text-sm text-white/30 max-w-md mb-6">
                Try adjusting your filters or explore a different category. Our artisans are always creating something new.
            </p>
            <Link
                href="/shop"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.3)' }}
            >
                Clear Filters
            </Link>
        </div>
    );
}
