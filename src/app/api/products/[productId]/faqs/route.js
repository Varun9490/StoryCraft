import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';

// GET — public: fetch only approved FAQs
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { productId } = await params;

        const product = await Product.findById(productId)
            .select('ai_generated_faqs title artisan')
            .lean();

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const approvedFaqs = (product.ai_generated_faqs || []).filter((f) => f.approved === true);

        return NextResponse.json({
            success: true,
            data: { faqs: approvedFaqs, product_title: product.title },
        });
    } catch (error) {
        console.error('Get FAQs error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch FAQs' }, { status: 500 });
    }
}

// PUT — artisan owner: replace all FAQs
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { productId } = await params;

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        if (decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Only artisans can manage FAQs' }, { status: 403 });
        }

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) return NextResponse.json({ success: false, error: 'Artisan profile not found' }, { status: 404 });

        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

        if (product.artisan.toString() !== artisan._id.toString()) {
            return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
        }

        const body = await request.json();
        const { faqs } = body;

        if (!Array.isArray(faqs) || faqs.length > 10) {
            return NextResponse.json({ success: false, error: 'FAQs must be an array of max 10 items' }, { status: 400 });
        }

        const isValid = faqs.every(
            (f) => typeof f.question === 'string' && f.question.length > 0 && typeof f.answer === 'string' && f.answer.length > 0
        );
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Each FAQ must have a non-empty question and answer' }, { status: 400 });
        }

        product.ai_generated_faqs = faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
            approved: f.approved === true,
        }));
        await product.save();

        return NextResponse.json({
            success: true,
            data: { faqs: product.ai_generated_faqs },
        });
    } catch (error) {
        console.error('Update FAQs error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update FAQs' }, { status: 500 });
    }
}
