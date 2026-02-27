'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ImageUploadZone({ images = [], onChange, maxImages = 6 }) {
    const [uploading, setUploading] = useState({});
    const fileInputRef = useRef(null);

    const handleFiles = useCallback(
        async (files) => {
            const fileArray = Array.from(files);
            const remaining = maxImages - images.length;

            if (fileArray.length > remaining) {
                toast.error(`You can only add ${remaining} more image(s)`);
                return;
            }

            let currentImages = [...images];

            for (const file of fileArray) {
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image`);
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} exceeds 5MB`);
                    continue;
                }

                const tempId = `temp_${Date.now()}_${Math.random()}`;
                setUploading((prev) => ({ ...prev, [tempId]: { progress: 0, name: file.name } }));

                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    // Simulate progress
                    const progressInterval = setInterval(() => {
                        setUploading((prev) => {
                            if (!prev[tempId]) return prev;
                            return {
                                ...prev,
                                [tempId]: { ...prev[tempId], progress: Math.min(prev[tempId].progress + 15, 90) },
                            };
                        });
                    }, 200);

                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                    clearInterval(progressInterval);

                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Upload failed');
                    }

                    const data = await res.json();
                    setUploading((prev) => {
                        const next = { ...prev };
                        delete next[tempId];
                        return next;
                    });

                    currentImages = [...currentImages, { url: data.data.url, public_id: data.data.public_id }];
                    onChange(currentImages);
                } catch (err) {
                    setUploading((prev) => {
                        const next = { ...prev };
                        delete next[tempId];
                        return next;
                    });
                    toast.error(err.message || 'Upload failed');
                }
            }
        },
        [images, maxImages, onChange]
    );

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
    };

    const removeImage = (idx) => {
        onChange(images.filter((_, i) => i !== idx));
    };

    const makeCover = (idx) => {
        if (idx === 0) return;
        const newImages = [...images];
        const [movedImage] = newImages.splice(idx, 1);
        newImages.unshift(movedImage);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center cursor-none hover:border-[#C4622D]/40 transition-colors group"
            >
                <div className="text-4xl mb-3 opacity-30 group-hover:opacity-50 transition-opacity">📸</div>
                <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                    Drag & drop images here, or click to browse
                </p>
                <p className="text-xs text-white/20 mt-1">
                    JPG, PNG, WebP • Max 5MB each • Up to {maxImages} images
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* Upload progress */}
            {Object.entries(uploading).map(([id, info]) => (
                <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-lg">⬆️</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60 truncate">{info.name}</p>
                        <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: '#C4622D' }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: info.progress / 100 }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-[#1A1209] border border-white/10">
                            <Image src={img.url} alt={`Upload ${idx + 1}`} fill className="object-cover" sizes="120px" />
                            {idx === 0 && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C4622D] text-white">
                                    Cover
                                </span>
                            )}
                            {idx !== 0 && (
                                <button
                                    onClick={() => makeCover(idx)}
                                    className="absolute bottom-1 left-1 right-1 py-1 rounded bg-black/60 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Set as Cover
                                </button>
                            )}
                            <button
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white/70 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
