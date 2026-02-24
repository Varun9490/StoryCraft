'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function VerifyStep({ user, mode = 'register' }) {
    const [countdown, setCountdown] = useState(3);
    const router = useRouter();

    const isLogin = mode === 'login';

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Redirect based on role
                    const role = user?.role || 'buyer';
                    router.push(
                        role === 'artisan' ? '/dashboard/artisan' : '/dashboard/buyer'
                    );
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [router, user]);

    return (
        <div className="text-center py-8">
            {/* Animated checkmark */}
            <div className="flex justify-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2,
                    }}
                >
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#52B788"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                        />
                        <motion.path
                            d="M20 32L28 40L44 24"
                            stroke="#52B788"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
                        />
                    </svg>
                </motion.div>
            </div>

            <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                {isLogin
                    ? `Welcome back, ${user?.name || 'friend'}!`
                    : `Welcome to StoryCraft, ${user?.name || 'friend'}!`}
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-sm text-white/40 mb-6"
                style={{ fontFamily: 'var(--font-inter)' }}
            >
                Taking you to your dashboard...
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="inline-flex items-center gap-2 text-xs text-white/30"
                style={{ fontFamily: 'var(--font-inter)' }}
            >
                <div className="w-4 h-4 border-2 border-white/20 border-t-[#C4622D] rounded-full animate-spin" />
                Redirecting in {countdown}s
            </motion.div>
        </div>
    );
}
