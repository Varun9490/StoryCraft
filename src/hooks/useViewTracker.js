'use client';

import { useEffect, useRef } from 'react';

function getVisitorId() {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('sc_vid');
    if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('sc_vid', id);
    }
    return id;
}

function getTrafficSource() {
    if (typeof window === 'undefined') return 'direct';
    const ref = document.referrer;
    const params = new URLSearchParams(window.location.search);
    if (params.get('utm_source') === 'ai' || params.get('ref') === 'ai') return 'ai';
    if (params.get('utm_source') === 'suggestion' || params.get('ref') === 'suggestion') return 'suggestion';
    if (ref && (ref.includes('google') || ref.includes('bing') || ref.includes('duckduckgo'))) return 'search';
    if (ref && !ref.includes(window.location.hostname)) return 'external';
    return 'direct';
}

export function useViewTracker(productId) {
    const startTime = useRef(Date.now());
    const tracked = useRef(false);

    useEffect(() => {
        if (!productId || tracked.current) return;
        tracked.current = true;

        const visitorId = getVisitorId();
        const source = getTrafficSource();

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId,
                event: 'view',
                visitorId,
                source,
            }),
        }).catch(() => { });

        const sendDuration = () => {
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            if (duration < 2) return;
            const payload = JSON.stringify({
                productId,
                event: 'duration',
                visitorId,
                duration,
            });
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
            } else {
                fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                }).catch(() => { });
            }
        };

        window.addEventListener('beforeunload', sendDuration);
        return () => {
            sendDuration();
            window.removeEventListener('beforeunload', sendDuration);
        };
    }, [productId]);
}
