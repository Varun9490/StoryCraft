'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function BuyerForm({ onSuccess, onBack, role = 'buyer', mode = 'register' }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const isLogin = mode === 'login';

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'email') setEmailError('');
    }

    function getPasswordStrength() {
        const { password } = form;
        if (!password) return { level: '', width: '0%', color: '', label: '' };
        if (password.length < 8)
            return { level: 'weak', width: '33%', color: '#E55A4A', label: 'Weak' };
        if (password.length < 12)
            return { level: 'fair', width: '66%', color: '#E8A838', label: 'Fair' };
        if (/[!@#$%^&*(),.?":{}|<>0-9]/.test(password))
            return { level: 'strong', width: '100%', color: '#52B788', label: 'Strong' };
        return { level: 'fair', width: '66%', color: '#E8A838', label: 'Fair' };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setEmailError('');

        try {
            if (isLogin) {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    toast.error(data.error || 'Login failed');
                    return;
                }
                toast.success(data.message || 'Welcome back!');
                onSuccess(data.data.user);
            } else {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        password: form.password,
                        phone: form.phone,
                        role,
                    }),
                });
                const data = await res.json();
                if (res.status === 409) {
                    setEmailError(data.error);
                    return;
                }
                if (!res.ok) {
                    toast.error(data.error || 'Registration failed');
                    return;
                }
                toast.success(data.message || 'Welcome!');
                onSuccess(data.data.user);
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const strength = getPasswordStrength();

    const inputClass =
        'w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none transition-colors';
    const inputStyle = {
        fontFamily: 'var(--font-inter)',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
    };
    const labelClass = 'text-xs text-white/50 mb-1 block';
    const labelStyle = { fontFamily: 'var(--font-inter)' };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div>
                    <label className={labelClass} style={labelStyle}>
                        Full Name <span className="text-[#E55A4A]">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className={inputClass}
                        style={inputStyle}
                    />
                </div>
            )}

            <div>
                <label className={labelClass} style={labelStyle}>
                    Email Address <span className="text-[#E55A4A]">*</span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                    style={{
                        ...inputStyle,
                        borderColor: emailError ? '#E55A4A' : 'rgba(255,255,255,0.1)',
                    }}
                />
                {emailError && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-[#E55A4A] mt-1"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        {emailError}
                    </motion.p>
                )}
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>
                    Password <span className="text-[#E55A4A]">*</span>
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        className={inputClass}
                        style={inputStyle}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                        {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>
                {/* Password strength bar — only show for registration */}
                {!isLogin && form.password && (
                    <div className="mt-2">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                layout
                                className="h-full rounded-full"
                                style={{
                                    width: strength.width,
                                    background: strength.color,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                        </div>
                        <span
                            className="text-[10px] mt-1 inline-block"
                            style={{ color: strength.color, fontFamily: 'var(--font-inter)' }}
                        >
                            {strength.label}
                        </span>
                    </div>
                )}
            </div>

            {!isLogin && (
                <div>
                    <label className={labelClass} style={labelStyle}>
                        Phone <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className={inputClass}
                        style={inputStyle}
                    />
                </div>
            )}

            <div className="flex gap-3 pt-2">
                {onBack && !isLogin && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-colors"
                        style={{
                            fontFamily: 'var(--font-inter)',
                            borderColor: 'rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.6)',
                            background: 'transparent',
                        }}
                    >
                        ← Back
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                        fontFamily: 'var(--font-inter)',
                        background: loading ? 'rgba(196,98,45,0.7)' : '#C4622D',
                        color: '#fff',
                    }}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isLogin ? (
                        'Sign In'
                    ) : (
                        'Create Account'
                    )}
                </button>
            </div>

            {isLogin && (
                <div className="text-center pt-2 space-y-2">
                    <a
                        href="#"
                        className="text-xs text-white/40 hover:text-white/60 transition-colors"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        Forgot password?
                    </a>
                    <p className="text-xs text-white/30" style={{ fontFamily: 'var(--font-inter)' }}>
                        Don&#39;t have an account?{' '}
                        <a href="/register" className="text-[#C4622D] hover:underline">
                            Join StoryCraft
                        </a>
                    </p>
                </div>
            )}
        </form>
    );
}
