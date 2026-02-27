import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { apiLimiter } from '@/lib/rate-limit';

export async function PATCH(request, { params }) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        await connectDB();
        const { productId, feedbackId } = await params;

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'artisan') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) return NextResponse.json({ success: false, error: 'Artisan not found' }, { status: 404 });

        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

        if (product.artisan.toString() !== artisan._id.toString()) {
            return NextResponse.json({ success: false, error: 'Not your product' }, { status: 403 });
        }

        const feedback = product.feedback.id(feedbackId);
        if (!feedback) {
            return NextResponse.json({ success: false, error: 'Feedback not found' }, { status: 404 });
        }

        feedback.approved = true;
        await product.save();

        return NextResponse.json({ success: true, data: { feedback } });
    } catch (error) {
        console.error('Approve feedback error:', error);
        return NextResponse.json({ success: false, error: 'Failed to approve feedback' }, { status: 500 });
    }
}
