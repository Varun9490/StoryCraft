import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { apiLimiter } from '@/lib/rate-limit';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Slow down. Too many requests.' }, { status: 429 });
        }

        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: 'AI is sleeping right now.' }, { status: 503 });
        }

        await connectDB();

        // Fetch some basic store context to feed the AI
        const products = await Product.find({ is_published: true }).select('title price category material').limit(10).lean();

        const storeContext = products.map(p =>
            `- ${p.title} (₹${p.price.toLocaleString('en-IN')}) | Category: ${p.category} | Material: ${p.material || 'N/A'}`
        ).join('\n');

        const systemPrompt = `You are "Kala", a friendly, knowledgeable, and elegant AI chatbot for "StoryCraft" – a premium e-commerce platform selling traditional handcrafted arts from Visakhapatnam and Hyderabad artisans.
        
Your role is to assist customers, give them product suggestions, answer questions about crafts, and provide a warm, welcoming experience. Speak in a friendly, conversational, yet sophisticated tone. You have access to some current store inventory:

CURRENT STORE INVENTORY HIGHLIGHTS:
${storeContext || 'No specific products available right now, but feel free to discuss Indian crafts!'}

Guidelines:
- If a user asks for product suggestions, recommend items from the inventory highlights.
- Keep your answers concise, ideally 2-4 short sentences. 
- Use warm emojis occasionally (✨, 🌿, 🏺).
- If they ask about order logistics, tell them we offer free shipping and trackable orders.
- Never write markdown tables or complex formatting. Keep it chat-friendly.`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
                maxOutputTokens: 300,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
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
