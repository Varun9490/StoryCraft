'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const ChatPopout = dynamic(() => import('@/components/chat/ChatPopout'), { ssr: false });
const GlobalChatbot = dynamic(() => import('@/components/chat/GlobalChatbot'), { ssr: false });
const SmoothCursor = dynamic(
    () => import('@/registry/magicui/smooth-cursor').then(mod => ({ default: mod.SmoothCursor })),
    { ssr: false }
);
const InstallPrompt = dynamic(() => import('@/components/pwa/InstallPrompt'), { ssr: false });

export default function ClientProviders() {
    const pathname = usePathname();
    const isStory = pathname?.startsWith('/story/');

    return (
        <>
            {!isStory && <ChatPopout />}
            {!isStory && <GlobalChatbot />}
            {!isStory && <SmoothCursor />}
            <InstallPrompt />
        </>
    );
}
