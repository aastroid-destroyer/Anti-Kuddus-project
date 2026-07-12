import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
    ArrowRight,
    ArrowsDownUp,
    Check,
    ListNumbers,
    Ruler,
    Star,
    Trash,
    X,
} from '@phosphor-icons/react';

// Sensible bounds for a student's height, kept as named constants so the
// validation rule is not a magic number buried in the form.
const MIN_HEIGHT_CM = 90;
const MAX_HEIGHT_CM = 230;

// Shared motion curve, mirroring --ease-out from index.css so JS-driven
// motion shares the same rhythm as the CSS transitions elsewhere.
const EASE_OUT = [0.23, 1, 0.32, 1];

// How long the toast stays before it slides away on its own.
const TOAST_DURATION = 5000;

// Premium confirmation toast. Slides in from the corner, counts down with a
// thin progress bar, and can be dismissed early. Purely presentational —
// the parent controls when it mounts and unmounts (via AnimatePresence).
const Toast = ({ name, onDismiss }) => {
    const reduce = useReducedMotion();

    useEffect(() => {
        // Auto-dismiss: the parent unmounts us, AnimatePresence plays the exit.
        const timer = setTimeout(onDismiss, TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 sm:justify-end sm:pr-6">
            <motion.div
                role="status"
                aria-live="polite"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-card border border-border bg-surface shadow-menu"
            >
                <div className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                        <Check size={16} weight="bold" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">Student added</p>
                        <p className="mt-0.5 truncate text-sm text-muted">
                            {name} is on the roster and ready to seat.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onDismiss}
                        aria-label="Dismiss notification"
                        className="-mr-1 -mt-1 rounded-control p-1 text-muted transition-colors duration-150 ease-[var(--ease-out)] outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                        <X size={16} weight="bold" aria-hidden="true" />
                    </button>
                </div>
                {/* Countdown bar: scaleX from full to empty over the toast's lifetime.
                    Transform-only so it stays on the compositor. */}
                <div className="h-0.5 bg-border">
                    <motion.div
                        className="h-full origin-left bg-accent"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

// Shared with the rest of the app's forms so this reads as one system
// (same shape as Login / Register / MakeComplaint).
const inputClass =
    'w-full rounded-control border border-border bg-bg px-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

// How the planner reasons about seating. Each point restates a rule the roster
// actually follows, so the strip beside the form informs rather than decorates.
const ASSURANCES = [
    {
        icon: Ruler,
        text: 'Heights are captured up front so rows can rise from front to back.',
    },
    {
        icon: Star,
        text: 'Anyone flagged for the front row keeps that seat regardless of height.',
    },
    {
        icon: ListNumbers,
        text: 'Roll numbers stay unique, so no student is added to the class twice.',
    },
    {
        icon: ArrowsDownUp,
        text: 'The roster lives here as you build it — arrange the seats once it is complete.',
    },
];

// One pass of the assurance cards. Rendered twice inside the marquee track so
// the second copy backfills the top as the first scrolls down, keeping the loop
// seamless. The card styling matches the surface/border system elsewhere.
const AssuranceStack = () => (
    <>
        {ASSURANCES.map(({ icon: Icon, text }) => (
            <div
                key={text}
                className="flex items-start gap-3 rounded-card border border-border bg-surface p-4"
            >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent/10 text-accent">
                    <Icon size={20} weight="fill" aria-hidden="true" />
                </span>
                <p className="text-sm text-muted">{text}</p>
            </div>
        ))}
    </>
);

const SeatPlanner = () => {
    const reduce = useReducedMotion();

    // The single source of truth for Phase A: every student the teacher adds.
    // Later phases will read from this same array, no backend involved.
    const [students, setStudents] = useState([]);

    // Bumping the key remounts the toast so a fresh submit always re-plays the
    // enter animation, even if one is still on screen.
    const [toastKey, setToastKey] = useState(0);
    const [toastName, setToastName] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    const dismissToast = useCallback(() => setToastVisible(false), []);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        setFocus,
        formState: { errors },
    } = useForm({
        defaultValues: { name: '', roll: '', height: '', isSpecial: false },
    });

    // Add one student to state. Roll is treated as the identifier, so a
    // duplicate roll is rejected inline rather than silently added.
    const onSubmit = (values) => {
        const roll = values.roll.trim();
        const alreadyUsed = students.some((student) => student.roll === roll);
        if (alreadyUsed) {
            setError('roll', { message: 'That roll is already on the list.' });
            setFocus('roll');
            return;
        }

        const name = values.name.trim();
        setStudents((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
                name,
                roll,
                height: Number(values.height),
                isSpecial: values.isSpecial,
            },
        ]);
        reset();
        setFocus('name');
        setToastName(name);
        setToastKey((key) => key + 1);
        setToastVisible(true);
    };

    // Drop one student by id (stable key, so removal never hits the wrong row).
    const removeStudent = (id) => {
        setStudents((current) => current.filter((student) => student.id !== id));
    };

    // Entrance choreography: a gentle stagger that reveals content already
    // present in the markup (never gates visibility on it).
    const container = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduce ? 0 : 0.06,
                delayChildren: reduce ? 0 : 0.04,
            },
        },
    };
    const item = reduce
        ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
        : {
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
          };

    return (
        <section className="relative mx-auto grid max-w-6xl gap-12 overflow-x-clip px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
            <AnimatePresence>
                {toastVisible && <Toast key={toastKey} name={toastName} onDismiss={dismissToast} />}
            </AnimatePresence>

            {/* Editorial intro column. Sticks alongside the form on wide screens. */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative lg:sticky lg:top-24 lg:self-start"
            >
                {/* Oversized ghost word, an editorial nod. Decorative only. */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 -left-1 -z-10 select-none text-[24vw] leading-[0.8] font-bold tracking-tighter text-ink/4 lg:-top-16 lg:text-[13rem]"
                >
                    Seat will be sorted automatically
                </span>

                <motion.p
                    variants={item}
                    className="text-xs font-semibold tracking-[0.22em] text-muted uppercase"
                >
                    Class roster
                </motion.p>
                <motion.h1
                    variants={item}
                    className="mt-4 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl"
                >
                    Seat planner
                </motion.h1>
                <motion.p variants={item} className="mt-5 max-w-md text-pretty text-muted">
                    Add every student in the class with their height. The seating arrangement comes
                    later — first build the roster.
                </motion.p>

                <motion.div variants={item} className="mt-8 max-w-md">
                    {/* Vertical marquee of assurances. The moving stack is decorative
                        (aria-hidden); the sr-only list carries the same points once for
                        assistive tech. Fades top and bottom so cards drift in and out. */}
                    <div
                        className="marquee-vert relative h-64 overflow-hidden"
                        style={{
                            maskImage:
                                'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)',
                            WebkitMaskImage:
                                'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)',
                        }}
                    >
                        <div aria-hidden="true" className="marquee-vert-track flex flex-col gap-3">
                            <AssuranceStack />
                            <AssuranceStack />
                        </div>
                    </div>

                    <ul className="sr-only">
                        {ASSURANCES.map((assurance) => (
                            <li key={assurance.text}>{assurance.text}</li>
                        ))}
                    </ul>
                </motion.div>
            </motion.div>

            {/* Form + roster column. */}
            <motion.div variants={container} initial="hidden" animate="show">
                <motion.form
                    variants={item}
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-card border border-border bg-surface p-6 shadow-raised sm:p-8"
                >
                    <div className="mb-5">
                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="off"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            className={inputClass + ' h-11'}
                            {...register('name', { required: 'Enter the student’s name.' })}
                        />
                        {errors.name && (
                            <p id="name-error" role="alert" className="mt-1.5 text-sm text-danger">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="roll" className="mb-1.5 block text-sm font-medium text-ink">
                                Roll
                            </label>
                            <input
                                id="roll"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                aria-invalid={!!errors.roll}
                                aria-describedby={errors.roll ? 'roll-error' : undefined}
                                className={inputClass + ' h-11'}
                                {...register('roll', { required: 'Enter a roll number.' })}
                            />
                            {errors.roll && (
                                <p id="roll-error" role="alert" className="mt-1.5 text-sm text-danger">
                                    {errors.roll.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="height" className="mb-1.5 block text-sm font-medium text-ink">
                                Height (cm)
                            </label>
                            <input
                                id="height"
                                type="number"
                                inputMode="numeric"
                                min={MIN_HEIGHT_CM}
                                max={MAX_HEIGHT_CM}
                                aria-invalid={!!errors.height}
                                aria-describedby={errors.height ? 'height-error' : undefined}
                                className={inputClass + ' h-11 tabular-nums'}
                                {...register('height', {
                                    required: 'Enter a height.',
                                    min: {
                                        value: MIN_HEIGHT_CM,
                                        message: `Height must be at least ${MIN_HEIGHT_CM} cm.`,
                                    },
                                    max: {
                                        value: MAX_HEIGHT_CM,
                                        message: `Height must be under ${MAX_HEIGHT_CM} cm.`,
                                    },
                                })}
                            />
                            {errors.height && (
                                <p id="height-error" role="alert" className="mt-1.5 text-sm text-danger">
                                    {errors.height.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <label
                        htmlFor="isSpecial"
                        className="mb-6 flex items-center gap-2.5 text-sm text-ink"
                    >
                        <input
                            id="isSpecial"
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-accent accent-accent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            {...register('isSpecial')}
                        />
                        Needs a front-row seat regardless of height
                    </label>

                    <motion.button
                        type="submit"
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        transition={{ duration: 0.12, ease: EASE_OUT }}
                        className="group flex h-11 w-full items-center justify-center gap-2 rounded-control bg-accent font-medium text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                        Add student
                        <ArrowRight
                            size={18}
                            weight="bold"
                            aria-hidden="true"
                            className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5 motion-reduce:transition-none"
                        />
                    </motion.button>
                </motion.form>

                {/* The roster. Empty state explains how to fill it (design §7). */}
                <motion.div variants={item} className="mt-8">
                    <div className="mb-3 flex items-baseline justify-between">
                        <h2 className="text-lg font-semibold tracking-tight text-ink">Students</h2>
                        <span className="text-sm tabular-nums text-muted">
                            {students.length} added
                        </span>
                    </div>

                    {students.length === 0 ? (
                        <div className="rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
                            <p className="text-sm text-muted">
                                No students yet. Add one above to start the roster.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
                            <AnimatePresence initial={false}>
                                {students.map((student) => (
                                    <motion.li
                                        key={student.id}
                                        layout={!reduce}
                                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                                        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                        exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                                        transition={{ duration: 0.2, ease: EASE_OUT }}
                                        className="flex items-center gap-4 px-4 py-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-ink">
                                                {student.name}
                                                {student.isSpecial && (
                                                    <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-xs font-medium text-accent-ink">
                                                        Front row
                                                    </span>
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-sm tabular-nums text-muted">
                                                Roll {student.roll} · {student.height} cm
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStudent(student.id)}
                                            aria-label={`Remove ${student.name}`}
                                            className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-muted outline-none transition-colors duration-150 ease-[var(--ease-out)] hover:bg-danger-bg hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                                        >
                                            <Trash size={18} aria-hidden="true" />
                                        </button>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </motion.div>
            </motion.div>
        </section>
    );
};

export default SeatPlanner;
