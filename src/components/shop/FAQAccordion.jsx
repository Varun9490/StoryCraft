'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQAccordion({ faqs = [], productTitle }) {
    if (faqs.length === 0) return null;

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

            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-white/5 data-[state=open]:border-l-[2px] data-[state=open]:border-l-[#C4622D] data-[state=open]:pl-4 transition-all duration-300">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-white/90">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/50 leading-relaxed pr-8">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {/* AI attribution */}
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
                <span className="text-[#8B5CF6] text-xs">✦</span>
                <span className="text-[10px] text-white/20">FAQs generated with AI and verified by the artisan</span>
            </div>
        </div>
    );
}
