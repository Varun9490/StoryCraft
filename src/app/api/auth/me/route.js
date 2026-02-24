import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import User from '@/models/User';
import Artisan from '@/models/Artisan';

export async function GET() {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, error: 'Session expired. Please login again.' },
                { status: 401 }
            );
        }

        const user = await User.findById(decoded.userId)
            .populate('artisanProfile')
            .select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: { user } });
    } catch (error) {
        console.error('Auth/me error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
