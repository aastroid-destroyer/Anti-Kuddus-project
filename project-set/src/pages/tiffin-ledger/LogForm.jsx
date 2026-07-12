import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Coins, ForkKnife, PaperPlaneTilt, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { EASE_OUT } from './easeOut';

// Same input styling the other forms use, so this page reads as one system.
const fieldClass =
    'w-full rounded-control border border-border bg-bg px-3 py-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const TYPES = [
    { value: 'payment', label: '2-Taka washroom toll', icon: Coins },
    { value: 'food', label: 'Stolen food', icon: ForkKnife },
];

// The anonymous log form: a payment/food segmented control, a conditional
// food-name field, and a submit button with an inline loading/error state.
// The active segment is a shared-layout pill (Framer Motion), so it slides
// between options via transform instead of two colors cutting instantly.
const LogForm = ({ type, onTypeChange, item, onItemChange, onSubmit, submitting, error, delay = 0 }) => {
    const reduce = useReducedMotion();

    return (
        <motion.form
            layout
            onSubmit={onSubmit}
            className="rise rounded-card border border-border bg-surface p-6"
            style={{ animationDelay: `${delay}ms` }}
        >
            <p className="mb-2 block text-sm font-medium text-ink">What happened?</p>

            <div className="relative grid grid-cols-2 gap-1 rounded-control border border-border bg-bg p-1">
                {TYPES.map((option) => {
                    const isActive = type === option.value;
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onTypeChange(option.value)}
                            className={
                                'relative z-10 flex min-h-11 items-center justify-center gap-1.5 text-balance rounded-[7px] px-2 py-2 text-center text-sm font-medium leading-tight outline-none transition-colors duration-150 ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
                                (isActive ? 'text-accent-ink' : 'text-muted hover:text-ink')
                            }
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="ledger-type-pill"
                                    className="absolute inset-0 -z-10 rounded-[7px] bg-accent"
                                    transition={reduce ? { duration: 0.15 } : { type: 'spring', bounce: 0.15, duration: 0.45 }}
                                />
                            )}
                            <Icon aria-hidden="true" size={16} weight="bold" />
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence initial={false}>
                {type === 'food' && (
                    <motion.div
                        layout
                        key="food-field"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="mt-4"
                    >
                        <label htmlFor="item" className="mb-1.5 block text-sm font-medium text-ink">
                            Which food?
                        </label>
                        <input
                            id="item"
                            type="text"
                            autoComplete="off"
                            value={item}
                            onChange={(event) => onItemChange(event.target.value)}
                            placeholder="e.g. fried rice, samosa, sandwich"
                            className={fieldClass}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-control bg-accent text-sm font-semibold text-accent-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
                {submitting ? (
                    <>
                        <CircleNotch aria-hidden="true" size={18} weight="bold" className="animate-spin" />
                        Logging…
                    </>
                ) : (
                    <>
                        <PaperPlaneTilt aria-hidden="true" size={18} weight="bold" />
                        Log it anonymously
                    </>
                )}
            </button>

            <AnimatePresence mode="wait" initial={false}>
                {error && (
                    <motion.p
                        key={error}
                        role="alert"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="mt-3 flex items-center gap-1.5 text-sm text-danger"
                    >
                        <WarningCircle aria-hidden="true" size={16} weight="bold" className="shrink-0" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.form>
    );
};

export default LogForm;
