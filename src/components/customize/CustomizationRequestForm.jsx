'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomizationRequestForm({ chatId, productId, onSubmit }) {
    const [description, setDescription] = useState('');
    const [referenceImage, setReferenceImage] = useState(null);
    const [referenceUrl, setReferenceUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isValid = description.trim().length >= 20;

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setReferenceUrl(data.data.url);
                setReferenceImage(URL.createObjectURL(file));
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);
        try {
            await onSubmit({
                description: description.trim(),
                referenceImageUrl: referenceUrl || '',
            });
        } catch (err) {
            console.error('Submit failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#E8A838]/20 bg-[#E8A838]/5 p-6 space-y-5"
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎨</span>
                <h3 className="text-sm font-semibold text-white/80">Describe Your Customization</h3>
            </div>

            {/* Reference image upload */}
            <div>
                <label className="text-xs text-white/40 block mb-2">Reference Image (optional)</label>
                {referenceImage ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                        <button
                            onClick={() => { setReferenceImage(null); setReferenceUrl(''); }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <label className="flex items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-white/10 cursor-pointer hover:border-[#E8A838]/30 transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        {uploading ? (
                            <span className="w-5 h-5 border-2 border-white/20 border-t-[#E8A838] rounded-full animate-spin" />
                        ) : (
                            <span className="text-white/20 text-xs text-center">+ Upload<br />Reference</span>
                        )}
                    </label>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="text-xs text-white/40 block mb-2">
                    What changes would you like? <span className="text-white/20">({description.length}/500)</span>
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                    rows={4}
                    placeholder="e.g., Same toy but in blue with my name painted on it"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-[#E8A838] focus:outline-none resize-none transition-colors"
                />
                {description.length > 0 && description.length < 20 && (
                    <p className="text-[10px] text-amber-400 mt-1">Minimum 20 characters ({20 - description.length} more needed)</p>
                )}
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                style={{ background: isValid ? '#C4622D' : '#333' }}
            >
                {submitting ? 'Sending Request...' : 'Send Customization Request'}
            </button>
        </motion.div>
    );
}
