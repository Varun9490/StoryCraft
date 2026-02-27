'use client';

import { useState, useCallback, useRef } from 'react';

const clientCache = new Map();

export function useTranslation(productId) {
    const [lang, setLang] = useState('en');
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(new Set());

    const translate = useCallback(async (fields, targetLang = 'te') => {
        const sortedFields = [...fields].sort().join(',');
        const cacheKey = `${productId}_${targetLang}_${sortedFields}`;

        if (clientCache.has(cacheKey)) {
            setTranslations(prev => ({ ...prev, ...clientCache.get(cacheKey) }));
            setLang(targetLang);
            return;
        }

        if (loading) return; // prevent double clicks while loading

        setLoading(true);
        try {
            const res = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, fields, targetLang }),
            });
            const data = await res.json();
            if (data.success) {
                clientCache.set(cacheKey, data.data.translations);
                setTranslations(prev => ({ ...prev, ...data.data.translations }));
                setLang(targetLang);
            } else {
                console.error('[Translation API Error]:', data.error);
            }
        } catch (err) {
            console.error('Translation network error:', err);
        } finally {
            setLoading(false);
        }
    }, [productId, loading]);

    const toggleLang = useCallback((fields) => {
        if (lang === 'en') {
            translate(fields, 'te');
        } else {
            setLang('en');
        }
    }, [lang, translate]);

    const t = useCallback((field, original) => {
        if (lang === 'en') return original;
        return translations[field] || original;
    }, [lang, translations]);

    return { lang, toggleLang, t, loading, translate };
}
