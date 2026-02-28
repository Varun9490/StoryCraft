import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getFlashModel, parseAIJson, generateWithRetry } from '@/lib/gemini';
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
IMPORTANT: Today's date is exactly ${currentDate}. You must ONLY suggest events and festivals occurring in the upcoming 1-2 months from this date. For example, if it is late February or March, suggest Maha Shivaratri, Holi, Ugadi, Women's Day, or summer beach tourist season. DO NOT suggest Diwali, Sankranti, or Dussehra if they are more than 3 months away.

The artisan using the platform specializes in: "${craft}".

Analyze the upcoming accurate calendar events and current e-commerce trends. You must provide professional-wise suggestions on WHICH SPECIFIC PRODUCTS they should stock up on, given their specific specialization (${craft}) and the upcoming season in Visakhapatnam.

Generate EXACTLY 2 actionable insights. 
1. The first insight MUST suggest what specific items they should create right now for the upcoming festive/tourist season based on today's date (${currentDate}).
2. The second insight MUST be a high-converting e-commerce or marketing strategy tailored to their profession right now.

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
]

CRITICAL: Do not write anything outside the actual JSON array. Ensure all double quotes inside strings are properly escaped like \\". Do not use markdown \`\`\`json blocks.`;

    const model = getFlashModel({ requireJson: true });
    let insights = [];

    try {
      const rawText = await generateWithRetry(model, prompt, 3, true);
      insights = parseAIJson(rawText);
    } catch (e) {
      try {
        const strictPrompt = prompt + '\n\nCRITICAL: Return ONLY raw JSON array. DO NOT use markdown. Escape all strings properly.';
        const rawText = await generateWithRetry(model, strictPrompt, 3, true);
        insights = parseAIJson(rawText);
      } catch (e2) {
        console.error('Insights JSON Parsing Error:', e2);
        return NextResponse.json({ success: false, error: 'AI returned invalid response format. Please try again.' }, { status: 422 });
      }
    }

    return NextResponse.json({ success: true, data: { insights } });

  } catch (error) {
    console.error('Insights Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 });
  }
}
