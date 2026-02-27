import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getFlashModel, parseAIJson } from '@/lib/gemini';
import Artisan from '@/models/Artisan';
import connectDB from '@/lib/db';

export async function GET(request) {
    try {
        await connectDB();
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const artisan = await Artisan.findOne({ user: decoded.userId }).lean();
        const craft = artisan?.craft_specialty || 'General Handcrafts';

        const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const prompt = `You are an expert e-commerce and local market analysis AI for artisans selling handcrafted goods in Visakhapatnam, India.
Today's date is exactly ${currentDate}.
The artisan using the platform specializes in: "${craft}".

Analyze the upcoming calendar events, seasons, localized Indian/Andhra Pradesh festivals (like Ugadi, Sankranti, Diwali, Dussehra/Navaratri, local Vizag events, weddings, tourists visiting beaches, etc.), and current e-commerce trends. Provide heavily personalized and extremely accurate insights related to Visakhapatnam and their specific craft.

Generate EXACTLY 2 actionable insights. 
1. The first insight should be about an UPCOMING festival, event, or season based on today's date (${currentDate}).
2. The second insight should be about a current high-converting e-commerce strategy/trend for this specific craft right now.

Respond ONLY with valid, minified JSON matching this array structure exactly, with no surrounding text or markdown formatting:
[
  {
    "icon": "💡",
    "title": "Title here",
    "description": "2-3 sentences of actionable advice."
  },
  {
    "icon": "📈",
    "title": "Another title",
    "description": "More actionable advice."
  }
]`;

        const model = getFlashModel();
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const insights = parseAIJson(text);

        return NextResponse.json({ success: true, data: { insights } });

    } catch (error) {
        console.error('Insights Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 });
    }
}
