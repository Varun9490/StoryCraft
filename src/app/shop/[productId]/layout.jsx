import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function generateMetadata({ params }) {
    try {
        await connectDB();
        const { productId } = await params;
        const product = await Product.findById(productId)
            .select('title description images category city price artisan')
            .populate({ path: 'artisan', populate: { path: 'user', select: 'name' } })
            .lean();

        if (!product) {
            return { title: 'Product Not Found — StoryCraft' };
        }

        const imageUrl = product.images?.[0]?.url || product.images?.[0] || '';
        const artisanName = product.artisan?.user?.name || 'Artisan';
        const description = (product.description || '').slice(0, 160);

        return {
            title: `${product.title} by ${artisanName} — StoryCraft`,
            description,
            keywords: [
                product.category?.replace('_', ' '),
                product.city,
                'handmade',
                'artisan',
                'Indian crafts',
                product.title,
            ].filter(Boolean).join(', '),
            openGraph: {
                title: `${product.title} — ₹${product.price?.toLocaleString('en-IN')}`,
                description,
                images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: product.title }] : [],
                type: 'website',
                siteName: 'StoryCraft',
            },
            twitter: {
                card: 'summary_large_image',
                title: product.title,
                description,
                images: imageUrl ? [imageUrl] : [],
            },
        };
    } catch {
        return { title: 'StoryCraft' };
    }
}

export default function ProductLayout({ children }) {
    return children;
}
