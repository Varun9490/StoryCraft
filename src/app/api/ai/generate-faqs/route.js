import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { getFlashModel, generateWithRetry, parseAIJson, getApiKey } from '@/lib/gemini';
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

        // Auth — artisan only
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        if (decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Only artisans can generate FAQs' }, { status: 403 });
        }


        const { title, description, category, material, craft_technique, city, productId } = body;

        // Validate
        if (!title || !category) {
            return NextResponse.json({ success: false, error: 'Title and category are required' }, { status: 400 });
        }
        if (!description || description.length < 50) {
            return NextResponse.json(
                { success: false, error: 'Description too short for FAQ generation (min 50 chars)' },
                { status: 400 }
            );
        }

        // Rate limit per product
        if (productId) {
            const artisan = await Artisan.findOne({ user: decoded.userId });
            const product = await Product.findById(productId);
            if (product && artisan && product.artisan.toString() === artisan._id.toString()) {
                if (product.faq_generation_count >= 5) {
                    return NextResponse.json(
                        { success: false, error: 'FAQ generation limit reached for this product (5/5)' },
                        { status: 429 }
                    );
                }
                product.faq_generation_count += 1;
                await product.save();
            }
        }

        // Check GEMINI_API_KEY
        if (!getApiKey()) {
            return NextResponse.json(
                { success: false, error: 'AI service not configured. Please set GEMINI_API_KEY.' },
                { status: 503 }
            );
        }

        const model = getFlashModel({ requireJson: true });

        const prompt = `You are an expert in Indian traditional crafts and handmade products for an e-commerce platform. A buyer is browsing an artisan product listing. Generate exactly 8 natural buyer questions with helpful, accurate answers.

Product Details:
- Title: ${title}
- Category: ${category}
- Description: ${description}
- Material: ${material || 'Not specified'}
- Craft Technique: ${craft_technique || 'Not specified'}
- Origin City: ${city || 'Visakhapatnam'}

Requirements:
1. Questions must be things a real buyer would ask before purchasing
2. Include questions about: care/maintenance, dimensions/size, customization, shipping fragility, authenticity, materials safety, gifting suitability, artisan background
3. Answers must be warm, specific, and reflect the craft's cultural significance
4. Return ONLY a valid JSON array — no markdown, no explanation, no code blocks

Format:
[{"question":"...","answer":"..."},{"question":"...","answer":"..."}]

Generate exactly 8 items.`;

        let parsedFaqs;

        try {
            const rawText = await generateWithRetry(model, prompt, 3, true);
            let resultFaqs = parseAIJson(rawText);
            if (resultFaqs && !Array.isArray(resultFaqs) && Array.isArray(resultFaqs.faqs)) {
                resultFaqs = resultFaqs.faqs;
            }
            parsedFaqs = resultFaqs;
        } catch (firstError) {
            // Retry with stricter prompt
            try {
                const strictPrompt = prompt + '\n\nCRITICAL: Return ONLY raw JSON. No markdown formatting. No ```json blocks. Just the array.';
                const rawText = await generateWithRetry(model, strictPrompt, 3, true);
                let resultFaqs = parseAIJson(rawText);
                if (resultFaqs && !Array.isArray(resultFaqs) && Array.isArray(resultFaqs.faqs)) {
                    resultFaqs = resultFaqs.faqs;
                }
                parsedFaqs = resultFaqs;
            } catch (secondError) {
                console.error('FAQ generation failed twice:', secondError);
                return NextResponse.json(
                    { success: false, error: 'AI returned an unexpected response. Please try again in a moment.' },
                    { status: 422 }
                );
            }
        }

        // Validate shape
        if (!Array.isArray(parsedFaqs) || parsedFaqs.length !== 8) {
            return NextResponse.json(
                { success: false, error: 'AI returned invalid format. Please try again.' },
                { status: 422 }
            );
        }

        const isValid = parsedFaqs.every(
            (f) => typeof f.question === 'string' && f.question.length > 0 && typeof f.answer === 'string' && f.answer.length > 0
        );
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'AI returned invalid format. Please try again.' },
                { status: 422 }
            );
        }

        const faqs = parsedFaqs.map((f) => ({
            question: f.question,
            answer: f.answer,
            approved: false,
        }));

        return NextResponse.json({
            success: true,
            data: { faqs },
            message: 'FAQs generated successfully. Review and approve before publishing.',
        });
    } catch (error) {
        console.error('FAQ generation error:', error);
        if (error.message?.includes('SAFETY')) {
            return NextResponse.json(
                { success: false, error: 'Content flagged. Please rephrase your product description.' },
                { status: 422 }
            );
        }
        if (error.message?.includes('quota') || error.message?.includes('429')) {
            return NextResponse.json(
                { success: false, error: 'AI service temporarily unavailable. Please try again in a few minutes.' },
                { status: 503 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Could not reach AI service. Check your internet connection.' },
            { status: 503 }
        );
    }
}
