'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AccountPage() {
    const { user, loading: authLoading, refetchUser } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setAvatar(user.avatar || '');
        }
    }, [user]);

    const handleAvatarUpload = async (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setAvatar(data.data.url);
                toast.success('Photo uploaded');
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        }
        setUploading(false);
    };

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }
        setSaving(true);
        try {
            const payload = { name: name.trim(), phone: phone.trim(), avatar };
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated');
                await refetchUser();
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            toast.error(err.message || 'Update failed');
        }
        setSaving(false);
    };

    const handleChangePassword = async () => {
        if (!currentPassword) {
            toast.error('Enter your current password');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be 8+ characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Password changed');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordSection(false);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            toast.error(err.message || 'Password change failed');
        }
        setSaving(false);
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="pt-28 max-w-2xl mx-auto px-6">
                    <div className="space-y-6">
                        <div className="h-32 bg-white/5 animate-pulse rounded-2xl" />
                        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
                    </div>
                </div>
            </main>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <main className="min-h-screen bg-[#050505]">
            <Navbar accountMode={true} />
            <div className="pt-28 pb-20 max-w-2xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-bold text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                        My Account
                    </h1>
                    <p className="text-sm text-white/30 mt-1">Manage your profile and preferences</p>
                </motion.div>

                {/* Avatar Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 mb-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-[#1A1209] flex items-center justify-center flex-shrink-0">
                                {avatar ? (
                                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-white/20">
                                        {name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                                <span className="text-white text-xs font-semibold">Change</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleAvatarUpload(e.target.files?.[0])}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-white/90 truncate">{user.name}</h2>
                            <p className="text-sm text-white/40">{user.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-[#C4622D]/15 border border-[#C4622D]/30 text-[#C4622D] font-semibold">
                                    {user.role}
                                </span>
                                <span className="text-[11px] text-white/20">
                                    Member since {memberSince}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/[0.02] rounded-xl p-1 border border-white/5">
                    {['profile', 'security'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === tab
                                ? 'bg-white/10 text-white/80'
                                : 'text-white/30 hover:text-white/50'
                                }`}
                        >
                            {tab === 'profile' ? '👤 Profile' : '🔒 Security'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6"
                        >
                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Full Name
                                </label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 transition-colors"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Email Address
                                </label>
                                <input
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white/30 text-sm"
                                />
                                <p className="text-[10px] text-white/15 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Phone Number
                                </label>
                                <input
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 transition-colors"
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Profile Picture URL
                                </label>
                                <input
                                    value={avatar}
                                    onChange={e => setAvatar(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 transition-colors"
                                    placeholder="https://"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Role
                                </label>
                                <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white/30 text-sm capitalize">
                                    {user.role}
                                </div>
                            </div>

                            {user.role === 'artisan' && user.artisanProfile && (
                                <div className="p-4 rounded-xl bg-[#C4622D]/5 border border-[#C4622D]/15">
                                    <p className="text-xs text-[#C4622D]/80 font-semibold mb-1">Artisan Profile</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/60">{user.artisanProfile.craft_specialty || 'Craft Artisan'}</p>
                                            <p className="text-[11px] text-white/25">{user.artisanProfile.city}</p>
                                        </div>
                                        <a
                                            href="/dashboard/artisan"
                                            className="text-xs text-[#C4622D] hover:underline"
                                        >
                                            Manage →
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/5">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all hover:brightness-110"
                                    style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.25)' }}
                                >
                                    {saving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6"
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 mb-1">Change Password</h3>
                                <p className="text-[11px] text-white/25">Update your password to keep your account secure</p>
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 transition-colors"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 transition-colors"
                                    placeholder="Minimum 8 characters"
                                />
                                {newPassword && (
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className="h-1 flex-1 rounded-full transition-all"
                                                style={{
                                                    background: newPassword.length >= i * 3
                                                        ? i <= 2
                                                            ? 'rgba(239,68,68,0.6)'
                                                            : i === 3
                                                                ? 'rgba(234,179,8,0.6)'
                                                                : 'rgba(34,197,94,0.6)'
                                                        : 'rgba(255,255,255,0.05)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C4622D]/40 transition-colors"
                                    placeholder="Re-enter new password"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-[10px] text-red-400/70 mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                    className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-30 transition-all hover:brightness-110"
                                    style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.25)' }}
                                >
                                    {saving ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-sm font-semibold text-white/70 mb-1">Account Info</h3>
                                <div className="space-y-2 mt-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/25">Account Status</span>
                                        <span className="text-green-400/80">{user.isActive ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/25">Verified</span>
                                        <span className={user.isVerified ? 'text-green-400/80' : 'text-amber-400/80'}>
                                            {user.isVerified ? 'Yes' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/25">Member Since</span>
                                        <span className="text-white/40">{memberSince}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid grid-cols-2 gap-3"
                >
                    <a
                        href="/dashboard"
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                    >
                        <span className="text-lg mb-2 block">📊</span>
                        <span className="text-xs text-white/50 group-hover:text-white/70 font-medium">Dashboard</span>
                    </a>
                    {user.role === 'buyer' && (
                        <a
                            href="/dashboard/buyer/wishlist"
                            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                        >
                            <span className="text-lg mb-2 block">❤️</span>
                            <span className="text-xs text-white/50 group-hover:text-white/70 font-medium">My Wishlist</span>
                        </a>
                    )}
                    {user.role === 'artisan' && (
                        <a
                            href="/dashboard/artisan"
                            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                        >
                            <span className="text-lg mb-2 block">🎨</span>
                            <span className="text-xs text-white/50 group-hover:text-white/70 font-medium">Artisan Tools</span>
                        </a>
                    )}
                    <a
                        href="/shop"
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                    >
                        <span className="text-lg mb-2 block">🛍️</span>
                        <span className="text-xs text-white/50 group-hover:text-white/70 font-medium">Browse Shop</span>
                    </a>
                    <a
                        href="/chat"
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                    >
                        <span className="text-lg mb-2 block">💬</span>
                        <span className="text-xs text-white/50 group-hover:text-white/70 font-medium">Messages</span>
                    </a>
                </motion.div>
            </div>
        </main>
    );
}
