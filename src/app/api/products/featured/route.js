import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
    try {
        await connectDB();

        // Get top 6 by views
        let products = await Product.find({ is_published: true })
            .sort({ views: -1 })
            .limit(6)
            .populate('artisan', 'craft_specialty city')
            .lean();

        // If fewer than 6, fill with newest
        if (products.length < 6) {
            const existingIds = products.map((p) => p._id);
            const more = await Product.find({
                is_published: true,
                _id: { $nin: existingIds },
            })
                .sort({ createdAt: -1 })
                .limit(6 - products.length)
                .populate('artisan', 'craft_specialty city')
                .lean();
            products = [...products, ...more];
        }

        return NextResponse.json({ success: true, data: { products } });
    } catch (error) {
        console.error('Featured products error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch featured products' },
            { status: 500 }
        );
    }
}
