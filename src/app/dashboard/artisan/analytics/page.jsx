'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

function StatCard({ label, value, suffix = '', icon, color }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: color + '20', color }}
                >
                    {icon}
                </div>
                <span className="text-[11px] text-white/40 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white/90">
                {typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
            </p>
        </div>
    );
}

function RevenueChart({ data }) {
    if (!data || data.length === 0) return null;

    const maxRev = Math.max(...data.map((d) => d.revenue), 1);
    const chartWidth = Math.max(data.length * 18, 300);
    const chartHeight = 200;
    const padding = { top: 20, right: 10, bottom: 30, left: 50 };
    const plotW = chartWidth - padding.left - padding.right;
    const plotH = chartHeight - padding.top - padding.bottom;

    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1 || 1)) * plotW;
        const y = padding.top + plotH - (d.revenue / maxRev) * plotH;
        return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + plotH} L ${points[0].x} ${padding.top + plotH} Z`;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 overflow-x-auto">
            <h3 className="text-sm font-semibold text-white/60 mb-4">Revenue Over Time</h3>
            <svg width={chartWidth} height={chartHeight} className="min-w-full">
                <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E07038" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E07038" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = padding.top + plotH - frac * plotH;
                    return (
                        <g key={frac}>
                            <line x1={padding.left} y1={y} x2={padding.left + plotW} y2={y} stroke="rgba(255,255,255,0.05)" />
                            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="9">
                                ₹{Math.round(maxRev * frac).toLocaleString('en-IN')}
                            </text>
                        </g>
                    );
                })}
                <path d={areaD} fill="url(#revGradient)" />
                <path d={pathD} fill="none" stroke="#E07038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#E07038" stroke="#06060A" strokeWidth="1.5" />
                ))}
            </svg>
        </div>
    );
}

function ProductTable({ products }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 overflow-x-auto">
            <h3 className="text-sm font-semibold text-white/60 mb-4">Product Performance</h3>
            <table className="w-full text-left min-w-[600px]">
                <thead>
                    <tr className="text-[10px] text-white/30 uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3 pr-4">Product</th>
                        <th className="pb-3 pr-4">Views</th>
                        <th className="pb-3 pr-4">Orders</th>
                        <th className="pb-3 pr-4">Revenue</th>
                        <th className="pb-3">FAQs</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.productId} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                    {p.image && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                                            <Image src={p.image} alt={p.title} fill className="object-cover" sizes="40px" />
                                        </div>
                                    )}
                                    <span className="text-sm text-white/70 font-medium truncate max-w-[200px]">{p.title}</span>
                                </div>
                            </td>
                            <td className="py-3 pr-4 text-sm text-white/50">{p.views}</td>
                            <td className="py-3 pr-4 text-sm text-white/50">{p.orders}</td>
                            <td className="py-3 pr-4 text-sm text-[#E07038] font-medium">₹{p.revenue.toLocaleString('en-IN')}</td>
                            <td className="py-3 text-sm text-white/50">{p.faq_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ArtisanAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [period, setPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/analytics/artisan?period=${period}`);
                const data = await res.json();
                if (data.success) setAnalytics(data.data.analytics);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, [period]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#06060A] pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1
                                className="text-2xl md:text-3xl font-bold text-white/90"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                Analytics Dashboard
                            </h1>
                            <p className="text-sm text-white/40 mt-1">Track your craft business performance</p>
                        </div>
                        <div className="flex gap-2">
                            {['7d', '30d', '90d'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${period === p
                                            ? 'bg-[#E07038] text-white'
                                            : 'bg-white/5 text-white/40 hover:text-white/60 border border-white/10'
                                        }`}
                                >
                                    {p === '7d' ? 'Week' : p === '30d' ? 'Month' : '90 Days'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 h-28 animate-pulse" />
                            ))}
                        </div>
                    ) : analytics ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <StatCard label="Total Revenue" value={analytics.overview.totalRevenue} prefix="₹" icon="💰" color="#E07038" />
                                <StatCard label="Total Views" value={analytics.overview.totalViews} icon="👁" color="#8B5CF6" />
                                <StatCard label="Orders" value={analytics.period_stats.orders} icon="📦" color="#52B788" />
                                <StatCard label="Products" value={analytics.overview.publishedProducts} icon="🎨" color="#D4A853" />
                            </div>

                            {/* Revenue Chart */}
                            <div className="mb-8">
                                <RevenueChart data={analytics.revenue_chart} />
                            </div>

                            {/* Product Performance Table */}
                            <ProductTable products={analytics.products_performance} />
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-white/30">No analytics data available yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
