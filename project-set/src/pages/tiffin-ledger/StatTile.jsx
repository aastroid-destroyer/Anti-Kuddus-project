// A single headline-number tile. Reused for "Total Extorted" and "Food Items
// Stolen" so both share one visual rhythm instead of two hand-tuned cards.
const StatTile = ({ icon: Icon, label, value, suffix, sublabel, loading, delay = 0 }) => (
    <div
        className="rise rounded-card border border-border bg-surface p-6"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
                <Icon aria-hidden="true" size={18} weight="bold" />
            </span>
            <p className="text-sm font-medium text-muted">{label}</p>
        </div>

        {loading ? (
            <div
                className="mt-3 h-10 w-28 animate-pulse rounded-control bg-border/60"
                aria-hidden="true"
            />
        ) : (
            <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums text-ink">
                {value}
                {suffix && <span className="ml-1.5 text-lg font-medium text-muted">{suffix}</span>}
            </p>
        )}

        <p className="mt-1.5 text-sm text-muted">{sublabel}</p>
    </div>
);

export default StatTile;
