'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket() {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!socketInstance) {
            socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
                withCredentials: true,
                transports: ['websocket', 'polling'],
            });
        }
        socketRef.current = socketInstance;

        return () => {
            // Singleton — do NOT disconnect on unmount
        };
    }, []);

    const joinChat = useCallback((chatId, userId) => {
        socketRef.current?.emit('join_chat', { chatId, userId });
    }, []);

    const leaveChat = useCallback((chatId) => {
        socketRef.current?.emit('leave_chat', { chatId });
    }, []);

    const sendMessage = useCallback((payload) => {
        socketRef.current?.emit('send_message', payload);
    }, []);

    const onNewMessage = useCallback((handler) => {
        socketRef.current?.on('new_message', handler);
        return () => socketRef.current?.off('new_message', handler);
    }, []);

    const onEvent = useCallback((event, handler) => {
        socketRef.current?.on(event, handler);
        return () => socketRef.current?.off(event, handler);
    }, []);

    const emitTypingStart = useCallback((chatId, userId) => {
        socketRef.current?.emit('typing_start', { chatId, userId });
    }, []);

    const emitTypingStop = useCallback((chatId, userId) => {
        socketRef.current?.emit('typing_stop', { chatId, userId });
    }, []);

    return {
        socket: socketRef.current,
        joinChat,
        leaveChat,
        sendMessage,
        onNewMessage,
        onEvent,
        emitTypingStart,
        emitTypingStop,
    };
}
