'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import CustomizationRequestForm from '@/components/customize/CustomizationRequestForm';

function resolveImageUrl(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || img.secure_url || '';
}

export default function CustomizationStudioPage({ params }) {
    const { productId } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (!authLoading && user?.role !== 'buyer') {
            router.push(`/shop/${productId}`);
        }
    }, [user, authLoading]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success) {
                    if (!data.data.product.is_customizable) {
                        router.push(`/shop/${productId}`);
                        return;
                    }
                    setProduct(data.data.product);
                }
            } catch (err) {
                console.error('Failed to load product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleSubmit = async ({ description, referenceImageUrl }) => {
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    artisanId: product.artisan?._id || product.artisan,
                    productId,
                    initialMessage: description,
                    messageType: 'customization_request',
                    referenceImageUrl,
                    customizationDescription: description,
                }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/chat/${data.data.chat._id}`);
            }
        } catch (err) {
            console.error('Failed to create chat:', err);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-8 w-2/3 bg-white/5 rounded animate-pulse" />
                        <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <p className="text-white/40 text-sm">Product not found or not customizable</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto px-4 py-12"
        >
            <h1
                className="text-2xl font-bold text-white/90 mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                Customization Studio
            </h1>
            <p className="text-sm text-white/40 mb-8">
                Send your request to the artisan. They'll generate an AI preview for your approval before you confirm the order.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left — product */}
                <div className="space-y-4">
                    {product.images?.[0] && (
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08]">
                            <img
                                src={resolveImageUrl(product.images[0])}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-white/80">{product.title}</h2>
                        <p className="text-sm text-white/40 mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Right — form */}
                <div>
                    <CustomizationRequestForm
                        chatId={null}
                        productId={productId}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </motion.div>
    );
}
