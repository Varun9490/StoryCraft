import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody, isValidMongoId } from '@/lib/sanitize';

export async function GET(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        const token = request.cookies.get('auth_token')?.value;
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(decoded.userId).populate({
            path: 'wishlist',
            populate: { path: 'artisan', select: 'craft_specialty city' },
        });

        return NextResponse.json({
            success: true,
            data: { wishlist: user?.wishlist || [] },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        const token = request.cookies.get('auth_token')?.value;
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);
        const { productId, action } = body;

        if (!productId || !isValidMongoId(productId)) {
            return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
        }

        if (!['add', 'remove'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        await connectDB();

        if (action === 'add') {
            await User.findByIdAndUpdate(decoded.userId, { $addToSet: { wishlist: productId } });
        } else {
            await User.findByIdAndUpdate(decoded.userId, { $pull: { wishlist: productId } });
        }

        return NextResponse.json({
            success: true,
            message: action === 'add' ? 'Added to wishlist' : 'Removed from wishlist',
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
