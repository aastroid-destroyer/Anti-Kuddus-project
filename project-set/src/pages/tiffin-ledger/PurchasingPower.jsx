import { ShoppingBagOpen } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from './easeOut';

// What the total loot could have bought, live floor-division against the
// current total. Rows stagger in on mount, cheap and purely decorative.
const PurchasingPower = ({ totalTaka, items, delay = 0 }) => {
    const reduce = useReducedMotion();

    return (
        <div
            className="rise rounded-card border border-border bg-surface p-6"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
                    <ShoppingBagOpen aria-hidden="true" size={18} weight="bold" />
                </span>
                <p className="text-sm font-medium text-muted">
                    What his ৳{totalTaka.toLocaleString()} could buy
                </p>
            </div>

            <ul className="mt-4 divide-y divide-border">
                {items.map((buyable, index) => (
                    <motion.li
                        key={buyable.label}
                        initial={reduce ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT, delay: reduce ? 0 : 0.1 + index * 0.05 }}
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                        <span className="flex items-center gap-2.5 text-ink">
                            <span className="text-lg" aria-hidden="true">
                                {buyable.emoji}
                            </span>
                            {buyable.label}
                        </span>
                        <span className="font-semibold tabular-nums text-ink">
                            {Math.floor(totalTaka / buyable.price).toLocaleString()}
                        </span>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default PurchasingPower;
