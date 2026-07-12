# Frontend Engineering Rules — Permanent Reference

> The engineering layer. This document decides **how the UI is built in code**.
> Its companion, [design.md](./design.md), decides **what it looks like and why**.
> Every component authored in this project must comply with the rules below and pass the
> [Definition of Done](#12-definition-of-done) checklist before it is considered complete.

Synthesized from **Emil Kowalski** (motion implementation & performance), **UI/UX Pro Max**
(systematic UX & accessibility), **Impeccable** (production-grade craft), and **Taste**
(anti-slop engineering discipline), then adapted to **this project's real stack.**

---

## 0. The Actual Stack (source of truth)

Do not assume Next.js, RSC, or TypeScript — this project is a **Vite SPA**. Adapt every
framework-specific rule from the source skills to what is actually installed.

**Client** (`project-set/` — the `client`):
- **Vite 7** + **React 19** (`.jsx`, not TypeScript)
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.js` PostCSS plugin — v4 is
  CSS-first, configured in `src/index.css` with `@import "tailwindcss"` and `@theme`)
- **react-router v7** (data router, `src/routes/router.jsx`)
- **Firebase** (auth; `src/firebase/firebase.config.js`, `AuthContext`/`AuthProvider`)
- **axios** (`useAxiosSecure` hook for authenticated calls)

**Server** (`project-set-server/` — the `server`):
- **Express 5** + **MongoDB** (native driver) + **cors** + **dotenv**

**Consequences of this stack:**
- There are **no Server Components.** Every component runs on the client. Ignore all `"use client"` /
  RSC / Server Action guidance from the source skills — it does not apply here.
- Routing, data loading, and auth follow **react-router v7 + Firebase + axios** patterns, not Next.
- Styling is **Tailwind v4 utility-first** with CSS variables in `@theme`. This is the one styling
  system for the project (§2). Do not add a second one.

---

## 1. Project Structure & Conventions

Follow the structure already present in `project-set/src/`:

```
src/
  assets/        static imports (svg, images)
  components/    reusable presentational + interactive components (create as needed)
  contexts/      React context definitions + providers (AuthContext, AuthProvider)
  firebase/      firebase.config.js
  hooks/         custom hooks (useAuth, useAxiosSecure, ...)
  layouts/       route layout shells (RootLayout)
  pages/         route-level screens (create as needed)
  routes/        router.jsx, PrivateRoute, guards
  index.css      Tailwind v4 entry + @theme design tokens
  main.jsx       app entry (RouterProvider, AuthProvider)
```

- **One component per file.** Component files are `PascalCase.jsx`; hooks are `useCamelCase.jsx`;
  utilities are `camelCase.js`.
- **Match the surrounding code** — comment density, naming, and idiom. Read a neighboring file
  before adding a new one. Don't reinvent a pattern the codebase already has.
- **Colocate** a component's small helpers with it; promote to `hooks/` or a shared util only when a
  second consumer appears.
- **No dead code, no commented-out blocks, no `console.log`** left in shipped components.

---

## 2. Styling — Tailwind v4 (the one system)

- **Utility-first Tailwind** is the single styling system. Do not introduce CSS Modules,
  styled-components, or a second UI kit alongside it.
- **Design tokens live in `src/index.css` under `@theme`** as CSS variables (colors in OKLCH,
  spacing scale, radius, easing curves, font families). Components consume tokens through Tailwind
  utilities — **never hardcode raw hex in components.** Add a token, then use it.
- **Define the motion curves from [design.md §6.C](./design.md#6c-easing--duration-the-feel) as
  tokens** so every component shares one rhythm:
  ```css
  @theme {
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
    --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  }
  ```
- **Dark mode** — pick ONE strategy and keep it project-wide: either Tailwind `dark:` variants or
  a `[data-theme]` attribute swapping `@theme` values. Every color utility ships with its dark
  counterpart. (Design rules: [design.md §3.C](./design.md#3c-dark-mode-design-both-from-the-start).)
- **Standard breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Mobile-first: base
  styles target mobile, `md:`/`lg:` scale up.
- **Grid for 2D, Flex for 1D.** Responsive grids without breakpoints: `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`.
  Avoid `w-[calc(...)]` flex math.
- **Contain layouts** with `max-w-7xl mx-auto`; full-height sections use `min-h-[100dvh]`, **never
  `h-screen`** (iOS Safari address-bar jump).
- **Build a semantic z-index scale** as tokens — `dropdown → sticky → modal-backdrop → modal →
  toast → tooltip`. Never arbitrary `z-50` / `z-[999]` / `z-[9999]`.

---

## 3. Components & State

- **Function components + hooks only.** Keep components small and single-responsibility; extract a
  child or a hook when one grows past ~150 lines or gains a second concern.
- **Presentational vs. container:** components that fetch/derive data stay thin and delegate
  rendering to presentational children where it clarifies.
- **State placement:**
  - Local `useState` / `useReducer` for isolated UI state.
  - Shared cross-tree state via **React context** (the project already uses `AuthContext`). Reach for
    a store (Zustand/Jotai) only if prop-drilling becomes genuinely painful — do not add one preemptively.
  - **Never drive continuous, high-frequency values through `useState`** (mouse position, scroll
    progress, drag offset). It re-renders the tree every frame and janks on mobile. Write to the DOM
    node directly via a ref (`el.style.transform = ...`) or use a motion library's motion values.
- **Keys** on lists are stable IDs, never array index for reorderable lists.
- **Effects have cleanup.** Every `useEffect` that adds a listener, timer, observer, or animation
  returns a cleanup function. Missing cleanup is a bug, not a style preference.
- **Derive, don't sync.** Compute values during render instead of mirroring props into state via effects.

---

## 4. Routing, Data & Auth (react-router v7 + Firebase + axios)

- **Routes are declared in `src/routes/router.jsx`.** Every key screen is reachable by URL (deep
  linkable). Protected screens go through `PrivateRoute`.
- **Auth flows through `AuthProvider` / `useAuth`.** Components read auth state from the hook, never
  touch `firebase.config` directly. Guard rendering on `loading` before deciding authenticated vs. not.
- **Authenticated API calls use `useAxiosSecure`;** public calls may use plain axios. Keep the base
  URL and interceptors centralized in the hook, not duplicated per component.
- **Every async data view implements the full set of states** from
  [design.md §7](./design.md#7-component-states-never-ship-the-happy-path-only): loading (skeleton),
  empty, and error (with a retry path). Never render a bare spinner-then-content with no empty/error branch.
- **Never leak secrets to the client.** Firebase web config is public by design, but API keys for the
  Express/Mongo server stay in `project-set-server/.env` and are used server-side only.
- **Handle the request lifecycle:** disable submit buttons during in-flight requests, show feedback
  within 100ms of the tap, and surface timeouts with a retry.

---

## 5. Icons & Assets

- **One icon family for the whole project.** Prefer (in order) `@phosphor-icons/react`,
  `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`. `lucide-react` only if the user
  asks or the project already depends on it. Standardize `strokeWidth` globally (e.g. `1.5`).
- **Never hand-roll SVG icon paths.** If a glyph is missing, install a second library or compose from
  primitives — don't draw paths.
- **No emoji as structural icons** (nav, settings, controls) — they're font-dependent and untokenizable.
- **Verify a dependency exists in `package.json` before importing it.** If missing, state the install
  command first; never assume a library is present. Icon libraries above are **not yet installed** —
  add one before use.
- **Images:** declare `width`/`height` or `aspect-ratio` to prevent layout shift; `loading="lazy"` on
  below-the-fold images; prefer WebP/AVIF; hero image is eager/preloaded. Use seeded placeholders
  (`https://picsum.photos/seed/{descriptive}/{w}/{h}`) over broken Unsplash links.

---

## 6. Accessibility (CRITICAL — non-negotiable)

- **Contrast:** body ≥ 4.5:1, large text (≥18px / bold ≥14px) ≥ 3:1, placeholders ≥ 4.5:1. Verify;
  don't assume.
- **Keyboard:** full keyboard operability; tab order matches visual order; **never remove focus
  rings** (2–4px visible ring on every interactive element). Move focus to main content on route change.
- **Semantics:** real `<button>`/`<a>`/`<label>` elements, not clickable `<div>`s. `aria-label` on
  icon-only buttons. Sequential heading hierarchy (`h1→h6`, no skips). `alt` on meaningful images.
- **Touch targets ≥ 44×44px** with ≥ 8px spacing; expand hit area with padding if the visual is smaller.
- **Don't rely on hover or color alone** — provide tap equivalents and a second signal (icon/text)
  for functional color.
- **Forms:** visible label per input (never placeholder-as-label); error below the field with
  `role="alert"` / `aria-live`; auto-focus first invalid field on submit error; semantic input types.
- **Respect `prefers-reduced-motion`** and system text scaling (layout must not break at largest size).

---

## 7. Animation & Motion (implementation)

Design decides *whether/why* ([design.md §6](./design.md#6-motion-the-design-decision)); this section
is *how to build it without jank*.

- **Animate only `transform` and `opacity`** (GPU, skips layout+paint). Never animate `width`,
  `height`, `top`, `left`, `margin`, `padding`. Use `transform: translate/scale`, not position props.
- **Specify exact properties** — `transition: transform 200ms var(--ease-out)`, never `transition: all`.
- **CSS transitions for interruptible UI** (rapid toggles, toasts, hover) — they retarget mid-flight.
  **Keyframes restart from zero**, so reserve them for predetermined, non-interruptible motion.
- **Use `@starting-style`** for enter animations where support allows; otherwise the
  `data-mounted` attribute pattern. Prefer CSS-driven motion — it runs off the main thread and stays
  smooth while the app is busy.
- **`will-change: transform` sparingly** — only on elements that actually animate, removed after.
- **Update `transform` directly on the node** for drag/scroll-driven values, not a CSS variable on a
  parent (that recalculates every child).
- **Scroll work:** never `window.addEventListener('scroll', ...)` in React state (re-renders every
  frame). Use `IntersectionObserver`, CSS scroll-driven animations (`animation-timeline: view()`), or
  a motion library's scroll primitives.
- **If a motion library is needed**, use `motion` (`import { motion } from "motion/react"`) — but it
  is **not yet installed**; add it first and isolate motion in small leaf components. Do not mix
  GSAP/Three.js with `motion` in the same tree.
- **Every animation above MOTION 3 has a `prefers-reduced-motion: reduce` fallback** (crossfade or
  instant). Gate hover effects behind `@media (hover: hover) and (pointer: fine)`.

---

## 8. Performance

- **Core Web Vitals targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1. Reserve space for images/fonts/
  embeds to keep CLS down.
- **Code-split by route** with `React.lazy` + `Suspense`; lazy-load anything not above the fold and
  any heavy library.
- **Virtualize lists over ~50 items.** Debounce/throttle high-frequency handlers (scroll, resize,
  search input).
- **`font-display: swap`**; preload only critical fonts. Self-host or scope fonts; don't block render.
- **Keep per-frame work under ~16ms** for 60fps; move heavy work off the main thread.
- **Grain/noise filters** only on a `fixed`, `pointer-events-none` overlay — never on scrolling
  containers (continuous GPU repaint kills mobile FPS).

---

## 9. Responsive & Layout Mechanics

- **Mobile-first**, then scale up. Test at **375px** and in landscape; no horizontal scroll on mobile.
- **Every multi-column layout declares its `< 768px` collapse explicitly** in the same component
  (`grid-cols-1 md:grid-cols-3`). No "Tailwind will handle it" assumptions.
- **Fixed/sticky bars reserve safe padding** for the content beneath; respect safe areas (notch,
  home indicator) with env() insets where relevant.
- **Test the heading copy at every breakpoint** — long words + large clamp scales + narrow grids
  cause headline overflow. If it overflows, reduce the clamp max or the copy. The viewport is part of
  the design.

---

## 10. Interaction Details

- **Buttons feel pressed** — `active:scale-[0.97]` (or `-translate-y-[1px]`) with a short
  `var(--ease-out)` transition. Disable + spinner during async; feedback within 100ms of tap.
- **Dropdowns/popovers escape clipping** — a `position: absolute` menu inside an `overflow:hidden`/
  `auto` container gets clipped. Use the native `<dialog>`/popover API, `position: fixed`, or a portal.
- **One primary CTA per screen;** secondary actions are visually subordinate. No two CTAs with the
  same intent on one page ("Get in touch" + "Let's talk" = fail — pick one label everywhere).
- **CTA labels fit one line at desktop** (≤ 3 words for primary). A wrapping CTA is broken.
- **Button contrast is verified** — no white-on-white, no transparent button over a photo without a
  scrim/stroke.

---

## 11. Server & API Contract (Express 5 + MongoDB)

Frontend correctness depends on the API behaving predictably:
- **CORS is configured** on the server for the client origin; keep the allowed origins in server env,
  not hardcoded.
- **Consistent JSON shapes** — success and error responses have a stable schema the client can branch
  on. Return meaningful HTTP status codes so the client can distinguish empty (200 + `[]`) from error
  (4xx/5xx) and render the right state.
- **Never trust the client** — validate and authorize on the server even though the client also guards
  routes. `PrivateRoute` is UX, not security.
- **Secrets stay server-side** in `project-set-server/.env` (Mongo URI, API keys); never shipped to the
  bundle. `.env` files are gitignored.

---

## 12. Definition of Done

A component/screen is done only when **every** box is honestly ticked. This is the code-side gate;
the visual gate is [design.md §12](./design.md#12-pre-flight-check) — both must pass.

**Correctness & structure**
- [ ] One responsibility per component; matches existing file structure and naming?
- [ ] No raw hex in components (tokens only); no dead code / `console.log` / commented blocks?
- [ ] Every `useEffect` with a listener/timer/observer/animation has cleanup?
- [ ] No high-frequency value driven through `useState` (ref/motion-value instead)?
- [ ] All imported libraries exist in `package.json` (install command stated if not)?

**Data & states**
- [ ] Loading (skeleton), empty, and error (with retry) states all implemented for async views?
- [ ] Auth read through `useAuth`; authenticated calls through `useAxiosSecure`; `loading` guarded?
- [ ] Buttons disable + give feedback within 100ms during in-flight requests?

**Accessibility**
- [ ] Contrast verified (body 4.5:1, large 3:1); focus rings intact on all interactive elements?
- [ ] Real semantic elements; `aria-label` on icon-only buttons; sequential headings; `alt` text?
- [ ] Keyboard-operable, tab order matches visual order; touch targets ≥ 44px?
- [ ] Forms: labels visible, errors below field with `aria-live`, first invalid field focused?

**Motion & performance**
- [ ] Only `transform`/`opacity` animated; exact properties (no `transition: all`); shared curves?
- [ ] `prefers-reduced-motion` fallback above MOTION 3; hover gated behind `hover: hover`?
- [ ] No `scale(0)` entries, no `ease-in` on UI; no `window` scroll listener in React state?
- [ ] Code-split where heavy; images sized/lazy; CLS-safe; verified at 375px + landscape?

**Styling & responsive**
- [ ] Tailwind v4 utilities + `@theme` tokens only; `min-h-[100dvh]` not `h-screen`?
- [ ] Dark mode implemented in the project's one strategy and tested?
- [ ] Every multi-column layout declares its `< md` collapse explicitly?
- [ ] Semantic z-index scale (no arbitrary `z-[999]`)?

**Cross-check**
- [ ] Passes the visual [design.md Pre-Flight Check](./design.md#12-pre-flight-check), including the
      **zero em-dashes** rule and the AI-slop bans?
