'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductFeedback({ productId, initialFeedback = [], user }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Only show approved feedback
    const approvedFeedback = initialFeedback.filter(f => f.approved);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to leave feedback');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${productId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment, name: user.name })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Feedback submitted! It will appear once approved by the artisan.');
                setComment('');
                setRating(5);
            } else {
                toast.error(data.error || 'Failed to submit feedback');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border-t border-white/10 pt-8 mt-12 w-full">
            <h3 className="text-2xl font-bold text-white/90 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                Customer Feedback
            </h3>

            {/* Approved Feedback List */}
            <div className="space-y-4 mb-10">
                {approvedFeedback.length === 0 ? (
                    <p className="text-white/40 text-sm italic">No feedback yet. Be the first to review!</p>
                ) : (
                    approvedFeedback.map((f, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white/80">{f.name}</span>
                                <div className="flex text-[#E8A838] text-sm">
                                    {'★'.repeat(f.rating) + '☆'.repeat(5 - f.rating)}
                                </div>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed">{f.comment}</p>
                            <span className="text-[10px] text-white/30 mt-3 block">
                                {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Feedback Form */}
            <div className="p-6 rounded-2xl bg-[#C4622D]/10 border border-[#C4622D]/20">
                <h4 className="text-lg font-semibold text-white/90 mb-4">Leave your feedback</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-white/60 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl transition-all ${star <= rating ? 'text-[#E8A838] scale-110' : 'text-white/20 hover:text-white/40'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-white/60 mb-2">Your Experience</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={3}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-[#C4622D] transition-all resize-none"
                            placeholder="Tell us about the craftsmanship and your experience..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="self-end px-6 py-2.5 rounded-xl bg-[#C4622D] text-white font-medium hover:brightness-110 transition-all text-sm disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
}
