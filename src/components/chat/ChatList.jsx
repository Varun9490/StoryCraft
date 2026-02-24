'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatListItem from './ChatListItem';
import Link from 'next/link';

export default function ChatList({ currentUserId }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch('/api/chats');
                const data = await res.json();
                if (data.success) setChats(data.data.chats);
            } catch (err) {
                console.error('Failed to load chats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="text-4xl opacity-20 block mb-4">💬</span>
                <p className="text-sm text-white/40 mb-3">No conversations yet</p>
                <p className="text-xs text-white/25 mb-5">Browse crafts and start a customization request</p>
                <Link
                    href="/shop"
                    className="text-sm px-5 py-2 rounded-xl text-white hover:brightness-110 transition-all inline-block"
                    style={{ background: '#C4622D' }}
                >
                    Browse Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            {chats.map((chat, i) => (
                <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ChatListItem chat={chat} currentUserId={currentUserId} />
                </motion.div>
            ))}
        </div>
    );
}
