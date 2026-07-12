import { useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// Same input styling the other forms use, so this page reads as one system.
const fieldClass =
    'w-full rounded-control border border-border bg-bg px-3 py-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const KuddusFactChecker = () => {
    const axiosSecure = useAxiosSecure();

    // The claim the student typed in.
    const [claim, setClaim] = useState('');
    // Raw backend response: { verdict, confidence, rule, reason }. Phase 1 only.
    const [result, setResult] = useState(null);
    // While a request is in flight, so the button can disable + show feedback.
    const [loading, setLoading] = useState(false);
    // A friendly, human-readable error message (empty = no error).
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!claim.trim() || loading) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const { data } = await axiosSecure.post('/fact-check', { claim });
            setResult(data);
        } catch (err) {
            // 429 = Gemini's rate limit. Show the calm "try again" message
            // instead of a scary technical error.
            if (err.response?.status === 429) {
                setError('The AI is a little busy right now. Try again in a moment.');
            } else {
                setError(
                    err.response?.data?.error ||
                        'Something went wrong while checking that claim. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                The Kuddus Fact-Checker
            </h1>
            <p className="mt-3 max-w-prose text-muted">
                Type something Kuddus claimed. The tool checks it against the real rules
                and hands back a verdict.
            </p>

            <div className="mt-8 rounded-card border border-border bg-surface p-6">
                <label htmlFor="claim" className="mb-1.5 block text-sm font-medium text-ink">
                    Kuddus's claim
                </label>
                <textarea
                    id="claim"
                    rows={4}
                    value={claim}
                    onChange={(event) => setClaim(event.target.value)}
                    placeholder="e.g. Kuddus says late submissions get an automatic zero, no exceptions."
                    className={fieldClass + ' resize-y'}
                />

                <button
                    type="button"
                    onClick={handleCheck}
                    disabled={loading || !claim.trim()}
                    className="mt-4 h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Checking...' : 'Check'}
                </button>
            </div>

            {/* Error state, same calm friendly-message pattern as the other tools. */}
            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-card border border-danger bg-danger-bg px-4 py-3 text-sm text-danger"
                >
                    {error}
                </div>
            )}

            {/* Phase 1: raw response so we can confirm the wiring works end to end.
                Phase 2 replaces this block with the styled verdict card. */}
            {result && (
                <pre className="mt-8 overflow-x-auto rounded-card border border-border bg-surface p-4 text-sm text-ink">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </section>
    );
};

export default KuddusFactChecker;
