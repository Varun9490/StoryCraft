import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CustomizationModal({ isOpen, onClose, onSubmit }) {
    const [choice, setChoice] = useState(null); // 'color' | 'photo'
    const [colorText, setColorText] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Only images are allowed');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                toast.success('Photo uploaded successfully!');
                onSubmit({ type: 'photo', url: data.data.url });
            } else {
                toast.error(data.error || 'Failed to upload photo');
            }
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleColorSubmit = (e) => {
        e.preventDefault();
        if (!colorText.trim()) return;
        onSubmit({ type: 'color', text: colorText.trim() });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 transition-colors"
                >
                    ✕
                </button>

                <div className="p-6">
                    <h3 className="text-xl font-bold text-white/90 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Request Customization
                    </h3>
                    <p className="text-sm text-white/50 mb-6">
                        How would you like to customize this product?
                    </p>

                    {!choice ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => setChoice('color')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left"
                            >
                                <span className="text-2xl">🎨</span>
                                <div>
                                    <p className="font-medium text-white/90 text-sm">Change Color</p>
                                    <p className="text-xs text-white/40 mt-1">Request a different color or shade</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setChoice('photo')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left"
                            >
                                <span className="text-2xl">📸</span>
                                <div>
                                    <p className="font-medium text-white/90 text-sm">Upload Reference Photo</p>
                                    <p className="text-xs text-white/40 mt-1">Show the artisan exactly what you want</p>
                                </div>
                            </button>
                        </div>
                    ) : choice === 'color' ? (
                        <form onSubmit={handleColorSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-white/50 mb-2 block">What color would you like?</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={colorText}
                                    onChange={(e) => setColorText(e.target.value)}
                                    placeholder="e.g., Deep Navy Blue, Bright Crimson..."
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:border-[#C4622D] outline-none transition-colors"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setChoice(null)}
                                    className="flex-1 py-3 text-xs font-semibold rounded-xl border border-white/10 text-white/60 hover:bg-white/5"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={!colorText.trim()}
                                    className="flex-1 py-3 text-xs font-semibold rounded-xl bg-[#C4622D] text-white disabled:opacity-50"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/[0.02]">
                                <span className="text-4xl opacity-30 mb-3 block">🖼️</span>
                                <p className="text-sm text-white/60 mb-4">Choose an image from your device</p>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="px-6 py-2.5 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Browse Files'}
                                </button>
                            </div>
                            <button
                                onClick={() => setChoice(null)}
                                className="w-full py-3 text-xs font-semibold rounded-xl border border-white/10 text-white/60 hover:bg-white/5"
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
