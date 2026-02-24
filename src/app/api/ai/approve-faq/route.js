import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';

export async function PUT(request) {
    try {
        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        if (decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Only artisans can manage FAQs' }, { status: 403 });
        }

        const body = await request.json();
        const { productId, faqIndex, approved } = body;

        if (!productId || faqIndex === undefined || typeof approved !== 'boolean') {
            return NextResponse.json({ success: false, error: 'Missing required fields: productId, faqIndex, approved' }, { status: 400 });
        }

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) return NextResponse.json({ success: false, error: 'Artisan profile not found' }, { status: 404 });

        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

        if (product.artisan.toString() !== artisan._id.toString()) {
            return NextResponse.json({ success: false, error: 'You can only manage FAQs for your own products' }, { status: 403 });
        }

        if (faqIndex < 0 || faqIndex >= product.ai_generated_faqs.length) {
            return NextResponse.json({ success: false, error: 'Invalid FAQ index' }, { status: 400 });
        }

        product.ai_generated_faqs[faqIndex].approved = approved;
        await product.save();

        return NextResponse.json({
            success: true,
            data: { faq: product.ai_generated_faqs[faqIndex] },
        });
    } catch (error) {
        console.error('Approve FAQ error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update FAQ' }, { status: 500 });
    }
}
