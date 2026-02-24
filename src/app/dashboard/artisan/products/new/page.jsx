'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductUploadForm from '@/components/dashboard/ProductUploadForm';

export default function NewProductPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/artisan" className="text-xs text-white/30 hover:text-white/50 transition-colors mb-4 block">
                    ← Back to Dashboard
                </Link>
                <h1
                    className="text-2xl md:text-3xl font-bold text-white/90"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    List a New Product
                </h1>
                <p className="text-sm text-white/40 mt-1">Tell the world about your craft</p>
            </motion.div>

            <ProductUploadForm />
        </div>
    );
}
