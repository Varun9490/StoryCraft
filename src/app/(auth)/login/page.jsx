'use client';

import { Suspense } from 'react';
import StepperAuth from '@/components/auth/StepperAuth';

function LoginContent() {
    return (
        <div>
            <div className="text-center mb-8">
                <a href="/" className="inline-block mb-6">
                    <span
                        className="text-3xl font-bold italic"
                        style={{ fontFamily: 'var(--font-playfair)', color: '#C4622D' }}
                    >
                        StoryCraft
                    </span>
                </a>
                <h1
                    className="text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Welcome Back
                </h1>
                <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                    Sign in to continue your craft journey
                </p>
            </div>
            <StepperAuth mode="login" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
