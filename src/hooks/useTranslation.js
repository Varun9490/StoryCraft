'use client';

import { useState, useCallback, useRef } from 'react';

const clientCache = new Map();

export function useTranslation(productId) {
    const [lang, setLang] = useState('en');
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(new Set());

    const translate = useCallback(async (fields, targetLang = 'te') => {
        const cacheKey = `${productId}_${targetLang}_${fields.sort().join(',')}`;
        if (clientCache.has(cacheKey)) {
            setTranslations(prev => ({ ...prev, ...clientCache.get(cacheKey) }));
            setLang(targetLang);
            return;
        }
        if (fetchedRef.current.has(cacheKey)) return;
        fetchedRef.current.add(cacheKey);

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
            }
        } catch (err) {
            console.error('Translation error:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

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
