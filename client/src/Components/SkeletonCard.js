import "./SkeletonCard.css";

/**
 * SkeletonCard - animated placeholder card displayed while notes are loading.
 * Accessible: uses role="status" and aria-label so screen readers announce loading state.
 */
export default function SkeletonCard() {
    return (
        <div className="skeleton-card" role="status" aria-label="Loading note">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-body" />
            <div className="skeleton-line skeleton-body short" />
            <div className="skeleton-actions">
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
            </div>
            {/* Hidden text for screen readers */}
            <span className="sr-only">Loading note content, please wait…</span>
        </div>
    );
}
