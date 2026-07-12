import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Lightning,
  LockKey,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react';
import ToolArsenal from '../../components/ToolArsenal';
import Marquee from '../../components/Marquee';
import ScrambleText from '../../components/ScrambleText';
import SplitText from '../../components/SplitText';
import KuddusDossier from '../../components/KuddusDossier';

// Canvas grid is decorative, so it is split out of the initial bundle. The
// hero copy (the LCP) renders immediately; the canvas streams in behind it.
const GridBackdrop = lazy(() => import('./GridBackdrop'));

const signals = ['Report', 'Track', 'Verify', 'Respond'];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

const Home = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [activeSignal, setActiveSignal] = useState(0);

  // Cycles which word in the "console" reads as live. Reduced motion holds on
  // the first word instead of looping (state transition, not decoration).
  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = setInterval(() => {
      setActiveSignal((index) => (index + 1) % signals.length);
    }, 1800);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <>
      {/* Fill the viewport below the 64px navbar so the hero owns the first screen
          without floating. `isolate` contains the local z-stack for the backdrop. */}
      <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b border-border px-4 sm:px-6">
        {/* Decorative grid. pointer-events-none keeps it from stealing taps;
            aria-hidden keeps it out of the accessibility tree. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <Suspense fallback={null}>
            <GridBackdrop animate={!reducedMotion} />
          </Suspense>
          {/* Legibility scrim: fades the grid out toward the edges so text
              contrast holds against the page background. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,var(--bg)_88%)]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 py-16 md:grid-cols-2 md:items-center md:gap-8 md:py-20">
          {/* Copy column */}
          <div className="flex flex-col items-start gap-6 text-left">
            <span className="rise inline-flex items-center gap-2 rounded-control border border-border bg-surface/80 px-3 py-1.5 text-sm font-medium text-muted backdrop-blur-sm">
              <ShieldCheck aria-hidden="true" size={16} weight="fill" className="text-accent" />
              Campus safety, together
            </span>
            <SplitText
              text="Welcome, to the Anti Bully Protocol"
              className="text-2xl font-semibold text-center"
              delay={70}
              duration={1.25}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              showCallback
            />
            
            <h1
              className="rise text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl"
              style={{ animationDelay: '80ms' }}
            >
              <span className="block font-medium text-muted">Campus life,</span>
              <span className="block">
                with <span className="text-accent">backup</span>.
              </span>
            </h1>

            <p
              className="rise max-w-xl text-pretty text-lg leading-relaxed text-muted"
              style={{ animationDelay: '160ms' }}
            >
              Report problems, plan seats, track tiffins, and reach help fast.
              Everything your hostel needs, in one place.
            </p>

            <div
              className="rise flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row"
              style={{ animationDelay: '240ms' }}
            >
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-accent px-6 text-sm font-semibold text-accent-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none"
              >
                Get started
                <ArrowRight aria-hidden="true" size={18} weight="bold" />
              </Link>

              <Link
                to="/sos"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-border bg-surface/60 px-6 text-sm font-semibold text-ink outline-none transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-surface active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none"
              >
                <Lightning aria-hidden="true" size={18} weight="fill" className="text-accent" />
                Send an SOS
              </Link>
            </div>
          </div>

          {/* Console column: one bordered module, not stacked cards. */}
          <div
            className="rise relative w-full max-w-md justify-self-start rounded-card border border-border bg-surface/85 p-5 shadow-bar backdrop-blur-sm md:justify-self-end"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
              <ScrambleText
                text="PROTOCOL_STATUS"
                className="font-mono text-xs tracking-wide text-muted"
              />
              <span className="inline-flex items-center gap-1.5 rounded-control border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] font-semibold tracking-wide text-accent">
                <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                Active
              </span>
            </div>

            <div className="flex items-center gap-5 py-6">
              <div className="scan-ring-wrap relative grid h-20 w-20 shrink-0 place-items-center rounded-control border border-dashed border-accent/40">
                <span aria-hidden="true" className="scan-ring absolute inset-0 rounded-control border-t-2 border-accent" />
                <ShieldCheck aria-hidden="true" size={36} weight="duotone" className="text-accent" />
              </div>

              <ul className="flex flex-1 flex-col gap-1.5 font-mono text-sm uppercase tracking-wide">
                {signals.map((label, index) => (
                  <li
                    key={label}
                    className={[
                      'transition-colors duration-300 ease-[var(--ease-out)]',
                      index === activeSignal ? 'font-semibold text-accent' : 'text-muted/60',
                    ].join(' ')}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-border pt-4 text-sm text-muted">
              <div className="flex items-center gap-2.5">
                <LockKey aria-hidden="true" size={16} weight="fill" className="shrink-0 text-accent" />
                Reports stay encrypted
              </div>
              <div className="flex items-center gap-2.5">
                <UsersThree aria-hidden="true" size={16} weight="fill" className="shrink-0 text-accent" />
                SOS reaches nearby captains
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      <ToolArsenal />
      <KuddusDossier/>
    </>
  );
};

export default Home;
