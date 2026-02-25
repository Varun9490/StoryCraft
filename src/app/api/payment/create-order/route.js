import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getRazorpayInstance } from '@/lib/razorpay';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'buyer') {
            return NextResponse.json(
                { success: false, error: 'Only buyers can create payment orders' },
                { status: 403 }
            );
        }

        
        const { amount, currency, receipt } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const razorpay = getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            data: {
                razorpay_order_id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_id: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error('Razorpay order error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
