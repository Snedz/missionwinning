# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22).

---

## 2026-07-26 — Rings come off, the ramps go on (`.139`)

Phase A of the **second** Modernist handoff (`design_handoff_missionwinning_modernist`),
which covers the 13 signed-in screens the first handoff deliberately left. Its
token sheet turned out to match what `.131` already shipped — poster `#ec3013`,
`accent-600` = `--primary-fill`, `accent-700` = `--primary` — so P0 was already
done and this is the primitives layer instead.

- **Both ramps added** — `--neutral-100…900` and `--accent-100…900`. The screens
  need steps the semantic roles never covered: ink panels (rest dock, flow
  runner) are `neutral-900`/`neutral-100`, the honor tier is `accent-800`.
  **100/600/700 are aliases** of `--accent-tint`/`--primary-fill`/`--primary`, so
  ramp and roles cannot drift. The indirection points scale → role, which looks
  backwards, because `check-token-sync.mjs` regex-parses `:root` for literal HSL
  triplets and a `var()` on `--primary` would blind the gate. Poster red is
  **not** a ramp step — it sits between 500 and 600.
- **`ProgressRing` deleted**, and with it the "42% of nothing" problem: the
  `MacroCalculator` rings drew arcs against invented ceilings (`protein/200`,
  `carbs/300`). Scores → `ScoreNumeral` (tabular numeral, `value={null}` renders
  an em-dash so first-run shows "not measured yet", never a 0). Budgets →
  `MeterBar`. Fuel lost two rings that restated the bars directly beneath them.
- **`MeterBar` tracks are `neutral-300`, not the sheet's `neutral-200`** — that
  value assumes the paper ground; on a `--card` panel #eae7e7 is a 1.01:1
  difference and an empty track vanishes, which is the state a budget bar is in
  all morning.
- **Deleted:** `card-glow-emerald`/`-brass`, `ring-glow-emerald`, `ring-draw-in`,
  `texture-noise` (already a no-op), `texture-grid` and `--grid-line` (zero call
  sites). Replaced by `card-boss` (≤1 per screen — tint + poster border + the
  only sanctioned elevation), `card-section`, `is-active-row`/`is-active-tab`,
  and `seg`/`seg-opt`.
- **Fixed a pre-existing WCAG 1.4.1 failure** — `npm run a11y` was **18/20, not
  20/20**, on `/paths` and `/compare`. `text-primary hover:underline` (56 call
  sites) leaves a red link separated from muted body copy by hue alone at rest:
  #ad1700 on #484747 is 1.27:1 against a 3:1 floor, and hover is no remedy on
  touch. One base rule (`p a` underlined at rest, scoped to `<p>` so nav and
  card links are untouched) beats 56 edits. Now **20/20**.
- Gates: `npm run gate` 26/26, `npm run a11y` 20/20.

## 2026-07-25 — Email leaves plain text behind (`.138`)

The last rebrand surface. Every Mission Winning email was a `[...].join('\n')`
text body; the handoff ships three send-ready Modernist HTML templates.

- **`sendTransactionalEmail` takes `html?`** — sent multipart alongside `text`,
  which stays mandatory as the fallback, so all six existing senders are
  untouched.
- **Templates live in `src/emails/templates/`** byte-for-byte from the handoff
  (that table markup is what survives Outlook; rebuilding it in JSX would only
  add risk). `renderEmail()` replaces the four per-send literals: unsubscribe
  URL, postal address, access code, origin.
- **Wired:** waitlist-confirm → `app/api/leads/route.ts`; launch-day →
  `scripts/send-launch-broadcast.mjs`; **beta-invite → `scripts/send-beta-invite.ts`,
  which did not exist** — the invite was previously text printed to stdout for
  manual copy-paste. Dry-run by default, `--send` to deliver, and it refuses to
  send from the `resend.dev` test domain.
- **`MAIL_POSTAL_ADDRESS` is now required before any list mail** ([docs/ENV.md](docs/ENV.md)).
  CAN-SPAM §7704(a)(5) requires a physical address; rather than mailing
  "[postal address], USA" to the waitlist, the renderer refuses (waitlist confirm
  degrades to text-only and logs why; broadcast and invite exit non-zero). It is
  founder data and is never invented here.

## 2026-07-25 — The guidebook cover, re-inked (`.137`)

The magazine was the last surface still on a pinned pre-rebrand palette (`.131`
held it back deliberately until its cover could be recut properly).

- **Magazine palette joins the system**: `--mag-paper`/`--mag-ink`/`--mag-navy`/
  `--mag-fg-on-dark` now read the global tokens instead of literal navy/cream;
  `--mag-brass` resolves to the neutral ramp (brass retired).
- **Cover** per `Guidebook Cover.dc.html`: flat **ink field** with paper type —
  MW square + wordmark over a 2px rule, caps kicker, Archivo 800 title, subtitle,
  version/origin meta. The gradient `hero-field` and `texture-grid` are gone.
- **PDF rebuilt through the real print path**: 27 pages / 4.5 MB, inside the
  script's own 12–36 page + min-byte validation. `print-color-adjust: exact` on
  `.magazine-root` is inherited, so the ink field prints rather than dropping out.
  (No local poppler, so the PDF's rendered cover wasn't eyeballed page-by-page —
  the on-screen print route was, and print CSS doesn't override the field.)

## 2026-07-25 — The app stops floating (`.136`)

Phase 3 opens on the signed-in app's shared furniture — the chrome every one of
the twelve screens wears, rather than twelve one-off screen edits.

- **Bottom nav** (`MobileNav`): active tab is now a **2px poster-red rule along
  the tab's top edge** (it reads as the nav's own rule turning red) + accent-700
  label, replacing the floating rounded bar. Solid paper, 2px top rule, no blur.
  The `before:` rule needed `content-['']` — the first cut rendered nothing, which
  a DOM check caught before it shipped.
- **Nothing floats, anywhere:** every `backdrop-blur` outside `/experience` is
  gone (15 sites — app header + its dropdown, active-session chrome, rest timer,
  library/exercise sticky filters, builder footer, consent banner, sheets), and
  every elevation utility with it (**28 → 0** `shadow-*`). Translucent
  `bg-card/80` panels become flat surface fills; modal scrims go ink, not black.
- **Pills squared** — auth chip, coach chips, metric/photo range toggles, admin
  status tags, info-page chips. `rounded-full` survives only where the geometry
  is genuinely circular (ProgressRing, dots, icon buttons, thin tracks).
- **Coach week strip**: today = 2px poster-red border + tint; a finished session
  reads as solid ink (brass retired); **a missed day is struck through** — calm,
  not alarming. The mockup's "→ Thu" reshape note stays out: the plan engine
  records no reshape target, and inventing one would be a fabricated claim.
- **Press page** was still telling the public to "use emerald, navy, and brass as
  specified" — corrected to paper/ink/one-red with the retired palette named.

## 2026-07-25 — SEO templates on the system's own furniture (`.135`)

The structural fidelity pass on the surfaces the tokens+shell had already
recolored:

- **`FilterChip`** (Library + all public exercise filters): pill → Modernist
  square tag; active = tint fill `#fff2ef` + accent-700 text; local focus ring
  dropped (the global outline covers it). One component edit restyles every
  chip row on ~250 URLs.
- **Compare**: the honest table goes 2px-ruled with the Mission Winning column
  tinted, story cards and the free-stays-free note flatten to 2px-bordered
  panels — no shadow, no rounding, no translucent fills.
- **Guide index**: chapter titles drop Barlow's leftover `uppercase` for
  Archivo sentence case; `CH 01` indexes stay tabular via `.section-index`.
- Exercise page/hub templates confirmed correct from tokens+shell alone —
  no per-template edits needed (the mockup's own note: "the template repeats;
  only the data changes").

## 2026-07-25 — Public calculators: three SEO routes, one honest ladder (`.134`)

The rebrand's Phase 2 asymmetric play: no-auth calculator pages, built now,
indexed at flip. Not greenfield — the in-app tabbed `/calculators` stays; these
are public sub-routes on `PublicPageShell`.

- **`/calculators/1rm`** — Epley headline + Brzycki cross-check (existing
  `calcHelpers`), NEW working-weight table 1–12 as % of the single.
- **`/calculators/tdee`** — Mifflin-St Jeor × activity, goal −15%/+10%;
  macros per the handoff (protein **1.8 g/kg** first — deliberately above the
  in-app Fuel default — fat 25% kcal, carbs remainder), ±10% honesty framing +
  educational-tool disclaimer.
- **`/calculators/strength-standards`** — NEW `src/lib/strengthStandards.ts`:
  bodyweight-multiple ladders per lift/sex from the handoff (Novice→Elite,
  below-first = "Starting"), unrounded-Epley e1RM so thresholds compare
  honestly, current rung tinted. 5 unit tests; 599 total pass.
- Shared Modernist calc UI (`publicCalcUi.tsx`): native-radio segmented
  control (ink-filled checked state, 44px targets), kg-internal with lb at the
  display edge (lb whole, kg nearest 0.5).
- Registered everywhere the gate demands: sitemap (3 URLs → the all-200 @gate
  test now covers them), `PRIVATE_GATE_PUBLIC_PATHS` (`/calculators` prefix),
  `SEO_TEMPLATES` (+`/calculators/1rm` design-system contract), gate-smoke
  reachable-while-gated check. JSON-LD `WebApplication` on each.

## 2026-07-25 — Modernist rebrand: the landing argues on paper (`.133`)

`/` recut to the Homepage mockup — the argument (log → adapt → anywhere → free →
start) unchanged, the setting new:

- **Hero flat**: gradient art overlay retired; kicker goes accent-700; both H1
  lines ink (red is spent once, at the close). Subtitle picks up the mockup's
  full promise ("…free forever. Works offline, anywhere you train.").
- **Checkable stat row** (new): 217 / 3min / 0 / $0 in poster-red `display-mega`
  tabular figures on rule separators — facts a visitor can verify, no traction
  claims (hard rule 3).
- **`section-index` numbers** (02/03/04) on the argument sections; free-core dl
  and FAQ on full-strength 2px rules.
- **Poster close** (new `.poster-close` component class): the page's ONE red
  field — `display-hero` paper-on-red, flush left; the `.primary-action` inside
  inverts to paper so first-90's two-CTA count contract holds.
- Welcome: first-session payoff card gets the tint + 2px poster-border
  treatment; goal presets use the standard fill. App header's Dumbbell chip →
  `BrandMonogram` ink square. `public/locales` re-exported for the landing copy.

## 2026-07-25 — Modernist rebrand: the public shell is structural now (`.132`)

The chrome the ~250 SEO URLs share, recut to the system the tokens already speak:

- **Nav** (`PublicPageShell` + `MarketingNav`): solid paper bar under a **2px rule** —
  translucency + backdrop-blur retired; wordmark drops its uppercase for Archivo 800
  sentence case. `PublicNavMenu`: ink scrim (no blur), 2px rules between links,
  sentence-case items. All test contracts intact (focus-restore, skip link, H1
  alignment).
- **Footers** (`PublicSiteFooter` + `MarketingFooter`): 2px rules; the medical
  disclaimer strip goes flush-left (nothing is centered).
- **404** re-set flush-left and ruled: red kicker, `.display-section`, poster CTA +
  2px-ink ghost. **Offline** gets the handoff's feature-framing: "You're offline.
  The log isn't." + a ruled still-works list. Live waiting-to-sync count needs an
  outbox read from the SW fallback — deferred to the Phase 3 app pass.
  (`/offline` online-while-gated redirects to `/private` — pre-existing; real
  offline hits serve from the SW cache before the network.)

## 2026-07-25 — Modernist rebrand Phase 1: the whole app changes uniform (`.131`)

The global token swap. One `:root` block in `src/index.css` now carries paper/ink/red;
~2,700 token-utility call sites flipped without edits. Archivo (400/600/800) replaces
Barlow Condensed + Inter + IBM Plex Mono — one `next/font` load, with the three legacy
font vars aliased to it so all 84 `font-display`/`font-mono` sites resolve unchanged.

- **The red is three tokens** because paper inverts the `.127` contrast math:
  `--accent-poster` #ec3013 (fills w/ ≥19px/800 labels, chrome, one field per page),
  `--primary-fill` #dd2b0f (button fills — white text 4.74:1 AA at any size),
  `--primary` #ae1800 (all small red text/borders, 6.4:1) — so 276 `text-primary`
  sites stayed AA without edits. Documented in brand-guidelines.md "Which red".
- **Radius 0 via the whole Tailwind scale** — only `lg/md/sm` were token-wired;
  `xl` (124), `2xl` (48), `3xl` now collapse too; `full` stays for true circles.
  Glows, gradient fields, noise, and shadows retired: `.card-glow-emerald` is now the
  tint+2px-poster-border "selected" card, seams are honest 2px rules.
- **Guards updated in the same change set:** `check-token-sync.mjs` pins the new web
  hexes, Android cross-check paused (wave D5 override; motion still enforced);
  `first-90.spec.ts` font contract Barlow→Archivo (8 sites); display classes recut
  in place (names are the `check-display-type` contract).
- **Brand assets:** ink-square mark everywhere — `BrandMonogram`, favicon.svg,
  apple-touch + PWA 192/512/maskable (sharp-rasterized), `/brand` SVG kit (icon,
  reversed, red poster, wordmarks), OG generators re-inked flat (5 routes),
  handoff `og-default.png` + social PNGs dropped in. **All 30 form-guide SVGs were
  still navy** (exploration had claimed parity — a browser check caught it);
  replaced with the handoff's re-inked paper set.
- **Docs:** DESIGN_SYSTEM.md + brand-guidelines.md color/type/logo/AI sections
  rewritten to Modernist; DESIGN_REVIEW checklist re-pointed; PressPage palette/
  fonts/downloads recut. Magazine PDF keeps pinned pre-rebrand palette until its
  Phase 3 cover recut. Beta testers now see restyled-but-not-recut app screens —
  accepted in planning; the 12 screens follow in Phase 3.

## 2026-07-25 — Modernist rebrand Phase 0: the gate wears the new uniform (`.130`)

The founder-commissioned **Modernist rebrand** (design handoff 2026-07-25: ink-on-paper
`#f3f2f2`/`#201e1d`, one red accent `#ec3013`, Archivo only, radius 0, 2px rules,
light-only — replaces navy/emerald/brass + Barlow/Inter/Plex Mono) starts at `/private`:
with `PRIVATE_MODE` on, the gate **is** the public site, so it ships alone. Founder
override recorded in [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) (wave
D5); Android token sync pauses for the program — Android rebrand is a follow-up.

- **Restyle only, plumbing untouched:** `submitLead`, `/api/private-access`, OAuth
  session unlock, `data-mw-invitee` SSR attr, invitee direct-form + autofocus,
  open-redirect guard all unchanged. Verified in-browser: cold, invitee, disclosure,
  mobile 375px.
- **Tokens locally scoped** under `.mw-gate` in `app/private/gate.css`; Archivo via
  `next/font` in the route only; per-route `viewport.themeColor` paper. The Phase 1
  global token swap dissolves this file into `src/index.css`. `html:has(.mw-gate)`
  forces the canvas paper — the navy body otherwise flashes on overscroll.
- **Contrast engineering:** paper-on-red is 3.78:1, below AA for normal text — primary
  button labels are 19px/800 (WCAG large text, ≥3:1 ✓); small red text uses accent-700
  `#ae1800` (6.4:1). This is the pattern for the whole rebrand.
- **Copy to handoff finals:** `gateSubtitle` re-cut, invite headline+subtitle merged;
  new `gateFooterTagline` hand-translated ×15. `public/locales` overlay re-exported —
  it was stale from `.126`–`.129` ships (separate commit; the overlay was serving old
  copy over the in-bundle defaults).

## 2026-07-25 — Accelerator paste packs gitignored

- `docs/applications/*` answers removed from tracking; only [README.md](docs/applications/README.md) stays public. Files remain on disk for founder paste. History still has old copies until a rewrite.

## 2026-07-25 — Secrets program + pre-public scrub

- **Program:** [docs/SECRETS.md](docs/SECRETS.md) — vaults (Vercel + GH Actions), never-commit list, rotate-on-leak, Public flip checklist. `npm run secrets:scan` + `.gitleaks.toml` + PR `gitleaks.yml`.
- **Scrub:** personal gmail, Vercel org/project IDs, Supabase ref, treasury pubkey/temp path, personal `*.vercel.app` from docs/workflows/tests (placeholders only).
- Founder still owns: enable secret scanning + push protection, then GitHub **Public** — no `PRIVATE_MODE` flip.

## 2026-07-25 — The public site is one site now, and 94 pages stopped 404ing (`.129`)

A UI/UX pass on the public site turned up a launch blocker first, so that went first.

**94 of the 219 advertised exercise URLs returned 404.** `generateStaticParams` read
`EXERCISES` without awaiting `ensureFullExerciseCatalog()`, so only the base ~126
prerendered; `ExerciseDetailRoute` then missed on a cold process and fell through to
`notFound()`. `/exercises` displayed the full count and linked to every one of them, so
the flagship free-library page was a third dead links. The sitemap got 219 *by luck* — it
ran in a build worker that had already awaited the catalog elsewhere — which is precisely
why the two numbers disagreed and nothing looked wrong. Verified by fetching every URL in
`sitemap.xml` against a production build: **273 URLs, 95 non-200 → 273 URLs, 0 non-200.**
There is now a `@gate` test that does exactly that fetch.

Then the actual UI work. `/` was rebuilt in `.126`; the other ~250 URLs render through
`PublicSeoHeader`, whose `h1` had no `font-display` — **the same defect `.126` fixed, still
live on 250 pages.** Zero uses of `.display-section` and zero of `.eyebrow` across all
eight SEO page components.

- **`PublicPageShell`** replaces `PublicSeoHeader` + `PublicSeoFooter`: briefing type,
  one `maxWidth` shared by header *and* body (the header hardcoded `max-w-4xl` against
  `max-w-3xl` bodies, so the headline sat outdented from its own copy), one emerald
  action above the fold, and the full footer with legal links and the medical disclaimer.
  A Server Component — four of eight consumers have no `'use client'` and are ~235 of the
  URLs. Uses `.display-section`, not `.display-hero`: the hero tier's 2.75rem floor wraps
  "Close-Grip Bench Press" to three lines at 390px.
- **`PublicNavMenu`** — `MarketingNav` hid every link behind `hidden … sm:flex` with no
  menu anywhere in the repo, so at 390px a visitor could reach `/` and `/welcome` and
  nothing else. On Radix Dialog, already a dependency, so the focus trap and Escape are
  not hand-rolled a sixth time.
- **The design system was being nullified where it was used.** `.display-section` sits in
  `@layer components`; utilities come later, so `className="display-section text-2xl"`
  discarded the `clamp()` — confirmed by byte offset in the built CSS. Ten sites did it,
  which is why the class's real size rendered on exactly one page. Fixed, and
  `scripts/check-display-type.mjs` now fails the gate if it returns.
- **There was no focus indicator.** `src/index.css` had zero `:focus` rules;
  `focus-visible` appeared only in `button.tsx`, so 91 raw `<button>`s, every link, and
  `.primary-action` fell back to Chromium's 1px `auto` outline. One rule in `@layer base`
  on the unused `--ring` token covers all of them; the ring came *out* of `button.tsx` so
  there is one indicator, not two. **axe does not test focus visibility** — which is how
  `npm run a11y` sat 10/10 green while WCAG 2.4.7 failed site-wide — so the new test
  asserts `outline-style: solid` at ≥2px, and was checked against a build with the CSS
  removed to confirm it actually fails.
- Also: `/compare`'s primary CTA read **"Begin"** (`t('welcomeBegin')` ships `'Begin'` in
  en); `MarketingNav`'s CTA was `onClick={router.push}` on force-static pages, so it did
  nothing pre-hydration and crawlers saw no link; `Button variant="fitness"
  className="primary-action"` in two files rendered at Button's radius while keeping
  `w-full`; `/experience` was in the sitemap but absent from `PRIVATE_GATE_PUBLIC_PATHS`;
  `.animate-otp-shake` was the one animation missing from the reduced-motion block;
  `themeColor` was two points off `--background`; `.display-section` asked for weight 600
  when only 700 is loaded; hardcoded "217 exercises" in three places now reads the
  catalog; ~112 lines of verified-dead hero CSS deleted.
- Gates widened: `@gate` 16 → 25 (per-template display face, H1/body left-edge geometry,
  footer legal + disclaimer, mobile menu with Escape and focus restore, sitemap all-200);
  `@a11y` 10 → 20 (8 new routes + 3 focus-visibility tests). `check-display-type` and
  `check-token-sync` added to `npm run gate` — neither was in it.

**Deliberately not done:** `viewportFit: 'cover'`. The plan called for it, but no sticky
header in the repo carries `env(safe-area-inset-top)` and every public container is plain
`px-5`, so opting into edge-to-edge would put the notch over the nav in landscape —
creating the bug the inset guards exist to prevent rather than fixing one. Nothing is
broken today: without `cover` iOS insets the layout viewport itself, so those guards are
inert, not wrong. It belongs in an in-app pass with the nav and containers guarded and a
landscape Playwright project.

## 2026-07-25 — The storage ratchet is empty: 53 files, one door (`.128`)

Every remaining direct `localStorage` call is gone. `LEGACY_DIRECT_STORAGE` is **deleted**
from `eslint.config.js` and the rule is now a plain error, so a new bare call fails lint
instead of joining a backlog. ~200 call sites across 53 files.

- **Why it mattered:** a bare `localStorage.setItem` throws in Safari private mode and on
  quota exhaustion. Several of these sat in render paths and module-init with no
  `try/catch` at all — `savedMeals`, `guidebookProgress`, `journeyAnalytics`,
  `presidentialFitnessStorage`, `schoolClass`, `todayDashboardPrefs` among them. On a
  product whose promise is offline-first logging without an account, a full disk could
  blank the page.
- The migration **deleted guard code rather than adding it**: ~40 hand-rolled
  `try/catch` blocks and ~35 `typeof window === 'undefined'` / `typeof localStorage ===
  'undefined'` checks are gone, because `safeStorage` is SSR-safe and never throws. Net
  effect is less code doing more.
- **Every key now comes from `STORAGE_KEYS`.** ~90 inline string literals resolved to the
  registry, which is how three near-duplicate spellings of the same concern surfaced.
  Dynamic keys got prefixes: `fuelPlanSync`, `premiumCourseSync` join `event` and
  `teacherPin`. `i18nextLng` is registered as `I18N_LANG_KEY` — owned by i18next, kept
  deliberately outside `MW_PREFIX` so backup/restore leaves the detector alone.
- **New `keysWithPrefix()`** in `safeStorage`, the one primitive the migration needed:
  `ProfileOwnerTools` enumerated `Object.keys(localStorage)` to find `mw_event_*`
  breadcrumbs. It merges the real backend with the memory fallback, so a private-mode tab
  can still enumerate what it stored this session. 3 tests.
- **`bumpTrainingStreak()`** replaces the read-increment-write of `mw_streak` that was
  hand-copied **ten times** across `TodayProgressSection` and `BenchmarksPage`, each copy
  with its own `try/catch` and its own off-by-one risk.
- Three call sites collapsed into helpers that already existed and were being ignored:
  `WorkoutVictorySheet` and `SchoolClassPanel` re-read the referral code by hand instead
  of `getCachedReferralCode()`; `SessionCheckInSheet` re-parsed the zustand persist blob
  instead of `readWorkoutHistoryFromStorage()`; `coachSync` and `journeySync` re-read the
  taster flag instead of `isTasterUsed()`.
- Two small fixes found while reading, not while looking: `journeyAnalytics` wrote its
  per-event breadcrumb **twice** (once in each branch of a `try/catch` where only one
  could run), and `RegionDefaultsBoot` marked itself applied in a `catch` that a thrown
  `fetch` skipped — a failing `/api/geo` retried on every mount. Now a `finally`.
- `src/lib/backup.ts` **stays exempt on purpose**: it prefix-scans `mw_*` at runtime so a
  stale registry can never silently drop a key from a user's only safety net.
- Verified: 593 unit tests, 16 gate e2e, 10 a11y, lint clean with the allowlist gone,
  i18n parity green, `PRIVATE_MODE=false` build clean. The rule was probed with a
  throwaway file to confirm it errors rather than having gone inert. Seven e2e failures
  outside the gate tag (`premium-gate`, `premium-pillars`, one `growth`, one
  `coach-adjust`) reproduce **identically on `58c2191` with no changes applied** — they
  need Supabase/Stripe env this sandbox does not have.

## 2026-07-25 — Quality pass: a11y green, outbox finished, gate runnable (`.127`)

Closing gaps the last week's work left rather than adding to it.

- **`npm run a11y`: 8 failing routes → 10/10, and deterministic.** White on the brand
  emerald was 2.76:1. No single value fixes it — `--primary` is 7.08:1 as text on navy
  but 2.77:1 under white text, and a value dark enough for white text falls to 3.57:1 as
  text. So `--primary` is unchanged and `--primary-fill` (hue 158, L 25%) carries white
  text at 5.38:1; hover **darkens** because lightening fails again at 4.17:1.
- Three more contrast defects the audit surfaced, all pre-existing: `--muted-foreground`
  58%→62% (utilities dim it to /80 and /70, compositing to 4.31:1); `.section-index`
  un-dimmed (4.48:1 on card surfaces); `WeekStrip` empty/missed days de-emphasised by
  border instead of a container `opacity` that took the day label to 2.05:1; and
  `.xp-word` animates transform only, since fading from opacity 0.15 left words at
  1.25:1 whenever the scroll animation had not run.
- **The MW monogram keeps the accent** — logotype, WCAG 1.4.3 exempts it, and it must
  match `/favicon.svg` and the PWA rasters. Its seven inline copies are now one
  `BrandMonogram` with `data-brand-monogram`, which axe excludes **by selector** rather
  than by disabling color-contrast everywhere.
- **The a11y suite was also ~50% flaky**, wandering between `/welcome`, `/coach` and
  `/nutrition`. Cause: axe ran mid-fade, and a partly-faded element composites lower
  than its resting state. A one-shot `getAnimations()` check was not enough because those
  routes mount behind `requestIdleCallback`, so animations started after the check. It
  now waits for two consecutive quiet frames. 5/5 clean runs.
- **Every declared `OutboxKind` has a handler now.** Only `workout.upsert` did; the other
  five would have queued forever while the type claimed support, and their `pushTimer`
  modules still did the real work on the path the outbox replaced. `fuel.plan` is
  **removed** rather than wired — `pushFuelPlanToCloud` writes a device-storage key, not
  a network, so there is nothing to retry. The rest returned `false` when signed out,
  which the outbox cannot tell from a network failure; they return `true` now.
  `leaderboard`/`pft` swallowed errors and returned void, silently losing writes.
- **Cross-device edits and deletes work.** `getUserWorkoutsUpdatedSince` had zero callers
  since `.123`; `loadFromCloud` now pairs the `completed_at` backfill with an `updated_at`
  cursor, which is the only way an edit or a tombstone arrives. Also **corrects the `.123`
  claim** that truncation was reported — `truncated` was computed but only read by a test.
  It emits `history_truncated` now.
- **`npm run gate`** ([scripts/gate.mjs](scripts/gate.mjs)) runs lint · typecheck · tests ·
  i18n · build · hero e2e, starting and stopping the server itself, because Actions is
  still blocked and nothing else guards `master`. Checks for the chromium binary up front
  rather than trusting `playwright --version`, which passes with no browser installed.
- Storage ratchet **59 → 53**: WelcomePage, ProfilePage, missionJourney,
  coach/contextBuilder, useUnits, usePremium off the legacy list.
- 590 unit tests, 16 gate e2e, 10 a11y, lint clean, i18n parity green across 15 langs.

## 2026-07-25 — Homepage rebuilt on its own design system (`.126`)

- **The actual bug: `/` ignored the briefing type system.** `src/index.css` already ships
  `.display-hero` / `.display-section` / `.eyebrow` / `.briefing-rule`, and `/press`,
  `/bundle`, `/about`, `/vision` all use them — `.eyebrow` alone appears in 50+ files.
  `LandingPage.tsx` set ad-hoc `text-[2.5rem] font-semibold`, so the largest type on the
  site rendered in **Inter instead of Barlow Condensed**, against brand-guidelines.md.
  Nav wordmark had the same problem. Both now on the display face.
- **Diagnosis, for the record:** the page was not over-designed, it was the residue of
  twelve subtractive passes (`.103`–`.107`) that cut StatBand, Journey, Guide, the pillar
  bento and email capture and put nothing back. Five sections, none of which made a
  visitor believe anything.
- **Restructured as the loop** — log → adapt → anywhere → free → start. That is a real
  sequence, so order now carries meaning; the decorative `01 · / 02 ·` markers are gone.
- **Signature: [`LogToPlanHero`](src/components/landing/LogToPlanHero.tsx).** The visitor
  logs a set and the next session changes. Every number comes from
  `suggestNextSetTarget` — the same double-progression function `/active` calls — so the
  page demonstrates the mechanism instead of asserting it. Replaces `HeroDemo`, which
  hardcoded `readiness: 72` and `'Set 1 · Squat'`. Verified: `3 × 12 @ 80 kg` →
  `8 × 82.5 kg` today → `9 × 82.5 kg` next session.
- **`CoachAdaptDemo` is now visitor-driven.** It auto-cycled 3 frames every 2.8s, so the
  adapt claim only landed if you were looking at the right moment. Now you press
  "Miss Wednesday" and the week re-spreads. Reduced motion starts on the outcome.
- **Evidence without fabrication.** brand-guidelines.md forbids testimonials and there
  are no users, so the free core is a definition list of checkable facts (217 exercises,
  offline, no account) instead of a checkmark farm. Real brand art (`/art/hero-field`,
  the asset `/press` uses) replaces the gradient orbs — **8 KB** of AVIF.
- **Audience page** `/compare/test-prep` for people with a scored test on a date. Reuses
  the `COMPARE_STORIES` data pattern, so routing, metadata and sitemap came free. It
  deliberately claims nothing MW ships: no target-date plan (nothing in `src/lib/coach/`
  takes a date), no published pass marks, no affiliation — and says so on the page.
- **Removed dead code:** `HeroDemo.tsx`, `JourneyScroll.tsx`, `GuideTeaser.tsx` (the last
  two were imported nowhere). Fixed the now-stale `GuideTeaser` pointer in SEO_ANALYTICS.
- **Gate:** two new `@gate` assertions — the hero H1 must resolve to Barlow Condensed,
  and logging in the demo must change what the page says. 16/16 gate e2e green, 588 unit
  tests, lint clean, i18n parity green across 15 langs. FCP 196ms.
- **Found, not fixed — founder call:** white on emerald `#27b07d` is **2.76:1** where
  WCAG AA needs 4.5:1. 163 nodes on `/` alone and it fails identically on `/coach` and
  `/nutrition`, so it predates this work and is a brand-token decision, not a landing
  one. `npm run a11y` is red on 8 routes because of it.

## 2026-07-24 — Prod deploys off GitHub Actions (Deploy Hook primary)

- **Why:** every workflow started failing in under 5s with no downloadable logs — Deploy
  production, CI and Aikido together, on commits that predate this work. That pattern means
  the job never got a runner (Actions billing / spending limit), not a code failure.
- **Deploy Hook + GitHub webhook is now the canonical prod path** — webhooks are not Actions,
  so they are unmetered and unaffected by the billing state. Checklist §1.1 rewritten from
  "recommended backup" to primary, plus §1.2 promote-an-existing-SHA, §1.3 verify via
  `APP_BUILD_LABEL`, §1.4 blocked-Actions diagnosis, §1.5 Preview-only root cause.
- **`deploy-production.yml` is `workflow_dispatch`-only.** Dropped the `push: master` trigger:
  with the hook wired it would double-deploy, and while Actions is blocked it produced a red
  run and a failure email on every push, hiding real failures.
- **Flagged:** the PR gate (`ci.yml` → lint · typecheck · tests · build · `e2e:gate`) cannot
  run while Actions is blocked, so nothing currently stops a regression reaching `master`.
  Run `npm run e2e:gate` against a production build locally until billing clears.
- Founder-only steps remain founder-only: creating the hook, adding the webhook, promoting
  `35d5be0`, clearing billing. Agents cannot reach Vercel from CI or this environment.

## 2026-07-24 — First 90 seconds as a budget (`.125`)

- **`tests/e2e/first-90.spec.ts` (`@gate`)** turns excellence criteria 1/2/5 into
  assertions instead of opinions: a genuinely cold visitor reaches a logged set in
  **≤6 taps**, no modal may intercept the first session, Today has exactly one
  `.primary-action`, and every control on the logging surface is **≥44px**.
- **One-thumb fixes it found.** The reps/weight **± steppers were 36px** — the exact
  controls you press holding a bar — plus per-set `More` at 28px, `Add Set`, the rest
  preset, the card `More` and the sign-in prompt at 36px. All raised to the repo's
  existing 44px convention (`SetLogRow`, `ActiveExerciseCard`, `SignInPrompt`).
- **Re-entry without shame** — `src/lib/reentry.ts` + `TodayReentryCard`. Under 4 days
  off is a rest day, not a miss. Beyond that Today leads with a smaller ask (70% dose,
  50% past two weeks) placed directly under the boss CTA, above any score or streak
  chrome that would read as a scoreboard of the gap. 12 tests incl. tombstoned
  sessions, corrupt and future timestamps.
- **`first_set_logged`** with `secondsFromStart` — the only honest read on whether the
  first 90 seconds works. Funnel comment in `analytics.ts` updated.
- `HomeTodayDashboard` no longer reads storage during render (hydration mismatch plus
  a re-read every render); it is off the eslint storage backlog. 588 unit tests and
  14 `@gate` e2e green.

## 2026-07-24 — Surface parking: one flag to shrink to the wedge (`.124`)

- **`src/lib/surface.ts` + `NEXT_PUBLIC_SURFACES`.** Generalises the pattern from
  `americaConfig.isAmericaTrackEnabled` / `freeBeta.isFreeBeta` into one registry.
  Parked by default: **america · school · wearables · leaderboard · cryptoRails ·
  paypal** — COPPA/teacher, hardware/OAuth and extra payment-rail surface the wedge
  does not need. Six pillars stay on (vision.md); `NEXT_PUBLIC_SURFACES=wedge` parks
  them too when the founder wants a wedge-only beta. `all` and `-name` also supported.
- **Enforced in one place.** `proxy.ts` rewrites parked page paths to `/_not-found`
  (real 404, styled) and returns JSON 404 for parked APIs. `notFound()` in a route
  wrapper does **not** work here — the `(app)` layout streams, so the 200 shell has
  already flushed by the time a page component throws; `surfaceRoute.ts` is now
  metadata-only (`robots: noindex`). Nav drops parked entries (and sections that
  become empty), and `app/sitemap.ts` drops parked URLs.
- **The wedge is not expressible as a surface**, so no flag can switch off the free
  logger (hard rule 2). `src/lib/surface.test.ts` asserts it, and the 11 `@gate` e2e
  tests pass with `NEXT_PUBLIC_SURFACES=wedge`.
- `isWearablesPubliclyEnabled` now also requires the surface; `isAmericaTrackEnabled`
  delegates to it. Both legacy env vars still work. Build-time var — needs a redeploy.
- Verified: parked pages and APIs 404, all 18 wedge/default routes 200, sitemap clean,
  576 unit tests + 11 gate e2e green.

## 2026-07-24 — Logger reliability: unloseable logs + hero PR gate (`.123`)

- **Fixed: `/active` "Start Workout" was permanently disabled.** zustand runs
  `onRehydrateStorage` synchronously *inside* `create()` when storage is synchronous,
  so `useWorkoutStore.setState` there threw a TDZ `ReferenceError` that the persist
  thenable swallowed — `hasHydrated` never became true and the empty logger shell sat
  on "Loading session…". `hasHydrated` is now reconciled after `create()` across all
  three storage paths (sync, async, unavailable), with a 1.5s last-resort net.
  Regression covered in `src/store/workoutStore.test.ts`.
- **Sync v2 on web.** `saveWorkoutLog`'s blind `insert` (no `client_id`) meant every
  retry could duplicate a session, and those duplicates came back via `loadFromCloud`.
  Logs now carry `clientId` / `revision` / `updatedAt` / `deletedAt` and go through
  read-then-write upsert mirroring `app/api/mobile/sync/workouts` — the schema and
  unique index already existed from Android. `mergeWorkoutHistories` keys on
  `clientId` (fingerprint only as legacy fallback), honours tombstones, highest
  revision wins, and reports truncation instead of silently dropping at 200.
- **Durable outbox** — `src/lib/sync/outbox.ts`. Cloud writes survive the tab closing,
  retry with jittered backoff, collapse superseded work, and never discard on failure
  (`stuck` + `retryStuck`). Replaces the single 60s `setTimeout` retry and
  `syncCurrentHistoryToCloud`'s "last 5 that look local" heuristic. Drained on mount /
  `online` / tab-visible by `useOutboxDrain`.
- **Storage layer** — `src/lib/storage/`. Ten files called `localStorage.setItem` with
  no `try/catch` anywhere (incl. Nutrition / Assessments / Feedback pages), which
  throws in Safari private mode and on a full disk. All migrated; an eslint ratchet
  makes new direct calls an **error** with a shrinking legacy allowlist.
  `SyncStatusRow` on Profile tells the truth about queued and unpersistable writes.
- **CI:** hero + logger + new **offline** e2e now run on every PR (`npm run e2e:gate`,
  `@gate` tag) inside the existing build job — no second build, no extra minutes.
  Also fixed 3 pre-existing lint **errors** that had `npm run lint` red on master.
- First tests for `workoutStore` (16) plus `safeStorage` (8) and `outbox` (11);
  `npm test` glob widened to `src/**/*.test.ts`. 560 unit tests green, 11 gate e2e green.

## 2026-07-24 — OSS public-ready + lean CI / prod path

- **CI minutes:** `ci.yml` PR-only lean gate; heavy e2e/Android/smokes → `ci-extended.yml` (manual/weekly); CodeQL monthly+dispatch; Aikido PR-only. Master push no longer burns minutes racing production.
- **Prod:** keep `deploy-production.yml`; checklist adds Deploy Hook webhook (zero Actions minutes) + billing/secrets founder steps.
- **OSS:** CoC, `docs/OPEN_SOURCE.md`, README badges, Profile footer **Source** → GitHub (AGPL §13). Founder flips repo Public when ready — no `PRIVATE_MODE` change.

## 2026-07-24 — Fuel train-day targets (Wave A)

- Rings/budget adapt from **workout history** load (heavy/training/rest) via shared fuelCoach rules.
- Banner chip + delta; **Use base** / **Match training** toggle (`mw_fuel_adapt_enabled`).
- Base targets still editable; week glance stays on base. Tests: `fuelDayAdapt`.

## 2026-07-24 — Fuel goal wizard + weight strip (Wave T/W)

- **Set from goal:** lose / maintain / gain → Mifflin + activity macros (`fuelGoalWizard`, Fuel UI next to Edit targets).
- **Weight on Fuel:** log today’s weight + 7d delta/mini trend (`mw_body_metrics`, shared with Track).
- Help: goal table + weight; tests for goal math.

## 2026-07-23 — Free beta: full More nav (`.122`)

- `extendedNavSectionsForPhase`: free beta always returns full More minus Bundle (i-day/basic no longer train-only).
- Softened unlocked Super Bundle labels (Fuel recipes title, Learn empty state, Android Coach depth chips).
- Build: `2026.07-unified.122`.

## 2026-07-24 — Fuel speed logging (competitive Wave S)

- Steal from MacroFactor/Lose It/MFP: **Recent** rail (1-tap re-log), **servings** ½–3× on draft, Enter picks top search hit, larger remaining budget.
- Compare matrix in plan session; no micros/social. Tests: `getRecentFoods`, `scaleMealMacros`.

## 2026-07-24 — Fuel calorie tracker pass 7

- **Help + ENV:** accurate Fuel logging guide; `MEAL_VISION_*` founder notes.
- **Toasts** on log / edit; copy-day skips exact duplicates already on today; quiet multi-add for yesterday/copy.

## 2026-07-24 — Fuel calorie tracker pass 6

- **Past days:** browse last 14 logged days + **Copy to today**.
- **Recipes:** Use → review draft before log (free + premium).

## 2026-07-24 — Fuel calorie tracker pass 5

- **Persistence:** single merge of today list → 90-day local history (fixes stale allLogs duplicates).
- **Week glance:** 7-day calorie bars from local log vs target.
- **Edit → cloud:** best-effort append of corrected macros when signed in.

## 2026-07-24 — Fuel calorie tracker pass 4

- **Edit** logged entries (pencil → same draft card → save).
- **Clear day** prunes today’s rows from full nutrition log storage.
- **Custom log sheet:** carbs + fat fields.

## 2026-07-23 — Fuel calorie tracker pass 3

- **Targets editor** on Fuel (cals/protein/carbs/fat → `mw_macro_targets`).
- **Barcode/search** → review draft before log (same `MealEstimateDraft`).
- **Today’s meals** ordered B/L/D/snack with per-meal protein/kcal subtotals.

## 2026-07-23 — Fuel calorie tracker accuracy pass 2

- **NL:** more foods; `50g` / cups portion scaling; low-confidence embeds Open Food Facts search into draft.
- **Day totals:** calories left/over + protein left on Fuel overview.
- Tests: grams scale case + prior suite green. Commit `d0fd15c`.

## 2026-07-23 — Fuel calorie tracker accuracy pass

- **NL meals:** expanded food dictionary, per-item quantities (`3 eggs`), conservative low-confidence fallback; always **edit-before-log**.
- **Photo:** honest source labels (vision / rough / database); OFF matches fill draft; shared `MealEstimateDraft` for corrections.
- Tests: `nlMealLog.test.ts` green.

## 2026-07-23 — Web UX pass 6: History/Compare + secondary pillars

- **History:** “Past sessions”, calm at-a-glance card.
- **Compare + PublicSeoHeader:** wedge-accurate rows; no “everything app” pitch; quieter SEO chrome.
- **Move/Mind/Track/Learn/Leaderboard/Feedback:** human titles; free-beta honest; Today coach invite card.

## 2026-07-23 — Web UX pass 5: Profile + marketing shell

- **Profile:** human subtitle, account card free-beta foot, quieter journey setup.
- **Marketing nav/footer:** sentence-case brand, no glass/mono tagline theater; free-beta hides Bundle.
- **Landing:** hero/section titles sentence-case; CommandersIntent → calm “Today’s focus”.

## 2026-07-23 — Web UX pass 4: Welcome + Active logger human craft

- **Welcome:** drop texture/ALL CAPS briefing; real progress bar; “Welcome” + quiet session cards.
- **Active:** rest dock labels, quieter Victory (session locked, no brass glow theater), calmer tips/PR.
- **Session check-in:** default z-index via AdaptiveOverlay portal; human eyebrow copy.

## 2026-07-23 — Web UX pass 3: shell chrome less template-AI

- **In-app headers:** sentence-case PillarPageHeader / Today title (drop briefing mono caps).
- **Nav:** solid quieter MobileNav + AppHeader; Coach active path matching.
- **Empty states / coach insight / score foot:** human type + free-beta honest footers.
- **content-card:** lighter shadow system-wide in app surfaces.

## 2026-07-23 — Web UX pass 2: Today + Coach organic + free-beta honesty

- **Coach:** free-beta never hard-locks next week; quieter chrome; no brass glow lock card.
- **Today:** calmer JourneyHero / journey strip; coach invite card; human Just Go copy.
- **Fuel macros:** drop emerald card glow; vision page de-emphasizes “everything app”.

## 2026-07-23 — Web UX: Log food fix + wedge nav + organic landing

- **AdaptiveOverlay:** portal to `document.body`, body scroll lock, `z-[70]` above MobileNav — fixes clipped Log food sheet inside `AppLayout` overflow shell.
- **Nav:** primary tabs **Today · Train · Coach · Fuel · You**; Track moved to More menu.
- **Fuel:** honest free-beta copy (no “paid Nutrition course”); calmer Log food sheet; science notes collapsed by default; human page title.
- **Landing:** quieter hero (less orbs/texture/glow theater); wedge copy stays Train + Coach.
- Docs: [ADAPTIVE_LAYOUT.md](docs/ADAPTIVE_LAYOUT.md).

## 2026-07-23 — Beyond the Basics v1.4.1 (acquisition polish)

- **Media:** `getting-started-mw` chapter hero; section figures on ch2-s2/s3, ch3-s1/s2, ch5-s2, ch6-s2 (7 total with existing ch2-s1); [`media/manifest.json`](media/manifest.json) + originality log.
- **Links / copy:** denser `relatedExerciseIds` on movement/programming/recovery/benchmark sections; light polish on thin free bodies; meta **1.4.1**.
- **PDF:** regenerated `public/magazine/beyond-the-basics.pdf` (~27 pages). Still 6 free chapters / 18 sections — no Horizon W expansion.

## 2026-07-23 — Scout brand mascot (Duolingo → MW)

- [docs/MASCOT.md](docs/MASCOT.md): Scout geometric falcon — celebrate logs, never shame; placement matrix.
- Kit: `public/brand/mascot/` (idle / invite / celebrate + SVG mark) · Flow prompts · `mascot-*` inbox optimize.
- Phase A social docs · Phase B History empty · Phase C Victory sheet flourish. Not on Train logger.

## 2026-07-23 — Google Flow HQ media path

- Free Flow credits (≈50/day, Veo Lite/Fast/Quality) are the **primary** Learn/social HQ generator; form guides stay SVG.
- [media/FLOW_PROMPTS.md](media/FLOW_PROMPTS.md) copy-paste queue · `media/inbox/` drop zone · `npm run media:optimize-inbox`.
- Docs: [MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md) Wave 3. No Flow keys in the product — founder generates in Flow UI.

## 2026-07-23 — Media asset system (`.121`)

- [docs/MEDIA_SYSTEM.md](docs/MEDIA_SYSTEM.md) + [`media/manifest.json`](media/manifest.json): form / Learn / art / social pipeline (offline gen → approve → static).
- Instructional form SVGs: replaced 15 placeholders + 15 expansion movements; FormGuideSheet dark frame + caption; light SMIL on heroes.
- Guidebook `heroImage` / `figure` → web + magazine print; 5 Learn heroes in `public/learn/`; social stills in `public/social/`.
- Android: `FormGuideMedia` + `MwFormGuideSheet` on Active (same CDN `/form-guides/{id}.svg`).
- Build: `2026.07-unified.121`.

## 2026-07-23 — Pre-EIN interim payments (docs)

- Texas LLC filed (Bizee, ~4 weeks) + EIN pending: document path to take beta payments **without** business Stripe/PayPal.
- [LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) §1d — Stripe **individual/sole prop** primary; Phantom list Lifetime parallel; manual Venmo/Zelle escape hatch; migrate when EIN lands.
- [LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §4 pre-EIN checklist · [PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) interim exception · [STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md) pointer.
- Founder still owns: open individual Stripe, wire live keys, test purchase, treasury ATA, LLC migration.

---

## 2026-07-23 — Free beta unlocks full depth (`.120`)

- Free-first mute kept; **also** unlock premium depth for everyone (`isPremiumBypassEnabled` / `usePremium` / Android `MwFreeBeta`) — Coach chat, Fuel Coach, catalogs. No credits wallet.
- Build: `2026.07-unified.120`. Docs: [docs/FREE_BETA.md](docs/FREE_BETA.md).

## 2026-07-23 — Free-first beta mute (`.119`)

- `NEXT_PUBLIC_FREE_BETA` / `isFreeBeta()` (default ON) + Android `MwFreeBeta.ENABLED`: hide Bundle, UnlockButton, LockedPreviews, nav/marketing paid CTAs, Play subscribe, crypto Lifetime.
- `/bundle` redirects to `/log`. LLC §1d overridden — no individual Stripe until EIN. Docs: [docs/FREE_BETA.md](docs/FREE_BETA.md).
- Build: `2026.07-unified.119`.

## 2026-07-23 — Adaptive layouts web + Android (`.118`)

- Web: `AdaptiveOverlay` (compact bottom sheet / md+ centered dialog); Fuel log pilot + two-column xl; SessionCheckIn, PlateCalculator, AdjustSession migrated; Victory dialog widened; AppLayout `xl:max-w-4xl 2xl:max-w-5xl`.
- Android: `MwWidthSizeClass` + `MwAdaptiveOverlay`; Active confirms + plate calculator; gallery demo. Docs: [docs/ADAPTIVE_LAYOUT.md](docs/ADAPTIVE_LAYOUT.md).
- Build: `2026.07-unified.118`.

## 2026-07-23 — Region defaults for language + units (`.117`)

- First visit: `/api/geo` reads Vercel/Cloudflare country → default language (APP_LANGS) + units (imperial for US/LR/MM). Profile/Guide choices set explicit flags and are never overwritten.
- Build: `2026.07-unified.117`.

## 2026-07-23 — PKCE via @supabase/ssr cookies (`.116`)

- “PKCE code verifier not found” after Google: browser client now `createBrowserClient` (cookie verifier); `/auth/callback` is a Route Handler that `exchangeCodeForSession` server-side and mints the private-gate cookie.
- Build: `2026.07-unified.116`. Still requires Supabase Site URL = www.

## 2026-07-23 — OAuth must not land on *.vercel.app (`.115`)

- Google after www was returning to `*.vercel.app/private` when Supabase Site URL was a Vercel alias. Auth redirect now prefers `NEXT_PUBLIC_SITE_URL` and never uses ephemeral vercel.app; `/auth/callback` on vercel.app bounces to www with the same `?code=`.
- **Founder:** Supabase → Auth → URL Configuration → Site URL = `https://www.missionwinning.com` (required). Build: `2026.07-unified.115`.

## 2026-07-23 — Google sign-in vs private gate (`.114`)

- After Google OAuth, session lives in localStorage so the proxy never saw auth and bounced to `/private`. Auth callback (+ gate page recovery) now mints `mw_private_access` via `POST /api/private-access/session` after `getUser()`.
- Build: `2026.07-unified.114`.

## 2026-07-23 — Free Coach week not Bundle paywall (`.113`)

- Victory → `/coach` showed brass “Coach chat is Super Bundle” above the free week. Chat lock demoted to a soft tip; `?ask=` shows free form cues. Session cards come first.
- Copy: free week (not lifetime taster). Build: `2026.07-unified.113`.

## 2026-07-23 — Logger UX density web+phone (`.112`)

- Active chrome: sticky compact header (timer/Finish), Plates/Discard overflow, coach tip one-liner, inline add-exercise; removed duplicate eyebrow + Coach Notes card.
- Exercise footer: Add Set + rest icon; Apply/Remove behind More. SetLogRow narrow overflow + md wider weight. Rest dock slightly tighter (`pb-36`).
- Build: `2026.07-unified.112`.

## 2026-07-23 — Dense mobile set logger (`.111`)

- Active logger phone density: cues off-card (Form guide + Info), overflow for Note/Swap/SS/Ask/Remove, Strong/Hevy nowrap reps × weight × Log, exercise stack `space-y-3`.
- FormGuideSheet footer: Ask about form → `/coach?ask=`.
- Build: `2026.07-unified.111`.

## 2026-07-23 — Horizon W wedge excellence (`.110`)

- **Policy:** Replaced H0 agent freeze with Horizon W — build Train→Today→Victory→Coach until founder phone sign-off; ≥10 beta is flip gate only ([ORCHESTRATION.md](ORCHESTRATION.md), [AGENTS.md](AGENTS.md), [CONTEXT.md](CONTEXT.md)).
- **W1–W4:** I-Day finishes into `/active`; Basic = first workout only; set row “More” disclosure; Victory stays in Coach/train; free weekly Coach (no lifetime taster lock); Today Coach dose line.
- Build: `2026.07-unified.110`. **Founder:** walk phone path and score excellence before recruiting.

## 2026-07-23 — Exercise as medicine thesis + habit-loop polish (`.109`)

- Docs: [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md) (cites + claim table); vision / STRATEGY / YC / brand / LEGAL / social / beta wired; About + soft landing/Learn copy. Wedge unchanged (Train + Coach).
- Product: Coach week “dose” line; victory 1-tap feel → readiness; shame-free missed-day re-entry CTAs; Coach chat + insight claim hygiene.
- Build: `2026.07-unified.109` — promote www after Ready. Founder bottleneck still ≥10 beta + phone hero QA.

## 2026-07-22 — Landing FAQ raw keys (`.108`)

- FAQ used `t(key)` with no `defaultValue` while full catalogs hydrate after interaction/2.8s — showed `landingFaqFreeQ` etc.
- Fix: FAQ defaults on keys + bootstrap EN FAQ strings; hydrate ends with `changeLanguage` so UI refreshes.
- Build: `2026.07-unified.108` — promote www after Ready.

## 2026-07-22 — Emerald glow + homepage craft (`.107`)

- **Landing:** hero ambient orbs + stronger `.hero-field` emerald bloom; demo slot `card-elevated card-glow-emerald`; Win Score ring glow; `primary-action` emerald shadow; brand eyebrow live + emerald title accent; ≤1 glow (hero only).
- **Today:** Mission Score `ProgressRing` `glow`; shared `.ring-glow-emerald` bloom + SVG drop-shadow.
- Build: `2026.07-unified.107` — promote www after Ready.

## 2026-07-22 — Responsive layout + Today score presence (`.106`)

- **Landing:** narrow viewports center hero copy/CTA; landscape short-height compact 2-col; `.hero-copy` / `.hero-orient-grid` utilities.
- **Today:** Mission Score `ProgressRing` + readiness/strain/recovery `MetricsRow` above the fold (parity with HeroDemo); sparklines stay in Trends details; `today-shell` safe-area.
- Build: `2026.07-unified.106` — promote www after Ready.

## 2026-07-22 — Hero a11y + logic polish (`.105`)

- **Logic:** `workoutStore.hasHydrated` gates Active Start (persist wipe race); e2e waits for enabled Start + dismisses check-in.
- **a11y:** SessionCheckIn focus trap / Escape / Skip 44px; EmptyState + SetLogRow + Beta banner tap targets; rest `motion-reduce`; gate `role="alert"`; axe covers `/active`, `/private`, `/nutrition`.
- **Craft:** Today e2e asserts one `.primary-action`; BetaWelcomeBanner muted (no competing emerald chips).
- Build: `2026.07-unified.105` — promote www after Ready.

## 2026-07-22 — Horizon 0 agent unblock (CI + ship `.104`)

- **Ship:** D4 composure + red/blue S2 + build `2026.07-unified.104` to master (Deploy production should promote www).
- **CI:** CodeQL Analyze `continue-on-error` until Code scanning enabled; Aikido skip via env gate (no more 0s fail when secret unset).
- **Aikido triage:** issues feed still disabled — Phantom/Solana mapped in [SECURITY_AUDIT_TRIAGE.md](docs/SECURITY_AUDIT_TRIAGE.md) + [AIKIDO.md](docs/AIKIDO.md).
- **Founder still (agents do not mark done):** verify `/api/health` = `.104`; enable Code scanning; phone QA + ≥10 invites; Accept B; Sentry DSN; Aikido permissions + `AIKIDO_SECRET_KEY`.

## 2026-07-22 — Pre-launch red/blue S2 (security)

- **Red:** www `security-smoke` + `rate-limit-smoke` green; gate/premium/webhook/crypto/coach probes hold; hero e2e 11/11 + coach lock teasers pass.
- **Blue:** `private-access` → Upstash `rateLimitAsync`; `fuel/estimate-meal` requires `hasAppAccess`; school PIN GET removed; crypto confirm row-race; gate-smoke extended.
- **Founder still:** rotate `VERCEL_TOKEN`, enable CodeQL, promote `.104`+, Sentry DSN, invites + phone QA.
- Build label remains `2026.07-unified.104` (D4); promote after push.

## 2026-07-22 — D4 beta composure (founder override · `.104`)

- **Why:** Website still read as six-pillar magazine; late Today as dashboard — not beta/investor-ready after D0–D3 heroes.
- **Website:** Landing cut to ~5 bands (Hero · Coach · Free · FAQ · CTA); nav ghost Start; HeroDemo muted CTA; `/experience` off footer; kill “everything app” in metadata/About/Press/brand/manifest.
- **Bundle:** one story + one offer card; compare collapsed; no pillar tile farm / unlock link farm.
- **Web Today:** QuickLinks + accordion under one collapsed More; wedge encouragement copy.
- **Android:** Today secondary cards `elevated=false` — only session hero elevated+glow; FOUNDER_ACCEPT D4 prep note.
- Build: `2026.07-unified.104`. Founder: promote www · Accept B re-walk · beta ≥10.

## 2026-07-22 — Post-RFS next actions (agent slice)

- Positioning done → distribution > features. Agent-allowed: push e2e-critical Active/Fuel unblock; verify `npm run seed-coach-adapt-demo`; refresh [BETA_INVITE.md](docs/BETA_INVITE.md) status to `.103`.
- **Founder still owns (not marked done):** recruit ≥10, phone hero QA, film 60s demo, CDL Jul 24, Wave A + promote `.103`, public flip, YC Jul 27.
- No pillars / RFS product / F5.

## 2026-07-22 — Fall 2026 official RFS sync (docs)

- Aligns shipped positioning pack to [ycombinator.com/rfs](https://www.ycombinator.com/rfs): batch intro (healthcare / stay healthy seat), Consumer AI agent+token curve, Primer K-12 product ask vs pattern-only boundary.
- Updates: [docs/YC_THESIS.md](docs/YC_THESIS.md), [YC_ANSWERS.md](docs/applications/YC_ANSWERS.md), applications INDEX + ACCELERATOR_SPRINT pointers.
- No product/landing change. Stance unchanged: Primer pattern + Consumer timing; wedge = Train + Coach.

## 2026-07-22 — YC RFS positioning pack (Mission / Vision / Team Humanity)

- Locks three layers: Team Humanity north star · Primer + Consumer AI fundraising narrative · Train+Coach wedge (never collapse).
- [docs/YC_THESIS.md](docs/YC_THESIS.md): Mission/Vision/Values, Team Humanity pillar map, RFS fit matrix (claim/secondary/non-claim), Consumer AI why-now.
- [vision.md](vision.md): Mission & Vision header + Team Humanity fronts table; wedge vs constitution note updated.
- Sync: [YC_ANSWERS.md](docs/applications/YC_ANSWERS.md), [applications/INDEX.md](docs/applications/INDEX.md), [ACCELERATOR_SPRINT.md](docs/ACCELERATOR_SPRINT.md).
- No product/landing change; no Elon/Primer consumer branding. Horizon 0 unchanged.

## 2026-07-22 — Primer-shaped vision + YC thesis (docs)

- Interprets YC *The Primer* RFS as fundraising craft (privilege → possible → entry → greater ambition); maps to Train+Coach wedge + lifelong adaptive coach.
- Updates: [docs/YC_THESIS.md](docs/YC_THESIS.md) § Narrative arc + Problem/Solution/Why now; [vision.md](vision.md) “coach that grows with you”; STRATEGY positioning; [YC_ANSWERS.md](docs/applications/YC_ANSWERS.md) paste voice.
- No product/landing change; no consumer Primer/Stephenson branding. Horizon 0 scope unchanged.

## 2026-07-22 — CI e2e-critical unblock (hero Active + Fuel)

- **Root cause:** `SessionCheckInSheet` overlay + Zustand persist race wiped Start; tests still expected removed `Set logged!` toast; Fuel expand flaky.
- **Fix:** seed complete today's mind check-in in journey helpers; `startEmptyActiveWorkout` retry helper; assert Rest timer not toast; Fuel Coach expand with `toPass`; FuelMealPlanCard above free recipes; RestTimerBar `transition-[width]`; commit Linux `@visual` baselines.
- **Still founder-owned:** rotate `VERCEL_TOKEN`; enable CodeQL code scanning.
- Verify: 16/16 local mobile-chrome hero + logger-depth + premium-pillars.

## 2026-07-22 — Pre-launch craft sprint (web .103)

- **Track 1:** Ops docs — VERCEL_TOKEN rotate + CodeQL enable; hero quality bar verified (no named #1 phone-QA bug yet).
- **Track 2:** ProfilePage → profile cards (~299 lines); NutritionPage → FuelQuickLogPanel/MoreTools; lint hook warnings cleared.
- **Track 3 (D3 override):** `npm run check-token-sync`; danger token aligned; Fuel FAB demoted; Move/Mind/Learn one-emerald CTA; i18n Batch C IT/RU/KO/JA depth; DESIGN_ORCHESTRATION D3 in-progress→shipped.
- Build: `2026.07-unified.103` · promote www after CI Ready.

## 2026-07-22 — Design D-prelaunch (web .102 · Android 1.24.1)

- **Today:** Mission Score + coach line above fold; rings/sparklines/muscle in collapsed details.
- **Active:** mono session brief; readiness chrome demoted below sets; oversized RestTimerBar.
- **Victory:** one emerald next; History/Share quiet text links.
- **Landing:** HeroDemo dominant plane (no art wash / inset card).
- **Gate/Beta:** briefing chrome — forms without content-card stacks; beta steps as mono list.
- **Android:** Today Form+insight without elevated card; rest clock 80sp Text; Victory duration/sets Neutral (brass = volume honor).
- Build: `2026.07-unified.102` · Android `1.24.1` / versionCode 53.

---

## 2026-07-22 — Design D1+D2 founder override (web .101 · Android 1.24.0)

- **Override:** Horizon gates waived for conversion + retention emotion craft (excellence before beta/public).
- **D1 Landing:** brand in hero · one CTA · product proof only (no dual CTAs / PR sticker / experience link).
- **D1 Welcome:** 3 steps (welcome → profile → signin); mission folded into Begin; 3 questions (no days/week UI); cinematic mono progress.
- **D1 Bundle:** thin hero (one brass badge); pillar story before tabs; removed duplicate in-tab pillar grid.
- **D2 Victory:** web lock animation + brass volume + one next; Android volume as brass honor line.
- **D2 Today:** Mission Score + coach line under number; Android Form score + insight under number.
- **D2 Coach adapt:** glanceable (≤1 beat compact / ≤3 full).
- Build: `2026.07-unified.101` · Android `1.24.0` / versionCode 52.

---

## 2026-07-22 — Crypto rails thesis (docs)

- Added [docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md): MW uses stablecoin/Phantom as **payment rails**, not a crypto product pivot (YC/Nemil “best time to build” lens).
- Wired: YC_THESIS Why now + non-pitch · LAUNCH_RUNBOOK §4 · ORCHESTRATION/CONTEXT · INDEX + docs/INDEX.
- No product/code changes — rails remain `src/lib/cryptoCheckout/` + Phantom Lifetime verify on launch checklist.

---

## 2026-07-22 — Design Orchestration D0 (web .100 · Android 1.23.1)

- **OS:** [docs/DESIGN_ORCHESTRATION.md](docs/DESIGN_ORCHESTRATION.md) — emotion arc, quality bars, craft waves D0–D3; wired into INDEX + ORCHESTRATION Design lane + Android UX/INDEX.
- **Research:** Wave 7 steal/avoid/own synthesis in [docs/DESIGN_RESEARCH.md](docs/DESIGN_RESEARCH.md).
- **Web Today:** Single emerald CTA — demoted coach invite, Rankings QuickLink, Mission Score glow, journey/header primary chrome; muscle REC → brass.
- **Web Active:** PR = inline brass chip + haptic (no toast); RestTimerBar clock-in-ring; SetLogRow hide Apply/Use last when seeded.
- **Android:** Mission insight + rest dock glow demoted; floating PR chip removed; VIEW chip Neutral; Accept B agent prep for D0. Founder still owns Pass.
- **Review:** DESIGN_REVIEW D0 pass logged. D1/D2 horizon-gated (documented, not shipped).
- Build: `2026.07-unified.100` · Android `1.23.1` / versionCode 51.

---

## 2026-07-22 — Web .99: eslint CI cleanup

- Removed obsolete `@next/next/no-img-element` disables (rule not in flat config).
- Fixed OtpInput `aria-invalid` on `role="group"`; intentional autofocus disables for invite/OTP.
- Trimmed redundant guide i18n `useMemo` deps; BodyMetrics refresh ticks; unused Button import.
- GitHub Pro unblocked Actions; lint was the remaining `build-and-test` failure.
- Build: `2026.07-unified.99`. Verify: `npm run lint` + `npm run typecheck`.

---

## 2026-07-22 — Android 1.23.0: wedge UX overhaul (founder override)

- **Designsystem:** `MwMotion`, spacing/radius/color tokens, hero cards, stronger hub selected state; debug gallery extended; [UX.md](apps/android/UX.md) principles (one composition, brand-first Today, logger-first Active).
- **Screens:** Active current-set hero + Now/Up next/Done; Today Start hero above metrics; Victory single ritual card; Coach adapt first + week tiles; I-Day shorter copy; Account Preferences/sync above fold.
- **Nav:** stack transitions use `MwMotion` durations. Room/sync unchanged. No F5.
- Version `1.23.0` / versionCode 50. Founder re-walk Accept B before Internal.
- Verify: `./gradlew :app:assembleDebug :app:testDebugUnitTest` · `./scripts/release-smoke.sh` · `wedge-adb-walk.py`.

---

## 2026-07-22 — H0 beta sprint packaging (docs)

- **Founder path:** LAUNCH_RUNBOOK §1 billing annotation + §3 sprint to **2026-08-02**; BETA_INVITE sprint checklist; CONTEXT `## Now` framed as beta sprint.
- **Flip prep:** PUBLIC_FLIP_CHECKLIST marks growth/week4/rate-limit/build-label green on prod `.98`; `LAUNCH_STRICT` + Linux visual + CI still founder-blocked (secrets / billing / Sentry).
- **Agent:** no named tester confusion; `LAUNCH_STRICT` cannot run without `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET`. No product decoration.

---

## 2026-07-22 — Android 1.22.0: extract `:feature:auth` (F3.1 / F11)

- **Bridges:** `HealthConnectAccountBridge` + `CrashReportingBridge` registered from `MwApp`; HC writer + Sentry stay in `:app`.
- **Move:** `AuthScreen` / `AuthViewModel` / `AuthPrefsFeedback` (+ unit test) into `:feature:auth`; NavHost passes BuildConfig version/API labels.
- Version `1.22.0` / versionCode 49. F3.1 Done; F5 still gated. Verify: `./gradlew :app:assembleDebug :feature:auth:testDebugUnitTest :app:testDebugUnitTest`.

---

## 2026-07-22 — Web .98: launch smokes aligned with gate allowlist

- **gate-smoke:** `/welcome`, magazine PDF, `/locales` expected public while gated; `/log` still gated. Matches `.97` `PRIVATE_GATE_PUBLIC_PATHS`.
- **growth-smoke:** `/api/journey/welcome` without session accepts **403** (private gate) as well as 401/503.
- **Prod verify:** gate-smoke + growth-smoke green on www; rate-limit 429 OK; week4 digest dryRun OK. `LAUNCH_STRICT` still fails local check-env without founder `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET`.
- **Founder residual:** GH Actions billing · recruit ≥10 · Accept B · Wave A.
- Build: `2026.07-unified.98`.

---

## 2026-07-22 — Android 1.21.0: Accept enablement (F10)

- **Maestro:** Active immersive `assertNotVisible` Account tab (parity with wedge-adb-walk).
- **CI:** upload debug-signed `app-release.aab` artifact (`app-release-aab`, 7d); SHIP_INTERNAL notes Play still needs founder keystore.
- **Accept:** FOUNDER_ACCEPT **15-minute Accept B** short path (release-smoke → adb walk → manual spot → Pass/Fail table). Do not mark Pass.
- Version `1.21.0` / versionCode 48. F10 Done; F5 gated. Verify: `./gradlew :app:assembleDebug :app:testDebugUnitTest`.

---

## 2026-07-22 — Web .97 live on www (Vercel promote)

- Promoted ready master deploy `d0aa3ce` → Production via `vercel promote` (GH Actions still billing-blocked).
- Smoke: `/api/health` → `2026.07-unified.97`; `/welcome` + magazine PDF + `/locales/en/common.json` → 200; `/log` → 307 `/private`.
- Founder residual: clear GitHub spending limit / failed payment so CI runs again.

---

## 2026-07-22 — Android 1.20.0: CI release packaging + INDEX

- **CI:** android job runs `assembleRelease` + `bundleRelease` (debug-signed); Maestro/smoke greps Account + `release-smoke.sh`.
- **INDEX:** hub chrome notes; `./scripts/release-smoke.sh` in Commands; Accept B pointers.
- Version `1.20.0` / versionCode 47. F9 Done; F5 gated. Agent tree ready pending founder Accept B + www promote.

---

## 2026-07-22 — Android 1.19.0: pre-Internal readiness

- **Release smoke:** `scripts/release-smoke.sh` (assembleRelease + bundleRelease); PLAY_LISTING / SHIP_INTERNAL point at build.gradle + script; check-release-readiness runs release tasks.
- **Accept buffer:** wedge asserts Active immersive (no `Account tab`); store-assets documents `02b-account.png`.
- **Auth quality:** `AuthPrefsFeedback` + unit tests; Cloud sync card intro under Preferences.
- Version `1.19.0` / versionCode 46. F8 Done; F5 gated. Verify: `./gradlew :app:assembleDebug :app:testDebugUnitTest` + `./scripts/release-smoke.sh`.

---

## 2026-07-22 — Web .97: private-gate allowlist (welcome / magazine / locales)

- **Gate:** `/welcome`, `/magazine`, `/locales` added to `PRIVATE_GATE_PUBLIC_PATHS` so SEO “Start free” → I-Day, magazine PDFs, and HTTP i18n overlay work while `PRIVATE_MODE` stays on. `/log` / `/active` still gated.
- **Proxy:** matcher also skips `.pdf` static assets (belt with `/magazine` allowlist).
- **Tests:** `privateGate.test.ts` flipped; `/log` stays blocked. `npm run typecheck` + `npm test` (484).
- **Founder unblock (not agent):** clear GitHub Actions billing/spending limit · rotate `VERCEL_TOKEN` · `workflow_dispatch` Deploy production / Vercel Promote — www was stuck ~69 commits behind. Smoke: Profile `.97`; `/welcome` no 307; PDF + `/locales/*` 200 anonymous.
- Build: `2026.07-unified.97`.

---

## 2026-07-22 — Android 1.18.0: Accept-unblock after hub UX

- **Accept truth:** FOUNDER_ACCEPT hub checks + Preferences U0a/U0b (Units/Equipment off Today); More row paths for Progress/Routines/Library.
- **Smoke:** `wedge-adb-walk.py` + Maestro Account tab round-trip before Start workout.
- **Polish:** Account unit/equipment feedback messages; hub tab TalkBack `selected`; localized Account tab strings (ES/PT/FR).
- Version `1.18.0` / versionCode 45. F7 Done; F5 gated. Verify: `./gradlew :app:assembleDebug`.

---

## 2026-07-22 — Beyond the Basics v1.4 (web `.96`)

- **Editorial:** seven free sections gained callout/table/checklist teaching blocks; all **18** free sections now have ≥1 block. Originality log v1.4 rows; `magazineMeta` → **1.4**.
- **Reader:** shared `renderMagazineBody` on public + in-app chapters; denser `relatedExerciseIds` / `relatedLearnPathId`; public-safe practice CTAs (`.95` groundwork).
- **PDF:** `MAX_PAGES` 28→36; regenerated `public/magazine/beyond-the-basics.pdf` (~23 pages / ~610KB).
- **i18n:** guidebook content keys filled for all APP_LANGS; `i18n:parity` green; `export-locales`.
- Build: `2026.07-unified.96`. Verify: `npm run typecheck` + `npm run i18n:parity` + PDF page gate.

---

## 2026-07-22 — Web .95: public guide practice CTAs + magazine body

- Wire `/guide` chapters through `publicGuidePracticeCta` (anonymous CTAs → `/welcome` / `/exercises`, not gated pillar routes) + shared `renderMagazineBody`.
- In-app guidebook chapter page uses the same body renderer.
- Sync CONTEXT after Android 1.17 overwrote `## Now` to stale `.93`; build `2026.07-unified.95`.
- Verify: `npm run typecheck` + `npm test`.

---

## 2026-07-22 — Horizon 0 residual (.94): invite smoke, hero e2e, landing density, week4-smoke

- Invite printer + gate-smoke invitee SSR (`data-mw-invitee`); Mission Score e2e fail-closed; landing hero density; `npm run week4-smoke`.
- Build: `2026.07-unified.94` (commit `036cb03`).

---

## 2026-07-22 — Android 1.17.0: hub UX polish (Today · Coach · Account)

- **Hub chrome:** 3-tab bottom nav with icons; Account first-class; peer tabs `launchSingleTop` + `popUpTo(Today) { saveState }`.
- **Today declutter:** Units/Equipment moved to Account Preferences; one primary Start; Quick log ghost; Progress/Routines/Library in compact More row.
- **Motion/insets:** tab fade (~200ms) vs stack slide; `MwScreenScaffold(applyNavBarPadding)`; hub screens skip double nav-bar padding; Coach dead `onBack` removed.
- **Flow:** Victory Coach/Routines/Today hub-safe pops; History soft-delete lands on Today with hub.
- Version `1.17.0` / versionCode 44. Verify: `./gradlew :app:assembleDebug` (JAVA_HOME=Android Studio JBR). F5 still gated; F6 Done in [apps/android/BACKLOG.md](apps/android/BACKLOG.md).

---

## 2026-07-21 — Horizon 0 web readiness: invite gate + launch-verify + wedge copy

- **Invite → gate:** links land on `/private?invite=…` (no prod `?access=` unless `PRIVATE_ALLOW_QUERY_ACCESS`); invitee expands access form; admin prefers API `row.link`; [docs/BETA_INVITE.md](docs/BETA_INVITE.md) aligned.
- **Wedge copy:** Beta guide steps + banner + `/beta` cards push I-Day → Train → Mission Coach; Coach empty-state matches Generate CTA; ES/FR/PT/DE gate subtitles drop “everything app”.
- **Launch tooling:** `launch-verify` chains growth-smoke + rate-limit-smoke (`LAUNCH_STRICT` requires them); CI gate-smoke hard-fails when secrets set; growth + soft rate-limit jobs added.
- **Docs:** VISION_STATUS build `.93`; PROTECTION P0 synced to LAUNCH_RUNBOOK §2; DESIGN_REVIEW pass logged; removed stray `_probe_sync.ts`.
- Build: `2026.07-unified.93`. Verify: `npm run typecheck` + `npm test`.

---

## 2026-07-21 — Horizon 0 sprint: dispute shield landed + founder checklists + CI sync types

- Confirmed entity/dispute shield already on `master`; [CONTEXT.md](CONTEXT.md) boot file + `## Now` updated (founder still enables Dashboard dispute events / refunds custom text / Accept B).
- Founder clarity: [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §4 webhook events + `/refunds` custom text + digest email; [apps/android/FOUNDER_ACCEPT.md](apps/android/FOUNDER_ACCEPT.md) Accept B → Play Internal pointer.
- CI: typed `RequireUserResult` on mobile sync prefs (+ workouts/customs/routines) so `npm run typecheck` stays green.
- Agents: no F5 / new pillars; founder beta + Stripe Dashboard + Play remain founder-owned.

---

## 2026-07-21 — Android 1.16.0: PR chip, soft-delete, Baseline Profile

- **F2.4:** In-session e1RM PR detect (`Progression.isPersonalRecord`) + brass “New PR” chip; patterned rest/PR haptics (`VibrationEffect` waveform); `VIBRATE` permission
- **F3.4:** History soft-delete → Room `deletedAt` + outbox tombstone; push queries include pending deletes (workouts/routines/customs)
- **F2.5:** `:benchmark` Macrobenchmark + `BaselineProfileGenerator`; `profileinstaller` + `:app:generateBaselineProfile`; CI `:benchmark:assemble`
- **Docs:** [BACKLOG.md](apps/android/BACKLOG.md) F2.4/F2.5/F3.4 Done; ARCHITECTURE/SHIP_INTERNAL Baseline notes
- Verify: `cd apps/android && ./gradlew :app:assembleDebug testDebugUnitTest :core:model:testDebugUnitTest :benchmark:assemble`

---

## 2026-07-21 — Repo operating system: boot file, doc consolidation, iOS playbook, departments

- **CONTEXT.md** (new, root): universal boot file — `## Now` status block (now the ONLY status home; ORCHESTRATION `## Where we are` points there), trap terms, hard rules. Update `## Now` on every ship, same commit as the LOG entry.
- **Tool pointers:** `CLAUDE.md`, `GEMINI.md` (root) + `apps/android/GEMINI.md` — thin pointers into CONTEXT → AGENTS → INDEX; Cursor rule updated. Never duplicate spine content into tool files.
- **Root consolidation (20 → 11 .md):** STRATEGY/PLAN/REDTEAM/JOURNEY/LAUNCH_RUNBOOK/ENV/PROTECTION/BETA_INVITE/VISION_STATUS/VERCEL_DEPLOY_CHECKLIST → `docs/`; ACCEPTABLE_USE → `docs/legal/`; SETUP → `docs/archive/` (stale banner). Full link sweep across md/ts/mjs/mdc/yaml incl. `docs/compliance/controls.yaml` evidence paths + compliance test. INDEX §4 lists the moves.
- **LOG rotation:** ≤15 entries at root (rule in header); 75 older entries → [docs/archive/log/LOG-2026-06_to_2026-07-20.md](docs/archive/log/LOG-2026-06_to_2026-07-20.md).
- **iOS:** `docs/IOS_DEFERRED.md` → [docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md) — still deferred; now a full open-the-lane spec (SwiftUI, OpenAPI contract, StoreKit→enrollments, wedge scope, lane rules).
- **Departments:** agent-lane table in [ORCHESTRATION.md](ORCHESTRATION.md) (Web/Android/iOS-closed/Design/Content-Book/Growth/Ops/Data — owner, entry doc, allowed paths).
- **Vision/book:** `vision.md` Decade map (metrics-gated); Beyond the Basics book plan in [docs/STRATEGY.md](docs/STRATEGY.md) (locale PDFs → premium cadence → KDP at Horizon 3).
- **Design:** [docs/DESIGN_REVIEW.md](docs/DESIGN_REVIEW.md) hero-flow audit checklist; DESIGN_SYSTEM `## Motion & interaction` expanded (duration tiers, no-CLS, Android parity).
- Verify: `npm run typecheck` + `npm test` green; stale-link grep clean; root .md count = 11.

---

## 2026-07-21 — Android platform rebuild (Hilt / UDF / feature modules)

- **Architecture:** [apps/android/ARCHITECTURE.md](apps/android/ARCHITECTURE.md); horizons A–E in [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md)
- **Spine:** Hilt (`@HiltAndroidApp`, `AppModule`); ViewModels + `StateFlow` UiState; Room v2 (`set_logs`, `sync_outbox`); finish workout atomic + outbox flush
- **Logger craft (`:feature:active`):** exercise×sets, previous performance row, rest −15/+15, keep-screen-on, editable weight/reps
- **Modules:** `:feature:{active,today,coach,iday,victory}` + `:core:{common,model,data,network,designsystem}`
- **CI:** `.github/workflows/ci.yml` `android` job — `assembleDebug` + Active unit tests + Maestro file gate
- **API:** Production `/api/mobile/*` returns private-gate JSON (routes live); client uses Room when unauthorized
- Verify: `cd apps/android && ./gradlew :app:assembleDebug :feature:active:testDebugUnitTest`

---

## 2026-07-20 — Pre-revenue entity + Stripe dispute shield

- **Entity pack:** [docs/legal/ENTITY_RESEARCH.md](docs/legal/ENTITY_RESEARCH.md), [docs/legal/OPERATING_AGREEMENT_DRAFT.md](docs/legal/OPERATING_AGREEMENT_DRAFT.md), [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) (take-a-dollar gate)
- **Refunds visibility:** `UnlockButton` → 14-day + `/refunds`; Stripe Checkout custom-text steps in [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md)
- **Dispute alerts:** webhook `charge.dispute.*` → `FOUNDER_DIGEST_EMAIL` via `stripeDisputeNotify`; [docs/STRIPE_DISPUTE_OPS.md](docs/STRIPE_DISPUTE_OPS.md); setup script event list updated
- **Evidence pack:** [docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md](docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md) — no auto-fight
- Founder: add dispute events on existing Stripe webhook; set `FOUNDER_DIGEST_EMAIL`; Dashboard Checkout custom text → `/refunds`

---

## 2026-07-20 — Android UX craft pass

- **Design system:** bundled Barlow Condensed / Inter / IBM Plex Mono; `MwScreenScaffold` navy+emerald glow; branded buttons, `MwSetRow`, `MwRestTimer`, enter fade + reduce-motion
- **Screens:** I-Day hero (no roadmap copy), Today one-job next session, Active Strong-like logger, Victory lock metrics, Coach briefing rows + refined adapt banner
- Wedge Maestro strings preserved (`Start mission`, `Start workout`, `Finish workout`, `Session locked`, …)
- Verify: `./gradlew :app:assembleDebug` · `python3 apps/android/scripts/wedge-adb-walk.py`

---

