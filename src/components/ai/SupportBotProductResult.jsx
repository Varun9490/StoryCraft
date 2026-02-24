'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SupportBotProductResult({ product }) {
    return (
        <Link
            href={`/shop/${product._id}`}
            className="flex-shrink-0 w-40 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors bg-white/[0.03]"
        >
            {product.image ? (
                <div className="relative h-24 w-full">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="160px"
                    />
                </div>
            ) : (
                <div className="h-24 w-full bg-white/5 flex items-center justify-center">
                    <span className="text-white/20 text-xl">🎨</span>
                </div>
            )}
            <div className="p-2">
                <p className="text-[11px] text-white/70 font-medium truncate">{product.title}</p>
                <p className="text-[10px] text-white/40">₹{product.price?.toLocaleString('en-IN')}</p>
            </div>
        </Link>
    );
}
