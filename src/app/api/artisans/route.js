import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Artisan from '@/models/Artisan';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const craft_specialty = searchParams.get('craft_specialty');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '12', 10);

        const query = {};
        if (city && ['Visakhapatnam', 'Hyderabad'].includes(city)) {
            query.city = city;
        }
        if (craft_specialty) {
            query.craft_specialty = new RegExp(craft_specialty, 'i');
        }

        const skip = (page - 1) * limit;

        const [artisans, total] = await Promise.all([
            Artisan.find(query)
                .populate('user', 'name avatar')
                .sort({ rating: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Artisan.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                artisans,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Artisans list error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch artisans' },
            { status: 500 }
        );
    }
}
