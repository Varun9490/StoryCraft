'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const refreshTimer = useRef(null);

    const refreshSession = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/refresh', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setUser(data.data.user);
                return true;
            }
        } catch { }
        return false;
    }, []);

    const refetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                setUser(data.data.user);
            }
        } catch { }
    }, []);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.success) {
                    setUser(data.data.user);
                } else {
                    const refreshed = await refreshSession();
                    if (!refreshed) setError(data.error);
                }
            } catch (err) {
                setError('Failed to fetch user');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [refreshSession]);

    useEffect(() => {
        if (!user) return;
        refreshTimer.current = setInterval(() => {
            refreshSession();
        }, 25 * 60 * 1000);

        const onActivity = () => {
            clearInterval(refreshTimer.current);
            refreshTimer.current = setInterval(() => {
                refreshSession();
            }, 25 * 60 * 1000);
        };

        window.addEventListener('focus', onActivity);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) onActivity();
        });

        return () => {
            clearInterval(refreshTimer.current);
            window.removeEventListener('focus', onActivity);
        };
    }, [user, refreshSession]);

    async function logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            clearInterval(refreshTimer.current);
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    return { user, loading, error, logout, refreshSession, refetchUser };
}
