'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const statusSteps = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered'];

const statusConfig = {
    pending: { label: 'Order Placed', icon: '📝', color: '#D4A853' },
    confirmed: { label: 'Confirmed', icon: '✅', color: '#52B788' },
    in_progress: { label: 'Being Crafted', icon: '🤲', color: '#E07038' },
    shipped: { label: 'Shipped', icon: '📦', color: '#8B5CF6' },
    delivered: { label: 'Delivered', icon: '🏡', color: '#52B788' },
};

function TimelineStep({ step, isActive, isCompleted, isLast }) {
    const config = statusConfig[step];
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 transition-all ${isCompleted
                            ? 'border-[#52B788] bg-[#52B788]/20'
                            : isActive
                                ? 'border-[#E07038] bg-[#E07038]/20 ring-4 ring-[#E07038]/10'
                                : 'border-white/10 bg-white/[0.02]'
                        }`}
                >
                    {isCompleted ? '✓' : config.icon}
                </motion.div>
                {!isLast && (
                    <div className={`w-0.5 h-12 ${isCompleted ? 'bg-[#52B788]/40' : 'bg-white/10'}`} />
                )}
            </div>
            <div className="pt-2">
                <p className={`text-sm font-medium ${isActive ? 'text-white/90' : isCompleted ? 'text-white/60' : 'text-white/25'}`}>
                    {config.label}
                </p>
            </div>
        </div>
    );
}

export default function OrderTrackingPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}/tracking`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data.order);
                    setTimeline(data.data.storytelling_timeline);
                }
            } catch (err) {
                console.error('Failed to fetch tracking:', err);
            }
            setLoading(false);
        };
        fetchTracking();
    }, [orderId]);

    const currentStepIndex = order ? statusSteps.indexOf(order.status) : 0;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#06060A] pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-6">
                    {loading ? (
                        <div className="space-y-6 py-12">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                                    <div className="flex-1 h-6 rounded bg-white/5 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : order ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="mb-8">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">Order Tracking</span>
                                <h1
                                    className="text-2xl md:text-3xl font-bold text-white/90 mt-1"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    Your Craft Journey
                                </h1>
                                <p className="text-sm text-white/40 mt-1">Order #{orderId?.slice(-8)}</p>
                            </div>

                            {/* Storytelling narrative */}
                            <div className="rounded-2xl border border-[#E07038]/20 bg-[#E07038]/[0.03] p-6 mb-8">
                                {timeline.map((line, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="text-sm text-white/60 mb-2 last:mb-0"
                                    >
                                        {line}
                                    </motion.p>
                                ))}
                            </div>

                            {/* Timeline */}
                            <div className="mb-8">
                                {statusSteps.map((step, i) => (
                                    <TimelineStep
                                        key={step}
                                        step={step}
                                        isActive={i === currentStepIndex}
                                        isCompleted={i < currentStepIndex}
                                        isLast={i === statusSteps.length - 1}
                                    />
                                ))}
                            </div>

                            {/* Order Details */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-sm font-semibold text-white/60 mb-4">Order Items</h3>
                                {order.items?.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0">
                                        {item.product?.images?.[0] && (
                                            <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                                                <Image
                                                    src={item.product.images[0]?.url || item.product.images[0]}
                                                    alt={item.product.title || 'Product'}
                                                    fill
                                                    className="object-cover"
                                                    sizes="56px"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-white/80 font-medium">{item.product?.title}</p>
                                            <p className="text-xs text-white/30">Qty: {item.quantity || 1}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                                    <span className="text-sm text-white/40">Total</span>
                                    <span className="text-lg font-bold text-[#E07038]">
                                        ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-white/30">Order not found.</p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
