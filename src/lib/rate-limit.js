const rateLimitMap = new Map();

export function rateLimit({ windowMs = 60000, max = 30, identifier = 'default' }) {
    return function checkLimit(req) {
        const ip = req.headers.get?.('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || 'unknown';
        const key = `${identifier}:${ip}`;
        const now = Date.now();
        const entry = rateLimitMap.get(key);

        if (!entry || now - entry.startTime > windowMs) {
            rateLimitMap.set(key, { count: 1, startTime: now });
            return { allowed: true, remaining: max - 1 };
        }

        if (entry.count >= max) {
            return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.startTime + windowMs - now) / 1000) };
        }

        entry.count += 1;
        return { allowed: true, remaining: max - entry.count };
    };
}

// Pre-configured limiters for different route types
export const apiLimiter = rateLimit({ windowMs: 60000, max: 60, identifier: 'api' });
export const authLimiter = rateLimit({ windowMs: 900000, max: 50, identifier: 'auth' });
export const uploadLimiter = rateLimit({ windowMs: 60000, max: 10, identifier: 'upload' });
export const aiLimiter = rateLimit({ windowMs: 60000, max: 5, identifier: 'ai' });

// Cleanup old entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, val] of rateLimitMap.entries()) {
            if (now - val.startTime > 1800000) rateLimitMap.delete(key);
        }
    }, 300000);
}
