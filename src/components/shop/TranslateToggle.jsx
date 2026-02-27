'use client';

import { motion } from 'framer-motion';

export default function TranslateToggle({ lang, onToggle, loading }) {
    return (
        <motion.button
            onClick={onToggle}
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50"
            style={{
                background: lang === 'te'
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))'
                    : 'rgba(255,255,255,0.04)',
                borderColor: lang === 'te' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)',
                color: lang === 'te' ? '#A78BFA' : 'rgba(255,255,255,0.5)',
            }}
        >
            {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <span className="text-sm">{lang === 'te' ? 'అ' : 'అ'}</span>
            )}
            {lang === 'te' ? 'తెలుగు' : 'Telugu'}
        </motion.button>
    );
}
