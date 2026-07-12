import { useEffect, useState } from 'react';
import { Coins, ForkKnife, Receipt } from '@phosphor-icons/react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import StatTile from './StatTile';
import CalorieEngine from './CalorieEngine';
import PurchasingPower from './PurchasingPower';
import LogForm from './LogForm';
import FoodBreakdown from './FoodBreakdown';

// Mission 4 — The Corrupt Economy & Tiffin Ledger.
// Anonymous log form (payment or food) + a dashboard of what Kuddus extorted.
// Everything this page sends is anonymous: a payment carries no amount (the
// server fixes it at 2 Taka), and food carries only the item name. No name,
// roll, or time ever leaves the browser.

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

const FOOD_COMA_CALORIES = 3000;

const caloriesFor = (name) =>
    CALORIES_PER_ITEM[name.trim().toLowerCase()] ?? DEFAULT_CALORIES;

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
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            {/* ── Header ───────────────────────────────────────────── */}
            <header className="rise flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control border border-border bg-surface text-accent">
                    <Receipt aria-hidden="true" size={20} weight="bold" />
                </span>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                        The Tiffin Ledger
                    </h1>
                    <p className="mt-2 max-w-prose text-pretty text-muted">
                        Every time Kuddus charged you 2 Taka for the washroom or swiped your
                        tiffin, log it here, anonymously. No name, no roll, no time is stored.
                        The numbers below add up his whole corrupt economy.
                    </p>
                </div>
            </header>

            {/* ── Dashboard: the two headline numbers ─────────────────── */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <StatTile
                    icon={Coins}
                    label="Total Extorted"
                    value={`৳${stats.totalTaka.toLocaleString()}`}
                    sublabel="from 2-Taka washroom tolls"
                    loading={loadingStats}
                    delay={0}
                />
                <StatTile
                    icon={ForkKnife}
                    label="Food Items Stolen"
                    value={stats.totalFoodItems.toLocaleString()}
                    sublabel="tiffins swiped from students"
                    loading={loadingStats}
                    delay={80}
                />
            </div>

            {/* ── Showpiece visuals: calorie engine + money converter ─── */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <CalorieEngine
                    totalCalories={totalCalories}
                    fullness={fullness}
                    mascotScale={mascotScale}
                    mascotFace={mascotFace}
                    delay={160}
                />
                <PurchasingPower totalTaka={stats.totalTaka} items={BUYABLE} delay={240} />
            </div>

            {/* ── The log form ────────────────────────────────────────── */}
            <div className="mt-10">
                <LogForm
                    type={type}
                    onTypeChange={setType}
                    item={item}
                    onItemChange={setItem}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    error={error}
                    delay={320}
                />
            </div>

            {/* ── Food breakdown: what he stole, most-swiped first ────── */}
            <FoodBreakdown items={stats.foodBreakdown} loading={loadingStats} delay={0} />
        </section>
    );
};

export default TiffinLedger;
