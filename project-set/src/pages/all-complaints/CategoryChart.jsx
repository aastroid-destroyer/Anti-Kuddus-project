import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Tooltip themed with the same design tokens the rest of the app uses, so it
// swaps light/dark automatically (design.md §8: charts always get a tooltip).
const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { category, count } = payload[0].payload;
    return (
        <div className="rounded-control border border-border bg-surface px-3 py-2 shadow-raised">
            <p className="text-sm font-medium capitalize text-ink">{category}</p>
            <p className="text-xs text-muted">
                {count} {count === 1 ? 'report' : 'reports'}
            </p>
        </div>
    );
};

/**
 * Comparison of how many complaints fall in each category (design.md §8:
 * comparison → bar). Bars carry a value label so meaning never rests on color
 * alone, and the whole SVG is described for screen readers via a text summary.
 */
const CategoryChart = ({ categoryCount }) => {
    const data = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

    if (data.length === 0) return null;

    const summary = data
        .map(({ category, count }) => `${category}: ${count}`)
        .join(', ');

    return (
        <section className="mt-8 rounded-card border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">Complaints by category</h2>
            <p className="mt-1 text-sm text-muted">
                How every filed report breaks down across categories.
            </p>

            <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 16, right: 8, bottom: 0, left: -16 }}
                        role="img"
                        aria-label={`Bar chart of complaints by category. ${summary}.`}
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke="var(--border)"
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            dataKey="category"
                            tick={{ fill: 'var(--muted)', fontSize: 12, textTransform: 'capitalize' }}
                            tickLine={false}
                            axisLine={{ stroke: 'var(--border)' }}
                            interval={0}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: 'var(--muted)', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--border)', fillOpacity: 0.3 }}
                            content={<ChartTooltip />}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
                            {data.map((entry) => (
                                <Cell key={entry.category} fill="var(--accent)" />
                            ))}
                            <LabelList
                                dataKey="count"
                                position="top"
                                fill="var(--ink)"
                                fontSize={12}
                                fontWeight={600}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Accessible text summary — the data without needing the chart. */}
            <p className="sr-only">Complaints by category: {summary}.</p>
        </section>
    );
};

export default CategoryChart;
