import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// How long the toast stays before it slides away on its own.
const TOAST_DURATION = 5000;

// Premium confirmation toast. Slides in from the corner, counts down with a
// thin progress bar, and can be dismissed early. Purely presentational —
// the parent controls when it mounts and unmounts.
const Toast = ({ onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Mount hidden, then flip to visible on the next frame so the
        // enter transition actually plays.
        const enter = requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => setVisible(false), TOAST_DURATION);
        return () => {
            cancelAnimationFrame(enter);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 sm:justify-end sm:pr-6">
            <div
                role="status"
                aria-live="polite"
                onTransitionEnd={() => {
                    // Once the exit transition finishes, tell the parent to unmount.
                    if (!visible) onDismiss();
                }}
                className={
                    'pointer-events-auto w-full max-w-sm overflow-hidden rounded-card border border-border ' +
                    'bg-surface shadow-lg shadow-black/10 transition-all duration-300 ease-[var(--ease-out)] ' +
                    'motion-reduce:transition-none ' +
                    (visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')
                }
            >
                <div className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                            <path
                                d="M5 10.5l3 3 7-7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">Complaint registered</p>
                        <p className="mt-0.5 text-sm text-muted">
                            Your report is queued for review and the team is taking action.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        aria-label="Dismiss notification"
                        className="-mr-1 -mt-1 rounded-control p-1 text-muted transition-colors duration-150 ease-[var(--ease-out)] outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                            <path
                                d="M6 6l8 8M14 6l-8 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
                {/* Countdown bar: shrinks from full to empty over the toast's lifetime. */}
                <div
                    className="h-0.5 bg-accent ease-linear motion-reduce:transition-none"
                    style={{
                        width: visible ? '0%' : '100%',
                        transitionProperty: 'width',
                        transitionDuration: `${TOAST_DURATION}ms`,
                    }}
                />
            </div>
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

const MakeComplaint = () => {
    const axiosSecure = useAxiosSecure();
    const [formError, setFormError] = useState('');
    const [showToast, setShowToast] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { category: '', subject: '', details: '' },
    });

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
            // Re-trigger cleanly if a toast is already on screen.
            setShowToast(false);
            requestAnimationFrame(() => setShowToast(true));
        } catch {
            setFormError('Could not submit your complaint. Please try again.');
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            {showToast && <Toast onDismiss={() => setShowToast(false)} />}

            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Make a complaint
            </h1>
            <p className="mt-3 max-w-prose text-muted">
                You are signed in and can file a report. Your identity stays private,
                only the details you write are shared with the review team.
            </p>

            <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                aria-busy={isSubmitting}
                className="mt-8 rounded-card border border-border bg-surface p-6"
            >
                {formError && (
                    <div
                        role="alert"
                        className="mb-5 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger"
                    >
                        {formError}
                    </div>
                )}

                <div className="mb-4">
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
                </div>

                <div className="mb-4">
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
                </div>

                <div className="mb-6">
                    <label htmlFor="details" className="mb-1.5 block text-sm font-medium text-ink">
                        Details
                    </label>
                    <textarea
                        id="details"
                        rows={6}
                        aria-invalid={!!errors.details}
                        aria-describedby={errors.details ? 'details-error' : 'details-hint'}
                        className={inputClass + ' resize-y py-2.5'}
                        {...register('details', {
                            required: 'Describe what happened.',
                            minLength: { value: 20, message: 'Please add at least 20 characters.' },
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
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit complaint'}
                </button>
            </form>
        </section>
    );
};

export default MakeComplaint;
