import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Chalkboard, Star } from '@phosphor-icons/react';

// Mirrors the server's orderForSeating rule exactly: front-row flags keep
// their seats first (in the order they were added), everyone else fills in
// shortest to tallest so the back rows can see over the front.
const SEATS_PER_ROW = 5;
const MIN_ROWS = 4;

// Same curve as SeatPlanner so both surfaces share one motion rhythm.
const EASE_OUT = [0.23, 1, 0.32, 1];

const orderForSeating = (students) => {
    const special = students.filter((s) => s.isSpecial);
    const rest = students.filter((s) => !s.isSpecial).sort((a, b) => a.height - b.height);
    return [...special, ...rest];
};

// A fixture on the front wall (door, board, teacher's desk). Purely
// representational, so the label is the whole content. The ink tint keeps the
// fixtures visible on the surface in both themes without shouting.
const fixtureClass =
    'flex items-center justify-center rounded-control border border-border bg-ink/5 text-[11px] font-medium text-muted';

const ClassroomMap = ({ students = [], isPending = false }) => {
    const reduce = useReducedMotion();

    const seated = useMemo(() => orderForSeating(students), [students]);

    // The room always shows at least a few rows so the architecture reads
    // even while the roster is short; extra rows appear as the class grows.
    const rowCount = Math.max(MIN_ROWS, Math.ceil(seated.length / SEATS_PER_ROW));
    const seats = Array.from({ length: rowCount * SEATS_PER_ROW }, (_, i) => seated[i] ?? null);

    // Orchestration: mount-triggered like the rest of the page (design.md §6.D:
    // never gate visibility on a scroll reveal), then the desks ripple in front
    // to back. Reduced motion keeps only the fades.
    const container = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: reduce ? 0 : 0.08,
                delayChildren: reduce ? 0 : 0.05,
            },
        },
    };
    const grid = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.02 } },
    };
    const item = reduce
        ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
        : {
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
          };

    if (isPending) {
        return (
            <div aria-busy="true" className="rounded-card border border-border bg-surface p-4 sm:p-6">
                <div className="mb-6 h-7 w-1/2 animate-pulse rounded-control bg-bg" aria-hidden="true" />
                <div className="grid grid-cols-5 gap-1.5 sm:gap-3" aria-hidden="true">
                    {Array.from({ length: MIN_ROWS * SEATS_PER_ROW }, (_, i) => (
                        <div key={i} className="min-h-14 animate-pulse rounded-control bg-bg sm:min-h-20" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="mb-3 flex items-baseline justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
                    <Chalkboard size={20} weight="fill" className="text-accent" aria-hidden="true" />
                    Classroom
                </h2>
                <span className="text-sm tabular-nums text-muted">
                    {seated.length} of {seats.length} seats filled
                </span>
            </motion.div>
            <motion.p variants={item} className="mb-4 max-w-prose text-sm text-muted">
                Front-row flags sit first, then everyone else fills in shortest to tallest, front to
                back.
            </motion.p>

            <motion.div variants={item} className="rounded-card border border-border bg-surface p-4 sm:p-6">
                {/* Front wall: door in the corner, board centered on the wall
                    like a real room (not stretched edge to edge). */}
                <div className="relative mb-4 flex h-9 items-center justify-center sm:mb-6">
                    <div className={`absolute top-0 left-0 h-9 w-14 ${fixtureClass}`}>Door</div>
                    <div className={`h-7 w-1/2 max-w-sm ${fixtureClass}`}>Board</div>
                </div>

                {/* Teacher's desk, facing the class. */}
                <div className="mb-5 flex justify-center sm:mb-8">
                    <div className={`h-8 w-28 ${fixtureClass}`}>Desk</div>
                </div>

                <motion.ol
                    variants={grid}
                    aria-label="Seating map, front row to back row"
                    className="grid grid-cols-5 gap-1.5 sm:gap-3"
                >
                    {seats.map((student, i) =>
                        student ? (
                            <motion.li
                                key={student._id}
                                variants={item}
                                layout={!reduce}
                                className="min-w-0"
                                aria-label={`Seat ${i + 1}: ${student.name}, roll ${student.roll}, ${student.height} cm${student.isSpecial ? ', front-row seat' : ''}`}
                            >
                                <div
                                    title={`${student.name}, roll ${student.roll}, ${student.height} cm`}
                                    className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-control border p-1 transition-[transform,box-shadow] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-raised motion-reduce:transition-none sm:min-h-20 sm:p-2 ${
                                        student.isSpecial
                                            ? 'border-accent/40 bg-accent/10'
                                            : 'border-border bg-bg'
                                    }`}
                                >
                                    {/* Chair back: the one glyph that makes the tile read as a seat. */}
                                    <span
                                        aria-hidden="true"
                                        className={`h-1 w-2/5 rounded-full ${student.isSpecial ? 'bg-accent' : 'bg-ink/20'}`}
                                    />
                                    <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-ink">
                                        {student.isSpecial && (
                                            <Star size={11} weight="fill" className="text-accent" aria-hidden="true" />
                                        )}
                                        {student.roll}
                                    </span>
                                    <span className="hidden w-full truncate text-center text-[11px] text-muted sm:block">
                                        {student.name}
                                    </span>
                                    <span className="hidden text-[11px] tabular-nums text-muted md:block">
                                        {student.height} cm
                                    </span>
                                </div>
                            </motion.li>
                        ) : (
                            <motion.li
                                key={`empty-${i}`}
                                variants={item}
                                aria-hidden="true"
                                className="min-h-14 rounded-control border border-dashed border-border bg-bg/60 sm:min-h-20"
                            />
                        ),
                    )}
                </motion.ol>

                {seated.length === 0 && (
                    <p className="mt-5 text-center text-sm text-muted">
                        The room is empty. Add a student above and they will take a front seat.
                    </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-4 text-[11px] text-muted sm:mt-6">
                    <span className="flex items-center gap-1.5">
                        <Star size={11} weight="fill" className="text-accent" aria-hidden="true" />
                        Front-row flag
                    </span>
                    <span>Back of class</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ClassroomMap;
