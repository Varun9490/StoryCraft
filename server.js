import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    // Dynamic import for ES module compat with src/lib paths
    const { connectDB } = await import('./src/lib/db.js');
    const ChatModule = await import('./src/models/Chat.js');
    const Chat = ChatModule.default;

    await connectDB();

    const httpServer = createServer(async (req, res) => {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    // Survive Next.js hot-reload in dev
    global._io = io;

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        // Join a chat room
        socket.on('join_chat', ({ chatId, userId }) => {
            socket.join(chatId);
            socket.data.userId = userId;
            socket.data.chatId = chatId;
            // Also join personal room for targeted events
            if (userId) socket.join(userId);
        });

        socket.on('leave_chat', ({ chatId }) => {
            socket.leave(chatId);
        });

        // Send a text message
        socket.on('send_message', async ({ chatId, senderId, content, messageType = 'text', imageUrl = null }) => {
            try {
                await connectDB();
                const chat = await Chat.findById(chatId);
                if (!chat) return;
                if (!chat.participants.map((p) => p.toString()).includes(senderId)) return;

                const newMessage = {
                    sender: senderId,
                    content,
                    message_type: messageType,
                    image_url: imageUrl || '',
                    read: false,
                    createdAt: new Date(),
                };

                chat.messages.push(newMessage);
                chat.last_message = content || '[Image]';
                chat.last_message_at = new Date();
                await chat.save();

                const savedMessage = chat.messages[chat.messages.length - 1];
                io.to(chatId).emit('new_message', { message: savedMessage, chatId });
            } catch (err) {
                console.error('Socket send_message error:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Artisan starts generating customization preview
        socket.on('preview_generating', ({ chatId }) => {
            io.to(chatId).emit('preview_generating', { chatId });
        });

        // Artisan approves generated preview and sends to buyer
        socket.on('preview_approved', ({ chatId, imageUrl, message }) => {
            io.to(chatId).emit('preview_approved', { chatId, imageUrl, message });
        });

        // Typing indicators
        socket.on('typing_start', ({ chatId, userId }) => {
            socket.to(chatId).emit('typing_start', { userId });
        });
        socket.on('typing_stop', ({ chatId, userId }) => {
            socket.to(chatId).emit('typing_stop', { userId });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> StoryCraft ready on http://${hostname}:${port}`);
    });
});
