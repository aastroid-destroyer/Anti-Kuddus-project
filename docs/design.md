# Design System — Permanent Reference

> The taste layer. This document decides **what the product looks like, feels like, and why**.
> Its companion, [frontend-rules.md](./frontend-rules.md), decides **how it is built in code**.
> Every screen, page, and component in this project must be able to survive the
> [Pre-Flight Check](#12-pre-flight-check) at the bottom of this file before it ships.

Synthesized from four design engineering philosophies: **Emil Kowalski** (motion & polish),
**UI/UX Pro Max** (systematic UX rules), **Impeccable** (production craft & anti-slop),
and **Taste** (anti-templated visual direction). Where they overlap, the stricter rule wins.

---

## 0. Core Philosophy

Four ideas sit under every rule below. When a rule feels ambiguous, resolve it toward these.

1. **Taste is trained, not innate.** Good taste is a trained instinct, not personal preference.
   Study why the best interfaces feel the way they do, then reverse-engineer that feeling into
   this system. Do not ship the first thing that "works."
2. **Unseen details compound.** Most polish is never consciously noticed. That is the point.
   A thousand barely-audible correct decisions add up to software people love without knowing why.
3. **Beauty is leverage.** People choose tools on the whole experience, not just function. Good
   defaults and good motion are real differentiators. Use beauty deliberately to stand out.
4. **The AI-slop test.** If a stranger could glance at the interface and say "AI made that"
   without doubt, it has failed. Sections [9](#9-ai-slop--forbidden-patterns) and
   [12](#12-pre-flight-check) exist to defeat this.

---

## 1. Read the Room First (Brief Inference)

Before any color, font, or layout decision, **infer what this surface actually needs.** Most bad
output comes from jumping to a default aesthetic instead of reading the context.

### 1.A Signals to read
- **Surface kind** — marketing/landing (design *is* the product) vs. app/dashboard/tool
  (design *serves* the product). This split changes every downstream rule.
- **Audience** — who uses it, where, under what light, in what mood. Write one physical sentence
  describing the scene. If it doesn't force an aesthetic answer, it isn't concrete enough yet.
- **Vibe words** the request used — "minimal", "calm", "playful", "premium", "serious B2B",
  "editorial", "dark tech". The audience picks the aesthetic, not our personal preference.
- **Existing brand** — colors, type, logo already in the codebase are starting material, not
  optional input. Identity preservation wins over fresh aesthetics unless a redesign is requested.

### 1.B Declare a one-line "Design Read"
Before generating a new surface, state it in one line:
> *Reading this as: `<surface kind>` for `<audience>`, with a `<vibe>` language, leaning toward `<aesthetic family>`.*

If the brief is genuinely ambiguous, ask **exactly one** clarifying question. If it can be
confidently inferred, do not ask — declare the read and proceed.

### 1.C Anti-default discipline
Do **not** reflexively reach for: AI-purple/blue gradients, centered hero over dark mesh, three
equal feature cards, glassmorphism on everything, infinite micro-animations, `Inter` + `slate-900`,
cream/beige body backgrounds. These are the training-data defaults. Reach past them on purpose.

---

## 2. The Three Dials

After the design read, set three 1–10 dials. They gate layout, motion, and density decisions.
Overrides happen conversationally, never by guessing.

| Dial | 1–3 | 4–7 | 8–10 |
|---|---|---|---|
| **VARIANCE** (layout boldness) | Symmetric, centered, predictable | Offset, asymmetric white-space | Masonry, fractional grids, large empty zones |
| **MOTION** (animation intensity) | Static; `:hover`/`:active` only | Fluid CSS transitions, load-ins | Scroll choreography, parallax, physics |
| **DENSITY** (information packing) | Art-gallery airy (`py-32`+) | Daily-app spacing (`py-16`–`py-24`) | Cockpit; hairlines, mono numbers |

**Baseline presets:**

| Surface | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Marketing / landing | 7 | 6 | 4 |
| Product / app UI | 4–5 | 3–4 | 5–6 |
| Dashboard / data | 5 | 3 | 7–8 |
| Trust-first / regulated | 3 | 2 | 5 |

**Motion claimed = motion shown.** If MOTION > 4, the surface must actually move (hero entry,
scroll reveals, hover feedback). A static page claiming MOTION 7 is broken. If working motion can't
be shipped in scope, drop the dial to 3 and ship a clean static surface. Never half-build motion
that breaks.

---

## 3. Color

Color is chosen from a **strategy first**, then hues. Never pick hex values before deciding how
much color the surface commits to.

### 3.A Pick a color strategy (commitment axis)
- **Restrained** — tinted neutrals + one accent ≤10% of surface. *Default for product/app UI.*
- **Committed** — one saturated color carries 30–60% of surface. *Default for identity-driven brand pages.*
- **Full palette** — 3–4 named roles, each used deliberately. *Campaigns, data viz.*
- **Drenched** — the surface *is* the color. *Heroes, campaign pages.*

### 3.B Rules (non-negotiable)
- **Use OKLCH** for all custom color definitions. Tinted neutrals add only 0.005–0.015 chroma
  toward the brand hue — do not default-tint warm "because it feels premium."
- **Max one accent color per surface, saturation < 80% by default.** Once chosen, that accent is
  used identically across the *entire* page. A warm-grey site does not get a blue CTA in section 7.
- **The LILA rule** — no automatic AI-purple/violet button glows or neon gradients. Use neutral
  bases (zinc/slate/stone) with a single high-contrast accent (emerald, electric blue, deep rose,
  burnt orange). *Override:* if the brand explicitly is purple, embrace it with intent.
- **No pure `#000000` or `#ffffff`.** Use off-black (zinc-950 / warm near-black) and off-white.
  Pure values kill depth.
- **The cream/beige ban** — the warm-neutral near-white band (OKLCH L 0.84–0.97, C < 0.06,
  hue 40–100) is the saturated AI default. Token names like `--cream`, `--sand`, `--paper`,
  `--bone`, `--linen` are tells in themselves. Carry "warmth" through accent + type + imagery,
  not the body background.
- **Contrast is verified, not assumed** — body text ≥ 4.5:1; large text (≥18px or bold ≥14px) ≥ 3:1;
  placeholder text ≥ 4.5:1 (not the muted-gray default). Light gray body text "for elegance" is the
  single biggest reason AI designs feel unreadable. When close, bump toward the ink end of the ramp.
- **Gray text on a colored background looks washed out.** Use a darker shade of the background's own
  hue, or a transparency of the text color.
- **Functional color needs a second signal.** Error red / success green must also carry an icon or
  text — never color alone (colorblind users, WCAG).

### 3.C Dark mode (design both from the start)
- Design light and dark **together**, never one and infer the other. Test both before shipping.
- Dark mode uses desaturated / lighter tonal variants, **not inverted colors.** Verify contrast
  separately in dark.
- Hierarchy parity: if a CTA pops in light, it pops in dark. Brand accent stays recognizable
  (don't desaturate the brand away).
- One theme per page — sections do not flip from dark to a warm-paper light block mid-scroll.

---

## 4. Typography

- **One type system per project.** Define a scale (e.g. `12 · 14 · 16 · 18 · 24 · 32 · 48`) and a
  weight hierarchy: headings 600–700, body 400, labels 500.
- **Sans default, not `Inter` by reflex.** Prefer `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`,
  or a brand-appropriate face. *Inter is acceptable* only for neutral/standard/accessibility-first briefs.
- **Serif is very discouraged as a default.** "It feels creative/premium/editorial" is *not* a
  reason. Serif only when the brand names one, or the family is genuinely editorial/luxury/heritage
  *and* the specific serif is justified. **`Fraunces` and `Instrument Serif` are banned as defaults.**
- **Pair on a contrast axis** (serif + sans, geometric + humanist) or use one family in multiple
  weights. Never pair two fonts that are similar-but-not-identical.
- **Emphasis stays in-family.** To emphasize a word in a headline, use italic or bold of the *same*
  font. Injecting a random serif word into a sans headline is amateur.
- **Body measure 65–75ch.** Mobile 35–60 chars/line. Use `text-wrap: balance` on h1–h3 and
  `text-wrap: pretty` on long prose.
- **Display ceiling ~6rem (96px).** Above that the page is shouting, not designing. Display
  letter-spacing floor ≥ −0.04em (tighter and letters touch).
- **Body ≥ 16px** on mobile (below it iOS auto-zooms), line-height 1.5–1.75.
- **Tabular figures** for data columns, prices, and timers to prevent layout shift.
- **Italic descender clearance** — italic display words containing `y g j p q` need `leading-[1.1]`
  minimum + a `pb-1`/`mb-1` reserve, or the descender clips.

---

## 5. Layout & Spacing

- **4/8px spacing rhythm** everywhere; define tiers (16 / 24 / 32 / 48) by hierarchy and vary
  spacing for rhythm rather than one uniform gap.
- **Grid for 2D, Flex for 1D.** Don't default to Grid when `flex-wrap` fits. Responsive grids
  without breakpoints: `repeat(auto-fit, minmax(280px, 1fr))`. Avoid brittle flex percentage math
  (`w-[calc(33%-1rem)]`).
- **Anti-center bias** when VARIANCE > 4 — force split-screen, left-content/right-asset, or
  asymmetric white-space over the reflexive centered hero. *Centered is OK* for editorial/manifesto
  briefs where the message is the design.
- **Cards are the lazy answer.** Use a card only when elevation communicates real hierarchy;
  otherwise group with `border-t`, `divide-y`, or negative space. **Nested cards are always wrong.**
  Identical repeated card grids (icon + heading + text ×6) are banned.
- **Shape consistency lock** — pick ONE corner-radius system (all-sharp / all-soft 12–16px /
  pill for interactive) and follow it everywhere. Mixed radii need a documented rule.
- **Shadows tint to the background hue.** No pure-black drop shadows on light surfaces. Keep one
  consistent elevation scale for cards/sheets/modals.
- **Contain page width** (`max-w-7xl mx-auto` or `max-w-[1400px]`). Consistent gutters that adapt by
  breakpoint. No horizontal scroll on mobile.

### 5.A Hero discipline (marketing surfaces)
- Hero fits the initial viewport: headline ≤ 2 lines, subtext ≤ 20 words *and* ≤ 4 lines, CTA
  visible without scroll. Plan font size and asset size together.
- Hero top padding ≤ `pt-24` at desktop — more and the content floats halfway down as a bug.
- **Max 4 text elements in a hero:** (eyebrow OR brand strip), headline, subtext, CTAs
  (1 primary + max 1 secondary). No tagline below CTAs, no trust micro-strip, no feature bullets.
  "Trusted by" logo walls live *under* the hero, never inside it.

### 5.B Section discipline
- **No layout-family repeats.** Across 8 sections use ≥ 4 different layout families. "Selected
  work" must not look like "What we do."
- **Zigzag cap** — max 2 consecutive image+text-split sections. The 3rd in a row fails pre-flight.
- **Marquee max one per page.** A second horizontal marquee reads as filler.
- **Split-header ban** — no "big left headline + tiny floating right explainer paragraph." Stack
  headline over body (max 65ch) instead.
- **Bento grids have exactly N cells for N items** (no empty middle/end cell) and real background
  variety in 2–3 cells (image, brand gradient, pattern — not all white-on-white text cards).
- **Navigation on one line at desktop, height ≤ 80px** (default 64–72). A two-line desktop nav is broken.

---

## 6. Motion (the design decision)

Motion is decided here (whether / why) and implemented in
[frontend-rules.md §7](./frontend-rules.md#7-animation--motion-implementation) (how).

### 6.A Should it animate at all?
Decide by frequency of exposure:

| Frequency | Decision |
|---|---|
| 100+ times/day (shortcuts, command palette) | **No animation, ever.** |
| Tens of times/day (hover, list nav) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, celebration) | Delight allowed |

**Never animate keyboard-initiated actions.** Animation makes repeated actions feel slow. Raycast
has no open/close animation — that is correct for something used hundreds of times a day.

### 6.B Every animation states its purpose
Each one must answer "why does this move?" in one sentence: **hierarchy** (draw attention),
**storytelling** (reveal in sequence), **feedback** (acknowledge an action), **state transition**
(show something changed), or **preventing jarring change**. "It looks cool" for something seen often
is not a purpose — cut it.

### 6.C Easing & duration (the feel)
- **Entering/exiting → ease-out** (fast start, feels responsive). **Moving/morphing → ease-in-out.**
  **Hover/color → ease.** **Constant motion (marquee/progress) → linear.**
- **Never use `ease-in` for UI** — it delays the moment the user is watching most, feeling sluggish.
- **Use strong custom curves**, the built-in ones lack punch:
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
  - `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`
  - `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` (iOS-like)
- **Durations:** button press 100–160ms · tooltip 125–200ms · dropdown 150–250ms ·
  modal/drawer 200–500ms. **UI animations stay under 300ms.** A 180ms dropdown feels faster than 400ms.
- **Exit faster than enter** (~60–70% of enter duration). Slow where the user decides, fast where the
  system responds.
- **Springs** for drag, "alive" elements, and interruptible gestures (they retain velocity when
  interrupted). Keep bounce subtle (0.1–0.3); avoid bounce in most product UI. Prefer Apple-style
  `{ duration, bounce }` config.

### 6.D Craft details that compound
- **Never animate from `scale(0)`** — nothing in the real world appears from nothing. Start from
  `scale(0.95)` + `opacity: 0`.
- **Buttons feel responsive** — `transform: scale(0.97)` on `:active` (subtle 0.95–0.98).
- **Popovers/tooltips are origin-aware** — scale in from their trigger, not center. *Modals are
  exempt* (they stay centered).
- **Stagger lists** 30–80ms between items. Stagger is decorative — never block interaction on it.
- **Reveal animations enhance an already-visible default.** Never gate content visibility on a
  class-triggered transition; it never fires on hidden tabs / headless renderers and ships blank.

### 6.E Accessibility of motion (mandatory above MOTION 3)
- Honor `prefers-reduced-motion`: keep opacity/color transitions that aid comprehension, remove
  movement/position/parallax/scroll-hijack. Reduced motion means *gentler*, not zero.
- Gate hover-scale effects behind `@media (hover: hover) and (pointer: fine)` so touch taps don't
  trigger false hovers.

---

## 7. Component States (never ship the happy path only)

Every interactive component implements its full lifecycle, not just the successful state:
- **Loading** — skeleton loaders matching the final layout's shape (not a generic centered spinner)
  for anything > 300ms.
- **Empty** — a composed message that explains how to populate it, with a clear action.
- **Error** — inline near the field (forms) or contextual (toasts for transient). States cause +
  recovery path, never just "Invalid input."
- **Disabled** — reduced opacity (0.38–0.5) + cursor change + the semantic attribute.
- **Success** — brief confirmation (checkmark / toast / flash).
- **Tactile feedback** — `:active` uses `-translate-y-[1px]` or `scale(0.98)` to simulate a press.
- **Focus** — a visible focus ring (2–4px) on every interactive element. Never remove focus outlines.

---

## 8. Forms & Data

- **Label above the input, always.** No placeholder-as-label, ever. Helper text present in markup;
  error text below the field.
- **Validate on blur, not per keystroke.** Show the error only after the user finishes the field.
  On submit error, auto-focus the first invalid field; for many errors show a summary with anchors.
- **Semantic input types** (`email`, `tel`, `number`) to trigger the right mobile keyboard; support
  autofill; password fields get a show/hide toggle.
- **Destructive actions** use the semantic danger color, are spatially separated from the primary
  action, confirm before firing, and offer undo where possible.
- **Charts:** match type to data (trend→line, comparison→bar, proportion→pie ≤5 slices). Always a
  legend + tooltip; never color alone (add pattern/label); provide an accessible text summary; show
  a real empty state, not a blank axis frame.

---

## 9. AI-Slop — Forbidden Patterns

These are the signatures the model defaults to when it tries to "look designed." Hard bans unless
the brief explicitly demands one. (Category-reflex test: if someone could guess the theme + palette
from the product category alone, rework it.)

### 9.A Visual / CSS
- **No neon or outer glows** by default — use inner borders or subtle tinted shadows.
- **No pure black `#000000`.** Off-black / charcoal.
- **No gradient text** (`background-clip: text` on a gradient) — decorative, never meaningful.
  Single solid color; emphasis via weight or size.
- **No glassmorphism as default** — rare and purposeful, or nothing. Provide a solid fallback under
  `prefers-reduced-transparency`.
- **No side-stripe borders** (`border-left/right` > 1px as a colored accent). Rewrite with full
  borders, background tints, or leading numbers/icons.
- **No custom mouse cursors** (outdated, accessibility- and perf-hostile).
- **No the-hero-metric template** (big number, small label, gradient accent, SaaS cliché).

### 9.B Scaffolding tells
- **No tiny uppercase tracked eyebrow above every section.** Max **1 eyebrow per 3 sections**
  (hero counts as 1). Mechanical check: count `uppercase tracking` micro-labels; if the count
  exceeds `ceil(sectionCount / 3)`, it fails. Usually the right move is to drop the eyebrow entirely.
- **No numbered section markers as default** (`01 / About`, `002 · Capabilities`, `Stage 1`).
  Numbers earn their place only when the section genuinely *is* an ordered sequence.
- **No decorative status dots** on every nav item / list row / badge — only for real semantic state,
  sparingly.
- **The middle-dot `·` is rationed** — max 1 per metadata line, never the default separator for
  everything.

### 9.C Content & copy tells
- **No generic names** ("John Doe", "Sarah Chan") → realistic, locale-appropriate names.
- **No generic avatars** (SVG "egg", Lucide user icon) → believable placeholders.
- **No fake-perfect numbers** (`99.99%`, `50%`, `1234567`) and no fake-precise invented specs
  (`92%`, `5.8mm`) — use real or explicitly-mocked messy data.
- **No startup-slop brand names** ("Acme", "Nexus", "SmartFlow") → contextual, real-sounding names.
- **No filler verbs** ("Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize") → concrete verbs.
- **No performative-craftsman labels** ("From the field", "Field notes", "Quietly trusted by"),
  weather/locale strips ("LIS 14:23 · 18°C"), scroll cues ("↓ Scroll to explore"), or version stamps
  (`v1.4.2`, `Build 0048`) on marketing pages.
- **Copy self-audit before ship** — re-read every visible string. Rewrite anything grammatically
  broken, with unclear referents, or that reads like an LLM trying to sound thoughtful. Boring copy
  beats cute-but-wrong copy.

### 9.D Assets
- **No div-based fake screenshots** (fake dashboards/terminals built from styled `<div>`s) — the #1
  tell. Use a real screenshot, a generated image, a real mini component preview, or no preview.
- **No hand-rolled SVG icons** — use one icon family (see frontend-rules §5). **No hand-rolled
  decorative SVG illustrations** as default.
- **Real images even on minimalist sites** — a pure-text page is incomplete, not minimal. Use a
  generated image, then a seeded placeholder (`https://picsum.photos/seed/{descriptive}/{w}/{h}`),
  and only then a clearly-labeled TODO slot.
- **No pills/labels overlaid on images** and no pretentious photo-credit captions on stock images.

### 9.E The em-dash ban (non-negotiable, the #1 tell)
**The em-dash `—` and separator en-dash `–` are completely banned** in all user-visible text:
headlines, eyebrows, pills, body, quotes, attribution, captions, buttons, alt text. There is no
"limited use" allowance. Replace with a period, a comma, parentheses, a colon, or restructure into
two sentences. The only permitted dashes are the regular hyphen `-` (compounds, ranges like
`2018-2026`, `€40-80k`) and the math minus. A single `—` anywhere visible fails pre-flight.

---

## 10. Cohesion

The best components feel right partly because the *whole* experience is coherent. Match motion,
color, type, radius, and copy register to one personality:
- A playful product can be bouncier; a professional dashboard is crisp and fast.
- One copy register per page — don't mix terminal-mono, editorial prose, and marketing punch unless
  the brand voice explicitly calls for it.
- Review your work the next day (or after a break) with fresh eyes. Play animations in slow motion to
  catch timing issues invisible at full speed.

---

## 11. Building Loved Components (the Sonner principles)

When designing a reusable component or pattern, optimize for adoption and delight:
1. **Developer experience is the feature.** Minimal setup, sane defaults, call from anywhere.
2. **Good defaults beat options.** Ship beautiful out of the box; most users never customize.
3. **Handle edge cases invisibly** — pause timers on hidden tabs, capture pointer during drag, fill
   gaps between stacked items. Users never notice, which is exactly right.
4. **Cohesion over cleverness** — the easing, timing, and visual design all fit one vibe.

---

## 12. Pre-Flight Check

Run before any surface ships. **If a single box can't be honestly ticked, it is not done.**

**Direction & foundation**
- [ ] Design read declared (§1.B one-liner)?
- [ ] Dials set and reasoned from the brief, not silently baseline?
- [ ] One theme (light/dark/auto) locked for the whole page; no mid-scroll inversion?
- [ ] One accent color used identically across all sections?
- [ ] One corner-radius system applied consistently?

**Color & type**
- [ ] Body text ≥ 4.5:1, large text ≥ 3:1, placeholders ≥ 4.5:1 — verified, not assumed?
- [ ] No pure `#000`/`#fff`, no cream/beige AI-default body background?
- [ ] Sans default (not reflexive `Inter`); if serif, justified and not `Fraunces`/`Instrument Serif`?
- [ ] Italic descenders (`y g j p q`) have `leading-[1.1]` + reserve?
- [ ] Body ≥ 16px mobile, measure 65–75ch, display ≤ 6rem?

**Layout**
- [ ] Hero fits viewport (≤ 2-line headline, ≤ 20-word subtext, CTA visible, `pt-24` cap)?
- [ ] Hero ≤ 4 text elements; "trusted by" wall lives under the hero?
- [ ] ≥ 4 different layout families across the page; ≤ 2 consecutive zigzag sections?
- [ ] Eyebrow count ≤ `ceil(sectionCount / 3)`?
- [ ] Nav on one line at desktop, height ≤ 80px?
- [ ] Cards used only for real hierarchy; no nested cards, no identical ×6 card grid?
- [ ] Bento has exactly N cells for N items with real background variety?

**Motion & states**
- [ ] Every animation justifiable in one sentence; MOTION-claimed = MOTION-shown?
- [ ] No `scale(0)` entries, no `ease-in` on UI, no `transition: all`; custom curves used?
- [ ] `prefers-reduced-motion` honored above MOTION 3; hover-scale gated behind `hover: hover`?
- [ ] Loading / empty / error / disabled / success / focus states all present?

**Anti-slop**
- [ ] **ZERO em-dashes (`—`/`–`) anywhere visible?**
- [ ] No gradient text, side-stripe borders, neon glows, custom cursors, decorative dots?
- [ ] No div-based fake screenshots, hand-rolled icons, or pure-text "minimalism"?
- [ ] No generic names / Acme / fake-perfect numbers / filler verbs / performative labels?
- [ ] Copy self-audit done — every visible string re-read and sane?
- [ ] Could a stranger say "AI made that"? If yes, rework until no.
