import { useCallback, useEffect, useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// How often we re-fetch the active list while there are no real-time updates.
const POLL_INTERVAL = 3000;

const CaptainDashboard = () => {
    const axiosSecure = useAxiosSecure();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true); // first load only
    const [accessDenied, setAccessDenied] = useState(false); // backend said 403
    const [error, setError] = useState('');
    const [resolvingId, setResolvingId] = useState(null);

    // ─────────────────────────────────────────────────────────────
    // THE single source of truth for "get active SOS and update the list".
    // Polling calls it now (see the effect below). LATER, to go real-time,
    // replace ONLY the trigger — e.g. socket.on('sos:update', fetchActiveSOS)
    // — and leave this function exactly as-is.
    // ─────────────────────────────────────────────────────────────
    const fetchActiveSOS = useCallback(async () => {
        try {
            const res = await axiosSecure.get('/sos/active');
            setAlerts(res.data);
            setError('');
            setAccessDenied(false);
        } catch (err) {
            // 403 = the backend (the real access boundary) says this user is
            // not a captain. We just reflect that; we never decide it here.
            if (err.response?.status === 403) {
                setAccessDenied(true);
            } else {
                setError('Could not load active alerts. Retrying...');
            }
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // Polling trigger. Fires once immediately, then every POLL_INTERVAL.
    // Stops entirely once access is denied so we don't hammer a 403.
    useEffect(() => {
        if (accessDenied) return;

        fetchActiveSOS();
        const id = setInterval(fetchActiveSOS, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchActiveSOS, accessDenied]);

    // Mark one alert resolved, then immediately refresh via the same function.
    const resolveSOS = async (id) => {
        setResolvingId(id);
        setError('');
        try {
            await axiosSecure.patch(`/sos/${id}/resolve`);
            await fetchActiveSOS();
        } catch {
            setError('Could not resolve that alert. Please try again.');
        } finally {
            setResolvingId(null);
        }
    };

    // Non-captain view: the backend returned 403, so there is simply no data.
    if (accessDenied) {
        return (
            <section className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Captains only</h1>
                <p className="mt-3 text-muted">
                    This dashboard is available to class captains. Your account does not have
                    access, so there is nothing to show here.
                </p>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Active SOS alerts</h1>
                {/* Live-ish indicator: reminds the captain the list auto-refreshes. */}
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    Live
                </span>
            </div>
            <p className="mt-2 text-muted">
                Alerts refresh automatically every few seconds. Resolve one once help has reached them.
            </p>

            {error && (
                <div role="alert" className="mt-6 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="mt-10 text-center text-muted">Loading alerts...</p>
            ) : alerts.length === 0 ? (
                <div className="mt-10 rounded-card border border-border bg-surface p-10 text-center">
                    <p className="font-medium text-ink">All clear</p>
                    <p className="mt-1 text-sm text-muted">No active SOS alerts right now.</p>
                </div>
            ) : (
                <ul className="mt-8 space-y-3">
                    {alerts.map((alert) => (
                        <li
                            key={alert._id}
                            className="flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-4"
                        >
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 font-semibold text-ink">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-danger" aria-hidden="true" />
                                    {alert.location}
                                </p>
                                <p className="mt-1 text-sm text-muted">Reported {alert.date}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => resolveSOS(alert._id)}
                                disabled={resolvingId === alert._id}
                                className="h-10 shrink-0 rounded-control bg-accent px-4 text-sm font-medium text-accent-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {resolvingId === alert._id ? 'Resolving...' : 'Resolve'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default CaptainDashboard;
