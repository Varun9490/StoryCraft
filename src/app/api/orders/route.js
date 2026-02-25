import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

// GET — list orders
export async function GET(request) {
    try {
        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        let query;
        if (decoded.role === 'buyer') {
            query = { buyer: decoded.userId };
        } else if (decoded.role === 'artisan') {
            const artisan = await Artisan.findOne({ user: decoded.userId });
            if (!artisan) {
                return NextResponse.json({ success: false, error: 'Artisan profile not found' }, { status: 404 });
            }
            query = { artisan: artisan._id };
        } else {
            return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 403 });
        }

        const orders = await Order.find(query)
            .populate('items.product', 'title images')
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: { orders } });
    } catch (error) {
        console.error('Orders list error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST — create order (buyer only)
export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }
        if (decoded.role !== 'buyer') {
            return NextResponse.json(
                { success: false, error: 'Only buyers can place orders' },
                { status: 403 }
            );
        }


        const { items, delivery_address, razorpay_payment_id, razorpay_order_id, payment_method } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No items in order' },
                { status: 400 }
            );
        }

        if (!delivery_address || !delivery_address.street || !delivery_address.city || !delivery_address.state || !delivery_address.pincode) {
            return NextResponse.json(
                { success: false, error: 'Delivery address is required' },
                { status: 400 }
            );
        }

        // Fetch and verify all products
        const formattedItems = [];
        let totalAmount = 0;
        let firstArtisan = null;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || !product.is_published) {
                return NextResponse.json(
                    { success: false, error: `Product ${item.productId} not found or unavailable` },
                    { status: 400 }
                );
            }
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { success: false, error: `Insufficient stock for ${product.title}` },
                    { status: 400 }
                );
            }

            if (!firstArtisan) firstArtisan = product.artisan;

            formattedItems.push({
                product: product._id,
                quantity: item.quantity,
                price_at_order: product.price,
                title_snapshot: product.title,
            });
            totalAmount += product.price * item.quantity;
        }

        const order = new Order({
            buyer: decoded.userId,
            artisan: firstArtisan,
            items: formattedItems,
            total_amount: totalAmount,
            status: payment_method === 'cod' ? 'confirmed' : 'pending',
            payment_status: 'unpaid',
            delivery_address,
            storytelling_status: 'Your story has begun — order placed!',
            payment_id: razorpay_payment_id || '',
            razorpay_order_id: razorpay_order_id || '',
            payment_method: payment_method || 'online',
        });

        await order.save();

        // Decrement stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity },
            });
        }

        return NextResponse.json(
            {
                success: true,
                data: { order },
                message: 'Order placed successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Order create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
