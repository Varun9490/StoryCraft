import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
    try {
        // 1. Verify auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyJWT(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || file.size === 0) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // 3. Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // 4. Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // 5. Upload to Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await uploadToCloudinary(buffer, {
            folder: 'storycraft/products',
            transformation: [
                { width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
        });

        return NextResponse.json({
            success: true,
            data: { url: result.url, public_id: result.public_id },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}
