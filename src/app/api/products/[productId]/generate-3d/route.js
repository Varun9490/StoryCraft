import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { aiLimiter, apiLimiter } from '@/lib/rate-limit';
import { checkModelExists, uploadGLBToSpaces } from '@/lib/spaces';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request, { params }) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

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

        // Check DO Spaces cache
        const cacheKey = `models/${productId}.glb`;
        const exists = await checkModelExists(cacheKey);
        if (exists) {
            const cdnUrl = `${process.env.DO_SPACES_CDN_URL}/${cacheKey}`;
            product.model_3d_url = cdnUrl;
            product.model_3d_status = 'ready';
            await product.save();
            return NextResponse.json({ success: true, data: { url: cdnUrl, cached: true } });
        }

        // Get first product image
        const imageUrl = product.images?.[0]?.url || product.images?.[0];
        if (!imageUrl) {
            return NextResponse.json({ success: false, error: 'No product image available' }, { status: 400 });
        }

        // Mark as generating
        product.model_3d_status = 'generating';
        await product.save();

        // Step A: Submit Meshy.ai task
        const meshyRes = await fetch('https://api.meshy.ai/openapi/v1/image-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                enable_pbr: true,
                ai_model: 'meshy-4',
            }),
        });

        if (meshyRes.status === 429) {
            product.model_3d_status = 'failed';
            await product.save();
            return NextResponse.json({ success: false, error: '3D generation limit reached. Try again tomorrow.' }, { status: 503 });
        }

        const meshyData = await meshyRes.json();
        const taskId = meshyData.result;

        if (!taskId) {
            product.model_3d_status = 'failed';
            await product.save();
            return NextResponse.json({ success: false, error: '3D task creation failed' }, { status: 422 });
        }

        // Step B: Poll for completion (max 10 polls, 6s each)
        let glbUrl = null;
        for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 6000));

            const pollRes = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`, {
                headers: { 'Authorization': `Bearer ${process.env.MESHY_API_KEY}` },
            });
            const pollData = await pollRes.json();

            if (pollData.status === 'SUCCEEDED') {
                glbUrl = pollData.model_urls?.glb;
                break;
            }
            if (pollData.status === 'FAILED') {
                product.model_3d_status = 'failed';
                await product.save();
                return NextResponse.json({ success: false, error: '3D model generation failed. The image may not be suitable.' }, { status: 422 });
            }
        }

        if (!glbUrl) {
            product.model_3d_status = 'failed';
            await product.save();
            return NextResponse.json({ success: false, error: '3D generation timed out' }, { status: 408 });
        }

        // Download GLB and upload to DO Spaces
        const glbResponse = await fetch(glbUrl);
        const glbBuffer = Buffer.from(await glbResponse.arrayBuffer());
        const cdnUrl = await uploadGLBToSpaces(glbBuffer, cacheKey);

        product.model_3d_url = cdnUrl;
        product.model_3d_status = 'ready';
        await product.save();

        return NextResponse.json({ success: true, data: { url: cdnUrl, cached: false } });
    } catch (error) {
        console.error('3D generation error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
