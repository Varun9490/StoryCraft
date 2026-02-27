"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const publicNavItems = [
    { label: "Story", href: "/#story" },
    { label: "Artisans", href: "/#artisans" },
    { label: "Shop", href: "/shop" },
    { label: "Chat", href: "/chat" },
    { label: "AI Features", href: "/#ai-features" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOnLight, setIsOnLight] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();
    const { user, loading, logout } = useAuth();

    const navItems = user
        ? [
            ...(user.role === 'buyer' ? [{ label: "Wishlist", href: "/dashboard/buyer/wishlist" }] : []),
            { label: "Chat", href: "/chat" },
        ]
        : publicNavItems;

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    useEffect(() => {
        const lightSections = document.querySelectorAll(".section-warm");
        if (!lightSections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const navY = 60;
                let onLight = false;
                entries.forEach((entry) => {
                    const rect = entry.boundingClientRect;
                    if (rect.top < navY && rect.bottom > navY) {
                        onLight = true;
                    }
                });
                setIsOnLight(onLight);
            },
            { threshold: [0, 0.1, 0.5, 1], rootMargin: "-60px 0px 0px 0px" }
        );

        lightSections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    return (
        <motion.nav
            id="main-nav"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-[9998] transition-all duration-500 ${isScrolled
                ? isOnLight
                    ? "bg-white/80 backdrop-blur-md shadow-sm"
                    : "bg-[#050505]/80 backdrop-blur-md"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-1">
                    <span
                        className="text-2xl font-bold italic"
                        style={{
                            fontFamily: "var(--font-playfair)",
                            color: "#C4622D",
                        }}
                    >
                        StoryCraft
                    </span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                            className={`text-sm font-medium transition-colors duration-300 ${isOnLight && isScrolled
                                ? "text-[#1A1209]/70 hover:text-[#C4622D]"
                                : "text-white/70 hover:text-[#C4622D]"
                                }`}
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            {item.label}
                        </a>
                    ))}
                    {!loading && (
                        user ? (
                            <>
                                <a
                                    href="/account"
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${isOnLight && isScrolled
                                        ? "text-[#1A1209]/70 hover:text-[#C4622D]"
                                        : "text-white/70 hover:text-[#C4622D]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/20" />
                                    ) : (
                                        <span className="w-6 h-6 rounded-full bg-[#C4622D]/20 border border-[#C4622D]/30 flex items-center justify-center text-[10px] text-[#C4622D] font-bold">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                    Account
                                </a>
                                <a
                                    href="/dashboard"
                                    className={`text-sm font-medium transition-colors duration-300 ${isOnLight && isScrolled
                                        ? "text-[#1A1209]/70 hover:text-[#C4622D]"
                                        : "text-white/70 hover:text-[#C4622D]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    Dashboard
                                </a>
                                <button
                                    onClick={logout}
                                    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    style={{
                                        fontFamily: "var(--font-inter)",
                                        background: "transparent",
                                        border: "1px solid #C4622D",
                                        color: "#C4622D",
                                    }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    id="nav-sign-in"
                                    className={`text-sm font-medium transition-colors duration-300 ${isOnLight && isScrolled
                                        ? "text-[#1A1209]/70 hover:text-[#C4622D]"
                                        : "text-white/70 hover:text-[#C4622D]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    Sign In
                                </a>
                                <a
                                    href="/register"
                                    id="nav-begin-story"
                                    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg"
                                    style={{
                                        fontFamily: "var(--font-inter)",
                                        background: "#C4622D",
                                        color: "#fff",
                                        boxShadow: "0 4px 16px rgba(196,98,45,0.3)",
                                    }}
                                >
                                    Begin Your Story
                                </a>
                            </>
                        )
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    id="mobile-menu-toggle"
                    className="md:hidden flex flex-col gap-1.5 p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span
                        className={`w-6 h-0.5 transition-all duration-300 ${isOnLight && isScrolled ? "bg-[#1A1209]" : "bg-white"
                            } ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
                    />
                    <span
                        className={`w-6 h-0.5 transition-all duration-300 ${isOnLight && isScrolled ? "bg-[#1A1209]" : "bg-white"
                            } ${mobileOpen ? "opacity-0" : ""}`}
                    />
                    <span
                        className={`w-6 h-0.5 transition-all duration-300 ${isOnLight && isScrolled ? "bg-[#1A1209]" : "bg-white"
                            } ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`md:hidden px-6 pb-6 ${isOnLight ? "bg-white/95" : "bg-[#050505]/95"
                        } backdrop-blur-xl`}
                >
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block py-3 text-sm font-medium border-b transition-colors ${isOnLight
                                ? "border-[#E5DDD4] text-[#1A1209]/70 hover:text-[#C4622D]"
                                : "border-white/10 text-white/70 hover:text-[#C4622D]"
                                }`}
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            {item.label}
                        </a>
                    ))}
                    {!loading && (
                        user ? (
                            <>
                                <a
                                    href="/account"
                                    onClick={() => setMobileOpen(false)}
                                    className={`block py-3 text-sm font-medium border-b transition-colors ${isOnLight
                                        ? "border-[#E5DDD4] text-[#1A1209]/70 hover:text-[#C4622D]"
                                        : "border-white/10 text-white/70 hover:text-[#C4622D]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    👤 My Account
                                </a>
                                <a
                                    href="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className={`block py-3 text-sm font-medium border-b transition-colors ${isOnLight
                                        ? "border-[#E5DDD4] text-[#1A1209]/70 hover:text-[#C4622D]"
                                        : "border-white/10 text-white/70 hover:text-[#C4622D]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    Dashboard
                                </a>
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileOpen(false);
                                    }}
                                    className="block w-full mt-3 text-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                                    style={{
                                        fontFamily: "var(--font-inter)",
                                        background: "transparent",
                                        border: "1px solid #C4622D",
                                        color: "#C4622D",
                                    }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className={`block py-3 text-sm font-medium border-b transition-colors ${isOnLight
                                        ? "border-[#E5DDD4] text-[#1A1209]/70 hover:text-[#C4622D]"
                                        : "border-white/10 text-white/70 hover:text-[#C4622D]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    Sign In
                                </a>
                                <a
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="block mt-3 text-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                                    style={{
                                        fontFamily: "var(--font-inter)",
                                        background: "#C4622D",
                                        color: "#fff",
                                    }}
                                >
                                    Begin Your Story
                                </a>
                            </>
                        )
                    )}
                </motion.div>
            )}
        </motion.nav>
    );
}
