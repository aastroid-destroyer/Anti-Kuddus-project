import { useEffect, useRef } from 'react';

const CELL = 32;
const MAX_ACTIVE = 6;

// Bounces a CSS custom property (our OKLCH theme tokens) through a hidden
// probe so canvas, which cannot read CSS variables or oklch(), gets back a
// browser-computed rgb() string. Same trick the old three.js globe used.
function resolveToken(varName) {
  const probe = document.createElement('span');
  probe.style.cssText = `color: var(${varName}); position: absolute; opacity: 0; pointer-events: none`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

// Decorative hero backdrop: a grid of hairlines with a handful of cells that
// quietly fade in and out, like a system idling. Canvas-drawn (not DOM nodes),
// so the per-frame work never touches React state or layout. Colors re-read
// whenever [data-theme] flips or the OS scheme changes, so it stays in step
// with the rest of the page's theme.
export default function GridBackdrop({ animate = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lineColor = resolveToken('--border');
    let accentColor = resolveToken('--accent');

    const syncColors = () => {
      lineColor = resolveToken('--border');
      accentColor = resolveToken('--accent');
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const cols = () => Math.ceil(width / CELL) + 1;
    const rows = () => Math.ceil(height / CELL) + 1;

    let active = [];
    let lastSpawn = 0;
    let raf;

    const spawn = (time) => {
      if (active.length >= MAX_ACTIVE) return;
      active.push({
        c: Math.floor(Math.random() * cols()),
        r: Math.floor(Math.random() * rows()),
        born: time,
        life: 1400 + Math.random() * 1200,
      });
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = lineColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += CELL) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += CELL) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
      ctx.stroke();

      if (animate) {
        if (time - lastSpawn > 500) {
          spawn(time);
          lastSpawn = time;
        }

        active = active.filter((cell) => time - cell.born < cell.life);

        active.forEach((cell) => {
          const t = (time - cell.born) / cell.life;
          const fade = t < 0.5 ? t / 0.5 : (1 - t) / 0.5;
          ctx.globalAlpha = Math.max(0, fade) * 0.5;
          ctx.fillStyle = accentColor;
          ctx.fillRect(cell.c * CELL + 1, cell.r * CELL + 1, CELL - 2, CELL - 2);
        });

        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      } else {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = accentColor;
        [
          [2, 2],
          [Math.max(0, cols() - 4), Math.max(0, rows() - 3)],
          [Math.floor(cols() / 2), 1],
        ].forEach(([c, r]) => {
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        });
        ctx.globalAlpha = 1;
      }
    };

    const themeObserver = new MutationObserver(syncColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', syncColors);

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      themeObserver.disconnect();
      media.removeEventListener('change', syncColors);
      cancelAnimationFrame(raf);
    };
  }, [animate]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
