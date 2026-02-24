'use client';

import { motion } from 'framer-motion';

export default function DashboardStatCard({ icon, label, value, trend, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                {trend !== undefined && (
                    <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p
                className="text-2xl font-bold text-white/90"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                {value}
            </p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
        </motion.div>
    );
}
