import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { apiLimiter } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false }, { status: 429 });
        }

        const body = await request.json();
        const { productId, event, visitorId, source, duration } = body;

        if (!productId || !event) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        await connectDB();

        if (event === 'view') {
            const update = { $inc: { views: 1 } };
            if (visitorId) {
                update.$addToSet = { unique_visitors: visitorId };
            }
            await Product.findByIdAndUpdate(productId, update);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
