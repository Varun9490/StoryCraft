import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { orderId } = await params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid order ID' },
                { status: 400 }
            );
        }

        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const order = await Order.findById(orderId)
            .populate('items.product', 'title images')
            .populate('buyer', 'name email')
            .lean();

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership
        if (decoded.role === 'buyer' && order.buyer._id.toString() !== decoded.userId) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }
        if (decoded.role === 'artisan') {
            const artisan = await Artisan.findOne({ user: decoded.userId });
            if (!artisan || order.artisan.toString() !== artisan._id.toString()) {
                return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
            }
        }

        return NextResponse.json({ success: true, data: { order } });
    } catch (error) {
        console.error('Order detail error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { orderId } = await params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
        }

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'artisan') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) return NextResponse.json({ success: false, error: 'Artisan profile not found' }, { status: 404 });

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

        if (order.artisan.toString() !== artisan._id.toString()) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        if (body.status) order.status = body.status;
        if (body.storytelling_status) order.storytelling_status = body.storytelling_status;
        if (body.payment_status) order.payment_status = body.payment_status;

        await order.save();

        return NextResponse.json({ success: true, data: { order } });
    } catch (error) {
        console.error('Order update error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }
}
