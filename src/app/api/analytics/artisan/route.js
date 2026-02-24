import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Artisan from '@/models/Artisan';
import { apiLimiter } from '@/lib/rate-limit';

export async function GET(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        const token = request.cookies.get('auth_token')?.value;
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) {
            return NextResponse.json({ success: false, error: 'Artisan not found' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';
        const periodMap = { '7d': 7, '30d': 30, '90d': 90 };
        const days = periodMap[period] || 30;
        const since = new Date(Date.now() - days * 86400000);

        const [products, periodOrders, revenueAgg] = await Promise.all([
            Product.find({ artisan: artisan._id }).select('title images views is_published ai_generated_faqs price').lean(),
            Order.find({ artisan: artisan._id, createdAt: { $gte: since }, payment_status: 'paid' }).lean(),
            Order.aggregate([
                { $match: { artisan: artisan._id, payment_status: 'paid' } },
                { $group: { _id: null, totalRevenue: { $sum: '$total_amount' } } },
            ]),
        ]);

        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        const publishedProducts = products.filter((p) => p.is_published).length;

        // Products performance
        const productsPerformance = products.map((p) => {
            const productOrders = periodOrders.filter((o) =>
                o.items?.some((item) => item.product?.toString() === p._id.toString())
            );
            const productRevenue = productOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
            const faqCount = (p.ai_generated_faqs || []).filter((f) => f.approved).length;
            return {
                productId: p._id,
                title: p.title,
                image: p.images?.[0]?.url || p.images?.[0] || '',
                views: p.views || 0,
                orders: productOrders.length,
                revenue: productRevenue,
                faq_count: faqCount,
            };
        });

        // Revenue chart (daily aggregation)
        const revenueChart = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            const dateStr = date.toISOString().split('T')[0];
            const dayRevenue = periodOrders
                .filter((o) => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
                .reduce((sum, o) => sum + (o.total_amount || 0), 0);
            revenueChart.push({ date: dateStr, revenue: dayRevenue });
        }

        // Top products by views
        const topProducts = [...productsPerformance].sort((a, b) => b.views - a.views).slice(0, 3);

        return NextResponse.json({
            success: true,
            data: {
                analytics: {
                    overview: {
                        totalProducts: products.length,
                        publishedProducts,
                        totalViews,
                        totalOrders: periodOrders.length,
                        totalRevenue,
                        avgRating: artisan.rating || 0,
                    },
                    period_stats: {
                        orders: periodOrders.length,
                        revenue: periodOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
                        period,
                    },
                    products_performance: productsPerformance,
                    revenue_chart: revenueChart,
                    top_products: topProducts,
                },
            },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
