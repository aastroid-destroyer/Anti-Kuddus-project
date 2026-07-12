import {
    Brain,
    ChalkboardTeacher,
    ClockCounterClockwise,
    FileText,
    Lightbulb,
} from '@phosphor-icons/react';

// Static study advice shown below the marquee, before the tool itself. A
// divide-y list (not a card grid) so it reads as one grouped reference,
// matching the "His most-stolen tiffins" list pattern used elsewhere.
const tips = [
    {
        icon: Brain,
        title: 'Test yourself, not just reread',
        body: 'Close the notes and try to recall the topic from memory first. The struggle to remember is what makes it stick.',
    },
    {
        icon: ClockCounterClockwise,
        title: 'Space it out',
        body: 'Revisit a topic the next day, then again after a week. Cramming everything the night before rarely survives past the exam.',
    },
    {
        icon: ChalkboardTeacher,
        title: 'Teach it to someone',
        body: "Explain the topic out loud as if a friend has never heard of it. Gaps in your explanation are gaps in your understanding.",
    },
    {
        icon: FileText,
        title: 'Solve past papers first',
        body: 'Work through previous exam questions before rereading notes. It shows exactly which topics actually get tested.',
    },
];

const StudyTips = ({ delay = 0 }) => (
    <section className="rise mt-10" style={{ animationDelay: `${delay}ms` }}>
        <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-accent/10 text-accent">
                <Lightbulb aria-hidden="true" size={18} weight="bold" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
                Study smarter, not longer
            </h2>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {tips.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-4 px-5 py-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-control bg-bg text-muted">
                        <Icon aria-hidden="true" size={16} weight="bold" />
                    </span>
                    <div>
                        <p className="font-medium text-ink">{title}</p>
                        <p className="mt-0.5 text-sm text-pretty text-muted">{body}</p>
                    </div>
                </li>
            ))}
        </ul>
    </section>
);

export default StudyTips;
