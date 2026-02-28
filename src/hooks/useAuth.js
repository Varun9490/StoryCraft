'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

let globalRefreshPromise = null;
let globalMePromise = null;
let globalUser = null;
const authListeners = new Set();

function setGlobalUser(u) {
    globalUser = u;
    authListeners.forEach(listener => listener(u));
}

export function useAuth() {
    const [user, setUserState] = useState(globalUser);
    const [loading, setLoading] = useState(!globalUser);
    const [error, setError] = useState(null);
    const router = useRouter();
    const refreshTimer = useRef(null);

    useEffect(() => {
        authListeners.add(setUserState);
        return () => authListeners.delete(setUserState);
    }, []);

    const refreshSession = useCallback(async () => {
        if (!globalRefreshPromise) {
            globalRefreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
                .then(res => res.json())
                .catch(() => null)
                .finally(() => { globalRefreshPromise = null; });
        }

        const data = await globalRefreshPromise;
        if (data?.success) {
            setGlobalUser(data.data.user);
            return true;
        }
        return false;
    }, []);

    const refetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.success) {
                setGlobalUser(data.data.user);
            }
        } catch { }
    }, []);

    useEffect(() => {
        async function fetchUser() {
            if (globalUser) {
                setLoading(false);
                return;
            }
            try {
                if (!globalMePromise) {
                    globalMePromise = fetch('/api/auth/me')
                        .then(res => res.json())
                        .finally(() => { globalMePromise = null; });
                }
                const data = await globalMePromise;

                if (data?.success) {
                    setGlobalUser(data.data.user);
                } else {
                    const refreshed = await refreshSession();
                    if (!refreshed) setError(data?.error);
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
            setGlobalUser(null);
            clearInterval(refreshTimer.current);
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    return { user, loading, error, logout, refreshSession, refetchUser };
}
