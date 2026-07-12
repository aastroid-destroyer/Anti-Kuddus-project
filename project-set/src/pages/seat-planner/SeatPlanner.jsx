import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash } from '@phosphor-icons/react';

// Sensible bounds for a student's height, kept as named constants so the
// validation rule is not a magic number buried in the form.
const MIN_HEIGHT_CM = 90;
const MAX_HEIGHT_CM = 230;

// Shared with the rest of the app's forms so this reads as one system
// (same shape as Login / Register / MakeComplaint).
const inputClass =
    'w-full rounded-control border border-border bg-bg px-3 text-ink ' +
    'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
    'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const SeatPlanner = () => {
    // The single source of truth for Phase A: every student the teacher adds.
    // Later phases will read from this same array, no backend involved.
    const [students, setStudents] = useState([]);

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

        setStudents((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
                name: values.name.trim(),
                roll,
                height: Number(values.height),
                isSpecial: values.isSpecial,
            },
        ]);
        reset();
        setFocus('name');
    };

    // Drop one student by id (stable key, so removal never hits the wrong row).
    const removeStudent = (id) => {
        setStudents((current) => current.filter((student) => student.id !== id));
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Seat planner
            </h1>
            <p className="mt-3 max-w-prose text-muted">
                Add every student in the class with their height. The seating
                arrangement comes later, first build the roster.
            </p>

            <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 rounded-card border border-border bg-surface p-6"
            >
                <div className="mb-4">
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

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <button
                    type="submit"
                    className="h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                    Add student
                </button>
            </form>

            {/* The roster. Empty state explains how to fill it (design §7). */}
            <div className="mt-8">
                <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold tracking-tight text-ink">
                        Students
                    </h2>
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
                        {students.map((student) => (
                            <li
                                key={student.id}
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
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default SeatPlanner;
