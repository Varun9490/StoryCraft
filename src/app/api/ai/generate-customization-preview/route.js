import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { getGenAI, getApiKey } from '@/lib/gemini';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getIO } from '@/lib/socket-server';
import { aiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request) {
    try {
        const limit = aiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        if (decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Only artisans can generate previews' }, { status: 403 });
        }


        const { chatId, productImageUrl, customizationPrompt, referenceImageUrl } = body;

        if (!chatId || !productImageUrl || !customizationPrompt) {
            return NextResponse.json({ success: false, error: 'chatId, productImageUrl, and customizationPrompt are required' }, { status: 400 });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
        if (!chat.participants.map((p) => p.toString()).includes(decoded.userId)) {
            return NextResponse.json({ success: false, error: 'Not a participant' }, { status: 403 });
        }

        if (!getApiKey()) {
            return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 503 });
        }

        // Notify buyer immediately
        try {
            const io = getIO();
            io.to(chatId).emit('preview_generating', { chatId });
        } catch (socketErr) {
            console.warn('Socket emit failed (non-fatal):', socketErr.message);
        }

        // Fetch product image as base64
        let resolvedProductUrl = '';
        if (typeof productImageUrl === 'object' && productImageUrl !== null) {
            resolvedProductUrl = productImageUrl.url || productImageUrl.secure_url || '';
        } else if (typeof productImageUrl === 'string') {
            resolvedProductUrl = productImageUrl;
        }

        if (!resolvedProductUrl || !resolvedProductUrl.startsWith('http')) {
            return NextResponse.json(
                { success: false, error: 'Valid product image URL is required' },
                { status: 400 }
            );
        }

        const productImgRes = await fetch(resolvedProductUrl);
        if (!productImgRes.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch product image. Please try again.' },
                { status: 422 }
            );
        }
        const productBuffer = await productImgRes.arrayBuffer();
        const productBase64 = Buffer.from(productBuffer).toString('base64');

        const genAI = getGenAI();
        const genModel = genAI.getGenerativeModel({
            model: process.env.GEMINI_IMAGE_GEN_MODEL || 'gemini-2.0-flash-preview-image-generation',
            generationConfig: { responseModalities: ['image', 'text'] },
        });

        const generationPrompt = `You are an AI artisan assistant. Generate a photorealistic customized version of this handmade Indian craft product based on the artisan's customization request.

Customization Request: ${customizationPrompt}

Rules:
- Maintain the craft's traditional making technique and cultural authenticity
- Apply the requested color changes, size variations, or design modifications
- Keep the image style consistent with the original product photograph (same lighting, background style)
- The result must look like a real handcrafted product, not a digital render
- If a reference image is provided, incorporate those design elements

Generate a single product photograph showing the customized version.`;

        const parts = [
            { text: generationPrompt },
            { inlineData: { mimeType: 'image/jpeg', data: productBase64 } },
        ];

        // Optionally add reference image
        if (referenceImageUrl) {
            try {
                const refRes = await fetch(referenceImageUrl);
                const refBuffer = await refRes.arrayBuffer();
                const refBase64 = Buffer.from(refBuffer).toString('base64');
                parts.push({ inlineData: { mimeType: 'image/jpeg', data: refBase64 } });
            } catch (refErr) {
                console.warn('Failed to fetch reference image, proceeding without it');
            }
        }

        const result = await genModel.generateContent({
            contents: [{ role: 'user', parts }],
        });

        // Find image in response
        let generatedImageData = null;
        const candidates = result.response.candidates;
        if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImageData = part.inlineData.data;
                    break;
                }
            }
        }

        if (!generatedImageData) {
            try {
                const io = getIO();
                io.to(chatId).emit('preview_generation_failed', { chatId });
            } catch (e) { /* ignore */ }
            return NextResponse.json(
                { success: false, error: 'Image generation failed. Try a different prompt.' },
                { status: 422 }
            );
        }

        // Upload to Cloudinary
        const imageBuffer = Buffer.from(generatedImageData, 'base64');
        const uploadResult = await uploadToCloudinary(imageBuffer, {
            folder: 'storycraft/customizations',
        });

        // Return to artisan for approval before saving to chat and product
        return NextResponse.json({
            success: true,
            data: { imageUrl: uploadResult.url },
        });
    } catch (error) {
        console.error('Customization preview error:', error);
        return NextResponse.json(
            { success: false, error: 'Preview generation failed. Please try again.' },
            { status: 503 }
        );
    }
}
