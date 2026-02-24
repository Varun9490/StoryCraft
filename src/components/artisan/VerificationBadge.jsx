export default function VerificationBadge({ type }) {
    if (!type || type === 'none') return null;

    const isGovt = type === 'government';
    const label = isGovt ? 'Govt. Verified' : 'Platform Verified';
    const color = isGovt ? '#D4A853' : '#52B788';

    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
            style={{
                background: `${color}15`,
                borderColor: `${color}40`,
                color,
            }}
        >
            {isGovt ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            {label}
        </span>
    );
}
