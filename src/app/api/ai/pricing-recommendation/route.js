import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { getFlashModel, generateWithRetry, parseAIJson, getApiKey } from '@/lib/gemini';
import { scrapeCompetitorPrices, extractPricesFromResults } from '@/lib/serper';
import { getCachedPricing, setCachedPricing, buildCacheKey } from '@/lib/pricing-cache';
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
            return NextResponse.json({ success: false, error: 'Only artisans can access pricing insights' }, { status: 403 });
        }


        const { title, description, category, city, material } = body;

        if (!title || !category) {
            return NextResponse.json({ success: false, error: 'Title and category are required' }, { status: 400 });
        }

        if (!getApiKey()) {
            return NextResponse.json(
                { success: false, error: 'AI service not configured.' },
                { status: 503 }
            );
        }

        const cacheKey = buildCacheKey(category, city || 'Visakhapatnam');
        const cachedPrices = getCachedPricing(cacheKey);
        let competitorPrices = [];
        let fromCache = false;

        if (cachedPrices) {
            competitorPrices = cachedPrices;
            fromCache = true;
        } else {
            const searchQuery = `${title} handmade ${category} india buy online`;
            const { results } = await scrapeCompetitorPrices(searchQuery);
            competitorPrices = extractPricesFromResults(results);
            if (competitorPrices.length > 0) {
                setCachedPricing(cacheKey, competitorPrices);
            }
        }

        const competitorPricesJson = competitorPrices.length > 0
            ? JSON.stringify(competitorPrices)
            : '[] (no competitor price data available — use your knowledge of Indian handmade craft markets)';

        const pricingPrompt = `You are a fair-trade pricing consultant for Indian handmade artisan products. Your job is to recommend a fair price that respects the artisan's labor while remaining competitive.

Product:
- Title: ${title}
- Category: ${category}
- Description: ${description || 'Not provided'}
- Material: ${material || 'Not specified'}
- City: ${city || 'Visakhapatnam'}

Competitor Market Data (scraped prices in INR): ${competitorPricesJson}

If competitor data is empty or unavailable, use your knowledge of Indian handmade craft markets.

Provide a pricing recommendation. Return ONLY valid JSON in this exact shape:
{
  "market_range": { "min": <number>, "max": <number> },
  "suggested_price": <number>,
  "margin_breakdown": {
    "material_cost_pct": <number 0-100>,
    "artisan_labor_pct": <number 0-100>,
    "platform_fee_pct": 8,
    "profit_pct": <number 0-100>
  },
  "reasoning": "<1-2 sentence explanation>",
  "confidence": "<high|medium|low>"
}

Rules: All percentage fields must sum to 100. suggested_price must be within or near market_range. Return ONLY the JSON object — no markdown, no text. Ensure any double quotes inside string values are properly escaped (e.g. \\").`;

        const model = getFlashModel();
        let parsedResult;

        try {
            const rawText = await generateWithRetry(model, pricingPrompt);
            parsedResult = parseAIJson(rawText);
        } catch (firstErr) {
            try {
                const strictPrompt = pricingPrompt + '\n\nCRITICAL: Return ONLY raw JSON. Do not use Markdown backticks. Escape double quotes inside values properly.';
                const rawText = await generateWithRetry(model, strictPrompt);
                parsedResult = parseAIJson(rawText);
            } catch (secondErr) {
                return NextResponse.json(
                    { success: false, error: 'Pricing data unavailable. Enter your price based on material cost + labor.' },
                    { status: 422 }
                );
            }
        }

        // Validate shape
        if (
            !parsedResult?.market_range?.min ||
            !parsedResult?.market_range?.max ||
            !parsedResult?.suggested_price ||
            !parsedResult?.margin_breakdown
        ) {
            return NextResponse.json(
                { success: false, error: 'AI returned incomplete pricing data. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                pricing: parsedResult,
                competitor_count: competitorPrices.length,
                from_cache: fromCache,
            },
        });
    } catch (error) {
        console.error('Pricing recommendation error:', error);
        return NextResponse.json(
            { success: false, error: 'Could not generate pricing recommendation.' },
            { status: 503 }
        );
    }
}
