import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getFlashModel, generateWithRetry, getApiKey } from '@/lib/gemini';
import { aiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request) {
    try {
        const limit = aiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);
        const { productId, fields, targetLang = 'te' } = body;

        if (!productId || !fields || !Array.isArray(fields) || fields.length === 0) {
            return NextResponse.json({ success: false, error: 'productId and fields array required' }, { status: 400 });
        }

        if (!getApiKey()) {
            return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 503 });
        }

        await connectDB();
        const product = await Product.findById(productId).lean();
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const cacheMap = product.translation_cache || {};
        const translations = {};
        const toTranslate = {};

        for (const field of fields) {
            const cacheKey = `${targetLang}_${field}`;
            if (cacheMap[cacheKey]) {
                translations[field] = cacheMap[cacheKey];
            } else {
                let sourceText = '';
                if (field === 'description') sourceText = product.description || '';
                else if (field === 'title') sourceText = product.title || '';
                else if (field.startsWith('faq_')) {
                    const idx = parseInt(field.split('_')[1]);
                    const faq = (product.ai_generated_faqs || [])[idx];
                    if (faq) sourceText = `Q: ${faq.question}\nA: ${faq.answer}`;
                } else if (field.startsWith('story_')) {
                    const idx = parseInt(field.split('_')[1]);
                    const panel = (product.story_panels || [])[idx];
                    if (panel) sourceText = `${panel.heading}\n${panel.body}`;
                }
                if (sourceText) toTranslate[field] = sourceText;
            }
        }

        if (Object.keys(toTranslate).length > 0) {
            const langName = targetLang === 'te' ? 'Telugu' : 'Hindi';
            const entries = Object.entries(toTranslate);
            const numberedTexts = entries.map(([k, v], i) => `[${i}] ${v}`).join('\n---\n');

            const prompt = `Translate each numbered block below into ${langName}. Preserve the numbering format [0], [1], etc. Keep proper nouns, brand names, and currency symbols unchanged. Return ONLY the translations with their numbers, no explanations.

${numberedTexts}`;

            const model = getFlashModel();
            const rawText = await generateWithRetry(model, prompt);

            const regex = /\[(\d+)\]\s*([\s\S]*?)(?=\[\d+\]|$)/g;
            const matches = [...rawText.matchAll(regex)];
            const cacheUpdates = {};

            for (const match of matches) {
                const idx = parseInt(match[1]);
                const translated = match[2].trim();
                if (idx >= 0 && idx < entries.length) {
                    const fieldKey = entries[idx][0];
                    translations[fieldKey] = translated;
                    const cacheKey = `${targetLang}_${fieldKey}`;
                    cacheUpdates[`translation_cache.${cacheKey}`] = translated;
                }
            }

            if (Object.keys(cacheUpdates).length > 0) {
                Product.findByIdAndUpdate(productId, { $set: cacheUpdates }).exec();
            }
        }

        return NextResponse.json({ success: true, data: { translations } });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ success: false, error: 'Translation failed' }, { status: 503 });
    }
}
