import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CircleNotch, MagicWand, Sparkle, WarningCircle } from '@phosphor-icons/react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Marquee from '../../components/Marquee';
import StudyTips from './StudyTips';
import TopicResults from './TopicResults';

// Mirrors --ease-out in index.css so the Framer Motion touches on this page
// share the same rhythm as the CSS transitions used everywhere else.
const EASE_OUT = [0.23, 1, 0.32, 1];

// Short, scannable study reminders for the ribbon between the banner and the
// tips list below. Content-specific to this page, so it stays colocated
// rather than living in the shared Marquee component.
const studyPhrases = [
    'Active recall beats rereading',
    'Space it out, do not cram',
    'Solve past papers first',
    'Teach it to remember it',
    'One topic at a time',
    'Sleep counts as revision',
];

// Same input styling the other forms use, so this page reads as one system.
const fieldClass =
    'w-full rounded-control border border-border bg-bg px-3 py-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const SyllabusNegotiator = () => {
    const axiosSecure = useAxiosSecure();
    const reduce = useReducedMotion();

    const [text, setText] = useState('');
    const [items, setItems] = useState([]);
    const [hasResult, setHasResult] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const handleSimplify = async () => {
        if (!text.trim() || loading) return;

        setLoading(true);
        setError('');
        setItems([]);
        setHasResult(false);

        try {
            const { data } = await axiosSecure.post('/summarize', { text });
            setItems(Array.isArray(data.items) ? data.items : []);
            setHasResult(true);
        } catch (err) {
            // 429 = Gemini's rate limit. Show the calm "try again" message
            // instead of a scary technical error.
            if (err.response?.status === 429) {
                setError('The AI is a little busy right now. Try again in a moment.');
            } else {
                setError(
                    err.response?.data?.error ||
                        'Something went wrong while simplifying. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="mx-auto max-w-2xl px-4 pt-16 sm:px-6">
                {/* Banner: the same rotating-ring icon module used on the home
                    hero, so "an AI is working on this" reads consistently
                    across the app. */}
                <header className="rise flex items-start gap-4">
                    <div
                        aria-hidden="true"
                        className="relative grid h-14 w-14 shrink-0 place-items-center rounded-control border border-dashed border-accent/40"
                    >
                        <span className="scan-ring absolute inset-0 rounded-control border-t-2 border-accent" />
                        <MagicWand size={26} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-control border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                            <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                            AI-assisted
                        </span>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                            The Syllabus Negotiator
                        </h1>
                        <p className="mt-2 max-w-prose text-pretty text-muted">
                            Paste Kuddus's chaotic syllabus below. The tool sends it through
                            the AI and hands back a clean list of real exam topics, junk
                            removed.
                        </p>
                    </div>
                </header>
            </section>

            <div className="mt-10">
                <Marquee phrases={studyPhrases} icon={Sparkle} />
            </div>

            <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
                <StudyTips delay={80} />

                <div className="rise mt-10 rounded-card border border-border bg-surface p-6" style={{ animationDelay: '160ms' }}>
                    <label
                        htmlFor="syllabus"
                        className="mb-1.5 block text-sm font-medium text-ink"
                    >
                        Syllabus text
                    </label>
                    <textarea
                        id="syllabus"
                        rows={10}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Paste the full messy syllabus here..."
                        className={fieldClass + ' resize-y'}
                    />

                    <button
                        type="button"
                        onClick={handleSimplify}
                        disabled={loading || !text.trim()}
                        aria-busy={loading}
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-control bg-accent font-medium text-accent-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? (
                            <>
                                <CircleNotch aria-hidden="true" size={18} weight="bold" className="animate-spin" />
                                Simplifying…
                            </>
                        ) : (
                            <>
                                <Sparkle aria-hidden="true" size={18} weight="bold" />
                                Simplify
                            </>
                        )}
                    </button>
                </div>

                {/* Error state — a calm, friendly message. */}
                <AnimatePresence initial={false}>
                    {error && (
                        <motion.div
                            role="alert"
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: EASE_OUT }}
                            className="mt-6 flex items-center gap-2 rounded-card border border-danger bg-danger-bg px-4 py-3 text-sm text-danger"
                        >
                            <WarningCircle aria-hidden="true" size={18} weight="bold" className="shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result state — kept topics vs dropped junk, each with a reason. */}
                {hasResult && <TopicResults items={items} />}
            </section>
        </>
    );
};

export default SyllabusNegotiator;
