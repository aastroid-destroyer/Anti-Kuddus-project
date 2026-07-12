import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

// Resolve a CSS custom property (our OKLCH theme tokens) into an rgb() string
// three.js can actually parse. three cannot read CSS variables and does not
// understand oklch(), so we bounce the token through a hidden probe element and
// read back the browser-computed rgb(). We re-read whenever the [data-theme]
// attribute flips (the project's dark-mode strategy, frontend-rules §2) or the
// OS colour-scheme changes, so the globe re-tints with the rest of the page.
function useTokenColor(varName) {
  const [color, setColor] = useState('rgb(120, 120, 120)');

  useEffect(() => {
    const read = () => {
      const probe = document.createElement('span');
      probe.style.cssText =
        `color: var(${varName}); position: absolute; opacity: 0; pointer-events: none`;
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      if (resolved) setColor(resolved);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', read);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', read);
    };
  }, [varName]);

  return color;
}

// A slowly drifting wireframe sphere. It uses meshBasicMaterial (unlit), so the
// scene needs no lights. When `speed` is 0 the group is left untouched and the
// Canvas is driven on demand, so a reduced-motion visitor gets a still globe
// with no per-frame GPU work.
function Wireframe({ speed, radius, color }) {
  const groupRef = useRef(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group || speed === 0) return;
    group.rotation.y += speed;
    group.rotation.x += speed * 0.3;
    group.rotation.z += speed * 0.1;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.16} wireframe />
      </mesh>
    </group>
  );
}

// Decorative hero backdrop. Rendered behind the hero copy and marked aria-hidden
// by its container in Home, so it is invisible to assistive tech. Kept as its
// own module so the three.js bundle can be code-split with React.lazy.
export default function GlobeBackdrop({ animate = true, radius = 1.15 }) {
  const color = useTokenColor('--ink');
  const speed = animate ? 0.0025 : 0;

  return (
    <Canvas
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={70} />
      <Wireframe speed={speed} radius={radius} color={color} />
    </Canvas>
  );
}
