import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { signJWT, setAuthCookie, signRefreshToken, setRefreshCookie } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';
import User from '@/models/User';

export async function POST(req) {
    try {
        await connectDB();

        const limit = authLimiter(req);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await req.json();
        const body = sanitizeBody(rawBody);

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { success: false, error: 'Account has been deactivated. Contact support.' },
                { status: 403 }
            );
        }

        const token = signJWT({ userId: user._id.toString(), role: user.role });
        const refreshToken = signRefreshToken({ userId: user._id.toString() });

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            artisanProfile: user.artisanProfile,
        };

        const response = NextResponse.json(
            { success: true, data: { user: safeUser }, message: 'Welcome back!' },
            { status: 200 }
        );

        setAuthCookie(response, token);
        setRefreshCookie(response, refreshToken);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
