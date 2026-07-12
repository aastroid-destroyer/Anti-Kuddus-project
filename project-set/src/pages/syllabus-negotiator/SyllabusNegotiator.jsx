import { useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// Same input styling the other forms use, so this page reads as one system.
const fieldClass =
    'w-full rounded-control border border-border bg-bg px-3 py-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const SyllabusNegotiator = () => {
    const axiosSecure = useAxiosSecure();

    // The raw text the student pastes in.
    const [text, setText] = useState('');
    // Gemini's verdicts: [{ topic, decision: 'keep'|'drop', reason }].
    const [items, setItems] = useState([]);
    // Becomes true once we have a response, so we can show an empty-result note.
    const [hasResult, setHasResult] = useState(false);
    // While a request is in flight, so the button can disable + show a spinner.
    const [loading, setLoading] = useState(false);
    // A friendly, human-readable error message (empty = no error).
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

    // Split Gemini's verdicts into the two groups the UI shows.
    const kept = items.filter((item) => item.decision === 'keep');
    const dropped = items.filter((item) => item.decision === 'drop');

    return (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                The Syllabus Negotiator
            </h1>
            <p className="mt-3 max-w-prose text-muted">
                Paste Kuddus’s chaotic syllabus below. The tool sends it through the
                AI and hands back a clean list of topics.
            </p>

            <div className="mt-8 rounded-card border border-border bg-surface p-6">
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
                    className="mt-4 h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Simplifying…' : 'Simplify'}
                </button>
            </div>

            {/* Error state — a calm, friendly message. */}
            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-card border border-danger bg-danger-bg px-4 py-3 text-sm text-danger"
                >
                    {error}
                </div>
            )}

            {/* Result state — kept topics vs dropped junk, each with a reason. */}
            {hasResult && (
                <div className="mt-8 space-y-8">
                    {/* Empty result: Gemini found nothing at all in the text. */}
                    {items.length === 0 && (
                        <div className="rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
                            <p className="text-sm text-muted">
                                No topics were found in that text. Try pasting more of
                                the syllabus.
                            </p>
                        </div>
                    )}

                    {kept.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-baseline justify-between">
                                <h2 className="text-lg font-semibold tracking-tight text-ink">
                                    Real exam topics
                                </h2>
                                <span className="text-sm tabular-nums text-muted">
                                    {kept.length} kept
                                </span>
                            </div>
                            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
                                {kept.map((item, index) => (
                                    <li key={index} className="px-4 py-3">
                                        <p className="font-medium text-ink">
                                            {item.topic}
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted">
                                            {item.reason}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {dropped.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-baseline justify-between">
                                <h2 className="text-lg font-semibold tracking-tight text-muted">
                                    Mittha Kotha
                                </h2>
                                <span className="text-sm tabular-nums text-muted">
                                    {dropped.length} removed
                                </span>
                            </div>
                            <ul className="divide-y divide-border overflow-hidden rounded-card border border-dashed border-border bg-surface">
                                {dropped.map((item, index) => (
                                    <li key={index} className="px-4 py-3">
                                        <p className="font-medium text-muted line-through">
                                            {item.topic}
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted">
                                            {item.reason}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default SyllabusNegotiator;
