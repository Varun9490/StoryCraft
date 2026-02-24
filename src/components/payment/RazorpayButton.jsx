'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RazorpayButton({ amount, orderId, onSuccess, disabled, className }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Razorpay order
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, receipt: `sc_${orderId || Date.now()}` }),
            });
            const orderData = await orderRes.json();

            if (!orderData.success) throw new Error(orderData.error);

            // 2. Load Razorpay script if needed
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Failed to load Razorpay'));
                    document.head.appendChild(script);
                });
            }

            // 3. Open Razorpay modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.data.amount,
                currency: orderData.data.currency,
                name: 'StoryCraft',
                description: 'Handcrafted Art Purchase',
                order_id: orderData.data.razorpay_order_id,
                theme: { color: '#C4622D' },
                prefill: {},
                handler: async (response) => {
                    try {
                        // 4. Verify payment
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                storycraft_order_id: orderId,
                            }),
                        });
                        const verifyData = await verifyRes.json();

                        if (!verifyData.success) throw new Error(verifyData.error);

                        toast.success('Payment successful!');
                        if (onSuccess) onSuccess(verifyData.data);
                    } catch (err) {
                        toast.error('Payment verification failed: ' + err.message);
                    }
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            toast.error(err.message || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={disabled || loading}
            className={`py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 ${className || 'w-full'}`}
            style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.3)' }}
        >
            {loading ? 'Processing...' : `Pay ₹${amount?.toLocaleString('en-IN')}`}
        </button>
    );
}
