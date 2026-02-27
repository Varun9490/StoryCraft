import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Product from '@/models/Product';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { getIO } from '@/lib/socket-server';
import { sanitizeBody } from '@/lib/sanitize';

export async function POST(request) {
    try {
        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded || decoded.role !== 'artisan') {
            return NextResponse.json({ success: false, error: 'Only artisans can approve previews' }, { status: 403 });
        }

        const { chatId, imageUrl } = body;

        if (!chatId || !imageUrl) {
            return NextResponse.json({ success: false, error: 'chatId and imageUrl are required' }, { status: 400 });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });

        const artisan = await Artisan.findOne({ user: decoded.userId });
        if (!chat.participants.map((p) => p.toString()).includes(decoded.userId)) {
            return NextResponse.json({ success: false, error: 'Not a participant' }, { status: 403 });
        }

        // Add the image to the product's images array
        if (chat.product) {
            const product = await Product.findById(chat.product);
            if (product) {
                product.images.push({ url: imageUrl, alt: 'Customization Preview' });
                await product.save();
            }
        }

        // Save as message in chat
        chat.messages.push({
            sender: decoded.userId,
            content: 'AI Customization Preview Generated & Approved',
            message_type: 'aipreview',
            image_url: imageUrl,
            read: false,
            createdAt: new Date(),
        });

        chat.customization_status = 'preview_generated';
        chat.last_message = 'AI Preview Generated';
        chat.last_message_at = new Date();
        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];

        // Emit to buyer via Socket.io
        try {
            const io = getIO();
            io.to(chatId).emit('preview_ready', {
                chatId,
                imageUrl: imageUrl,
                messageId: savedMessage._id,
            });
            io.to(chatId).emit('new_message', { message: savedMessage, chatId });
        } catch (socketErr) {
            console.warn('Socket emit failed (non-fatal):', socketErr.message);
        }

        return NextResponse.json({
            success: true,
            data: { message: savedMessage },
        });
    } catch (error) {
        console.error('Approve preview error:', error);
        return NextResponse.json(
            { success: false, error: 'Approval failed. Please try again.' },
            { status: 500 }
        );
    }
}
