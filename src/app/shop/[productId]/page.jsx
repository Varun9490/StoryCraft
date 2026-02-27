'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import InfiniteMenu from '@/components/animations/InfiniteMenu';
import { useCart } from '@/contexts/CartContext';
import FAQAccordion from '@/components/shop/FAQAccordion';
import TranslateToggle from '@/components/shop/TranslateToggle';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useViewTracker } from '@/hooks/useViewTracker';
import WishlistButton from '@/components/ui/WishlistButton';
import Head from 'next/head';

const ProductModelViewer = dynamic(() => import('@/components/three/ProductModelViewer'), { ssr: false });

function ProductJsonLd({ product, faqs }) {
    const artisanName = product.artisan?.user?.name || 'Artisan';
    const imageUrl = product.images?.[0]?.url || product.images?.[0] || '';

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: imageUrl,
        brand: { '@type': 'Brand', name: 'StoryCraft' },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Person', name: artisanName },
        },
        category: product.category?.replace('_', ' '),
        material: product.material || undefined,
    };

    const faqSchema = faqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    } : null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
        </>
    );
}

export default function ProductDetailPage({ params }) {
    const { productId } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { dispatch } = useCart();
    const [faqs, setFaqs] = useState([]);
    const { user } = useAuth();
    const { lang, toggleLang, t, loading: translating } = useTranslation(productId);

    useViewTracker(productId);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data.product);
                }
            } catch { }
            setLoading(false);
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(`/api/products/${productId}/faqs`);
                const data = await res.json();
                if (data.success) {
                    setFaqs(data.data.faqs);
                }
            } catch { }
        };
        if (productId) fetchFaqs();
    }, [productId]);

    const translationFields = useMemo(() => {
        const fields = ['title', 'description'];
        faqs.forEach((_, i) => fields.push(`faq_${i}`));
        return fields;
    }, [faqs]);

    const translatedFaqs = useMemo(() => {
        if (lang === 'en') return faqs;
        return faqs.map((faq, i) => {
            const translated = t(`faq_${i}`, '');
            if (!translated) return faq;
            const parts = translated.split('\n');
            const q = (parts.find(p => p.startsWith('Q:')) || '').replace('Q:', '').trim() || faq.question;
            const a = (parts.find(p => p.startsWith('A:')) || '').replace('A:', '').trim() || faq.answer;
            return { ...faq, question: q, answer: a };
        });
    }, [lang, faqs, t]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            dispatch({
                type: 'ADD_ITEM',
                payload: {
                    product: {
                        _id: product._id,
                        title: product.title,
                        price: product.price,
                        images: product.images,
                        stock: product.stock,
                        artisan: {
                            _id: product.artisan?._id,
                            name: product.artisan?.user?.name || 'Artisan',
                        },
                    },
                },
            });
        }
        dispatch({ type: 'SET_DRAWER', payload: true });
        toast.success(`${product.title} added to cart`);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] pt-24">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-white/5 rounded-xl animate-pulse" />
                            <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                            <div className="h-12 w-1/3 bg-white/5 rounded-xl animate-pulse mt-8" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-[#050505] pt-24">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <div className="text-6xl mb-4 opacity-20">🏺</div>
                    <h1 className="text-2xl text-white/60 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Product Not Found</h1>
                    <Link href="/shop" className="text-sm" style={{ color: '#C4622D' }}>← Back to Shop</Link>
                </div>
            </main>
        );
    }

    const artisanName = product.artisan?.user?.name || 'Artisan';
    const artisanId = product.artisan?._id;
    const isOwner = user?.role === 'artisan' && user?.artisanProfile === artisanId?.toString();
    const hasStory = product.story_panels && product.story_panels.length > 0;

    return (
        <main className="min-h-screen bg-[#050505]">
            <Navbar />
            <ProductJsonLd product={product} faqs={faqs} />

            <div className="w-full h-[100svh] relative pt-[72px]">
                <InfiniteMenu
                    items={product.images.map(img => ({
                        image: img.url,
                        title: product.title,
                        description: product.category?.replace('_', ' ')
                    }))}
                    scale={1.2}
                />
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 animate-bounce">
                    <button
                        onClick={() => window.scrollBy({ top: window.innerHeight - 80, behavior: 'smooth' })}
                        className="w-12 h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white hover:bg-[#C4622D] shadow-2xl hover:scale-110 transition-all"
                    >
                        ↓
                    </button>
                </div>
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16" id="details">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-xs text-white/30">
                        <Link href="/shop" className="hover:text-white/60 transition-colors">Shop</Link>
                        <span>/</span>
                        <span className="text-white/50 capitalize">{product.category?.replace('_', ' ')}</span>
                        <span>/</span>
                        <span className="text-white/60 truncate max-w-[200px]">{product.title}</span>
                    </div>
                    <TranslateToggle
                        lang={lang}
                        onToggle={() => toggleLang(translationFields)}
                        loading={translating}
                    />
                </div>

                <div className="max-w-3xl mx-auto flex flex-col gap-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/50 uppercase tracking-wider">
                                {product.category?.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/50">
                                📍 {product.city}
                            </span>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-white/90 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {t('title', product.title)}
                            </h1>
                            <div className="mt-2">
                                <WishlistButton productId={product._id} size="md" />
                            </div>
                        </div>

                        <Link
                            href={`/artisan/${artisanId}`}
                            className="flex items-center gap-3 group w-fit"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#1A1209] border border-white/10 flex items-center justify-center overflow-hidden">
                                {product.artisan?.profile_image ? (
                                    <Image src={product.artisan.profile_image} alt={artisanName} fill className="object-cover" sizes="40px" />
                                ) : (
                                    <span className="text-white/20 text-sm">👤</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-white/70 group-hover:text-[#C4622D] transition-colors">
                                    by {artisanName}
                                </p>
                                <p className="text-[10px] text-white/30">{product.artisan?.craft_specialty}</p>
                            </div>
                        </Link>

                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold" style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}>
                                ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-white/30 mb-1">Free shipping</span>
                        </div>

                        {product.stock > 0 && (
                            <p className={`text-xs ${product.stock <= 5 ? 'text-amber-400/80' : 'text-[#8B5CF6]/90'}`}>
                                {product.stock <= 5 ? '⚡ Only ' : '📦 '} {product.stock} units available in stock
                            </p>
                        )}
                        {product.stock === 0 && (
                            <p className="text-sm text-red-400">Out of stock</p>
                        )}

                        {product.stock > 0 && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center text-white/80 text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-110"
                                    style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.3)' }}
                                >
                                    Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
                                </button>
                            </div>
                        )}

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">The Story</h3>
                            <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                                {t('description', product.description)}
                            </p>
                        </div>

                        {hasStory && (
                            <a
                                href={`/story/${product._id}`}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border border-[#C4622D]/30 text-[#C4622D] hover:bg-[#C4622D]/10"
                            >
                                🎬 View Full Cinematic Story
                            </a>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {product.material && (
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Material</p>
                                    <p className="text-sm text-white/70">{product.material}</p>
                                </div>
                            )}
                            {product.craft_technique && (
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Technique</p>
                                    <p className="text-sm text-white/70">{product.craft_technique}</p>
                                </div>
                            )}
                            {product.is_customizable && (
                                <div className="p-3 rounded-xl bg-[#C4622D]/10 border border-[#C4622D]/20 col-span-2 space-y-2">
                                    <p className="text-sm text-[#C4622D]">🎨 This product can be customized</p>
                                    <a
                                        href={`/customize/${product._id}`}
                                        className="inline-block text-xs px-4 py-2 rounded-lg bg-[#C4622D] text-white font-semibold hover:brightness-110 transition-all"
                                    >
                                        Request Customization →
                                    </a>
                                </div>
                            )}
                        </div>

                        {artisanId && (
                            <a
                                href={`/chat?artisanId=${artisanId}&productId=${product._id}`}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white/90 transition-all text-sm font-medium"
                            >
                                💬 Chat with Artisan
                            </a>
                        )}

                        {product.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/40">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="text-xs text-white/20">
                            👁️ {product.views?.toLocaleString()} views
                        </div>

                        <FAQAccordion faqs={translatedFaqs} productTitle={product.title} />

                        {(product.model_3d_url || isOwner) && (
                            <div className="w-full bg-[#0F0F14] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[450px] mt-12 border border-white/5">
                                {product.model_3d_url && product.model_3d_status === 'ready' ? (
                                    <ProductModelViewer modelUrl={product.model_3d_url} productTitle={product.title} />
                                ) : (
                                    <p className="text-white/50">3D model not available yet.</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
