import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import Artisan from '@/models/Artisan';
import { verifyJWT } from '@/lib/auth';
import { apiLimiter } from '@/lib/rate-limit';
import { sanitizeBody } from '@/lib/sanitize';

// GET — list user's chats
export async function GET(request) {
    try {
        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const chats = await Chat.find({ participants: decoded.userId })
            .populate('participants', 'name avatar role')
            .populate('product', 'title images price is_customizable')
            .sort({ last_message_at: -1 })
            .lean();

        return NextResponse.json({ success: true, data: { chats } });
    } catch (error) {
        console.error('Get chats error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch chats' }, { status: 500 });
    }
}

// POST — create or get existing chat
export async function POST(request) {
    try {
        const limit = apiLimiter(request);
        if (!limit.allowed) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const rawBody = await request.json();
        const body = sanitizeBody(rawBody);

        await connectDB();

        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        const decoded = verifyJWT(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });


        const { artisanId, productId, initialMessage, messageType, referenceImageUrl, customizationDescription } = body;

        if (!artisanId || !productId) {
            return NextResponse.json({ success: false, error: 'artisanId and productId required' }, { status: 400 });
        }

        // Find artisan's user ID
        const artisan = await Artisan.findById(artisanId).populate('user', '_id name');
        if (!artisan) return NextResponse.json({ success: false, error: 'Artisan not found' }, { status: 404 });

        const artisanUserId = artisan.user._id.toString();
        const buyerUserId = decoded.userId;

        // De-duplicate: check for existing chat 
        let chat = await Chat.findOne({
            participants: { $all: [buyerUserId, artisanUserId] },
        });

        if (chat) {
            if (initialMessage) {
                chat.messages.push({
                    sender: buyerUserId,
                    content: initialMessage,
                    message_type: messageType || 'text',
                    image_url: referenceImageUrl || '',
                    read: false,
                    createdAt: new Date(),
                });
                chat.last_message = initialMessage;
                chat.last_message_at = new Date();

                if (messageType === 'customization_request') {
                    chat.customization_status = 'requested';
                    if (referenceImageUrl) chat.customization_reference_image = referenceImageUrl;
                    if (customizationDescription) chat.customization_description = customizationDescription;
                }

                chat.product = productId; // update to the active product they are looking at
                await chat.save();
            }

            const populatedExisting = await Chat.findById(chat._id)
                .populate('participants', 'name avatar role')
                .populate('product', 'title images price is_customizable');

            return NextResponse.json({ success: true, data: { chat: populatedExisting } }, { status: 200 });
        }

        // Create new chat
        const newChat = new Chat({
            participants: [buyerUserId, artisanUserId],
            product: productId,
            messages: [],
            customization_status: messageType === 'customization_request' ? 'requested' : 'none',
            customization_reference_image: referenceImageUrl || '',
            customization_description: customizationDescription || '',
        });

        if (initialMessage) {
            newChat.messages.push({
                sender: buyerUserId,
                content: initialMessage,
                message_type: messageType || 'text',
                image_url: referenceImageUrl || '',
                read: false,
                createdAt: new Date(),
            });
            newChat.last_message = initialMessage;
            newChat.last_message_at = new Date();
        }

        await newChat.save();

        // Populate for response
        const populated = await Chat.findById(newChat._id)
            .populate('participants', 'name avatar role')
            .populate('product', 'title images price is_customizable');

        // Notify artisan via Socket.io
        try {
            const { getIO } = await import('@/lib/socket-server');
            const io = getIO();
            io.to(artisanUserId).emit('new_chat', { chat: populated, productId });
        } catch (e) { /* Socket may not be ready */ }

        return NextResponse.json({ success: true, data: { chat: populated } }, { status: 201 });
    } catch (error) {
        console.error('Create chat error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create chat' }, { status: 500 });
    }
}
