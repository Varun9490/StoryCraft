import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { aiLimiter, apiLimiter } from '@/lib/rate-limit';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request, { params }) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        // Route expects no body

        // Rate limit
        const aiLimit = aiLimiter(request);
        if (!aiLimit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
        }

        // Auth
        const token = request.cookies.get('auth_token')?.value;
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { productId } = await params;
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Verify ownership
        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan || product.artisan.toString() !== artisan._id.toString()) {
            return NextResponse.json({ success: false, error: 'Not your product' }, { status: 403 });
        }

        // Return cached URL if already generated
        if (product.model_3d_url && product.model_3d_status === 'ready') {
            return NextResponse.json({ success: true, data: { url: product.model_3d_url, cached: true } });
        }


        // Get first product image
        const imageUrl = product.images?.[0]?.url || product.images?.[0];
        if (!imageUrl) {
            return NextResponse.json({ success: false, error: 'No product image available' }, { status: 400 });
        }



        // Step A: Download image buffer to push over FormData
        const imageRes = await fetch(imageUrl);
        const imageBlob = await imageRes.blob();

        const formData = new FormData();
        formData.append('image', imageBlob, 'product-image.png');

        // Step B: Submit to Stability AI Point-Aware 3D API
        const stabilityRes = await fetch('https://api.stability.ai/v2beta/3d/stable-point-aware-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            },
            body: formData,
        });

        if (stabilityRes.status === 429) {
            return NextResponse.json({ success: false, error: '3D generation rate limit reached. Try again later.' }, { status: 503 });
        }

        if (!stabilityRes.ok) {
            console.error('Stability AI Generation Failed:', await stabilityRes.text());
            return NextResponse.json({ success: false, error: '3D model generation failed. Ensure your product image is clear and centered.' }, { status: 422 });
        }

        const glbBuffer = Buffer.from(await stabilityRes.arrayBuffer());

        // Step C: Upload directly to Cloudinary bypassing DO Spaces cache logic
        const uploadResult = await uploadToCloudinary(glbBuffer, {
            folder: 'storycraft/3d_models',
            resource_type: 'raw',
            public_id: `product_${productId}_3d_${Date.now()}`,
        });



        return NextResponse.json({ success: true, data: { url: uploadResult.url, cached: false } });
    } catch (error) {
        console.error('3D generation error:', error);

        // Rollback state visually
        return NextResponse.json({ success: false, error: 'Internal server error while building 3D model.' }, { status: 500 });
    }
}
