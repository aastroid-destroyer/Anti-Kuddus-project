import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import CategoryChart from './CategoryChart';

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

    // Sort newest first (matches the "newest first" copy in the header)
    const sortedComplaints = useMemo(() => {
        return [...complaints].sort((a, b) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
        });
    }, [complaints]);

    // Group complaints by category, sorted by frequency so the sidebar
    // reads as a ranked breakdown rather than an arbitrary list
    const categoryBreakdown = useMemo(() => {
        const counts = complaints.reduce((acc, complaint) => {
            acc[complaint.category] = (acc[complaint.category] || 0) + 1;
            return acc;
        }, {});
        const max = Math.max(1, ...Object.values(counts));
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => ({
                category,
                count,
                percent: Math.round((count / max) * 100),
            }));
    }, [complaints]);

    const categoryCount = categoryBreakdown.reduce((acc, { category, count }) => {
        acc[category] = count;
        return acc;
    }, {});

    return (
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <header className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    All complaints
                </h1>
                <p className="mt-2 max-w-prose text-sm text-muted">
                    Every report filed so far, newest first.
                </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Side Banner */}
                <aside className="h-fit rounded-card border border-border bg-surface p-6 lg:sticky lg:top-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                        Category breakdown
                    </h2>

                    <div className="mt-5 space-y-4">
                        {categoryBreakdown.length > 0 ? (
                            categoryBreakdown.map(({ category, count, percent }) => (
                                <div key={category}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium capitalize text-ink">
                                            {category}
                                        </span>
                                        <span className="tabular-nums text-muted">{count}</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                                        <div
                                            className="h-full rounded-full bg-blue-600"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted">No complaints yet.</p>
                        )}
                    </div>

                    <div className="mt-6 flex items-baseline justify-between border-t border-border pt-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted">
                            Total reports
                        </p>
                        <p className="text-2xl font-bold tabular-nums text-ink">
                            {complaints.length}
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <section className="lg:col-span-3">
                    {isPending && (
                        <div className="space-y-3" aria-busy="true">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-20 animate-pulse rounded-card border border-border bg-surface"
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-card border border-border bg-surface p-6"
                        >
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            <div>
                                <p className="text-sm font-medium text-ink">
                                    Could not load complaints
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    Something went wrong while fetching reports. Try again.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => refetch()}
                                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-control border border-border px-3 text-sm font-medium text-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] hover:bg-zinc-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {!isPending && !isError && complaints.length === 0 && (
                        <div className="flex flex-col items-center rounded-card border border-dashed border-border bg-surface p-12 text-center">
                            <Inbox className="h-8 w-8 text-muted" />
                            <p className="mt-3 text-sm font-medium text-ink">
                                No complaints have been filed yet
                            </p>
                            <p className="mt-1 text-sm text-muted">
                                Once a report is submitted it will appear here.
                            </p>
                        </div>
                    )}

                    {!isPending && !isError && sortedComplaints.length > 0 && (
                        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
                            {sortedComplaints.map((complaint) => (
                                <li
                                    key={complaint._id}
                                    className="p-5 transition-colors duration-150 hover:bg-zinc-50/60"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm font-semibold leading-snug text-ink">
                                            {complaint.subject}
                                        </p>
                                        <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 ring-1 ring-inset ring-blue-100">
                                            {complaint.category}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                                        {complaint.details}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {!isPending && !isError && complaints.length > 0 && (
                        <div className="mt-8">
                            <CategoryChart categoryCount={categoryCount} />
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AllComplaints;