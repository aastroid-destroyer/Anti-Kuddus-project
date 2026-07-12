import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
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

// Shared --ease-out curve (design.md §6.C) so the JS motion matches the CSS
// rhythm used elsewhere in the app.
const EASE = [0.23, 1, 0.32, 1];

// Link needs to be a motion component so each card can take part in the grid's
// staggered scroll-reveal and carry its own hover/press feedback.
const MotionLink = motion.create(Link);

const ToolArsenal = () => {
  const reduce = useReducedMotion();

  // The grid orchestrates a staggered reveal; each card is a direct motion
  // child so the stagger index resolves correctly.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  };

  // Reduced motion keeps the fade (aids comprehension) but drops the travel.
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        viewport={{ once: true, amount: 0.6 }}
        className="max-w-2xl"
      >
        <h2 className="text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          <span className='text-accent'>Protocol</span> Arsenal
        </h2>
        <p className="mt-3 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          The tools you need to stay safe, informed, and organized in an
          unpredictable campus climate.
        </p>
      </motion.div>
      

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tools.map((tool) => {
          const { to, title, description, urgent } = tool;
          const Icon = tool.icon;

          return (
            <MotionLink
              key={to}
              to={to}
              variants={item}
              whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.2, ease: EASE } }}
              whileTap={reduce ? undefined : { scale: 0.98, transition: { duration: 0.12, ease: EASE } }}
              className={[
                'group relative flex flex-col gap-5 rounded-card border p-6 outline-none',
                // Framer owns the transform (lift/press); CSS carries the soft
                // shadow bloom and border tint so they layer under the lift.
                'transition-[box-shadow,border-color] duration-300 ease-[var(--ease-out)]',
                'shadow-raised hover:shadow-bar',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                urgent
                  ? 'border-danger/25 bg-danger-bg hover:border-danger/40 lg:col-span-2 lg:flex-row lg:items-center lg:gap-6 lg:p-7'
                  : 'border-border bg-surface hover:border-accent/30',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'grid shrink-0 place-items-center rounded-control ring-1 ring-inset',
                  'transition-transform duration-300 ease-[var(--ease-out)]',
                  'group-hover:-translate-y-0.5 motion-reduce:transform-none',
                  urgent
                    ? 'h-12 w-12 bg-surface text-danger shadow-raised ring-danger/15'
                    : 'h-11 w-11 bg-accent/10 text-accent ring-accent/15',
                ].join(' ')}
              >
                <Icon size={urgent ? 24 : 22} weight="fill" />
              </span>

              <div className={urgent ? 'flex flex-col gap-1.5 lg:flex-1' : 'flex flex-col gap-1.5'}>
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted">
                  {description}
                </p>
              </div>

              <span
                className={[
                  'inline-flex items-center gap-1.5 text-sm font-semibold',
                  urgent ? 'mt-auto text-danger lg:mt-0 lg:shrink-0' : 'mt-auto text-accent',
                ].join(' ')}
              >
                {urgent ? 'Get help' : 'Open'}
                <ArrowRight
                  aria-hidden="true"
                  size={16}
                  weight="bold"
                  className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1 motion-reduce:transform-none"
                />
              </span>
            </MotionLink>
          );
        })}
      </motion.div>
    </section>
  );
};

export default ToolArsenal;
