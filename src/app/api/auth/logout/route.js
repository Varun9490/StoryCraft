import { NextResponse } from 'next/server';
import { clearAuthCookie, clearRefreshCookie } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST() {
        const limit = authLimiter(req);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

    const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' }
    );
    clearAuthCookie(response);
    clearRefreshCookie(response);
    return response;
}
