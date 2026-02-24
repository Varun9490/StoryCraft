import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { productId } = await params;

        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) {
            return NextResponse.json({ success: false, error: 'Artisan profile not found' }, { status: 404 });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        if (product.artisan.toString() !== artisan._id.toString()) {
            return NextResponse.json({ success: false, error: 'You can only modify your own products' }, { status: 403 });
        }

        // Validate: must have at least 1 image to publish
        if (!product.is_published && (!product.images || product.images.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'Product must have at least 1 image before publishing' },
                { status: 400 }
            );
        }

        product.is_published = !product.is_published;
        await product.save();

        return NextResponse.json({
            success: true,
            data: { is_published: product.is_published },
            message: product.is_published ? 'Product published' : 'Product unpublished',
        });
    } catch (error) {
        console.error('Publish toggle error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to toggle publish status' },
            { status: 500 }
        );
    }
}
