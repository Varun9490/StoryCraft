import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { uploadLimiter } from '@/lib/rate-limit';
import path from 'path';

export async function POST(request) {
    try {
        const limit = uploadLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

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
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.type)) {
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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // MIME Magic Bytes Check
        const magicBytes = buffer.slice(0, 8);
        const isJPEG = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8;
        const isPNG = magicBytes[0] === 0x89 && magicBytes[1] === 0x50;
        const isWEBP = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';
        const isGIF = buffer.slice(0, 3).toString() === 'GIF';

        if (!isJPEG && !isPNG && !isWEBP && !isGIF) {
            return NextResponse.json(
                { success: false, error: 'File content does not match file type' },
                { status: 400 }
            );
        }

        // Sanitize filename
        const safeFilename = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_');

        // 5. Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, {
            folder: 'storycraft/products',
            public_id: safeFilename.split('.')[0] + '_' + Date.now(),
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
