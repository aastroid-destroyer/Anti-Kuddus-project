import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

// Terminal-style decrypt reveal: scrambles to real glyphs left to right, then
// settles. Used sparingly for the hero's technical readout so it reads as a
// system coming online rather than static copy. `aria-hidden` keeps assistive
// tech from reading the mid-scramble noise; `aria-label` gives it the final
// text immediately instead.
export default function ScrambleText({ text, className = '' }) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(text);
      return;
    }

    let raf;
    const framesPerChar = 3;
    const totalFrames = text.length * framesPerChar + 6;

    const tick = () => {
      frameRef.current += 1;
      const revealed = Math.min(text.length, Math.floor(frameRef.current / framesPerChar));

      setDisplay(
        text
          .split('')
          .map((char, index) => (char === ' ' || index < revealed ? char : randomGlyph()))
          .join(''),
      );

      if (frameRef.current < totalFrames) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frameRef.current = 0;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
