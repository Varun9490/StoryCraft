import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, avatar, currentPassword, newPassword } = body;

        const user = await User.findById(decoded.userId).select('+password');
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Update basic fields
        if (name && typeof name === 'string') {
            const trimmed = name.trim();
            if (trimmed.length < 2 || trimmed.length > 80) {
                return NextResponse.json({ success: false, error: 'Name must be 2-80 characters' }, { status: 400 });
            }
            user.name = trimmed;
        }

        if (phone !== undefined && typeof phone === 'string') {
            user.phone = phone.trim().slice(0, 15);
        }

        if (avatar && typeof avatar === 'string') {
            // Basic URL check
            if (avatar.startsWith('http') || avatar === '') {
                user.avatar = avatar;
            }
        }

        // Password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ success: false, error: 'Current password required' }, { status: 400 });
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
            }

            if (newPassword.length < 8) {
                return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 });
            }

            user.password = newPassword; // pre-save hook will hash it
        }

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(decoded.userId)
            .populate('artisanProfile')
            .select('-password');

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: updatedUser },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
    }
}
