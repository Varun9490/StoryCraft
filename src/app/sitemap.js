import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';

export default async function sitemap() {
    await connectDB();
    const products = await Product.find({ is_published: true }).select('_id updatedAt').lean();
    const artisans = await Artisan.find().select('_id updatedAt').lean();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';

    const staticRoutes = ['/', '/shop', '/artisans', '/chat'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '/' ? 1 : 0.8,
    }));

    const productRoutes = products.map((p) => ({
        url: `${baseUrl}/shop/${p._id}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const artisanRoutes = artisans.map((a) => ({
        url: `${baseUrl}/artisan/${a._id}`,
        lastModified: a.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...artisanRoutes];
}
