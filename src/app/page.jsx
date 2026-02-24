"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import MarqueeStrip from "@/components/MarqueeStrip";
import BackToTop from "@/components/BackToTop";

// Lazy-loaded non-hero components for performance
const GlobeSection = dynamic(() => import("@/components/GlobeSection"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

const StoryPanels = dynamic(() => import("@/components/StoryPanels"), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#F9F6F1]" />,
});

const ProductGrid = dynamic(() => import("@/components/ProductGrid"), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#F9F6F1]" />,
});

const ArtisanPosters = dynamic(() => import("@/components/ArtisanPosters"), {
    ssr: false,
    loading: () => <div className="min-h-[60vh] bg-[#1A1209]" />,
});

const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
    ssr: false,
    loading: () => <div className="min-h-[60vh] bg-[#F9F6F1]" />,
});

const AIFeatures = dynamic(() => import("@/components/AIFeatures"), {
    ssr: false,
    loading: () => <div className="min-h-[60vh] bg-[#0E0C08]" />,
});

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
    ssr: false,
    loading: () => <div className="min-h-[60vh] bg-[#F9F6F1]" />,
});

const CTAFooter = dynamic(() => import("@/components/CTAFooter"), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#050505]" />,
});

export default function Home() {
    // Init Lenis smooth scroll
    useEffect(() => {
        let lenis;
        const initLenis = async () => {
            try {
                const Lenis = (await import("lenis")).default;
                lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                });

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
            } catch (e) {
                console.warn("Lenis smooth scroll not available:", e);
            }
        };
        initLenis();
        return () => {
            if (lenis) lenis.destroy();
        };
    }, []);

    return (
        <main className="relative">
            <Navbar />

            {/* Section 1 — Cinematic Opener */}
            <GlobeSection />

            {/* Section 2 — Transition Strip */}
            <MarqueeStrip />

            {/* Section 3 — The Visakhapatnam Story */}
            <StoryPanels />

            {/* Section 4 — Product Gallery */}
            <ProductGrid />

            {/* Section 5 — Featured Artisans */}
            <ArtisanPosters />

            {/* Section 6 — How It Works */}
            <HowItWorks />

            {/* Section 7 — AI Features Teaser */}
            <AIFeatures />

            {/* Section 8 — Testimonials / Trust */}
            <Testimonials />

            {/* Section 9 — CTA + Footer */}
            <CTAFooter />

            {/* Back to Top FAB */}
            <BackToTop />
        </main>
    );
}
