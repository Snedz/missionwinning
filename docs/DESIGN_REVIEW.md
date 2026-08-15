# DESIGN_REVIEW.md — hero-flow audit checklist

Recurring pass over the five hero flows. Findings become GitHub Issues (one screen per Issue, Android-lane style); **only hero-bug-level fixes land in Horizon 0** — everything else waits ([../ORCHESTRATION.md](../ORCHESTRATION.md)). Companions: [brand-guidelines.md](brand-guidelines.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) · [DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md).

## Flows under review

1. Landing `/` → Welcome → private gate
2. I-Day onboarding → first Today
3. Today `/log` (Mission Score, next session)
4. Active `/active` → set logging → Victory
5. Coach `/coach` (plan + adapt banner)

Review on a 390×844 phone viewport first (the Playwright target); desktop second.

## Checklist (per screen)

### Brand voice
- [ ] Mission-briefing anatomy (Modernist, 2026-07-25): caps kicker → Archivo 800 display (sentence case, flush left) → one clear action. No gym-bro hype, no paywall shame bait.
- [ ] Copy leads with the wedge (logger + Mission Coach), pillars below the fold.

### Color semantics
- [ ] Red = the one "do this now" action; **exactly one primary CTA above the fold**; at most one poster-red field per page. Verified by computed background (`redActions.ts`), not by class name — a default-variant `Button` once shipped a second red CTA while the `.primary-action` count stayed at 1.
- [ ] Small red text is `--primary` (#ae1800), never `--accent-poster` — 3.78:1 fails AA below large-text sizes.
- [ ] Status colors map to `--status-*` tokens; no ad-hoc amber/blue; brass is retired.
- [ ] Colour is never the only carrier of meaning — pair it with shape, stroke or a label (WCAG 1.4.1, and `.221`'s chart).

### Card tier ladder
- [ ] ≤1 `card-boss` per screen — the only sanctioned elevation. No shadows or glows anywhere else; `card-glow-emerald` was deleted in `.139`.
- [ ] Dense/repeated rows stay on base `Card`; rules are 2px solid, never hairlines.
- [ ] Radius 0. Raw CSS bypasses the Tailwind collapse — `border-radius` in a stylesheet must be written `0`.

### Metrics & type
- [ ] All numerals `tabular-nums`; units in `.eyebrow` labels; no jitter on tick.
- [ ] Type: **Archivo only**, weights 400/600/800 — so `font-semibold`/`font-extrabold`, never `font-medium`/`font-bold` on display type (500/700 would synthesize).
- [ ] No `text-*` utility on a `.display-*` class — the utilities layer beats components and silently kills the clamp (`check-display-type`).

### Motion & feedback
- [ ] Durations/easing per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) § Motion; `prefers-reduced-motion` respected.
- [ ] Every tappable surface has press feedback; touch targets ≥44px (`tap-target`).
- [ ] No layout shift on data load — skeletons reserve space.

### States
- [ ] Empty state = **ruled** invite + CTA (`EmptyState`), not a blank void. Two 2px rules, flush left, ink square mark — **not dashed**. This line said "dashed" until `.241`, describing a treatment `.139` deliberately deleted (*"a dashed rounded box on a `bg-muted/20` fill with a 10%-opacity red icon chip and centred copy: four things the system does not do"* — `EmptyState.tsx`), so a checklist-driven fix would have rebuilt it.
- [ ] Error state is recoverable — **`ErrorState` renders no retry unless it is passed an `onAction`**, so "recoverable" means passing one, not reaching for the component. Phrased as a briefing, not a stack trace.
- [ ] **A CTA has somewhere to go.** An action that scrolls the user back to content they already passed is a dead end wearing a button.
- [ ] Loading, offline, and unauthorized each render intentionally (PWA offline shell).
- [ ] Both state rules are swept at runtime with **no seeded data** by `tests/e2e/zero-state.spec.ts`, because a blank screen passes axe perfectly.

### i18n & a11y
- [ ] Longest locale strings (de, pt) don't overflow or wrap-break the layout.
- [ ] RTL (ar) spot-check on the screen's flex/grid direction.
- [ ] Focus order sane; interactive elements labeled (axe-core `npm run a11y` green).

### Destructive actions
- [ ] Anything irreversible uses HoldToConfirm + DangerZone geography ([DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md)).

## Cadence

- Full pass before any public flip; then quarterly (pairs with the a11y quarterly in the standing queues).
- Gauntlet critics append a §Passes row, Reviewer `Gauntlet <ID>.<U> R<r>` — no second review log.
- Log each pass: date + flows covered + Issues filed, appended below.

## Passes

| Date | Reviewer | Flows | Issues filed |
|------|----------|-------|--------------|
| 2026-08-15 | Gauntlet GNT-1.U5 R1 | Phone hero `/welcome` → first set → Victory → Today | TAP_BUDGET cold-visitor green (4 taps / budget 5). Timed walk 5.215s, Continue→`/log`, Today `.primary-action` count 1. Stills `U5-R1-*.png`. Victory NEXT clipped below 390×844 fold. |
| 2026-08-15 | Gauntlet GNT-1.U4 R1 | Reentry 3/7/14 | **FAIL** (no render PASS). Guard 5/5. `/log` hit `/private`. |
| 2026-08-15 | Gauntlet GNT-1.U3 R1 | Coach week from logs | **FAIL** (no render PASS). Engine 2/2. Stills skipped — no two-history seed without demo IIFE. |
| 2026-08-15 | Gauntlet GNT-1.U2 R1 | `/log` zero-state | **FAIL:** 1 red vs cap 0. Capture `U2-R1-cold.png` is Notify-me, not Today. |
| 2026-08-15 | Gauntlet GNT-1.U1 R1 | I-Day → `/active`; Just Go set/rest/finish | **FAIL:** first-90 expected `/log`, landed `/active`. Logger mid-session stills in `docs/gauntlet/GNT-1/evidence/`. |
| 2026-08-09 | Agent (empty Active dock · .638) | `/active` zero | Closed `.637` S2: EmptyState invite-only; docked poster-field Start; Today/Builder secondary. |
| 2026-08-09 | Agent (CX/UX/UI hero walk · .637) | Welcome→Active→Victory→Today→Coach; reentry; zero | **S1 fixed:** raw i18n on readiness Today. Residual empty Active Start → closed in `.638`. |
| 2026-08-09 | Agent (Feel Wave 9 · .633) | Builder | Step rail 44px; Blank/Start red; Save outline. |
| 2026-08-09 | Agent (Feel Wave 8 · .632) | Beta, private gate, First Steps | Dogfood residual: bootstrap keys, gate taps, quiet dismiss. |
| 2026-08-09 | Agent (Feel Wave 7 · .631) | Landing FAQ, About, Vision, Library, Press | Public residual display type + 44px taps. |
| 2026-08-09 | Agent (Feel Wave 6 · .630) | Welcome, Beta start | Entry path briefing type; primary CTA first; 44px goal chips. |
| 2026-08-09 | Agent (Feel Wave 5 · .629) | Guidebook chapter, Learn course, Coaching, Feedback, History day | Red discipline + form-first utility + EmptyState. |
| 2026-08-09 | Agent (Feel Wave 4 · .628) | Track, Assessments, Calculators, Guidebook, Programs | Track log-first; toolkit residual folded. Field manual A complete on More toolkit. |
| 2026-08-09 | Agent (Feel Wave 3 · .627) | Learn, Move, Mind, Library, Builder, Benchmarks, Leaderboard | Paths/free-first; premium+tests folded; brief More rail chrome. Field manual A complete. |
| 2026-08-09 | Agent (Feel Wave 2 · .626) | Fuel, History, Coach | Log-first Fuel; heatmaps/coach depth folded. Field manual A. |
| 2026-08-09 | Agent (Account Field manual · .625) | `/account` | Day-one stack open; More settings folds secondary cards. |
| 2026-08-09 | Agent (You Field manual · .624) | `/profile` | Identity hero-first; edit under details; 0 red. Continues Field manual from .619. |
| 2026-08-09 | Agent (hero feel · .619) | Today, Active, Victory, Coach | Field manual composition: briefing hierarchy; Finish outline on Active; Victory poster-field next; Coach adapt kicker. B/C presets catalogued not shipped. |
| 2026-08-06 | Agent (web-first UX · .536–.538) | Today, Victory, Coach, Fuel | Continuity on both Today shells; Coach session why (Wave 8); Fuel Empty/Error; Victory secondary Super Bundle links (one primary CTA). Ritual: design better = laws-as-checks; think better = problem register; communicate better = honest inventory; impact = one-app continuity vs multi-app Super Bundle. |
| 2026-07-25 | Agent (public site · .129) | Landing, all 8 SEO templates, guide, press, bundle | **Blocker found first: 94 of 219 advertised exercise URLs returned 404** (`generateStaticParams` read the exercise catalog without awaiting the lazy extended modules); sitemap 95 non-200 → 0, with a `@gate` test that fetches every `<loc>`. Then: `PublicPageShell` replaces `PublicSeoHeader`/`Footer` across ~250 URLs whose `h1` had no `font-display` — the `.126` defect, unfixed everywhere but `/`. One `maxWidth` for header + body (was `4xl` vs `3xl`, headline outdented from its own copy); `.display-section` not `.display-hero` (hero floor wraps an exercise name to 3 lines at 390px); one emerald CTA above the fold; full footer with legal + disclaimer (**was on 3 of ~270 public URLs**). `PublicNavMenu` on Radix Dialog — the nav had **zero links at 390px**. **Global `:focus-visible`** on the unused `--ring`; ring removed from `button.tsx` so there is one indicator. Ten sites had `text-*` nullifying a `.display-*` clamp (utilities layer beats components) → fixed + `scripts/check-display-type.mjs` in the gate. Also `/compare` CTA read "Begin", `MarketingNav` CTA was a non-link `router.push`, `.animate-otp-shake` missed reduced-motion, `themeColor` off by two points, ~112 lines dead hero CSS. **`@gate` 16→25 · `@a11y` 10→20.** Deferred with reason: `viewportFit: 'cover'` (no sticky header is inset-guarded — it would create the bug it appears to fix). |
| 2026-07-25 | Agent (a11y tokens · .127) | Global | Fixed: emerald split into `--primary` (accent, 7.08:1 on navy) + `--primary-fill` (white text, 5.38:1) — no single value serves both roles; `--muted-foreground` 58→62%; `.section-index` un-dimmed; WeekStrip empty/missed days de-emphasised by border not opacity; `.xp-word` transform-only. `BrandMonogram` extracted (logotype keeps the accent, WCAG 1.4.3). **`npm run a11y` 8 failing routes → 10/10**, and de-flaked (axe now waits for animations to settle). |
| 2026-07-25 | Agent (homepage rebuild · .126) | Landing | Fixed: `/` moved onto the briefing type system (H1 was rendering in Inter, not Barlow Condensed) + nav wordmark; structure re-cut as the product loop; decorative `section-index` numbering dropped; `LogToPlanHero` signature on the real progression engine; `CoachAdaptDemo` made visitor-driven (was a 2.8s auto-carousel); free-core checkmarks → definition list; `/art/hero-field` replaces gradient orbs; `text-balance` on display headings; dead `HeroDemo`/`JourneyScroll`/`GuideTeaser` removed. New `@gate` assertions for display face + demo causality. **Open (founder):** white-on-emerald contrast 2.76:1 site-wide. |
| 2026-07-22 | Agent (emerald glow · .107) | Landing, Today | Fixed: hero ambient orbs + `card-glow-emerald` demo; Win/Mission Score `.ring-glow-emerald`; stronger `primary-action` bloom; ≤1 glow on landing (hero only). |
| 2026-07-22 | Agent (responsive layout · .106) | Landing, Today | Fixed: narrow hero centered; landscape compact 2-col; Today ProgressRing + MetricsRow above fold (HeroDemo parity); Trends collapsed. |
| 2026-07-22 | Agent (hero a11y + logic · .105) | Active, Gate, Today, Fuel | Fixed: hydrate Start gate; SessionCheckIn Escape/focus; axe `/active`/`/private`/`/nutrition`; 44px empties/RPE/Copy/beta chips; reduced-motion rest; Today ≤1 primary-action e2e. Cleared stale Batch C deferred notes. |
| 2026-07-22 | Agent (D4 beta composure · .104) | Landing, Gate, Bundle, Today (web), Android Today | Fixed in-sprint: Landing ≤6 bands (cut StatBand/Journey/Guide/pillar bento/email); nav CTA ghost; HeroDemo muted post-demo CTA; wedge metadata/About/Press/brand; Bundle one-offer; Today QuickLinks+accordion under More; Android secondary cards demoted (hero elevated only). Founder: Accept B re-walk + promote `.104`. |
| 2026-07-22 | Agent (D3 founder override · .103) | Fuel/Move/Mind/Learn; token sync; Batch C IT/RU/KO/JA; Profile/Fuel extract | Fixed in-sprint: one-emerald pillar CTAs; Fuel FAB demoted; `check-token-sync`; danger token aligned; hero bars verified (no named #1 phone-QA bug). |
| 2026-07-22 | Agent (D-prelaunch) | Today, Active, Victory, Landing, Gate, Beta, Android Today/Rest/Victory | Fixed in-sprint: Today composure; Active intent+oversized rest; Victory one-exit; Landing product plane; gate/beta briefing; Android parity. No separate Issues. |
| 2026-07-22 | Agent (D1+D2 founder override) | Landing, Welcome, Bundle, Victory, Today, Coach adapt, Android Today/Victory | Fixed in-sprint: Landing V1 density; Welcome ≤3 Q / 3 steps; Bundle thin hero; Victory lock+brass volume; score coach-line; adapt glance. No separate Issues. |
| 2026-07-22 | Agent (Design Orchestration D0) | `/log` Today, `/active`→Victory, Android Today/Active | Fixed in-sprint: Today competing emerald; Active PR/rest/next-set craft. Android glow demotion. D1/D2 later same day under founder override. |
| 2026-07-21 | Agent (Horizon 0) | `/`→gate, Welcome, `/log`, `/active`→Victory, `/coach` | Fixed in-sprint (no separate Issues): invite→`/private` friction; gate invitee expand; beta guide/banner wedge (Train→Coach); Coach empty-state “Unlock” vs Generate mismatch; ES/FR gate “everything app” subtitle → wedge. Post-flip residual: landing proof-chip density only (Batch C shipped in `.103`). |
| 2026-07-22 | Agent (H0 residual) | Landing hero density; invite smoke SSR; hero Mission Score e2e | Landing chips/trust row collapsed (one subtitle + one CTA). Invitee `data-mw-invitee` SSR for gate-smoke. Mission Score path fail-closed via Active. `@visual` Linux baselines soft in CI. |
| 2026-07-22 | Agent (.95) | Public `/guide` chapter CTAs | Wired `publicGuidePracticeCta` so anonymous practice links never dump into gated `/log`/`/nutrition` etc. Magazine body shared renderer. |

### 2026-08-09 CX/UX/UI hero pass ritual (`.637`)

- **Design better:** measure what the athlete *reads* (raw keys, competing CTAs), not class names alone — poster-field red lives on the field, not the nested button.
- **Think better:** composition waves closed chrome; residual excellence risk was honesty of copy under bootstrap hydrate.
- **Communicate better:** findings table with severity; kill false positives (Today “no red” when dock is poster-field).
- **Create more impact:** one S1 on the post-session Today beat (Peak-End → reopen) beats another peripheral Feel Wave.
- **Next wave differently:** founder phone excellence walk on Horizon W 1–5 before more surface polish.

### 2026-07-22 Design Orchestration D0 pass notes

- **OS shipped:** [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) — emotion arc, quality bars, waves D0–D3; Wave 7 research synthesis.
- **Today:** JourneyHero remains the sole emerald `primary-action`; secondary surfaces muted.
- **Active:** Rest glanceable; PR = brass chip on row; next-set auto-seed with Apply/Copy only when needed.
- **Android:** Accept B still founder-owned; agent prep updated for D0 craft.
- **Do not ship yet:** ~~D1 conversion surfaces; D2 retention emotion~~ — **shipped under founder override** (see D1+D2 pass).

### 2026-07-22 D-prelaunch pass notes

- **Today:** score + coach line above fold; readiness rings/sparklines/muscle collapsed.
- **Active:** session brief eyebrow; readiness trim below sets; rest clock oversized (5xl/6xl).
- **Victory:** one next CTA; History/Share as quiet text.
- **Landing/Gate/Beta:** product plane + briefing forms (no card farm).
- **Android 1.24.1:** Form strip composure; rest 80sp; Victory brass = volume only.

### 2026-07-21 pass notes

- **Phone viewport target:** 390×844 (code + live `/private` smoke; invitee UX ships with this commit — prod still shows waitlist-first until deploy).
- **Brand / wedge:** Gate + beta surfaces now lead with logger + Mission Coach, not rankings/languages/everything-app.
- **CTA:** Invitee path puts access-code form first; cold traffic keeps waitlist primary.
- **Do not redesign:** Landing layout, card tiers, new sections left untouched.
