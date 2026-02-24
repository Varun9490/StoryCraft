'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StepperAuth from '@/components/auth/StepperAuth';

function RegisterContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

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
                    Join StoryCraft
                </h1>
                <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                    Begin your craft story today
                </p>
            </div>
            <StepperAuth mode="register" defaultRole={role} />
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
