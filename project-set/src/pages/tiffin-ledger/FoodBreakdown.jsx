import { Basket, Trophy } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from './easeOut';

// "His most-stolen tiffins": a ranked leaderboard with a proportional bar per
// row (relative to the most-stolen item) so the eye reads magnitude, not just
// the raw count. Bars animate via scaleX, never the width property.
const FoodBreakdown = ({ items, loading, delay = 0 }) => {
    const reduce = useReducedMotion();

    if (loading) {
        return (
            <div className="mt-10" aria-busy="true">
                <div className="mb-4 h-6 w-48 animate-pulse rounded-control bg-border/60" />
                <div className="h-40 animate-pulse rounded-card border border-border bg-surface" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <section
                className="rise mt-10 rounded-card border border-dashed border-border bg-surface/60 px-6 py-10 text-center"
                style={{ animationDelay: `${delay}ms` }}
            >
                <Basket aria-hidden="true" size={28} weight="duotone" className="mx-auto text-muted" />
                <p className="mt-3 text-sm font-medium text-ink">No tiffins logged yet</p>
                <p className="mt-1 text-sm text-muted">
                    Once someone logs a stolen item, the leaderboard shows up here.
                </p>
            </section>
        );
    }

    const maxCount = Math.max(...items.map((food) => food.count));

    return (
        <section className="rise mt-10" style={{ animationDelay: `${delay}ms` }}>
            <div className="mb-4 flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
                    <Trophy aria-hidden="true" size={18} weight="bold" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-ink">His most-stolen tiffins</h2>
            </div>

            <ul className="overflow-hidden rounded-card border border-border bg-surface">
                {items.map((food, index) => (
                    <motion.li
                        layout
                        key={food.item}
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT, delay: reduce ? 0 : index * 0.04 }}
                        className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
                    >
                        <span className="w-4 shrink-0 text-right text-xs font-semibold tabular-nums text-muted">
                            {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate font-medium text-ink">{food.item}</span>
                                <span className="shrink-0 text-sm font-semibold tabular-nums text-muted">
                                    ×{food.count}
                                </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg">
                                <motion.div
                                    className="h-full rounded-full bg-accent"
                                    style={{ transformOrigin: 'left' }}
                                    initial={reduce ? false : { scaleX: 0 }}
                                    animate={{ scaleX: food.count / maxCount }}
                                    transition={{
                                        duration: reduce ? 0.2 : 0.5,
                                        ease: EASE_OUT,
                                        delay: reduce ? 0 : 0.1 + index * 0.04,
                                    }}
                                />
                            </div>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </section>
    );
};

export default FoodBreakdown;
