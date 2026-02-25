'use client';

import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function AuthLayout({ children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
            style={{ background: '#050505' }}
        >
            {/* Ambient background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-[120px]"
                    style={{ background: 'radial-gradient(circle, rgba(196,98,45,0.3) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-15 blur-[100px]"
                    style={{ background: 'radial-gradient(circle, rgba(232,168,56,0.25) 0%, transparent 70%)' }}
                />
            </div>

            {/* Starfield particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {mounted && Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                        }}
                        animate={{
                            opacity: [0.1, 0.6, 0.1],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-lg mx-4"
            >
                {children}
            </motion.div>

            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#EDE8E0',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontFamily: 'var(--font-inter)',
                        borderRadius: '12px',
                    },
                    success: {
                        iconTheme: { primary: '#52B788', secondary: '#1a1a1a' },
                    },
                    error: {
                        iconTheme: { primary: '#E55A4A', secondary: '#1a1a1a' },
                    },
                }}
            />
        </div>
    );
}
