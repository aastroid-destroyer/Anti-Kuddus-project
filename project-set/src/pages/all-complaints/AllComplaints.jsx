import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// All filed complaints, pulled from GET /complaints via TanStack Query. No card
// treatment yet — the collection is grouped with a divide, just enough to read
// the raw data while the final presentation is still being decided.
const AllComplaints = () => {
    const axiosSecure = useAxiosSecure();

    const {
        data: complaints = [],
        isPending,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['complaints'],
        queryFn: async () => {
            const res = await axiosSecure.get('/complaints');
            return Array.isArray(res.data) ? res.data : [];
        },
    });

    return (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                All complaints
            </h1>
            <p className="mt-3 max-w-prose text-muted">
                Every report filed so far, newest first.
            </p>

            <div className="mt-8">
                {isPending && (
                    <div className="space-y-3" aria-busy="true">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-16 rounded-control bg-surface"
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                )}

                {isError && (
                    <div
                        role="alert"
                        className="rounded-card border border-border bg-surface p-6"
                    >
                        <p className="text-sm text-ink">Could not load complaints.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="mt-3 h-9 rounded-control border border-border px-3 text-sm font-medium text-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!isPending && !isError && complaints.length === 0 && (
                    <div className="rounded-card border border-border bg-surface p-6">
                        <p className="text-sm text-ink">No complaints have been filed yet.</p>
                        <p className="mt-1 text-sm text-muted">
                            Once a report is submitted it will appear here.
                        </p>
                    </div>
                )}

                {!isPending && !isError && complaints.length > 0 && (
                    <ul className="divide-y divide-border rounded-card border border-border bg-surface">
                        {complaints.map((complaint) => (
                            <li key={complaint._id} className="p-4">
                                <p className="text-sm font-semibold text-ink">
                                    {complaint.subject}
                                </p>
                                <p className="mt-1 text-sm text-muted">{complaint.details}</p>
                                <p className="mt-2 text-xs text-muted">
                                    {complaint.category}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default AllComplaints;
