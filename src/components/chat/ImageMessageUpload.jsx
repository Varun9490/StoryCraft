'use client';

import { useState, useRef } from 'react';

export default function ImageMessageUpload({ onImageReady, disabled }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                onImageReady(data.data.url);
            }
        } catch (err) {
            console.error('Image upload failed:', err);
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSelect}
            />
            <button
                onClick={() => fileRef.current?.click()}
                disabled={disabled || uploading}
                className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30"
                title="Send image"
            >
                {uploading ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin block" />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                )}
            </button>
        </>
    );
}
