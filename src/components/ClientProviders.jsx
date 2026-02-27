'use client';

import dynamic from 'next/dynamic';

const ChatPopout = dynamic(() => import('@/components/chat/ChatPopout'), { ssr: false });
const GlobalChatbot = dynamic(() => import('@/components/chat/GlobalChatbot'), { ssr: false });
const SmoothCursor = dynamic(
    () => import('@/registry/magicui/smooth-cursor').then(mod => ({ default: mod.SmoothCursor })),
    { ssr: false }
);

export default function ClientProviders() {
    return (
        <>
            <ChatPopout />
            <GlobalChatbot />
            <SmoothCursor />
        </>
    );
}
