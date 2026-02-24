import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artisan',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                    min: 1,
                    default: 1,
                },
                price_at_order: { type: Number },
                title_snapshot: { type: String },
            },
        ],
        total_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: [
                'pending',
                'confirmed',
                'in_progress',
                'shipped',
                'delivered',
                'cancelled',
            ],
            default: 'pending',
        },
        payment_status: {
            type: String,
            enum: ['unpaid', 'paid', 'refunded'],
            default: 'unpaid',
        },
        payment_id: {
            type: String,
            default: '',
        },
        razorpay_order_id: {
            type: String,
            default: '',
        },
        is_customization: {
            type: Boolean,
            default: false,
        },
        customization_details: {
            type: String,
            default: '',
        },
        delivery_address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            landmark: { type: String, default: '' },
        },
        storytelling_status: {
            type: String,
            default: 'Your story has begun — order placed!',
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
