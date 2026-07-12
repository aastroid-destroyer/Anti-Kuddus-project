import { Flame } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from './easeOut';

// Kuddus's calorie intake, a growing mascot, and a belly meter (Phase 3's
// showpiece). The mascot uses a spring so it feels "alive" as it grows; the
// meter animates via scaleX (transform-only) rather than the width property.
const CalorieEngine = ({ totalCalories, fullness, mascotScale, mascotFace, delay = 0 }) => {
    const reduce = useReducedMotion();

    return (
        <div
            className="rise rounded-card border border-border bg-surface p-6"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
                    <Flame aria-hidden="true" size={18} weight="bold" />
                </span>
                <p className="text-sm font-medium text-muted">Kuddus Calorie Intake</p>
            </div>

            <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums text-ink">
                {totalCalories.toLocaleString()}{' '}
                <span className="text-lg font-medium text-muted">cal</span>
            </p>
            <p className="mt-1.5 text-sm text-muted">
                Energy burned: <span className="font-semibold text-ink">0</span> (Ludu lifestyle)
            </p>

            {/* transform-origin sits at the feet so he "puffs up" from the ground,
                not the centre. */}
            <div className="mt-6 flex h-28 items-end justify-center overflow-hidden">
                <motion.span
                    role="img"
                    aria-label="Kuddus getting fuller"
                    className="leading-none"
                    style={{ fontSize: '3.5rem', transformOrigin: 'bottom center' }}
                    animate={{ scale: mascotScale }}
                    transition={
                        reduce
                            ? { duration: 0.2, ease: EASE_OUT }
                            : { type: 'spring', duration: 0.6, bounce: 0.25 }
                    }
                >
                    {mascotFace}
                </motion.span>
            </div>

            <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-muted">
                    <span>Belly fullness</span>
                    <span className="tabular-nums">{fullness}%</span>
                </div>
                <div
                    className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-bg"
                    role="progressbar"
                    aria-valuenow={fullness}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Belly fullness toward a 3000-calorie food coma"
                >
                    <motion.div
                        className="h-full rounded-full bg-accent"
                        style={{ transformOrigin: 'left' }}
                        animate={{ scaleX: fullness / 100 }}
                        transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalorieEngine;
