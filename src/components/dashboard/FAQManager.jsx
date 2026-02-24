'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FAQGeneratorTrigger from '@/components/ai/FAQGeneratorTrigger';
import FAQPreviewList from '@/components/ai/FAQPreviewList';
import FAQAccordion from '@/components/shop/FAQAccordion';

export default function FAQManager({ productId, productData }) {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success && data.data.product?.ai_generated_faqs) {
                    setFaqs(data.data.product.ai_generated_faqs);
                }
            } catch (err) {
                console.error('Failed to load FAQs:', err);
            } finally {
                setLoading(false);
            }
        };
        if (productId) fetchFaqs();
    }, [productId]);

    const handleFAQsGenerated = (newFaqs) => {
        // Preserve approved FAQs, replace unapproved
        const approvedFaqs = faqs.filter((f) => f.approved);
        setFaqs([...approvedFaqs, ...newFaqs]);
    };

    const handleUpdate = (updatedFaqs) => {
        setFaqs(updatedFaqs);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/products/${productId}/faqs`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ faqs }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setFaqs(data.data.faqs);
            toast.success('FAQs saved successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to save FAQs');
        } finally {
            setSaving(false);
        }
    };

    const approvedCount = faqs.filter((f) => f.approved).length;
    const approvedFaqs = faqs.filter((f) => f.approved);

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">
                    <span className="text-white/80 font-semibold">{approvedCount}</span> of{' '}
                    <span className="text-white/80 font-semibold">{faqs.length}</span> FAQs approved and live
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:bg-white/5 transition-colors"
                    >
                        {showPreview ? 'Hide Preview' : 'Live Preview'}
                    </button>
                </div>
            </div>

            {/* Generate trigger */}
            <FAQGeneratorTrigger
                productData={{ ...productData, productId }}
                onFAQsGenerated={handleFAQsGenerated}
                disabled={false}
            />

            <hr className="border-white/5" />

            {/* FAQ list */}
            <FAQPreviewList faqs={faqs} onUpdate={handleUpdate} mode="manage" />

            {/* Live preview */}
            {showPreview && approvedFaqs.length > 0 && (
                <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-5">
                    <p className="text-xs text-[#8B5CF6] mb-3 uppercase tracking-wider font-medium">
                        ✦ Buyer Preview
                    </p>
                    <FAQAccordion faqs={approvedFaqs} productTitle={productData?.title} />
                </div>
            )}

            {/* Save */}
            {faqs.length > 0 && (
                <div className="sticky bottom-4 z-10">
                    <button
                        onClick={saveAll}
                        disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110 disabled:opacity-50"
                        style={{
                            background: '#C4622D',
                            boxShadow: '0 4px 24px rgba(196,98,45,0.3)',
                        }}
                    >
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            )}
        </div>
    );
}
