'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FAQPreviewList({ faqs = [], onUpdate, mode = 'preview' }) {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState({ question: '', answer: '' });

    const approvedCount = faqs.filter((f) => f.approved).length;

    const startEdit = (index) => {
        setEditingIndex(index);
        setEditForm({ question: faqs[index].question, answer: faqs[index].answer });
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditForm({ question: '', answer: '' });
    };

    const saveEdit = (index) => {
        const updated = [...faqs];
        updated[index] = { ...updated[index], question: editForm.question, answer: editForm.answer };
        onUpdate(updated);
        cancelEdit();
    };

    const toggleApprove = async (index) => {
        const updated = [...faqs];
        updated[index] = { ...updated[index], approved: !updated[index].approved };
        onUpdate(updated);
    };

    const deleteFaq = (index) => {
        const updated = faqs.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    if (faqs.length === 0) {
        return (
            <div className="text-center py-10">
                <span className="text-3xl opacity-20 block mb-3">✦</span>
                <p className="text-sm text-white/40">No FAQs generated yet. Click Generate FAQs to get started.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">{approvedCount} of {faqs.length} FAQs approved</span>
                    <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border',
                        approvedCount === faqs.length
                            ? 'bg-green-500/15 border-green-500/30 text-green-400'
                            : 'bg-white/5 border-white/10 text-white/30'
                    )}>
                        {approvedCount === faqs.length ? 'All approved ✓' : `${faqs.length - approvedCount} pending`}
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#C4622D]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: faqs.length > 0 ? approvedCount / faqs.length : 0 }}
                        style={{ transformOrigin: 'left' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* FAQ items */}
            <div className="space-y-3">
                <AnimatePresence>
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={`faq-${index}-${faq.question.slice(0, 20)}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={cn(
                                'rounded-xl p-4 border transition-colors relative',
                                faq.approved
                                    ? 'bg-green-500/[0.03] border-green-500/20'
                                    : 'bg-white/[0.02] border-white/10'
                            )}
                        >
                            {/* AI badge */}
                            <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#8B5CF6]">
                                ✦ AI Generated
                            </span>

                            {editingIndex === index ? (
                                /* Edit mode */
                                <div className="space-y-3 pr-20">
                                    <textarea
                                        value={editForm.question}
                                        onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:border-[#8B5CF6] focus:outline-none resize-none"
                                        placeholder="Question"
                                    />
                                    <textarea
                                        value={editForm.answer}
                                        onChange={(e) => setEditForm((p) => ({ ...p, answer: e.target.value }))}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:border-[#8B5CF6] focus:outline-none resize-none"
                                        placeholder="Answer"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveEdit(index)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8B5CF6] text-white hover:brightness-110 transition-all"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Display mode */
                                <div className="pr-20">
                                    <p className="text-sm font-medium text-white/80 mb-1.5">{faq.question}</p>
                                    <p className="text-sm text-white/50 leading-relaxed">{faq.answer}</p>

                                    {/* Status + actions */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                        <motion.button
                                            onClick={() => toggleApprove(index)}
                                            className="flex items-center gap-1.5 text-xs transition-colors"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <motion.span
                                                animate={{ scale: faq.approved ? [1, 1.3, 1] : 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {faq.approved ? '✅' : '⬜'}
                                            </motion.span>
                                            <span className={faq.approved ? 'text-green-400' : 'text-white/30'}>
                                                {faq.approved ? 'Approved' : 'Pending Review'}
                                            </span>
                                        </motion.button>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEdit(index)}
                                                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteFaq(index)}
                                                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
