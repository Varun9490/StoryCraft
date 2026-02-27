'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem('pwa_dismissed');
        if (dismissed) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShow(true), 5000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const install = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShow(false);
    };

    const dismiss = () => {
        setShow(false);
        sessionStorage.setItem('pwa_dismissed', '1');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm"
                >
                    <div
                        className="rounded-2xl p-4 flex items-center gap-4 border border-white/10"
                        style={{
                            background: 'linear-gradient(135deg, rgba(10,8,5,0.95), rgba(20,15,10,0.95))',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(196,98,45,0.15)' }}>
                            <span className="text-xl">🏺</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white/90">Install StoryCraft</p>
                            <p className="text-[10px] text-white/35">Access artisan crafts offline</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={dismiss} className="text-xs text-white/30 hover:text-white/50 px-2 py-1">
                                Later
                            </button>
                            <button
                                onClick={install}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                style={{ background: '#C4622D' }}
                            >
                                Install
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
