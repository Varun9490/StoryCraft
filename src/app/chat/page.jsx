'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ChatList from '@/components/chat/ChatList';

export default function ChatPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading]);

    if (loading || !user) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-8" />
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto px-4 py-12"
        >
            <h1
                className="text-2xl font-bold text-white/90 mb-8"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                Your Conversations
            </h1>

            <ChatList currentUserId={user._id} />
        </motion.div>
    );
}
