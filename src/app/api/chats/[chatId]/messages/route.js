import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import { verifyJWT } from '@/lib/auth';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

// POST — REST fallback for sending a message
export async function POST(request, { params }) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();
        const { chatId } = await params;

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const chat = await Chat.findById(chatId);
        if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });

        const isParticipant = chat.participants.some(
            (p) => p.toString() === decoded.userId
        );
        if (!isParticipant) {
            return NextResponse.json({ success: false, error: 'Not a participant' }, { status: 403 });
        }

        
        const { content, messageType = 'text', imageUrl = '' } = body;

        if (!content && !imageUrl) {
            return NextResponse.json({ success: false, error: 'Content or image required' }, { status: 400 });
        }

        const newMessage = {
            sender: decoded.userId,
            content: content || '',
            message_type: messageType,
            image_url: imageUrl,
            read: false,
            createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        chat.last_message = content || '[Image]';
        chat.last_message_at = new Date();
        await chat.save();

        const savedMessage = chat.messages[chat.messages.length - 1];

        // Emit via Socket.io if available
        try {
            const { getIO } = await import('@/lib/socket-server');
            const io = getIO();
            io.to(chatId).emit('new_message', { message: savedMessage, chatId });
        } catch (e) { /* Socket may not be ready */ }

        return NextResponse.json({
            success: true,
            data: { message: savedMessage },
        });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
}
