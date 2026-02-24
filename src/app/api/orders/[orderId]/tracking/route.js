import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { apiLimiter } from '@/lib/rate-limit';

const storytellingTimelineMap = {
    pending: [
        'Your story has begun — order placed! ✨',
        'The artisan has been notified of your order.',
    ],
    confirmed: [
        'Your order is confirmed! 🎉',
        'Payment received. The artisan is preparing materials.',
        'Your craft journey officially starts today.',
    ],
    in_progress: [
        'The craft is being made — just for you. 🤲',
        'Hands that have practised this art for decades are now creating your piece.',
        'Every stroke, every detail is being crafted with intention.',
    ],
    shipped: [
        'Your story is on its way! 📦',
        'Packaged with care and a handwritten artisan note inside.',
        'Track your package with the provided tracking number.',
    ],
    delivered: [
        'Your story has arrived. 🏡',
        'Welcome home. This piece carries centuries of tradition with it.',
        'Share your story — tag us @StoryCraft',
    ],
};

export async function GET(request, { params }) {
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
        const { orderId } = await params;
        const order = await Order.findById(orderId)
            .populate('items.product', 'title images craft_technique')
            .populate('artisan', 'craft_specialty city user')
            .lean();

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (order.buyer?.toString() !== decoded.userId) {
            return NextResponse.json({ success: false, error: 'Not your order' }, { status: 403 });
        }

        const storytellingTimeline = storytellingTimelineMap[order.status] || storytellingTimelineMap.pending;

        return NextResponse.json({
            success: true,
            data: { order, storytelling_timeline: storytellingTimeline },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
