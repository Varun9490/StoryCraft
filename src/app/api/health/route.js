import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export async function GET() {
    try {
        await connectDB();
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        return NextResponse.json({
            status: 'ok',
            db: dbStatus,
            project: 'StoryCraft',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            db: 'disconnected',
            project: 'StoryCraft',
            version: '2.0.0',
            error: error.message,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
