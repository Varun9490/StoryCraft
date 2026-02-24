import { createHmac, randomBytes } from 'crypto';

export function generateCSRFToken() {
    return randomBytes(32).toString('hex');
}

export function createSignedCSRFToken() {
    const raw = randomBytes(32).toString('hex');
    const sig = createHmac('sha256', process.env.CSRF_SECRET || 'storycraft_csrf_default_secret_32c').update(raw).digest('hex');
    return raw + sig;
}

export function validateCSRFToken(token) {
    if (!token || typeof token !== 'string') return false;
    if (token.length !== 128) return false;
    const raw = token.slice(0, 64);
    const sig = token.slice(64);
    const expected = createHmac('sha256', process.env.CSRF_SECRET || 'storycraft_csrf_default_secret_32c').update(raw).digest('hex');
    // Constant-time comparison
    if (expected.length !== sig.length) return false;
    let match = true;
    for (let i = 0; i < expected.length; i++) {
        if (expected[i] !== sig[i]) match = false;
    }
    return match;
}
