'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const LAYOUTS = [
    { value: 'text-left', label: 'Text Left' },
    { value: 'text-right', label: 'Text Right' },
    { value: 'full-image', label: 'Full Image' },
    { value: 'centered', label: 'Centered' },
];

export default function StoryEditorPage({ params }) {
    const { productId } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [panels, setPanels] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data.product);
                    setPanels(data.data.product.story_panels || []);
                }
            } catch { }
            setLoading(false);
        };
        if (productId) load();
    }, [productId]);

    const addPanel = () => {
        setPanels(prev => [...prev, { heading: '', body: '', image_url: '', layout: 'text-left', order: prev.length }]);
    };

    const updatePanel = (idx, field, value) => {
        setPanels(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    };

    const removePanel = (idx) => {
        setPanels(prev => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, order: i })));
    };

    const movePanel = (idx, dir) => {
        const newPanels = [...panels];
        const target = idx + dir;
        if (target < 0 || target >= newPanels.length) return;
        [newPanels[idx], newPanels[target]] = [newPanels[target], newPanels[idx]];
        setPanels(newPanels.map((p, i) => ({ ...p, order: i })));
    };

    const handleImageUpload = async (idx, file) => {
        if (!file) return;
        const toastId = toast.loading('Uploading image...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                updatePanel(idx, 'image_url', data.data.url);
                toast.success('Image uploaded', { id: toastId });
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            toast.error(err.message || 'Upload failed', { id: toastId });
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ story_panels: panels }),
            });
            const data = await res.json();
            if (data.success) toast.success('Story saved');
            else throw new Error(data.error);
        } catch (err) {
            toast.error(err.message || 'Save failed');
        }
        setSaving(false);
    };

    if (authLoading || loading) {
        return (
            <main className="min-h-screen bg-[#050505]">
                <div className="pt-24 max-w-4xl mx-auto px-6">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl" />)}
                    </div>
                </div>
            </main>
        );
    }

    if (!user || user.role !== 'artisan') {
        router.push('/login');
        return null;
    }

    return (
        <main className="min-h-screen bg-[#050505]">
            <div className="pt-24 pb-16 max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Story Builder
                        </h1>
                        <p className="text-sm text-white/40 mt-1">{product?.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href={`/story/${productId}`}
                            target="_blank"
                            className="px-4 py-2 rounded-xl text-xs font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-colors"
                        >
                            Preview Story
                        </a>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="px-6 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:brightness-110"
                            style={{ background: '#C4622D' }}
                        >
                            {saving ? 'Saving...' : 'Save Story'}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {panels.map((panel, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/30 font-mono">Panel {idx + 1}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => movePanel(idx, -1)} disabled={idx === 0} className="w-7 h-7 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 flex items-center justify-center text-xs disabled:opacity-30">↑</button>
                                    <button onClick={() => movePanel(idx, 1)} disabled={idx === panels.length - 1} className="w-7 h-7 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 flex items-center justify-center text-xs disabled:opacity-30">↓</button>
                                    <button onClick={() => removePanel(idx)} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400/60 hover:bg-red-500/20 flex items-center justify-center text-xs">✕</button>
                                </div>
                            </div>

                            <input
                                value={panel.heading}
                                onChange={e => updatePanel(idx, 'heading', e.target.value)}
                                placeholder="Panel heading..."
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40"
                            />

                            <textarea
                                value={panel.body}
                                onChange={e => updatePanel(idx, 'body', e.target.value)}
                                placeholder="Tell the story of this craft..."
                                rows={4}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 resize-none"
                            />

                            <div className="space-y-3">
                                <div className="flex gap-3 items-center">
                                    <input
                                        value={panel.image_url}
                                        onChange={e => updatePanel(idx, 'image_url', e.target.value)}
                                        placeholder="Image URL or upload →"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40"
                                    />
                                    <label className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 flex-shrink-0" style={{ background: '#C4622D' }}>
                                        📷 Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => handleImageUpload(idx, e.target.files?.[0])}
                                        />
                                    </label>
                                </div>

                                <select
                                    value={panel.layout}
                                    onChange={e => updatePanel(idx, 'layout', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-[#C4622D]/40"
                                >
                                    {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                            </div>

                            {panel.image_url ? (
                                <div className="rounded-xl overflow-hidden border border-white/5 h-40 relative group">
                                    <img src={panel.image_url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => updatePanel(idx, 'image_url', '')}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white/50 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 h-32 hover:border-[#C4622D]/30 transition-colors">
                                    <span className="text-white/20 text-2xl mb-2">📷</span>
                                    <span className="text-white/20 text-xs">Click to upload or paste URL above</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => handleImageUpload(idx, e.target.files?.[0])}
                                    />
                                </label>
                            )}
                        </motion.div>
                    ))}
                </div>

                <button
                    onClick={addPanel}
                    className="mt-6 w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:border-[#C4622D]/30 hover:text-white/50 transition-all text-sm font-medium"
                >
                    + Add Story Panel
                </button>
            </div>
        </main>
    );
}
