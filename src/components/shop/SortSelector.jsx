'use client';

export default function SortSelector({ value, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-[#C4622D] focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: 'none' }}
        >
            <option value="newest" className="bg-[#0a0a0a]">Newest</option>
            <option value="price_asc" className="bg-[#0a0a0a]">Price: Low → High</option>
            <option value="price_desc" className="bg-[#0a0a0a]">Price: High → Low</option>
            <option value="views" className="bg-[#0a0a0a]">Most Viewed</option>
        </select>
    );
}
