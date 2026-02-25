'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import RazorpayButton from '@/components/payment/RazorpayButton';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const { items, cartTotal, cartCount, dispatch } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [step, setStep] = useState('address'); // 'address' | 'payment'
    const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
    });

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!address.street || !address.city || !address.state || !address.pincode) {
            toast.error('Please fill all required address fields');
            return;
        }

        setLoading(true);
        try {
            // Create order
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((i) => ({
                        productId: i.product._id,
                        quantity: i.quantity,
                    })),
                    delivery_address: address,
                    payment_method: paymentMethod,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setOrderId(data.data.order._id);

            if (paymentMethod === 'cod') {
                dispatch({ type: 'CLEAR_CART' });
                toast.success('Order placed successfully (COD)!');
                router.push(`/orders/${data.data.order._id}`);
            } else {
                setStep('payment');
                toast.success('Address saved! Proceed to payment.');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        dispatch({ type: 'CLEAR_CART' });
        router.push(`/orders/${orderId}`);
    };

    if (items.length === 0 && !orderId) {
        router.push('/cart');
        return null;
    }

    return (
        <main className="min-h-screen bg-[#050505] pt-24">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold text-white/90 mb-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Checkout
                    </h1>
                    <p className="text-sm text-white/40 mb-8">
                        Complete your order to begin your craft story
                    </p>
                </motion.div>

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-10">
                    {['Delivery', 'Payment'].map((label, i) => (
                        <div key={label} className="flex items-center gap-3">
                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${(step === 'address' && i === 0) || (step === 'payment' && i === 1)
                                    ? 'bg-[#C4622D] text-white font-semibold'
                                    : i === 0 && step === 'payment'
                                        ? 'bg-green-500/20 text-green-400 font-medium'
                                        : 'bg-white/5 text-white/25'
                                    }`}
                            >
                                {i === 0 && step === 'payment' ? '✓' : i + 1}. {label}
                            </div>
                            {i < 1 && <div className={`w-12 h-px ${step === 'payment' ? 'bg-green-500' : 'bg-white/10'}`} />}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Form */}
                    <div className="lg:col-span-3">
                        {step === 'address' && (
                            <motion.form
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleAddressSubmit}
                                className="space-y-5"
                            >
                                <h3 className="text-lg font-semibold text-white/80 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    📍 Delivery Address
                                </h3>

                                <div>
                                    <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Street Address *</label>
                                    <textarea
                                        value={address.street}
                                        onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-[#C4622D] focus:outline-none transition-colors resize-none"
                                        placeholder="House/Flat number, Street name..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">City *</label>
                                        <input
                                            type="text"
                                            value={address.city}
                                            onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-[#C4622D] focus:outline-none transition-colors"
                                            placeholder="e.g., Visakhapatnam"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">State *</label>
                                        <input
                                            type="text"
                                            value={address.state}
                                            onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-[#C4622D] focus:outline-none transition-colors"
                                            placeholder="e.g., Andhra Pradesh"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Pincode *</label>
                                        <input
                                            type="text"
                                            value={address.pincode}
                                            onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-[#C4622D] focus:outline-none transition-colors"
                                            placeholder="530001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Landmark</label>
                                        <input
                                            type="text"
                                            value={address.landmark}
                                            onChange={(e) => setAddress((p) => ({ ...p, landmark: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-[#C4622D] focus:outline-none transition-colors"
                                            placeholder="Near..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-white/40 mb-3 uppercase tracking-wider">Payment Method *</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('online')}
                                            className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === 'online' ? 'border-[#C4622D] bg-[#C4622D]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="font-semibold text-sm mb-1 text-white/90">💳 Pay Online</div>
                                            <div className="text-xs text-white/40">Razorpay Secured</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`p-4 rounded-xl border text-left transition-all ${paymentMethod === 'cod' ? 'border-[#C4622D] bg-[#C4622D]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="font-semibold text-sm mb-1 text-white/90">🚚 Cash on Delivery</div>
                                            <div className="text-xs text-white/40">Pay upon arrival</div>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 mt-4 rounded-xl font-semibold text-white transition-all hover:brightness-110 disabled:opacity-30"
                                    style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.3)' }}
                                >
                                    {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD) →' : 'Continue to Payment →'}
                                </button>
                            </motion.form>
                        )}

                        {step === 'payment' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <h3 className="text-lg font-semibold text-white/80 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    💳 Payment
                                </h3>
                                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6">
                                    <div className="text-center">
                                        <p className="text-white/40 text-sm mb-2">Amount to pay</p>
                                        <p className="text-3xl font-bold" style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}>
                                            ₹{cartTotal.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <RazorpayButton
                                        amount={cartTotal}
                                        orderId={orderId}
                                        onSuccess={handlePaymentSuccess}
                                    />
                                    <p className="text-[10px] text-white/20 text-center">
                                        Secured by Razorpay • 256-bit encryption
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-28 p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
                            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                                Order Summary
                            </h3>
                            {items.map((item) => (
                                <div key={item.product._id} className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1A1209] flex-shrink-0">
                                        {item.product.images?.[0]?.url ? (
                                            <Image src={item.product.images[0].url} alt="" fill className="object-cover" sizes="48px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10">🎨</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white/70 truncate">{item.product.title}</p>
                                        <p className="text-[10px] text-white/30">×{item.quantity}</p>
                                    </div>
                                    <span className="text-xs text-white/60">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between text-sm">
                                <span className="text-white/50">Shipping</span>
                                <span className="text-green-400 text-xs">Free</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span className="text-white/80">Total</span>
                                <span style={{ color: '#C4622D' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
