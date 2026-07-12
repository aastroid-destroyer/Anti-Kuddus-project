import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, ArrowRight, Lightning } from '@phosphor-icons/react';
import ToolArsenal from '../../components/ToolArsenal';

// three.js is heavy and the globe is decorative, so it is split out of the
// initial bundle. The hero copy (the LCP) renders immediately; the canvas
// streams in behind it.
const GlobeBackdrop = lazy(() => import('./GlobeBackdrop'));

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

  return (
    <>
    {/* Fill the viewport below the 64px navbar so the hero owns the first screen
        without floating. `isolate` contains the local z-stack for the backdrop. */}
    <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4">
      {/* Decorative globe. pointer-events-none keeps it from stealing taps;
          aria-hidden keeps it out of the accessibility tree. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <Suspense fallback={null}>
          <GlobeBackdrop animate={!reducedMotion} />
        </Suspense>
        {/* Legibility scrim: fades the wireframe out toward the edges and under
            the copy so text contrast holds. A functional fade to the page
            background, not a decorative glow. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--bg)_82%)]" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 py-16 text-center">
        <span
          className="rise inline-flex items-center gap-2 rounded-control border border-border bg-surface/80 px-3 py-1.5 text-sm font-medium text-muted backdrop-blur-sm"
        >
          <ShieldCheck aria-hidden="true" size={16} weight="fill" className="text-accent" />
          Campus safety, together
        </span>

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
          className="rise max-w-xl text-pretty text-lg leading-relaxed font-bold text-muted"
          style={{ animationDelay: '160ms' }}
        >
          Report problems, plan seats, track tiffins, and reach help fast.
          Everything your hostel needs, in one place.
        </p>

        <div
          className="rise flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          style={{ animationDelay: '240ms' }}
        >
          <Link
            to="/register"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-accent px-6 text-sm font-semibold text-accent-ink outline-none transition-transform duration-150 ease-[var(--ease-out)] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none sm:w-auto"
          >
            Get started
            <ArrowRight aria-hidden="true" size={18} weight="bold" />
          </Link>

          <Link
            to="/sos"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control border border-border bg-surface/60 px-6 text-sm font-semibold text-ink outline-none transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-surface active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg motion-reduce:transition-none sm:w-auto"
          >
            <Lightning aria-hidden="true" size={18} weight="fill" className="text-accent" />
            Send an SOS
          </Link>
        </div>
      </div>
    </section>

    <ToolArsenal />
    </>
  );
};

export default Home;
