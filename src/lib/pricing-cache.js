// Simple in-memory cache for pricing recommendations — no Redis needed until Iteration 5
const cache = new Map();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedPricing(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL_MS) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

export function setCachedPricing(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

export function buildCacheKey(category, city) {
    return `pricing_${category}_${city}`.toLowerCase();
}
