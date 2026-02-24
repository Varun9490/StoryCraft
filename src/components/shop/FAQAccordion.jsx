'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQAccordion({ faqs = [], productTitle }) {
    const [openIndex, setOpenIndex] = useState(null);

    if (faqs.length === 0) return null;

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="border-t border-white/10 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-5">
                <h3
                    className="text-lg font-bold text-white/80"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Frequently Asked Questions
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6]">
                    {faqs.length}
                </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className={isOpen ? 'border-l-2 border-l-[#C4622D] pl-4' : 'pl-0'}>
                            <button
                                onClick={() => toggle(index)}
                                className="flex items-center justify-between w-full py-4 text-left gap-3 group"
                            >
                                <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
                                    {faq.question}
                                </span>
                                <motion.span
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-white/30 flex-shrink-0"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-sm text-white/50 leading-relaxed pb-4 pr-8">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* AI attribution */}
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
                <span className="text-[#8B5CF6] text-xs">✦</span>
                <span className="text-[10px] text-white/20">FAQs generated with AI and verified by the artisan</span>
            </div>
        </div>
    );
}
