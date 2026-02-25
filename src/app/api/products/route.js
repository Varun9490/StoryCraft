import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

// GET — list products with filters (public)
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const category = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'newest';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '12', 10);
        const artisanFilter = searchParams.get('artisan');

        // Build query
        const query = {};

        // If artisan=me, fetch the caller's own products (including drafts)
        if (artisanFilter === 'me') {
            const token = request.cookies.get('auth_token')?.value;
            if (token) {
                const decoded = verifyJWT(token);
                if (decoded && decoded.role === 'artisan') {
                    const artisan = await Artisan.findOne({ user: decoded.userId });
                    if (artisan) {
                        query.artisan = artisan._id;
                    }
                }
            }
        } else {
            // Public listing — only published
            query.is_published = true;
        }

        if (city && ['Visakhapatnam', 'Hyderabad'].includes(city)) {
            query.city = city;
        }
        if (category) {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { description: regex },
                { tags: regex },
            ];
        }

        // Sort
        const sortMap = {
            newest: { createdAt: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            views: { views: -1 },
        };
        const sortObj = sortMap[sort] || sortMap.newest;

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('artisan', 'user craft_specialty city rating profile_image')
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        // Populate artisan's user name for each product
        await Product.populate(products, {
            path: 'artisan.user',
            select: 'name avatar',
        });

        return NextResponse.json({
            success: true,
            data: {
                products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Products list error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST — create product (artisan only)
export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }
        if (decoded.role !== 'artisan') {
            return NextResponse.json(
                { success: false, error: 'Only artisans can create products' },
                { status: 403 }
            );
        }

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!artisan) {
            return NextResponse.json(
                { success: false, error: 'Artisan profile not found' },
                { status: 404 }
            );
        }

        const {
            title, description, category, price, images,
            city, stock, is_customizable, tags,
            material, craft_technique, suggested_price_range,
        } = body;

        // Validate required fields
        if (!title || !description || !category || !price || !images || images.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (price <= 0) {
            return NextResponse.json(
                { success: false, error: 'Price must be greater than 0' },
                { status: 400 }
            );
        }

        const validCategories = ['toys', 'textiles', 'pottery', 'jewelry', 'metalwork', 'woodwork', 'paintings', 'shell_craft', 'other'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { success: false, error: 'Invalid category' },
                { status: 400 }
            );
        }

        const product = new Product({
            artisan: artisan._id,
            title,
            description,
            category,
            price,
            images,
            city: city || 'Visakhapatnam',
            stock: stock || 1,
            is_customizable: is_customizable || false,
            is_published: false,
            tags: tags || [],
            material: material || '',
            craft_technique: craft_technique || '',
            suggested_price_range: suggested_price_range || {},
        });

        await product.save();

        return NextResponse.json(
            {
                success: true,
                data: { product },
                message: 'Product created successfully. Publish it when ready.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Product create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
