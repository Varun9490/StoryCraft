import { GoogleGenerativeAI } from '@google/generative-ai';

let keyIndex = 0;

export function getApiKey() {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY2,
        process.env.GEMINI_API_KEY3,
        process.env.GEMINI_API_KEY4,
        process.env.GEMINI_API_KEY5,
    ].filter(Boolean);

    if (keys.length === 0) return null;
    const key = keys[keyIndex % keys.length];
    keyIndex = (keyIndex + 1) % keys.length;
    return key;
}

export function getGenAI() {
    const key = getApiKey();
    if (!key) throw new Error('GEMINI API keys are missing. Configure them in .env');
    return new GoogleGenerativeAI(key);
}

export function getFlashModel() {
    return getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
    });
}

export async function generateWithRetry(model, prompt, maxRetries = 1) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return text;
        } catch (error) {
            if (attempt === maxRetries) throw error;
            await new Promise((r) => setTimeout(r, 1000));
        }
    }
}

/**
 * Strips markdown code blocks and extracts pure JSON from AI output.
 * Handles ```json ... ```, ``` ... ```, or raw JSON.
 */
export function parseAIJson(rawText) {
    let cleaned = rawText.trim();
    // Strip markdown fenced code blocks
    const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (fenceMatch) {
        cleaned = fenceMatch[1].trim();
    }
    return JSON.parse(cleaned);
}
