import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import { verifyJWT } from '@/lib/auth';

// GET — single chat with paginated messages
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { chatId } = await params;

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const chat = await Chat.findById(chatId)
            .populate('participants', 'name avatar role')
            .populate('product', 'title images price is_customizable');

        if (!chat) return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });

        // Verify participant
        const isParticipant = chat.participants.some(
            (p) => p._id.toString() === decoded.userId
        );
        if (!isParticipant) {
            return NextResponse.json({ success: false, error: 'Not a participant in this chat' }, { status: 403 });
        }

        // Pagination
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '30');
        const totalMessages = chat.messages.length;
        const start = Math.max(0, totalMessages - page * limit);
        const end = totalMessages - (page - 1) * limit;
        const paginatedMessages = chat.messages.slice(start, end);

        return NextResponse.json({
            success: true,
            data: {
                chat: {
                    _id: chat._id,
                    participants: chat.participants,
                    product: chat.product,
                    customization_status: chat.customization_status,
                    customization_reference_image: chat.customization_reference_image,
                    customization_description: chat.customization_description,
                    messages: paginatedMessages,
                    last_message: chat.last_message,
                    last_message_at: chat.last_message_at,
                },
                hasMore: start > 0,
                totalMessages,
            },
        });
    } catch (error) {
        console.error('Get chat error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch chat' }, { status: 500 });
    }
}

// PATCH — update chat metadata (customization status, etc.)
export async function PATCH(request, { params }) {
    try {
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

        const body = await request.json();
        const { customization_status, customization_description, customization_reference_image } = body;

        if (customization_status) chat.customization_status = customization_status;
        if (customization_description) chat.customization_description = customization_description;
        if (customization_reference_image) chat.customization_reference_image = customization_reference_image;

        await chat.save();

        return NextResponse.json({ success: true, data: { chat } });
    } catch (error) {
        console.error('Patch chat error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update chat' }, { status: 500 });
    }
}
