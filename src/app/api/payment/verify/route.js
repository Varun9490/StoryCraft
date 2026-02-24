import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { verifyJWT } from '@/lib/auth';

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'buyer') {
            return NextResponse.json(
                { success: false, error: 'Only buyers can verify payments' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, storycraft_order_id } = body;

        // Verify HMAC signature
        const expectedBody = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(expectedBody)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, error: 'Payment verification failed' },
                { status: 400 }
            );
        }

        // Update order
        await connectDB();
        const order = await Order.findById(storycraft_order_id);

        if (!order || order.buyer.toString() !== decoded.userId) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        order.payment_status = 'paid';
        order.status = 'confirmed';
        order.payment_id = razorpay_payment_id;
        order.razorpay_order_id = razorpay_order_id;
        order.storytelling_status = 'Your payment is received. The artisan is weaving your story...';
        await order.save();

        return NextResponse.json({
            success: true,
            data: { order },
            message: 'Payment verified. Your story begins!',
        });
    } catch (error) {
        console.error('Payment verify error:', error);
        return NextResponse.json(
            { success: false, error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
