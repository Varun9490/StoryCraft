import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Artisan from '@/models/Artisan';
import Product from '@/models/Product';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { artisanId } = await params;

        if (!mongoose.Types.ObjectId.isValid(artisanId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid artisan ID' },
                { status: 400 }
            );
        }

        const artisan = await Artisan.findById(artisanId)
            .populate('user', 'name avatar createdAt')
            .lean();

        if (!artisan) {
            return NextResponse.json(
                { success: false, error: 'Artisan not found' },
                { status: 404 }
            );
        }

        const products = await Product.find({
            artisan: artisanId,
            is_published: true,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: { artisan, products },
        });
    } catch (error) {
        console.error('Artisan detail error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch artisan' },
            { status: 500 }
        );
    }
}
