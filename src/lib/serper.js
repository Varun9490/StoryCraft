const SERPER_API_URL = 'https://google.serper.dev/shopping';

export async function scrapeCompetitorPrices(query, country = 'in') {
    if (!process.env.SERPER_API_KEY || process.env.SERPER_API_KEY === 'your_serper_api_key_from_serper_dev') {
        return { results: [], error: 'SERPER_API_KEY not configured' };
    }
    try {
        const response = await fetch(SERPER_API_URL, {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query, gl: country, hl: 'en', num: 10 }),
        });
        if (!response.ok) throw new Error(`Serper API error: ${response.status}`);
        const data = await response.json();
        return { results: data.shopping || [], error: null };
    } catch (error) {
        return { results: [], error: error.message };
    }
}

export function extractPricesFromResults(results) {
    const prices = results
        .map((r) => {
            const match = r.price?.replace(/[^0-9.]/g, '');
            return match ? parseFloat(match) : null;
        })
        .filter((p) => p !== null && p > 0 && p < 100000);
    return prices;
}
