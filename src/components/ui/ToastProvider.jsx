'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
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
    );
}
