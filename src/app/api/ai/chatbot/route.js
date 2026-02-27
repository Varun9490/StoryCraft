import { NextResponse } from 'next/server';
import { getGenAI, getApiKey } from '@/lib/gemini';
import { apiLimiter } from '@/lib/rate-limit';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Slow down. Too many requests.' }, { status: 429 });
        }

        const { message, image, history } = await request.json();

        if (!message && !image) {
            return NextResponse.json({ success: false, error: 'Message or image is required' }, { status: 400 });
        }

        if (!getApiKey()) {
            return NextResponse.json({ success: false, error: 'AI is sleeping right now.' }, { status: 503 });
        }

        await connectDB();

        // Fetch some basic store context to feed the AI
        const products = await Product.find({ is_published: true }).select('title price category material').limit(10).lean();

        const storeContext = products.map(p =>
            `- ID: ${p._id} | Title: ${p.title} | Price: ₹${p.price.toLocaleString('en-IN')} | Category: ${p.category} | Material: ${p.material || 'N/A'}`
        ).join('\n');

        const systemPrompt = `You are "Kala", a friendly, knowledgeable, and elegant AI chatbot for "StoryCraft" – a premium e-commerce platform selling traditional handcrafted arts from Visakhapatnam and Hyderabad artisans.
        
Your role is to assist customers, give them product suggestions, answer questions about crafts, and provide a warm, welcoming experience. Speak in a friendly, conversational, yet sophisticated tone. You have access to some current store inventory:

CURRENT STORE INVENTORY HIGHLIGHTS:
${storeContext || 'No specific products available right now, but feel free to discuss Indian crafts!'}

Guidelines:
- If a user asks for product suggestions, recommend items from the inventory highlights.
- If a user provides an image, ALWAYS FIRST describe what you see in the image vividly but briefly (1-2 sentences). THEN search our inventory highlights for the most similar products to suggest and explain why they match.
- **IMPORTANT**: When you suggest a product from the inventory, provide a clickable link to it like this: <a href="/shop/PRODUCT_ID_HERE" class="text-[#E8A838] underline">Product Title</a>. (I have provided the IDs in the inventory list).
- Be concise but complete. Ideally 3-6 short sentences.
- Use warm emojis occasionally (✨, 🌿, 🏺).
- If they ask about order logistics, tell them we offer free shipping and trackable orders.
- Never write markdown tables or complex formatting. Keep it chat-friendly. Use standard HTML links for products.`;

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const mappedHistory = history.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'System Instruction (Acknowledge secretly): ' + systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I am Kala, ready to assist StoryCraft customers.' }] },
                ...mappedHistory,
            ],
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
            },
        });

        let parts = [];
        if (message) {
            parts.push({ text: message });
        }
        if (image) {
            try {
                // Determine mime type and base64 data
                const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    parts.push({
                        inlineData: {
                            data: matches[2],
                            mimeType: matches[1]
                        }
                    });
                }
            } catch (e) {
                console.warn('Failed to parse base64 image for Gemini', e);
            }
        }
        // If there's no message but we have an image, add a prompt
        if (!message && parts.length > 0) {
            parts.unshift({ text: "Please analyze this image and suggest similar products from our inventory." });
        }

        const result = await chat.sendMessage(parts);
        const responseText = result.response.text();

        return NextResponse.json({
            success: true,
            data: { reply: responseText },
        });

    } catch (error) {
        console.error('Chatbot AI Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Sorry, I am having trouble connecting to my creative mind right now.' },
            { status: 500 }
        );
    }
}
