import { Link } from 'react-router';
import {
  ArrowRight,
  Armchair,
  EyeSlash,
  ForkKnife,
  MagnifyingGlass,
  Siren,
} from '@phosphor-icons/react';

// Anonymous Complaints and Fact-Checker route to their existing screens under
// different working names (make-complaint, syllabus-negotiator) so the copy
// here can stay student-facing without renaming the routes.
const tools = [
  {
    to: '/make-complaint',
    icon: EyeSlash,
    title: 'Anonymous Complaints',
    description:
      'Speak up without the shadow of retaliation. Reports stay encrypted and strictly confidential.',
  },
  {
    to: '/seat-planner',
    icon: Armchair,
    title: 'Seat Planner',
    description:
      "Claim your space before it's taken. Secure study spots and avoid territorial disputes.",
  },
  {
    to: '/tiffin-ledger',
    icon: ForkKnife,
    title: 'Tiffin Ledger',
    description:
      "Log every taxed lunchbox. Track the theft and build a data-driven case for accountability.",
  },
  {
    to: '/sos',
    icon: Siren,
    title: 'SOS Rescue',
    description:
      "One tap alerts the protocol network. Get immediate peer support when you're cornered.",
    urgent: true,
  },
  {
    to: '/syllabus-negotiator',
    icon: MagnifyingGlass,
    title: 'Fact-Checker',
    description:
      'Is that a real rule, or something a warden invented? Verify campus mandates against actual policy.',
  },
];

const ToolArsenal = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="rise max-w-2xl">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Protocol Arsenal
        </h2>
        <p className="mt-3 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          The tools you need to stay safe, informed, and organized in an
          unpredictable campus climate.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => {
          const { to, title, description, urgent } = tool;
          const Icon = tool.icon;

          return (
            <Link
              key={to}
              to={to}
              style={{ animationDelay: `${index * 70}ms` }}
              className={[
                'rise group relative flex flex-col gap-5 rounded-card border p-6 outline-none',
                'transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out)]',
                'shadow-raised hover:-translate-y-1 hover:shadow-bar',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                urgent
                  ? 'border-danger/25 bg-danger-bg hover:border-danger/40 sm:col-span-2'
                  : 'border-border bg-surface hover:border-accent/30',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'grid h-11 w-11 shrink-0 place-items-center rounded-control transition-transform duration-300 ease-[var(--ease-out)]',
                  'group-hover:-translate-y-0.5 motion-reduce:transform-none',
                  urgent ? 'bg-surface text-danger shadow-raised' : 'bg-accent/10 text-accent',
                ].join(' ')}
              >
                <Icon size={22} weight="fill" />
              </span>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted">
                  {description}
                </p>
              </div>

              <span
                className={[
                  'mt-auto inline-flex items-center gap-1.5 text-sm font-semibold',
                  urgent ? 'text-danger' : 'text-accent',
                ].join(' ')}
              >
                Go
                <ArrowRight
                  aria-hidden="true"
                  size={16}
                  weight="bold"
                  className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1 motion-reduce:transform-none"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ToolArsenal;
