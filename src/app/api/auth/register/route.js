import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { signJWT, setAuthCookie, signRefreshToken, setRefreshCookie } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';
import User from '@/models/User';
import Artisan from '@/models/Artisan';

export async function POST(req) {
    try {
        await connectDB();

        const limit = authLimiter(req);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await req.json();
        const body = sanitizeBody(rawBody);

        const { name, email, password, phone, role, craft_specialty, years_of_experience, city } = body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { success: false, error: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Please enter a valid email' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['buyer', 'artisan'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Artisan must have craft_specialty
        if (role === 'artisan' && !craft_specialty) {
            return NextResponse.json(
                { success: false, error: 'Craft specialty is required for artisans' },
                { status: 400 }
            );
        }

        // Check for existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            phone: phone || '',
            role,
        });
        await user.save();

        // If artisan, create artisan profile
        if (role === 'artisan') {
            const artisan = new Artisan({
                user: user._id,
                craft_specialty,
                city: city || 'Visakhapatnam',
                years_of_experience: years_of_experience || 0,
            });
            await artisan.save();
            user.artisanProfile = artisan._id;
            await user.save();
        }

        // Sign JWT
        const token = signJWT({ userId: user._id.toString(), role: user.role });
        const refreshToken = signRefreshToken({ userId: user._id.toString() });

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            artisanProfile: user.artisanProfile,
        };

        const response = NextResponse.json(
            { success: true, data: { user: safeUser }, message: 'Welcome to StoryCraft!' },
            { status: 201 }
        );

        setAuthCookie(response, token);
        setRefreshCookie(response, refreshToken);
        return response;
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
