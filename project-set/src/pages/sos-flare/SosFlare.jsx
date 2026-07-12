import { useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';


const LOCATIONS = ['Library', 'Playground', 'Corridor', 'Classroom', 'Canteen'];

// The button/select share the same control styling as the rest of the app.
const controlClass =
    'w-full rounded-control border border-border bg-bg px-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const SosFlare = () => {
    const axiosSecure = useAxiosSecure();

    const [location, setLocation] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const sendFlare = async () => {
        if (!location || sending) return;
        setError('');
        setSending(true);
        try {
            await axiosSecure.post('/sos', {
                location,
                createdAt: new Date().toISOString(),
            });
            setSent(true);
        } catch {
            setError('Could not send your SOS. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-ink">
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
                        <path
                            d="M5 12.5l4 4 10-10"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
                <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
                    Help is on the way
                </h1>
                <p className="mt-3 text-muted">
                    Your SOS from <span className="font-medium text-ink">{location}</span> has
                    been sent. A captain has been alerted and is responding.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setSent(false);
                        setLocation('');
                    }}
                    className="mt-8 h-11 rounded-control border border-border px-5 font-medium text-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                    Send another
                </button>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
            <h1 className="text-center text-2xl font-semibold tracking-tight text-ink">
                SOS Rescue Flare
            </h1>
            <p className="mt-3 text-center text-muted">
                Pick where you are and tap the button to alert a captain right away.
            </p>

            <div className="mt-10">
                <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-ink">
                    Your location
                </label>
                <select
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className={controlClass + ' h-12'}
                >
                    <option value="" disabled>
                        Select your location
                    </option>
                    {LOCATIONS.map((place) => (
                        <option key={place} value={place}>
                            {place}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mt-6 rounded-control bg-danger-bg px-3 py-2 text-center text-sm text-danger"
                >
                    {error}
                </div>
            )}

            {/* Big, thumb-friendly emergency button. Disabled until a location
                is chosen so a flare always carries a place. */}
            <button
                type="button"
                onClick={sendFlare}
                disabled={!location || sending}
                aria-busy={sending}
                className="mt-8 grid aspect-square w-full place-items-center rounded-full bg-danger text-4xl font-bold uppercase tracking-widest text-white shadow-lg shadow-danger/30 outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
                {sending ? 'Sending...' : 'SOS'}
            </button>
        </section>
    );
};

export default SosFlare;
