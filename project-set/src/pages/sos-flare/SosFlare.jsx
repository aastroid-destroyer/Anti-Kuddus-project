import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const LOCATIONS = ['Library', 'Playground', 'Corridor', 'Classroom', 'Canteen'];

const controlClass =
    'w-full rounded-control border border-border bg-bg px-4 text-ink ' +
    'transition-colors duration-200 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
    'hover:border-ink/20';

const easeOut = [0.25, 0.1, 0.25, 1];

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
            <div className="flex min-h-[80vh] items-center justify-center px-4 sm:px-6">
                <section className="mx-auto flex max-w-sm flex-col items-center px-8 py-12 text-center sm:px-10">
                    <motion.span
                        className="grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-ink"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
                            <path
                                d="M5 12.5l4 4 10-10"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </motion.span>
                    <motion.h1
                        className="mt-8 text-2xl font-semibold tracking-tight text-ink"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: easeOut, delay: 0.15 }}
                    >
                        Help is on the way
                    </motion.h1>
                    <motion.p
                        className="mt-3 text-[15px] leading-relaxed text-muted"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: easeOut, delay: 0.2 }}
                    >
                        Your SOS from{' '}
                        <span className="font-medium text-ink">{location}</span> has
                        been sent. A captain has been alerted and is responding.
                    </motion.p>
                    <motion.button
                        type="button"
                        onClick={() => {
                            setSent(false);
                            setLocation('');
                        }}
                        className="mt-10 h-11 rounded-control border border-border px-6 font-medium text-ink outline-none transition-colors duration-200 ease-[var(--ease-out)] hover:bg-surface hover:border-ink/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: easeOut, delay: 0.25 }}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Send another
                    </motion.button>
                </section>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 sm:px-6">
            <section className="mx-auto w-full max-w-sm">
                <motion.div
                    className="rounded-2xl border border-border bg-bg p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-200 ease-[var(--ease-out)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.08)]"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                    whileHover={{ y: -3, transition: { duration: 0.2, ease: easeOut } }}
                >
                    <motion.h1
                        className="text-center text-[22px] font-semibold leading-tight tracking-tight text-ink"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: easeOut }}
                    >
                        SOS Rescue Flare
                    </motion.h1>
                    <motion.p
                        className="mt-2 text-center text-[15px] leading-relaxed text-muted"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: easeOut, delay: 0.05 }}
                    >
                        Pick where you are and tap the button to alert a captain right away.
                    </motion.p>

                    <div className="mt-8">
                        <motion.label
                            htmlFor="location"
                            className="mb-2 block text-sm font-medium text-ink"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: easeOut, delay: 0.08 }}
                        >
                            Your location
                        </motion.label>
                        <motion.select
                            id="location"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            className={controlClass + ' h-12'}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: easeOut, delay: 0.1 }}
                        >
                            <option value="" disabled>
                                Select your location
                            </option>
                            {LOCATIONS.map((place) => (
                                <option key={place} value={place}>
                                    {place}
                                </option>
                            ))}
                        </motion.select>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                role="alert"
                                className="mt-5 rounded-control bg-danger-bg px-4 py-3 text-center text-sm leading-snug text-danger"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2, ease: easeOut }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        className="mt-8 flex justify-center"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: easeOut, delay: 0.15 }}
                    >
                        <button
                            type="button"
                            onClick={sendFlare}
                            disabled={!location || sending}
                            aria-busy={sending}
                            className="grid aspect-square w-[180px] place-items-center rounded-full bg-danger text-3xl font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-danger/25 outline-none transition-all duration-200 ease-[var(--ease-out)] hover:shadow-xl hover:shadow-danger/30 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-40 disabled:saturate-0"
                        >
                            {sending ? 'Sending...' : 'SOS'}
                        </button>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default SosFlare;