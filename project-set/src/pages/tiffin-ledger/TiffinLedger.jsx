import { useEffect, useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// Mission 4 — The Corrupt Economy & Tiffin Ledger.
// Anonymous log form (payment or food) + a dashboard of what Kuddus extorted.
// Everything this page sends is anonymous: a payment carries no amount (the
// server fixes it at 2 Taka), and food carries only the item name. No name,
// roll, or time ever leaves the browser.

// Same input styling the other forms use, so this page reads as one system.
const fieldClass =
    'w-full rounded-control border border-border bg-bg px-3 py-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

// ── The calorie engine (Phase 3) ─────────────────────────────
// A rough calories-per-item table. Keys are lowercased so lookups are
// case-insensitive; anything not listed falls back to DEFAULT_CALORIES.
// Edit these freely — they're just for the fun "what Kuddus ate" number.
const CALORIES_PER_ITEM = {
    'fried rice': 300,
    sandwich: 250,
    samosa: 260,
    singara: 260,
    biryani: 500,
    burger: 350,
    jhalmuri: 200,
    'chicken fry': 300,
    noodles: 320,
    khichuri: 350,
    roll: 300,
    egg: 80,
    banana: 100,
    cake: 260,
    chips: 150,
};
const DEFAULT_CALORIES = 200;

// How many calories mean a full belly (fills the meter to 100%).
const FOOD_COMA_CALORIES = 3000;

// Look up one food's calories, case-insensitively, with a sane fallback.
const caloriesFor = (name) =>
    CALORIES_PER_ITEM[name.trim().toLowerCase()] ?? DEFAULT_CALORIES;

// ── The money converter (Phase 3) ────────────────────────────
// Hardcoded prices in Taka. We floor-divide the total loot by each price to
// show how many of each Kuddus could have bought. Edit prices/items at will.
const BUYABLE = [
    { emoji: '🫓', label: 'Jhalmuri packets', price: 10 },
    { emoji: '☕', label: 'cups of cha', price: 7 },
    { emoji: '🥟', label: 'singaras', price: 10 },
    { emoji: '🛺', label: 'rickshaw rides', price: 30 },
    { emoji: '⚽', label: 'footballs', price: 800 },
    { emoji: '🏏', label: 'cricket bats', price: 1200 },
];

const TiffinLedger = () => {
    const axiosSecure = useAxiosSecure();

    // 'payment' = 2-Taka washroom toll, 'food' = a stolen tiffin item.
    const [type, setType] = useState('payment');
    // Only used when logging food; ignored for a payment.
    const [item, setItem] = useState('');

    // The aggregates from GET /ledger/stats. Start at zero so the cards render
    // cleanly before the first fetch returns.
    const [stats, setStats] = useState({ totalTaka: 0, totalFoodItems: 0, foodBreakdown: [] });
    const [loadingStats, setLoadingStats] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Pull the latest totals from the backend. Called on load and after every log.
    const loadStats = async () => {
        try {
            const { data } = await axiosSecure.get('/ledger/stats');
            setStats(data);
        } catch {
            setError('Could not load the ledger. Is the server running?');
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        loadStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Derived numbers for the Phase 3 visuals ──────────────────
    // Sum calories across every stolen item (calories × how many times taken).
    const totalCalories = stats.foodBreakdown.reduce(
        (sum, food) => sum + caloriesFor(food.item) * food.count,
        0
    );
    // How full Kuddus's belly is, 0–100%, and how big to draw the mascot.
    const fullness = Math.min(100, Math.round((totalCalories / FOOD_COMA_CALORIES) * 100));
    const mascotScale = 1 + Math.min(totalCalories / FOOD_COMA_CALORIES, 1) * 0.9;
    // A face that gets more stuffed as the calories climb.
    const mascotFace =
        totalCalories === 0 ? '🧍' : totalCalories < 1000 ? '🙂' : totalCalories < 2500 ? '😋' : '🥵';

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        if (type === 'food' && !item.trim()) {
            setError('Type the name of the food he stole.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            // Send only what the entry needs. The server stamps the date and,
            // for a payment, fixes the amount at 2 Taka — we never send either.
            const body =
                type === 'payment' ? { type: 'payment' } : { type: 'food', item: item.trim() };
            await axiosSecure.post('/ledger', body);
            setItem('');
            await loadStats();
        } catch {
            setError('Could not log that. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                The Tiffin Ledger
            </h1>
            <p className="mt-3 max-w-prose text-muted">
                Every time Kuddus charged you 2 Taka for the washroom or swiped your
                tiffin, log it here — anonymously. No name, no roll, no time is stored.
                The numbers below add up his whole corrupt economy.
            </p>

            {/* ── Dashboard: the two headline numbers ─────────────────── */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-border bg-surface p-6">
                    <p className="text-sm font-medium text-muted">Total Extorted</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-ink">
                        ৳{loadingStats ? '—' : stats.totalTaka.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted">from 2-Taka washroom tolls</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-6">
                    <p className="text-sm font-medium text-muted">Food Items Stolen</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-ink">
                        {loadingStats ? '—' : stats.totalFoodItems.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted">tiffins swiped from students</p>
                </div>
            </div>

            {/* ── Showpiece visuals: calorie engine + money converter ─── */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {/* Kuddus's calorie intake, a growing mascot, and a belly meter. */}
                <div className="rounded-card border border-border bg-surface p-6">
                    <p className="text-sm font-medium text-muted">Kuddus Calorie Intake</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums text-ink">
                        {totalCalories.toLocaleString()}{' '}
                        <span className="text-lg font-medium text-muted">cal</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">
                        Energy Burned:{' '}
                        <span className="font-semibold text-ink">0</span> (Ludu lifestyle)
                    </p>

                    {/* The mascot grows with every calorie. transform-origin at the
                        bottom so he "puffs up" from his feet rather than the centre. */}
                    <div className="mt-6 flex h-28 items-end justify-center overflow-hidden">
                        <span
                            role="img"
                            aria-label="Kuddus getting fuller"
                            className="leading-none transition-transform duration-500 ease-[var(--ease-out)] motion-reduce:transition-none"
                            style={{
                                fontSize: '3.5rem',
                                transform: `scale(${mascotScale})`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            {mascotFace}
                        </span>
                    </div>

                    {/* Belly fullness meter — fills toward a 3000-cal food coma. */}
                    <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs text-muted">
                            <span>Belly fullness</span>
                            <span className="tabular-nums">{fullness}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-bg">
                            <div
                                className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none"
                                style={{ width: `${fullness}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* What the total loot could have bought — live floor-division. */}
                <div className="rounded-card border border-border bg-surface p-6">
                    <p className="text-sm font-medium text-muted">
                        What his ৳{stats.totalTaka.toLocaleString()} could buy
                    </p>
                    <ul className="mt-4 space-y-3">
                        {BUYABLE.map((buyable) => (
                            <li
                                key={buyable.label}
                                className="flex items-center justify-between"
                            >
                                <span className="flex items-center gap-2 text-ink">
                                    <span className="text-xl" aria-hidden="true">
                                        {buyable.emoji}
                                    </span>
                                    {buyable.label}
                                </span>
                                <span className="font-semibold tabular-nums text-ink">
                                    {Math.floor(stats.totalTaka / buyable.price).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ── The log form ────────────────────────────────────────── */}
            <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-card border border-border bg-surface p-6"
            >
                <p className="mb-1.5 block text-sm font-medium text-ink">What happened?</p>

                {/* Payment vs food chooser — two radio-style buttons. */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setType('payment')}
                        className={
                            'h-11 rounded-control border text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
                            (type === 'payment'
                                ? 'border-accent bg-accent text-accent-ink'
                                : 'border-border text-ink hover:bg-bg')
                        }
                    >
                        2-Taka washroom toll
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('food')}
                        className={
                            'h-11 rounded-control border text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
                            (type === 'food'
                                ? 'border-accent bg-accent text-accent-ink'
                                : 'border-border text-ink hover:bg-bg')
                        }
                    >
                        Stolen food
                    </button>
                </div>

                {/* The food name only matters when 'food' is chosen. */}
                {type === 'food' && (
                    <div className="mt-4">
                        <label htmlFor="item" className="mb-1.5 block text-sm font-medium text-ink">
                            Which food?
                        </label>
                        <input
                            id="item"
                            type="text"
                            autoComplete="off"
                            value={item}
                            onChange={(event) => setItem(event.target.value)}
                            placeholder="e.g. fried rice, samosa, sandwich"
                            className={fieldClass}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? 'Logging…' : 'Log it anonymously'}
                </button>

                {error && (
                    <p role="alert" className="mt-3 text-sm text-danger">
                        {error}
                    </p>
                )}
            </form>

            {/* ── Food breakdown: what he stole, most-swiped first ────── */}
            {stats.foodBreakdown.length > 0 && (
                <div className="mt-8">
                    <h2 className="mb-3 text-lg font-semibold tracking-tight text-ink">
                        His most-stolen tiffins
                    </h2>
                    <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
                        {stats.foodBreakdown.map((food) => (
                            <li key={food.item} className="flex items-center justify-between px-4 py-3">
                                <span className="font-medium text-ink">{food.item}</span>
                                <span className="text-sm tabular-nums text-muted">
                                    ×{food.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export default TiffinLedger;
