import { GoogleGenerativeAI } from '@google/generative-ai';

let keyIndex = 0;

const fallbackKeys = [
    "AIzaSyAAm61ELkrz_XqMrcmaPViCKDaf3lalX90",
    "AIzaSyA7jkaXeiOSz0U01YqQZIllG0QOV0rE8XI",
    "AIzaSyA_yHsro-_UpHBi7FhacinV5tnqX8A37d8",
    "AIzaSyABp0IBCE90_mhITPXyrVWlRyXsjRLJhXs",
];

export function getApiKey() {
    let keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY2,
        process.env.GEMINI_API_KEY3,
        process.env.GEMINI_API_KEY4,
        process.env.GEMINI_API_KEY5,
    ].filter(Boolean);

    // Filter out the known expired key specifically if it accidentally gets loaded
    keys = keys.filter(k => k !== "AIzaSyB4Cf4g8MVL6H573swWqPdCbLuSJlipW3M");

    // Use fallbacks if no working valid keys are found in process.env
    if (keys.length === 0) {
        keys = fallbackKeys;
    }

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

export function parseAIJson(rawText) {
    let cleaned = rawText.trim();
    // Strip markdown fenced code blocks
    const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (fenceMatch) {
        cleaned = fenceMatch[1].trim();
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // If parsing fails, try to extract just the first {...} or [...] block
        const startBracket = cleaned.indexOf('[');
        const startBrace = cleaned.indexOf('{');

        let startIdx = -1;
        let endChar = '';
        if (startBracket !== -1 && (startBrace === -1 || startBracket < startBrace)) {
            startIdx = startBracket;
            endChar = ']';
        } else if (startBrace !== -1) {
            startIdx = startBrace;
            endChar = '}';
        }

        if (startIdx !== -1) {
            const endIdx = cleaned.lastIndexOf(endChar);
            if (endIdx > startIdx) {
                const subStr = cleaned.substring(startIdx, endIdx + 1);
                try {
                    return JSON.parse(subStr);
                } catch (e2) {
                    throw e; // throw original
                }
            }
        }

        throw e;
    }
}
