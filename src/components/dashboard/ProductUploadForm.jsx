'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ImageUploadZone from './ImageUploadZone';
import FAQGeneratorTrigger from '@/components/ai/FAQGeneratorTrigger';
import FAQPreviewList from '@/components/ai/FAQPreviewList';
import PricingRecommender from '@/components/ai/PricingRecommender';
import ImageAnalysisTrigger from '@/components/ai/ImageAnalysisTrigger';
import { CATEGORIES } from '@/data/categories';

const STEPS = [
    { label: 'Basic Info', icon: '✏️' },
    { label: 'Images', icon: '📸' },
    { label: 'Pricing', icon: '💰' },
];

export default function ProductUploadForm({ existingProduct = null }) {
    const router = useRouter();
    const isEdit = !!existingProduct;
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        category: '',
        description: '',
        material: '',
        craft_technique: '',
        tags: [],
        is_customizable: false,
        city: 'Visakhapatnam',
        images: [],
        price: '',
        stock: 1,
        suggested_price_range: { min: '', max: '' },
        ai_generated_faqs: [],
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (existingProduct) {
            setForm({
                title: existingProduct.title || '',
                category: existingProduct.category || '',
                description: existingProduct.description || '',
                material: existingProduct.material || '',
                craft_technique: existingProduct.craft_technique || '',
                tags: existingProduct.tags || [],
                is_customizable: existingProduct.is_customizable || false,
                city: existingProduct.city || 'Visakhapatnam',
                images: existingProduct.images || [],
                price: existingProduct.price || '',
                stock: existingProduct.stock || 1,
                suggested_price_range: existingProduct.suggested_price_range || { min: '', max: '' },
                ai_generated_faqs: existingProduct.ai_generated_faqs || [],
            });
        } else {
            // Un-hydrated draft resuming
            const storedDraft = localStorage.getItem('storycraft_product_draft');
            if (storedDraft) {
                try {
                    setForm(JSON.parse(storedDraft));
                } catch (e) {
                    // Ignore parse error
                }
            }
        }
    }, [existingProduct]);

    useEffect(() => {
        if (!existingProduct) {
            // Autosave local draft continuously
            localStorage.setItem('storycraft_product_draft', JSON.stringify(form));
        }
    }, [form, existingProduct]);

    const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (form.tags.length >= 10) {
                toast.error('Max 10 tags');
                return;
            }
            if (!form.tags.includes(tagInput.trim())) {
                updateField('tags', [...form.tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (t) => updateField('tags', form.tags.filter((tag) => tag !== t));

    const canProceedStep0 = form.title && form.category && form.description;
    const canProceedStep1 = form.images.length >= 1;
    const canSubmit = form.price > 0 && form.images.length > 0;

    const handleSubmit = async (isPublishing = false) => {
        setLoading(true);
        try {
            const url = isEdit ? `/api/products/${existingProduct._id}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    stock: Number(form.stock),
                    suggested_price_range: {
                        min: form.suggested_price_range.min ? Number(form.suggested_price_range.min) : undefined,
                        max: form.suggested_price_range.max ? Number(form.suggested_price_range.max) : undefined,
                    },
                    is_published: isPublishing,
                    ai_generated_faqs: form.ai_generated_faqs,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            if (!existingProduct) {
                localStorage.removeItem('storycraft_product_draft');
            }

            toast.success(data.message || 'Product saved!');
            router.push('/dashboard/artisan');
        } catch (err) {
            toast.error(err.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <button
                            onClick={() => i < step && setStep(i)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${step === i
                                ? 'bg-[#C4622D] text-white font-semibold'
                                : i < step
                                    ? 'bg-white/10 text-white/60 cursor-pointer hover:bg-white/20'
                                    : 'bg-white/5 text-white/25 cursor-default'
                                }`}
                        >
                            <span>{s.icon}</span>
                            <span className="hidden sm:inline">{s.label}</span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`w-8 h-px ${i < step ? 'bg-[#C4622D]' : 'bg-white/10'}`} />
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Product Title *</label>
                            <input
                                value={form.title}
                                onChange={(e) => updateField('title', e.target.value.slice(0, 120))}
                                placeholder="What is this craft called?"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                            />
                            <p className="text-[10px] text-white/20 mt-1 text-right">{form.title.length}/120</p>
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Category *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => updateField('category', cat.id)}
                                        className={`px-3 py-2.5 rounded-xl text-sm border transition-all ${form.category === cat.id
                                            ? 'border-[#C4622D] bg-[#C4622D]/10 text-white/90'
                                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                                            }`}
                                    >
                                        {cat.icon} {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Description *</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value.slice(0, 2500))}
                                placeholder="Tell the story of how this piece is made..."
                                rows={5}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors resize-none"
                            />
                            <p className="text-[10px] text-white/20 mt-1 text-right">{form.description.length}/2500</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Material</label>
                                <input
                                    value={form.material}
                                    onChange={(e) => updateField('material', e.target.value)}
                                    placeholder="e.g., Ivory wood, lac dyes"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Craft Technique</label>
                                <input
                                    value={form.craft_technique}
                                    onChange={(e) => updateField('craft_technique', e.target.value)}
                                    placeholder="e.g., Lost-wax casting"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Tags (press Enter)</label>
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                placeholder="Add a tag..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                            />
                            {form.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {form.tags.map((t) => (
                                        <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/10 text-white/60">
                                            {t}
                                            <button onClick={() => removeTag(t)} className="text-white/30 hover:text-red-400">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-white/50">Customizable</span>
                                <button
                                    onClick={() => updateField('is_customizable', !form.is_customizable)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.is_customizable ? 'bg-[#C4622D]' : 'bg-white/15'}`}
                                >
                                    <motion.div
                                        animate={{ x: form.is_customizable ? 20 : 2 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                                    />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {['Visakhapatnam', 'Hyderabad'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => updateField('city', c)}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.city === c ? 'border-[#C4622D] bg-[#C4622D]/10 text-white/80' : 'border-white/10 text-white/40'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI FAQ Generation */}
                        <div className="border-t border-white/10 pt-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-[#8B5CF6]">✦</span>
                                <span className="text-xs text-white/50 uppercase tracking-wider font-medium">AI Product FAQs</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">Optional</span>
                            </div>
                            <FAQGeneratorTrigger
                                productData={{
                                    title: form.title,
                                    description: form.description,
                                    category: form.category,
                                    material: form.material,
                                    craft_technique: form.craft_technique,
                                    city: form.city,
                                    productId: existingProduct?._id || null,
                                }}
                                onFAQsGenerated={(faqs) => updateField('ai_generated_faqs', faqs)}
                                disabled={false}
                            />
                            {form.ai_generated_faqs.length > 0 && (
                                <div className="mt-4">
                                    <FAQPreviewList
                                        faqs={form.ai_generated_faqs}
                                        onUpdate={(updated) => updateField('ai_generated_faqs', updated)}
                                        mode="preview"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            disabled={!canProceedStep0}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                            style={{ background: canProceedStep0 ? '#C4622D' : '#333' }}
                        >
                            Continue to Images →
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Images */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                        <ImageUploadZone
                            images={form.images}
                            onChange={(imgs) => updateField('images', imgs)}
                            maxImages={6}
                        />

                        {/* AI Image Analysis */}
                        {form.images.length > 0 && (
                            <div className="border-t border-white/10 pt-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-[#8B5CF6]">✦</span>
                                    <span className="text-xs text-white/50 uppercase tracking-wider font-medium">AI Vision Analysis</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">Beta</span>
                                </div>
                                <ImageAnalysisTrigger
                                    imageUrl={form.images[0]}
                                    onAnalysisComplete={(analysis) => {
                                        if (analysis.suggested_title) updateField('title', analysis.suggested_title);
                                        if (analysis.suggested_description) updateField('description', analysis.suggested_description);
                                        if (analysis.material) updateField('material', analysis.material);
                                        if (analysis.suggested_tags) updateField('tags', analysis.suggested_tags);
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl font-semibold border border-white/10 text-white/60 hover:bg-white/5 transition-colors">
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceedStep1}
                                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                                style={{ background: canProceedStep1 ? '#C4622D' : '#333' }}
                            >
                                Continue to Pricing →
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Pricing */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Price (₹) *</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-white/30">₹</span>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => updateField('price', e.target.value)}
                                    placeholder="0"
                                    min="1"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl text-white/90 placeholder:text-white/15 focus:border-[#C4622D] focus:outline-none transition-colors"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Stock *</label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={(e) => updateField('stock', e.target.value)}
                                min="0"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 focus:border-[#C4622D] focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Suggested Price Range (optional)</label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="number"
                                    placeholder="Min ₹"
                                    value={form.suggested_price_range.min}
                                    onChange={(e) => updateField('suggested_price_range', { ...form.suggested_price_range, min: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                                />
                                <span className="text-white/30">–</span>
                                <input
                                    type="number"
                                    placeholder="Max ₹"
                                    value={form.suggested_price_range.max}
                                    onChange={(e) => updateField('suggested_price_range', { ...form.suggested_price_range, max: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* AI Pricing Insight */}
                        <div className="border-t border-white/10 pt-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-[#E8A838]">✦</span>
                                <span className="text-xs text-white/50 uppercase tracking-wider font-medium">AI Pricing Insight</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8A838]/10 border border-[#E8A838]/30 text-[#E8A838]">Optional</span>
                            </div>
                            <PricingRecommender
                                productData={{
                                    title: form.title,
                                    description: form.description,
                                    category: form.category,
                                    city: form.city,
                                    material: form.material,
                                }}
                                onPriceApply={(price) => updateField('price', price)}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold border border-white/10 text-white/60 hover:bg-white/5 transition-colors">
                                ← Back
                            </button>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={!canSubmit || loading}
                                className="flex-1 py-3 rounded-xl font-semibold text-white/80 transition-all disabled:opacity-30 border border-white/20 hover:bg-white/5"
                            >
                                {loading ? 'Saving...' : 'Save as Draft'}
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={!canSubmit || loading}
                                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
                                style={{ background: canSubmit ? '#C4622D' : '#333', boxShadow: canSubmit ? '0 4px 16px rgba(196,98,45,0.3)' : 'none' }}
                            >
                                {loading ? 'Saving...' : isEdit ? 'Update & Publish' : 'Publish Product'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
