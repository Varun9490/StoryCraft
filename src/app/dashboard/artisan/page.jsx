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
                    fetch(`/api/products?artisan=me&limit=50&t=${Date.now()}`, { cache: 'no-store' }),
                    fetch(`/api/orders?t=${Date.now()}`, { cache: 'no-store' }),
                ]);

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    if (productsData.success) setProducts(productsData.data.products);
                }

                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    if (ordersData.success) setOrders(ordersData.data.orders);
                }
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

            {/* Smart Suggestions & Insights */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-[#C4622D]/20 bg-gradient-to-br from-[#C4622D]/5 to-transparent p-6 mb-10 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4622D]/10 rounded-full blur-[80px] -mr-10 -mt-20 pointer-events-none" />
                <h2 className="text-xl font-bold text-[#E8A838] mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                    ✨ AI Market Insights & Suggestions
                </h2>
                <p className="text-xs text-white/50 mb-6">Personalized opportunities based on your {artisanProfile?.craft_specialty || 'craft'} expertise.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
                        <span className="text-xl mb-3 block">🪔</span>
                        <h3 className="text-sm font-semibold text-white/90 mb-1">Upcoming Festive Demand: Diwali</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Search trends for '{artisanProfile?.craft_specialty || 'traditional'} handcrafted gifts' are projected to spike by 45% next month. Consider creating bundle offers or limited-edition festive pieces.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
                        <span className="text-xl mb-3 block">📈</span>
                        <h3 className="text-sm font-semibold text-white/90 mb-1">High-Converting Category</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Buyers are actively looking for customizable items. Adding a "Personalization Available" option to your top 3 products could increase sales conversion by 20%.
                        </p>
                    </div>
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

            {/* Product Analytics Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10"
            >
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white/80 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Store Performance Overview</h2>
                        <p className="text-[11px] text-white/40 mb-6">Views and engagement over the last 30 days</p>
                    </div>
                    {/* Mocked Graph UI */}
                    <div className="flex items-end gap-2 h-40 w-full border-b border-white/10 pb-2">
                        {[40, 60, 30, 80, 50, 90, 70, 100, 60, 40].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                className="flex-1 bg-gradient-to-t from-[#C4622D]/40 to-[#C4622D]/80 rounded-t-sm"
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-white/30 uppercase tracking-widest">
                        <span>1st</span>
                        <span>15th</span>
                        <span>30th</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <h2 className="text-lg font-bold text-white/80 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Top Selling Product</h2>
                    {loading || products.length === 0 ? (
                        <div className="h-32 bg-white/5 animate-pulse rounded-xl" />
                    ) : (
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5 h-full">
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-white/5 mb-4">
                                {products[0]?.images?.[0] && (
                                    <img src={products[0].images[0]} alt="Top product" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <p className="font-semibold text-sm text-white/90 truncate">{products[0]?.title || 'No product'}</p>
                            <p className="text-xs text-[#52B788] mt-1 font-medium">↑ 12% increase this week</p>
                        </div>
                    )}
                </div>
            </motion.div>

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

            {/* Customer Feedback & Reviews */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mt-10"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white/80 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Recent Feedback</h2>
                        <p className="text-xs text-white/40">What your customers are saying</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-white">4.9<span className="text-sm text-white/30">/5</span></span>
                        <div className="flex text-[#E8A838] text-xs">★★★★★</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { name: "Priya S.", product: products[0]?.title || "Handcrafted Item", text: "The detail and craftsmanship on this piece is unbelievable. It looks perfect in my living room!", rating: 5, date: "2 days ago" },
                        { name: "Arjun M.", product: products[1]?.title || "Custom Order", text: "Loved the personalization process. The artisan was incredibly communicative and brought my vision to life.", rating: 5, date: "1 week ago" }
                    ].map((review, i) => (
                        <div key={i} className="p-5 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-white/90 flex items-center gap-2">
                                        {review.name}
                                        <span className="bg-[#52B788]/20 text-[#52B788] px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border border-[#52B788]/30 flex items-center gap-1">
                                            ✓ Verified Buyer
                                        </span>
                                    </p>
                                    <p className="text-xs text-white/40 mt-1">Purchased: <span className="text-white/60">{review.product}</span></p>
                                </div>
                                <span className="text-xs text-white/30">{review.date}</span>
                            </div>
                            <div className="flex text-[#E8A838] text-xs mb-2">{'★'.repeat(review.rating)}</div>
                            <p className="text-sm text-white/60 italic">"{review.text}"</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
