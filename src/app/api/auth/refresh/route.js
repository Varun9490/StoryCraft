import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, setAuthCookie } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
    try {
        const refreshToken = request.cookies.get('refreshToken')?.value;
        if (!refreshToken) {
            return NextResponse.json({ success: false, error: 'No refresh token' }, { status: 401 });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
        }

        const newAccessToken = signAccessToken({ userId: user._id, role: user.role });
        const response = NextResponse.json({ success: true, data: { user } });
        setAuthCookie(response, newAccessToken);
        return response;
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Token refresh failed' }, { status: 500 });
    }
}
