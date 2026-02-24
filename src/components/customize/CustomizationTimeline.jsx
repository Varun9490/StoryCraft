'use client';

import { motion } from 'framer-motion';

const STEPS = [
    { label: 'Request Sent', icon: '📝', key: 'requested' },
    { label: 'Artisan Reviewing', icon: '👀', key: 'reviewing' },
    { label: 'Preview Generated', icon: '✦', key: 'preview_generated' },
    { label: 'Confirmed', icon: '✅', key: 'confirmed' },
];

function getActiveStep(status) {
    if (status === 'requested') return 0;
    if (status === 'preview_generated') return 2;
    if (status === 'confirmed') return 3;
    if (status === 'cancelled') return -1;
    return -1;
}

export default function CustomizationTimeline({ status }) {
    const activeStep = getActiveStep(status);

    if (status === 'none' || activeStep === -1) return null;

    return (
        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10">
            <div className="flex items-center justify-between">
                {STEPS.map((step, i) => {
                    const isComplete = i < activeStep;
                    const isActive = i === activeStep;
                    return (
                        <div key={step.key} className="flex items-center flex-1">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 border-2 transition-colors ${isComplete
                                    ? 'border-green-500 bg-green-500/20 text-green-400'
                                    : isActive
                                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-[#8B5CF6]'
                                        : 'border-white/10 bg-white/5 text-white/20'
                                    }`}
                            >
                                {step.icon}
                            </motion.div>
                            {i < STEPS.length - 1 && (
                                <div className="flex-1 h-0.5 mx-1">
                                    <motion.div
                                        className="h-full rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: isComplete ? 1 : 0 }}
                                        style={{
                                            transformOrigin: 'left',
                                            background: isComplete ? '#52B788' : 'rgba(255,255,255,0.1)',
                                        }}
                                        transition={{ delay: i * 0.1 + 0.2 }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-1.5">
                {STEPS.map((step, i) => {
                    const isActive = i === activeStep;
                    return (
                        <span
                            key={step.key}
                            className={`text-[9px] flex-1 text-center ${isActive ? 'text-white/60' : 'text-white/15'}`}
                        >
                            {step.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
