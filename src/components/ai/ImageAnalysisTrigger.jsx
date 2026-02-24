'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AnalysisResultCard from './AnalysisResultCard';

export default function ImageAnalysisTrigger({ imageUrl, onAnalysisComplete }) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!imageUrl || loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/ai/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });
            const data = await res.json();
            if (data.success) {
                setAnalysis(data.data.analysis);
            } else {
                setError(data.error || 'Analysis failed');
            }
        } catch (err) {
            setError('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (analysisData) => {
        onAnalysisComplete(analysisData);
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleAnalyze}
                disabled={!imageUrl || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                style={{ background: imageUrl && !loading ? '#8B5CF6' : '#333' }}
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Detecting craft type...
                    </>
                ) : (
                    <>
                        <span className="text-sm">✦</span>
                        Analyze Image with AI Vision
                    </>
                )}
            </button>

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}

            <AnimatePresence>
                {analysis && (
                    <AnalysisResultCard analysis={analysis} onApply={handleApply} />
                )}
            </AnimatePresence>
        </div>
    );
}
