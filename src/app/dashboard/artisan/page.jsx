'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import DashboardStatCard from '@/components/dashboard/DashboardStatCard';
import ProductListTable from '@/components/dashboard/ProductListTable';

export default function ArtisanDashboard() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    fetch('/api/products?artisan=me&limit=50'),
                    fetch('/api/orders'),
                ]);
                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();

                if (productsData.success) setProducts(productsData.data.products);
                if (ordersData.success) setOrders(ordersData.data.orders);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const artisanProfile = user?.artisanProfile;
    const totalRevenue = orders
        .filter((o) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

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
                    Welcome back, {user?.name || 'Artisan'} 🎨
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                    <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                            background: 'rgba(196,98,45,0.15)',
                            border: '1px solid rgba(196,98,45,0.3)',
                            color: '#E8A838',
                        }}
                    >
                        🎨 Artisan
                    </span>
                    {artisanProfile?.craft_specialty && (
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                background: 'rgba(232,168,56,0.1)',
                                border: '1px solid rgba(232,168,56,0.2)',
                                color: '#E8A838',
                            }}
                        >
                            {artisanProfile.craft_specialty}
                        </span>
                    )}
                    {artisanProfile?.is_verified ? (
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                background: 'rgba(82,183,136,0.15)',
                                border: '1px solid rgba(82,183,136,0.3)',
                                color: '#52B788',
                            }}
                        >
                            ✓ Verified Artisan
                        </span>
                    ) : (
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                background: 'rgba(232,168,56,0.1)',
                                border: '1px solid rgba(232,168,56,0.2)',
                                color: '#E8A838',
                            }}
                        >
                            ⏳ Verification Pending
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10">
                <DashboardStatCard
                    icon="📦"
                    label="Products Listed"
                    value={loading ? '...' : products.length}
                    index={0}
                />
                <DashboardStatCard
                    icon="📥"
                    label="Orders Received"
                    value={loading ? '...' : orders.length}
                    index={1}
                />
                <DashboardStatCard
                    icon="💰"
                    label="Total Revenue"
                    value={loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
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

            {/* Product Management */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2
                        className="text-xl font-bold text-white/80"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Your Products
                    </h2>
                    <Link
                        href="/dashboard/artisan/products/new"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                        style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.3)' }}
                    >
                        + Add Product
                    </Link>
                </div>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <ProductListTable products={products} />
                )}
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <h2
                        className="text-xl font-bold text-white/80 mb-6"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Recent Orders
                    </h2>
                    <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                            <Link
                                key={order._id}
                                href={`/orders/${order._id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
                            >
                                <div>
                                    <p className="text-sm text-white/70">Order #{order._id.slice(-8)}</p>
                                    <p className="text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${order.payment_status === 'paid'
                                        ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                        : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                                        }`}>
                                        {order.payment_status}
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: '#C4622D' }}>
                                        ₹{order.total_amount?.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
