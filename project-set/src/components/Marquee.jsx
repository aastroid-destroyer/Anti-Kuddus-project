import { ShieldCheck } from '@phosphor-icons/react';
import { useReducedMotion } from 'motion/react';
import FastMarquee from 'react-fast-marquee';

// A single strip of protocol taglines that scrolls between the hero and the
// arsenal. Driven by react-fast-marquee, which runs the loop on the compositor
// and seamlessly fills the track via `autoFill`.
const phrases = [
  'Report anonymously',
  'Track every tiffin',
  'Claim your seat',
  'Verify the rules',
  'SOS in one tap',
  'Campus safety, together',
];

const Marquee = () => {
  const reduce = useReducedMotion();

  return (
    <section
      // The ribbon restates links already present below, so it is decorative
      // and hidden from the a11y tree.
      aria-hidden="true"
      className="relative isolate overflow-hidden border-y border-border bg-surface/60 py-4"
      // Fade the ribbon into the page at both edges instead of hard-cutting the
      // text against the border.
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <FastMarquee
        autoFill
        pauseOnHover
        play={!reduce}
        speed={40}
      >
        {phrases.map((phrase, index) => (
          <div key={`${phrase}-${index}`} className="flex items-center">
            <span className="whitespace-nowrap px-6 font-mono text-sm font-medium uppercase tracking-wide text-muted sm:text-base">
              {phrase}
            </span>
            <ShieldCheck
              aria-hidden="true"
              size={16}
              weight="fill"
              className="shrink-0 text-accent"
            />
          </div>
        ))}
      </FastMarquee>
    </section>
  );
};

export default Marquee;
