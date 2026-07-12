import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, MagnifyingGlass, XCircle } from '@phosphor-icons/react';

// Mirrors --ease-out in index.css so this reveal shares the same rhythm as
// the CSS transitions used elsewhere on the page.
const EASE_OUT = [0.23, 1, 0.32, 1];

// Kept topics vs. dropped junk, each with the AI's reason. Extracted from the
// page component so SyllabusNegotiator stays focused on the fetch/orchestration
// concern, matching how the tiffin ledger splits its result views out too.
const TopicResults = ({ items }) => {
    const reduce = useReducedMotion();

    const kept = items.filter((item) => item.decision === 'keep');
    const dropped = items.filter((item) => item.decision === 'drop');

    return (
        <div className="mt-8 space-y-8">
            {/* Empty result: Gemini found nothing at all in the text. */}
            {items.length === 0 && (
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="rounded-card border border-dashed border-border bg-surface/60 px-6 py-10 text-center"
                >
                    <MagnifyingGlass aria-hidden="true" size={28} weight="duotone" className="mx-auto text-muted" />
                    <p className="mt-3 text-sm font-medium text-ink">No topics were found</p>
                    <p className="mt-1 text-sm text-muted">
                        Try pasting more of the syllabus.
                    </p>
                </motion.div>
            )}

            {kept.length > 0 && (
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                    <div className="mb-3 flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
                            <CheckCircle aria-hidden="true" size={18} weight="bold" />
                        </span>
                        <h2 className="flex-1 text-lg font-semibold tracking-tight text-ink">
                            Real exam topics
                        </h2>
                        <span className="text-sm tabular-nums text-muted">
                            {kept.length} kept
                        </span>
                    </div>
                    <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
                        {kept.map((item, index) => (
                            <motion.li
                                key={`${item.topic}-${index}`}
                                initial={reduce ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: EASE_OUT, delay: reduce ? 0 : index * 0.04 }}
                                className="px-4 py-3"
                            >
                                <p className="font-medium text-ink">{item.topic}</p>
                                <p className="mt-0.5 text-sm text-muted">{item.reason}</p>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {dropped.length > 0 && (
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT, delay: reduce ? 0 : 0.06 }}
                >
                    <div className="mb-3 flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-bg text-muted">
                            <XCircle aria-hidden="true" size={18} weight="bold" />
                        </span>
                        <h2 className="flex-1 text-lg font-semibold tracking-tight text-muted">
                            Mittha Kotha
                        </h2>
                        <span className="text-sm tabular-nums text-muted">
                            {dropped.length} removed
                        </span>
                    </div>
                    <ul className="divide-y divide-border overflow-hidden rounded-card border border-dashed border-border bg-surface">
                        {dropped.map((item, index) => (
                            <motion.li
                                key={`${item.topic}-${index}`}
                                initial={reduce ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: EASE_OUT, delay: reduce ? 0 : index * 0.04 }}
                                className="px-4 py-3"
                            >
                                <p className="font-medium text-muted line-through">{item.topic}</p>
                                <p className="mt-0.5 text-sm text-muted">{item.reason}</p>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </div>
    );
};

export default TopicResults;
