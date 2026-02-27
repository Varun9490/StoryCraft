'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;
let connectionPromise = null;

function getSocket() {
    if (!socketInstance) {
        socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        connectionPromise = new Promise((resolve) => {
            if (socketInstance.connected) {
                resolve(socketInstance);
            } else {
                socketInstance.once('connect', () => resolve(socketInstance));
            }
        });
    }
    return socketInstance;
}

export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const listenersRef = useRef([]);

    useEffect(() => {
        const socket = getSocket();
        socketRef.current = socket;

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            // Clean up any listeners registered through this hook instance
            listenersRef.current.forEach(({ event, handler }) => {
                socket.off(event, handler);
            });
            listenersRef.current = [];
        };
    }, []);

    const joinChat = useCallback((chatId, userId) => {
        const socket = socketRef.current || getSocket();
        socket.emit('join_chat', { chatId, userId });
    }, []);

    const leaveChat = useCallback((chatId) => {
        const socket = socketRef.current || getSocket();
        socket.emit('leave_chat', { chatId });
    }, []);

    const sendMessage = useCallback((payload) => {
        const socket = socketRef.current || getSocket();
        socket.emit('send_message', payload);
    }, []);

    const onNewMessage = useCallback((handler) => {
        const socket = socketRef.current || getSocket();
        socket.on('new_message', handler);
        listenersRef.current.push({ event: 'new_message', handler });
        return () => {
            socket.off('new_message', handler);
            listenersRef.current = listenersRef.current.filter(l => l.handler !== handler);
        };
    }, []);

    const onEvent = useCallback((event, handler) => {
        const socket = socketRef.current || getSocket();
        socket.on(event, handler);
        listenersRef.current.push({ event, handler });
        return () => {
            socket.off(event, handler);
            listenersRef.current = listenersRef.current.filter(l => l.handler !== handler);
        };
    }, []);

    const emitTypingStart = useCallback((chatId, userId) => {
        const socket = socketRef.current || getSocket();
        socket.emit('typing_start', { chatId, userId });
    }, []);

    const emitTypingStop = useCallback((chatId, userId) => {
        const socket = socketRef.current || getSocket();
        socket.emit('typing_stop', { chatId, userId });
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        joinChat,
        leaveChat,
        sendMessage,
        onNewMessage,
        onEvent,
        emitTypingStart,
        emitTypingStop,
    };
}
