import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIJson, getGenAI, getApiKey } from '@/lib/gemini';
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
            return NextResponse.json({ success: false, error: 'Only artisans can use image analysis' }, { status: 403 });
        }


        const { imageUrl } = body;

        if (!imageUrl || (!imageUrl.startsWith('https://') && !imageUrl.startsWith('http://'))) {
            return NextResponse.json(
                { success: false, error: 'Valid image URL required' },
                { status: 400 }
            );
        }

        if (!getApiKey()) {
            return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 503 });
        }

        // Fetch image as base64
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash',
        });

        const visionPrompt = `You are an expert in Indian traditional handicrafts with 30 years of experience identifying craft types, materials, and regional origins from photographs.

Analyze this product image and return a JSON object with the following fields:
- craft_type: The specific type of Indian craft (e.g., 'Etikoppaka Lacquer Toy', 'Bidriware Metal Art', 'Kalamkari Painting')
- material: Primary materials visible (e.g., 'Ivory wood with lac dye coating')
- region_origin: Most likely region of origin based on craft style
- color_palette: Array of 3-5 dominant colors as hex codes
- suggested_title: A compelling 5-10 word product title
- suggested_description: A 150-200 word artisan-style product description emphasizing cultural significance, making process, and uniqueness
- suggested_tags: Array of 5-8 SEO-friendly tags
- confidence: 'high' if craft is clearly identifiable, 'medium' if uncertain, 'low' if unclear

Return ONLY valid JSON — no markdown, no explanation.`;

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: visionPrompt },
                        { inlineData: { mimeType, data: base64Image } },
                    ],
                },
            ],
        });

        const rawText = result.response.text();
        let analysis;
        try {
            analysis = parseAIJson(rawText);
        } catch (parseErr) {
            return NextResponse.json(
                { success: false, error: 'AI returned invalid format. Please try again.' },
                { status: 422 }
            );
        }

        // Validate shape
        if (!analysis.craft_type || !analysis.suggested_title || !analysis.suggested_description) {
            return NextResponse.json(
                { success: false, error: 'AI analysis incomplete. Try a clearer image.' },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { analysis },
        });
    } catch (error) {
        console.error('Image analysis error:', error);
        return NextResponse.json(
            { success: false, error: 'Image analysis failed. Please try again.' },
            { status: 503 }
        );
    }
}
