'use client';

export default function ActiveFilters({ searchParams, onRemove }) {
    const filters = [];
    if (searchParams.get('city')) filters.push({ key: 'city', label: searchParams.get('city') });
    if (searchParams.get('category')) filters.push({ key: 'category', label: searchParams.get('category').replace('_', ' ') });
    if (searchParams.get('minPrice')) filters.push({ key: 'minPrice', label: `Min ₹${searchParams.get('minPrice')}` });
    if (searchParams.get('maxPrice')) filters.push({ key: 'maxPrice', label: `Max ₹${searchParams.get('maxPrice')}` });
    if (searchParams.get('search')) filters.push({ key: 'search', label: `"${searchParams.get('search')}"` });

    if (filters.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
                <button
                    key={f.key}
                    onClick={() => onRemove(f.key)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                    {f.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
