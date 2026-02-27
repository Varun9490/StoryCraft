import { sanitizeBody } from '@/lib/sanitize';
import { apiLimiter } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import cloudinary from '@/lib/cloudinary';
import { verifyJWT } from '@/lib/auth';





export const dynamic = 'force-dynamic';

// GET — single product
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { productId } = await params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const product = await Product.findById(productId)
            .populate({
                path: 'artisan',
                populate: { path: 'user', select: 'name avatar' },
            })
            .lean();

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if caller is the owner (for draft products)
        if (!product.is_published) {
            const token = request.cookies.get('auth_token')?.value;
            const decoded = token ? verifyJWT(token) : null;
            if (!decoded) {
                return NextResponse.json(
                    { success: false, error: 'Product not found' },
                    { status: 404 }
                );
            }
            const artisan = await Artisan.findOne({ user: decoded.userId });
            if (!artisan || artisan._id.toString() !== product.artisan._id.toString()) {
                return NextResponse.json(
                    { success: false, error: 'Product not found' },
                    { status: 404 }
                );
            }
        }

        // Increment views (fire and forget)
        Product.findByIdAndUpdate(productId, { $inc: { views: 1 } }).exec();

        return NextResponse.json({ success: true, data: { product } });
    } catch (error) {
        console.error('Product get error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT — update product (artisan owner only)
export async function PUT(request, { params }) {
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
            return NextResponse.json({ success: false, error: 'You can only edit your own products' }, { status: 403 });
        }


        const allowedFields = [
            'title', 'description', 'category', 'price', 'images',
            'city', 'stock', 'is_customizable', 'tags',
            'material', 'craft_technique', 'suggested_price_range',
            'is_published', 'model_3d_url', 'model_3d_status', 'story_panels'
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        Object.assign(product, updates);
        await product.save();

        return NextResponse.json({
            success: true,
            data: { product },
            message: 'Product updated successfully',
        });
    } catch (error) {
        console.error('Product update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE — delete product (artisan owner only)
export async function DELETE(request, { params }) {
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
            return NextResponse.json({ success: false, error: 'You can only delete your own products' }, { status: 403 });
        }

        // Delete images from Cloudinary
        for (const img of product.images) {
            if (img.public_id) {
                try {
                    await cloudinary.uploader.destroy(img.public_id);
                } catch (e) {
                    console.warn('Failed to delete Cloudinary image:', img.public_id, e);
                }
            }
        }

        await Product.findByIdAndDelete(productId);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Product delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
