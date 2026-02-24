'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const STATUS_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'in_progress', label: 'In Progress', icon: '🎨' },
    { key: 'shipped', label: 'Shipped', icon: '📦' },
    { key: 'delivered', label: 'Delivered', icon: '🏠' },
];

export default function OrderConfirmationPage({ params }) {
    const { orderId } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                const data = await res.json();
                if (data.success) setOrder(data.data.order);
            } catch { }
            setLoading(false);
        };
        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] pt-24">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                    <div className="w-12 h-12 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="min-h-screen bg-[#050505] pt-24">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                    <div className="text-5xl mb-4 opacity-20">📦</div>
                    <h1 className="text-2xl text-white/50" style={{ fontFamily: 'var(--font-playfair)' }}>Order Not Found</h1>
                    <Link href="/shop" className="text-sm mt-4 block" style={{ color: '#C4622D' }}>← Back to Shop</Link>
                </div>
            </main>
        );
    }

    const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

    return (
        <main className="min-h-screen bg-[#050505] pt-24">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-6xl mb-4"
                    >
                        {order.payment_status === 'paid' ? '🎉' : '📋'}
                    </motion.div>
                    <h1
                        className="text-3xl md:text-4xl font-bold text-white/90 mb-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        {order.payment_status === 'paid' ? 'Your Story Begins!' : 'Order Placed'}
                    </h1>
                    <p className="text-sm text-white/40 italic">
                        &ldquo;{order.storytelling_status}&rdquo;
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-12">
                    {STATUS_STEPS.map((s, i) => (
                        <div key={s.key} className="flex items-center">
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors ${i <= currentStepIndex
                                            ? 'bg-[#C4622D] text-white'
                                            : 'bg-white/5 text-white/20'
                                        }`}
                                >
                                    {s.icon}
                                </div>
                                <span className={`text-[10px] ${i <= currentStepIndex ? 'text-white/60' : 'text-white/20'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                                <div className={`w-12 md:w-20 h-px mx-1 ${i < currentStepIndex ? 'bg-[#C4622D]' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Order Details */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                            Order Details
                        </h3>
                        <span className="text-xs text-white/30">ID: {order._id.slice(-8)}</span>
                    </div>

                    {/* Items */}
                    {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div>
                                <p className="text-sm text-white/70">{item.title_snapshot || 'Product'}</p>
                                <p className="text-xs text-white/30">×{item.quantity}</p>
                            </div>
                            <span className="text-sm text-white/60">₹{(item.price_at_order * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    ))}

                    <div className="h-px bg-white/10" />

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white/80">Total</span>
                        <span className="text-lg font-bold" style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}>
                            ₹{order.total_amount?.toLocaleString('en-IN')}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white/40">Payment</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'paid'
                                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                            }`}>
                            {order.payment_status}
                        </span>
                    </div>

                    {order.delivery_address && (
                        <div className="text-xs text-white/30 pt-2">
                            <p className="text-white/50 mb-1">Delivering to:</p>
                            <p>{order.delivery_address.street}</p>
                            <p>{order.delivery_address.city}, {order.delivery_address.state} — {order.delivery_address.pincode}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                    <Link
                        href="/shop"
                        className="flex-1 py-3 rounded-xl text-center text-sm font-semibold border border-white/10 text-white/60 hover:bg-white/5 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href="/dashboard/buyer"
                        className="flex-1 py-3 rounded-xl text-center text-sm font-semibold text-white transition-all hover:brightness-110"
                        style={{ background: '#C4622D' }}
                    >
                        View All Orders
                    </Link>
                </div>
            </div>
        </main>
    );
}
