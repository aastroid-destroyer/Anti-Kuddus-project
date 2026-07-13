import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Clock, EyeSlash, ShieldCheck, UsersThree, X } from '@phosphor-icons/react';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// Shared motion curve, mirroring --ease-out from index.css so JS-driven
// motion shares the same rhythm as the CSS transitions elsewhere.
const EASE_OUT = [0.23, 1, 0.32, 1];

// How long the toast stays before it slides away on its own.
const TOAST_DURATION = 5000;

// Premium confirmation toast. Slides in from the corner, counts down with a
// thin progress bar, and can be dismissed early. Purely presentational —
// the parent controls when it mounts and unmounts (via AnimatePresence).
const Toast = ({ onDismiss }) => {
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
                        <p className="text-sm font-semibold text-ink">Complaint registered</p>
                        <p className="mt-0.5 text-sm text-muted">
                            Your report is queued for review and the team is taking action.
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

// Shared with Login/Register so the form reads as part of the same system.
const inputClass =
    'w-full rounded-control border border-border bg-bg px-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const CATEGORIES = [
    { value: 'academics', label: 'Academics' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' },
];

// Minimum characters the details field asks for; surfaced in a live counter.
const DETAILS_MIN = 20;

// Trust points that ride the vertical marquee beside the form. Each restates a
// promise the anonymous flow actually keeps, so the strip informs rather than
// decorates.
const ASSURANCES = [
    {
        icon: ShieldCheck,
        text: 'No name, roll number, or account is attached to your report.',
    },
    {
        icon: EyeSlash,
        text: 'Reviewers read only what you write. Nothing traces back to you.',
    },
    {
        icon: Clock,
        text: 'Reports are queued the moment you submit and handled in order.',
    },
    {
        icon: UsersThree,
        text: 'Every complaint reaches the review team directly, no gatekeepers.',
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

const MakeComplaint = () => {
    const axiosSecure = useAxiosSecure();
    const reduce = useReducedMotion();
    const [formError, setFormError] = useState('');
    // Bumping the key remounts the toast so a fresh submit always re-plays the
    // enter animation, even if one is still on screen.
    const [toastKey, setToastKey] = useState(0);
    const [toastVisible, setToastVisible] = useState(false);

    const dismissToast = useCallback(() => setToastVisible(false), []);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { category: '', subject: '', details: '' },
    });

    const detailsLength = (watch('details') || '').length;

    const onSubmit = async (values) => {
        setFormError('');
        try {
            // Only the report details are sent. Nothing that identifies the
            // sender is attached, keeping the complaint anonymous by design.
            await axiosSecure.post('/complaints', {
                category: values.category,
                subject: values.subject.trim(),
                details: values.details.trim(),
                createdAt: new Date().toISOString(),
            });
            reset();
            setToastKey((key) => key + 1);
            setToastVisible(true);
        } catch {
            setFormError('Could not submit your complaint. Please try again.');
        }
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
                {toastVisible && <Toast key={toastKey} onDismiss={dismissToast} />}
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
                    className="pointer-events-none absolute -top-10 -left-1 -z-10 select-none text-[26vw] leading-[0.8] font-bold tracking-tighter text-ink/3 lg:-top-16 lg:text-[11rem]"
                >
                    Anti Bully Protocol
                </span>

                <motion.p
                    variants={item}
                    className="text-xs font-semibold tracking-[0.22em] text-muted uppercase"
                >
                    Anonymous report
                </motion.p>
                <motion.h1
                    variants={item}
                    className="mt-4 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl"
                >
                    Make a complaint
                </motion.h1>
                <motion.p variants={item} className="mt-5 max-w-md text-pretty text-muted">
                    You are signed in and can file a report. Your identity stays private, only the
                    details you write are shared with the review team.
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

            {/* Form column. */}
            <motion.form
                variants={container}
                initial="hidden"
                animate="show"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                aria-busy={isSubmitting}
                className="rounded-card border border-border bg-surface p-6 shadow-raised sm:p-8"
            >
                {formError && (
                    <motion.div
                        role="alert"
                        initial={reduce ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="mb-5 flex items-start gap-2 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger"
                    >
                        <X size={16} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{formError}</span>
                    </motion.div>
                )}

                <motion.div variants={item} className="mb-5">
                    <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-ink">
                        Category
                    </label>
                    <select
                        id="category"
                        aria-invalid={!!errors.category}
                        aria-describedby={errors.category ? 'category-error' : undefined}
                        className={inputClass + ' h-11'}
                        {...register('category', { required: 'Choose a category.' })}
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        {CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p id="category-error" role="alert" className="mt-1.5 text-sm text-danger">
                            {errors.category.message}
                        </p>
                    )}
                </motion.div>

                <motion.div variants={item} className="mb-5">
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">
                        Subject
                    </label>
                    <input
                        id="subject"
                        type="text"
                        autoComplete="off"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : 'subject-hint'}
                        className={inputClass + ' h-11'}
                        {...register('subject', {
                            required: 'Add a short subject.',
                            maxLength: { value: 120, message: 'Keep the subject under 120 characters.' },
                        })}
                    />
                    {errors.subject ? (
                        <p id="subject-error" role="alert" className="mt-1.5 text-sm text-danger">
                            {errors.subject.message}
                        </p>
                    ) : (
                        <p id="subject-hint" className="mt-1.5 text-sm text-muted">
                            A one-line summary of your complaint.
                        </p>
                    )}
                </motion.div>

                <motion.div variants={item} className="mb-6">
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <label htmlFor="details" className="block text-sm font-medium text-ink">
                            Details
                        </label>
                        <span
                            className={
                                'text-xs tabular-nums transition-colors duration-150 ' +
                                (detailsLength >= DETAILS_MIN ? 'text-accent' : 'text-muted')
                            }
                        >
                            {detailsLength} / {DETAILS_MIN} min
                        </span>
                    </div>
                    <textarea
                        id="details"
                        rows={6}
                        aria-invalid={!!errors.details}
                        aria-describedby={errors.details ? 'details-error' : 'details-hint'}
                        className={inputClass + ' resize-y py-2.5'}
                        {...register('details', {
                            required: 'Describe what happened.',
                            minLength: { value: DETAILS_MIN, message: 'Please add at least 20 characters.' },
                        })}
                    />
                    {errors.details ? (
                        <p id="details-error" role="alert" className="mt-1.5 text-sm text-danger">
                            {errors.details.message}
                        </p>
                    ) : (
                        <p id="details-hint" className="mt-1.5 text-sm text-muted">
                            Include what happened, when, and where. Do not include your name.
                        </p>
                    )}
                </motion.div>

                <motion.div variants={item}>
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        transition={{ duration: 0.12, ease: EASE_OUT }}
                        className="group flex h-11 w-full items-center justify-center gap-2 rounded-control bg-accent font-medium text-accent-ink outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            'Submitting...'
                        ) : (
                            <>
                                Submit complaint
                                <ArrowRight
                                    size={18}
                                    weight="bold"
                                    aria-hidden="true"
                                    className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5 motion-reduce:transition-none"
                                />
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </motion.form>
        </section>
    );
};

export default MakeComplaint;
