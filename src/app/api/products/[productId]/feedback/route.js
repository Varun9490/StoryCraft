import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { verifyJWT } from '@/lib/auth';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request, { params }) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();
        const { productId } = await params;

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

        const { rating, comment, name } = body;

        if (!rating || !comment) {
            return NextResponse.json({ success: false, error: 'Rating and comment are required' }, { status: 400 });
        }

        const newFeedback = {
            user: decoded.userId,
            name: name || 'User',
            rating: Number(rating),
            comment: String(comment).slice(0, 500),
            approved: false, // Must be approved by artisan or admin to show
            createdAt: new Date(),
        };

        if (!product.feedback) {
            product.feedback = [];
        }

        product.feedback.push(newFeedback);
        await product.save();

        return NextResponse.json({
            success: true,
            data: { feedback: newFeedback },
            message: 'Feedback submitted for approval',
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
    }
}
