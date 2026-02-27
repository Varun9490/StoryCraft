import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getGenAI, getApiKey } from '@/lib/gemini';
import { aiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

// Simple IP-based rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}

export async function POST(request) {
    try {
        const limit = aiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        // Rate limit
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }


        const { message, imageBase64, imageMimeType, sessionHistory } = body;

        if (!message || message.length > 500) {
            return NextResponse.json(
                { success: false, error: 'Message required and must be under 500 characters' },
                { status: 400 }
            );
        }

        if (!getApiKey()) {
            return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 503 });
        }

        await connectDB();

        // Product search
        const searchTerms = message
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3);

        let matchedProducts = [];
        if (searchTerms.length > 0) {
            const searchRegex = searchTerms.join('|');
            matchedProducts = await Product.find({
                is_published: true,
                $or: [
                    { title: { $regex: searchRegex, $options: 'i' } },
                    { tags: { $in: searchTerms } },
                    { category: { $regex: searchRegex, $options: 'i' } },
                    { description: { $regex: searchRegex, $options: 'i' } },
                ],
            })
                .populate('artisan', 'craft_specialty city user')
                .limit(3)
                .lean();
        }

        // Build product context
        let productContext = 'No matching products found in our current inventory.';
        if (matchedProducts.length > 0) {
            productContext = matchedProducts
                .map(
                    (p, i) =>
                        `Product ${i + 1}: ${p.title} — ₹${p.price} — ${(p.description || '').slice(0, 100)}... (Category: ${p.category})`
                )
                .join('\n');
        }

        const systemPrompt = `You are Kavya, the friendly AI assistant for StoryCraft — a hyperlocal Indian artisan marketplace. You help buyers discover authentic handmade crafts from Visakhapatnam and Hyderabad.

Your personality: Warm, knowledgeable about Indian crafts, enthusiastic about fair trade. You speak naturally, not like a bot.

You can help with:
- Finding specific crafts or products
- Explaining craft traditions and cultural significance
- Answering care, maintenance, gifting, customization questions
- Sharing artisan stories
- Comparing products

Current product context from our marketplace:
${productContext}

Rules:
- Always recommend products from our marketplace when relevant
- If user uploads an image, identify the craft style and suggest similar products
- Keep responses under 150 words unless a detailed explanation is needed
- Never make up prices — only quote prices from the product context provided
- If no matching products found, acknowledge and suggest browsing the shop`;

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Build chat history (last 6 exchanges max)
        const formattedHistory = [];
        if (sessionHistory && Array.isArray(sessionHistory)) {
            const recentHistory = sessionHistory.slice(-12); // 6 exchanges = 12 messages
            for (const entry of recentHistory) {
                formattedHistory.push({
                    role: entry.role === 'user' ? 'user' : 'model',
                    parts: [{ text: entry.content || entry.parts?.[0]?.text || '' }],
                });
            }
        }

        // Build user parts
        const userParts = [{ text: message }];
        if (imageBase64 && imageMimeType) {
            userParts.push({
                inlineData: { mimeType: imageMimeType, data: imageBase64 },
            });
        }

        const chat = model.startChat({
            history: formattedHistory,
            systemInstruction: systemPrompt,
        });

        const result = await chat.sendMessage(userParts);
        const botResponse = result.response.text();

        // Format matched products for client
        const formattedProducts = matchedProducts.map((p) => ({
            _id: p._id,
            title: p.title,
            price: p.price,
            image: p.images?.[0] || '',
            category: p.category,
            artisan_city: p.artisan?.city || 'Visakhapatnam',
        }));

        return NextResponse.json({
            success: true,
            data: {
                response: botResponse,
                matchedProducts: formattedProducts,
            },
        });
    } catch (error) {
        console.error('Support bot error:', error);
        return NextResponse.json(
            { success: false, error: 'Kavya is taking a break. Please try again in a moment.' },
            { status: 503 }
        );
    }
}
