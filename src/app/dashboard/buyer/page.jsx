'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import DashboardStatCard from '@/components/dashboard/DashboardStatCard';

export default function BuyerDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (data.success) setOrders(data.data.orders);
            } catch (err) {
                console.error('Failed to load orders:', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    const paidOrders = orders.filter((o) => o.payment_status === 'paid');
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-10"
            >
                <h1
                    className="text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Good to see you, {user?.name || 'Explorer'} 👋
                </h1>
                <div className="flex items-center gap-3">
                    <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            color: '#93c5fd',
                        }}
                    >
                        🛍️ Buyer
                    </span>
                    <span className="text-xs text-white/30">
                        Your craft journey continues
                    </span>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10">
                <DashboardStatCard
                    icon="📦"
                    label="Total Orders"
                    value={loading ? '...' : orders.length}
                    index={0}
                />
                <DashboardStatCard
                    icon="✅"
                    label="Completed"
                    value={loading ? '...' : paidOrders.length}
                    index={1}
                />
                <DashboardStatCard
                    icon="💸"
                    label="Total Spent"
                    value={loading ? '...' : `₹${totalSpent.toLocaleString('en-IN')}`}
                    index={2}
                />
                <Link href="/chat">
                    <DashboardStatCard
                        icon="💬"
                        label="Active Chats"
                        value="View"
                        index={3}
                    />
                </Link>
            </div>

            {/* Orders List */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2
                        className="text-xl font-bold text-white/80"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Your Orders
                    </h2>
                    <Link
                        href="/shop"
                        className="text-sm hover:brightness-110 transition-all"
                        style={{ color: '#C4622D' }}
                    >
                        Browse More →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4 opacity-20">🛍️</div>
                        <p className="text-white/40 text-sm mb-4">No orders yet</p>
                        <Link
                            href="/shop"
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 inline-block"
                            style={{ background: '#C4622D' }}
                        >
                            Start Shopping →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <Link
                                key={order._id}
                                href={`/orders/${order._id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
                            >
                                <div>
                                    <p className="text-sm text-white/70">Order #{order._id.slice(-8)}</p>
                                    <p className="text-xs text-white/30 mt-0.5">
                                        {order.items?.length || 0} item(s) • {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold" style={{ color: '#C4622D' }}>
                                            ₹{order.total_amount?.toLocaleString('en-IN')}
                                        </span>
                                        <div className="flex gap-1.5 mt-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${order.payment_status === 'paid'
                                                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                                : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                                                }`}>
                                                {order.payment_status}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Explore CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="rounded-2xl p-8 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(196,98,45,0.1), rgba(232,168,56,0.05))', border: '1px solid rgba(196,98,45,0.15)' }}
            >
                <h3
                    className="text-xl font-bold text-white/80 mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Discover More Crafts
                </h3>
                <p className="text-sm text-white/40 mb-5 max-w-md mx-auto">
                    Explore authentic handcrafted treasures from artisans across Visakhapatnam and Hyderabad.
                </p>
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: '#C4622D' }}
                >
                    Explore Shop →
                </Link>
            </motion.div>
        </div>
    );
}
