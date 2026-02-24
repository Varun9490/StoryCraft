import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { apiLimiter } from '@/lib/rate-limit';

export async function GET(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        await connectDB();

        // Find all users who have approved customizations
        const users = await User.find({
            'approved_customizations.0': { $exists: true },
        }).select('approved_customizations').lean();

        const items = users
            .flatMap((u) => u.approved_customizations || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 50);

        return NextResponse.json({ success: true, data: { items } });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
