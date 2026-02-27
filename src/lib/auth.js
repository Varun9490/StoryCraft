import jwt from 'jsonwebtoken';

// ── Access Token (short-lived: 15 min) ──
export function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '7d',
    });
}

// Backward-compatible alias
export const signJWT = signAccessToken;

export function verifyJWT(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name !== 'TokenExpiredError') {
            console.warn('[auth] JWT verification failed:', err.message);
        }
        return null;
    }
}

// ── Refresh Token (long-lived: 30 days) ──
export function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET + '_refresh', {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d',
    });
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET + '_refresh');
    } catch (err) {
        console.warn('[auth] RefreshToken verification failed:', err.message);
        return null;
    }
}

// ── Cookie Helpers ──
export function setAuthCookie(response, token) {
    response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800, // 7 days
        path: '/',
    });
}

export function setRefreshCookie(response, token) {
    response.cookies.set('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2592000, // 30 days
        path: '/api/auth/refresh',
    });
}

export function clearAuthCookie(response) {
    response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });
}

export function clearRefreshCookie(response) {
    response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/api/auth/refresh',
    });
}
