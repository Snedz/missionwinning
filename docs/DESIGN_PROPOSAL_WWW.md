# DESIGN_PROPOSAL_WWW.md — the www surface, on Astro

**Lane:** Design / Brand · **Horizon:** W (craft window) · **Status:** **commissioned 2026-08-09** — [founder override](../ORCHESTRATION.md#founder-override--www-surface-on-astro-2026-08-09)
**Surface:** `design_handoff_www_static` — the **public marketing site**, pre-sign-in. Not the desktop app, not the mobile app.
**Governs:** the type scale, spacing rhythm, motion vocabulary, page map and build for a static marketing site
**Companions:** [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) §Wave 10 (the measured quality bar) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) + [brand-guidelines.md](brand-guidelines.md) (tokens — **the** source of truth) · [DESIGN_PROPOSAL_3.md](DESIGN_PROPOSAL_3.md) (the *app* composition pass — a different surface) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) (handoff registry)
**Spec sheet:** [`docs/design/www-spec-sheet.html`](design/www-spec-sheet.html) — the same specification, rendered *in* the system it specifies: the type tiers at real size against live `clamp()`, the rhythm ruler drawn to scale, the motion vocabulary running, and both page-map compositions. Self-contained, zero external references, opens offline. Wireframes and ruler also as PNG — [design/INDEX.md](design/INDEX.md). Published copy (private until shared): https://claude.ai/code/artifact/f5d8df0f-f987-4cf6-80ac-b118c3404554

> **Surface collision, resolved before it happens.** [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) records three handoffs and warns in bold that they are *three surfaces, not three revisions of one product*. This is a **fourth**, and it re-cuts the surface handoff 1 owned (`design_handoff_modernist_rebrand` — landing / marketing) onto a new stack. It is **not** [DESIGN_PROPOSAL_3.md](DESIGN_PROPOSAL_3.md), which is a composition pass over the *app*. `.159` happened because a surface was left implicit; this file states it in the header and in the registry row.

---

## 1. The brief, and what was decided

The founder set five constraints. Three were given; two were delegated and are answered here.

| # | Brief | Answer |
|---|---|---|
| 1 | **Audience** — decide | **The train-anywhere lifter, globally.** [`seo/README.md`](../seo/README.md)'s own wedge customer: home, park or garage; bodyweight or minimal gear; subscription-fatigued; any country. In their words — *"not another subscription", "works offline", "no account needed", "actually free, not free-trial free"*. **Not** the everything-app shopper; six pillars stay below the fold. |
| 2 | **The one action** — decide | **One CTA slot, flag-switched.** Gate on → *"Get an invite"* (email capture). Gate off → *"Start free — no account"* → `/welcome`. Same position, same weight, same red, every page. It reads the existing [`privateGate.ts`](../src/lib/privateGate.ts) / [`freeBeta.ts`](../src/lib/freeBeta.ts) flags, so **nothing gets redesigned on flip day** — see §5. |
| 3 | **References as the quality bar** | Measured, not eyeballed — [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) §Wave 10. Ten 1440pt captures parsed for font, size, colour and geometry. **§10.1 records that the first reading of them was wrong.** |
| 4 | **Stack** — Astro, Tailwind, Cloudflare Pages, static, no CMS | Accepted as given. §7. |
| 5 | **Ban list** — no purple gradients, emoji icons, Inter as display, stock-photo placeholders, centred-everything | Accepted, and **made enforceable** — §8, guard 4. Three of the five are already gate-enforced or structurally impossible; two are new checks. |

**The brief said "do not copy the layouts."** Wave 10 separates the four properties that transfer (scale ratio, rhythm, CTA discipline, accent discipline) from the layouts that carry them. Nothing below reproduces a reference layout, and §10 lists what is refused *because* it is theirs.

## 2. What is settled and what this proposal may move

Same frame as [DESIGN_PROPOSAL_3.md](DESIGN_PROPOSAL_3.md) §1, re-scoped to this surface.

| Layer | State | Open here? |
|---|---|---|
| Tokens — paper/ink, three reds, Archivo, radius 0, 2px rules | **Settled, gate-enforced** (`check-design-system`, `check-token-sync`) | **No.** A raw hex fails the build |
| Public URL inventory (~250 SEO routes) | **Settled.** Moving them is an SEO event, not a design decision | **No** — §7 keeps every one of them where it is |
| The argument order — log → adapt → anywhere → free → start | **Settled.** [`LandingPage.tsx`](../src/page-components/LandingPage.tsx) states it is the product loop and it reads as one argument | **No.** Re-set at reference rhythm, not re-ordered |
| Voice, and the ban on testimonials / traction claims | **Settled** ([brand-guidelines](brand-guidelines.md) § Voice, hard rule 3) | **No** |
| **Vertical rhythm** | **The measured gap** — §4 | **Yes — this is the job** |
| **Motion vocabulary** | Five moves shipped, none used on marketing | **Yes** |
| **Type scale ceilings** | Two numbers, both below the reference band | **Yes — narrowly.** §3 |
| Delivery — framework, hosting, JS budget | Next.js app route today | **Yes** — §7 |

## 3. Typography — two numbers change

Wave 10 §10.2 measured reference display type at 70–100pt and section heads at 30–40pt, at 1440. MW ships 76px and 48px. **The scale is already at the bar; do not inflate it.** An earlier draft of this proposal specified a 168px poster tier on the strength of phone screenshots; §10.1 records why that was wrong.

| Class | Today | Proposed | Change |
|---|---|---|---|
| `.display-hero` | `clamp(2.625rem, 6vw, 4.75rem)` · lh 1.06 · ls −0.02em | — | **none** |
| `.display-section` | `clamp(1.9rem, 4.5vw, 3rem)` · lh 1.12 · ls −0.015em | — | **none** |
| `.display-mega` | `clamp(2.5rem, 7vw, 4.5rem)` · lh 1 · `tabular-nums` | `clamp(2.5rem, 7vw, 6rem)` | **ceiling 72 → 96px** |
| `.display-statement` | — | `clamp(2.75rem, 7vw, 6rem)` · lh 0.94 · ls −0.025em | **new class** |
| `.eyebrow` | 13px caps · ls 0.08em · `tnum` | — | **none** |
| Body | 17/28 marketing | — | **none** |

**Why `.display-mega`'s ceiling moves.** It is the stat tier, and today it caps *below* `.display-hero` — a headline outranks a number. Both references that use a stat tier invert that: TrainHeroic sets `500,000+` at **100pt**, above its own 70pt hero; La Huella's statement type is 96pt. 96px restores the intended order and lands on the measured value.

**Why `.display-statement` is a new class and not a re-use.** `.display-mega` is numerals — `leading-none` and `tabular-nums`, tuned so a ticking figure does not jitter. A statement is prose and needs 0.94 leading and a measure cap. Same ceiling, different job; collapsing them would put `tabular-nums` on a sentence. Cap the measure at `18ch` — at 96px an uncapped line runs past comfortable reading and the statement stops landing as one block.

**Not proposed: a width axis.** CoD (Hitmarker Condensed) and La Huella (CWM) set condensed display; Freeletics and TrainHeroic do not — 2-of-4, so it is an option, not a requirement. Switching Archivo from three static weights to the variable `wdth` build is a real bundle cost on routes already under a ratchet. Left as open decision §11.3.

**Not proposed: a mono micro-label face.** Freeletics reserves Iosevka for telemetry captions. `.eyebrow` (Archivo caps + `tnum`) already occupies that register at one-typeface cost, and `second-typeface` is a gate rule.

## 4. Vertical rhythm — the actual delta

Wave 10 §10.4: reference spacing is **bimodal** — clusters at 27–46pt, section boundaries at 190–450pt, statement boundaries at 540–830pt, with nothing in between. MW's clusters are correct; its section boundaries are roughly half the bar.

| Tier | Today | Proposed | Resulting boundary | Reference band |
|---|---|---|---|---|
| Cluster | `space-y-6` (24px) | — | 24px | 27–46pt ✓ |
| Section | `py-16 lg:py-20` | **`py-24 lg:py-32`** | 192 / **256px** | 190–450pt ✓ |
| Heavy section | `py-20 lg:py-24` | **`py-28 lg:py-40`** | 224 / **320px** | 190–450pt ✓ |
| **Statement** | — | **`py-44 lg:py-72`** | 352 / **576px** | 540–830pt ✓ |

Everything else holds: 2px `--border` rules (never hairlines), the gutters-are-rules grid (`gap-0.5` on a `bg-border` parent — `gap-px` was rejected as a hairline), `max-w-6xl` chrome / `max-w-3xl` reading, flush left including button labels.

**This is the single change that closes the gap the founder saw.** It costs no new tokens and no new type.

## 5. The one action

Wave 10 §10.6: all four references repeat **one CTA shape** and change only the verb — Freeletics runs *Start now · Start your plan now · Got It Now · Start your transformation* as the same white pill + `→`. MW's [`.primary-action`](../src/index.css) (52px, 19px/800, flush left, poster red) is already that shape.

```
<CtaSlot/>   // one component, every page, same position and weight
  gate on   → "Get an invite"           → email capture, source: 'launch-waitlist'
  gate off  → "Start free — no account" → /welcome
```

Under it, always, a **reassurance line** in `.eyebrow` — TrainHeroic's *"14-Day Free Trial. No Credit Card Required."* move. MW already writes these; they belong under the button, not buried in a paragraph:

> *Under three minutes to your first logged set. Nothing to install, nothing to pay.*

**One red action per page** stays the law, and stays measured — §8, guard 3.

## 6. Page map

Argument order unchanged. Three sections added: two statements and a compare rail. Compact and desktop are **separate compositions**, per [DESIGN_PROPOSAL_3.md](DESIGN_PROPOSAL_3.md) §4.10 and the `md` (768px) line [`useIsCompact()`](../src/hooks/useIsCompact.ts) already draws.

| # | Section | Type | Rhythm | Compact (390) | Desktop (1440) |
|---|---|---|---|---|---|
| 00 | Nav + `CtaSlot` | `.eyebrow` | sticky | monogram · menu · CTA | monogram · 5 links · CTA |
| 01 | **LOG** — *"Log a set. / Your week rewrites itself."* | `.display-hero` | heavy | stacked; demo below | 1.05fr/0.95fr, live demo right |
| 02 | **Statement** *(new)* | `.display-statement` | statement | one sentence, full-bleed | one sentence, `18ch`, flush left |
| 03 | At a glance — `228 · 3min · 0 · $0` | `.display-mega` | section | 2×2, gutters are rules | 1×4, gutters are rules |
| 04 | ADAPT — `CoachAdaptDemo` | `.display-section` | section | stacked | two-column, demo right |
| 05 | ANYWHERE — 3 documentary photos | `.display-section` | section | rail, peek | 3-up, middle offset |
| 06 | FREE — definition list | `.display-section` | section | `divide-y-2` | `sm:grid-cols-[10rem_1fr]` |
| 07 | **Compare rail** *(new)* — 10 stories | `.display-section` | section | rail, 5th card cropped | 5-up, 6th cropped |
| 08 | Questions — `<details>`, zero JS | `.display-section` | reading | full width | `max-w-3xl` |
| 09 | **START** — the one red field | `.display-statement` | statement | `.poster-close` | `.poster-close` |

Routes: `/` · `/about` · `/vision` · `/compare` + 10 stories · `/press` · `/bundle` (built, flag-hidden) · the `/private` replacement.

## 7. Build

- **Astro + Tailwind + Cloudflare Pages**, as briefed. Static output, no CMS. Three islands only — `LogToPlanHero`, `CoachAdaptDemo`, the rail counter. **JS budget < 20KB**, ratcheting down like [`bundle-budget.mjs`](../scripts/bundle-budget.mjs).
- **Lives at `sites/www/` in this monorepo**, not a separate repo, so the token guard can reach it. Driven by **`npm --prefix sites/www`**, not npm workspaces — the root `package.json` declares none, `packages/mw-core` is consumed by relative path, and `apps/mobile` / `ops/dashboard` already use `--prefix`. Adding a `workspaces` array would rewrite `package-lock.json` and hoist Astro/Tailwind against the app's pinned `tailwindcss@^3.4.17`. The isolated `node_modules` is also what lets this site use Tailwind v4 while the app stays on v3.
- **Scope: the marketing shell only.** The 228 exercise pages, 6 guide chapters, 4 paths and 3 calculators **stay in Next.js at their current URLs**. Zero SEO-URL movement in this handoff.
- **Tokens are generated, never retyped.** A new `scripts/build-marketing-tokens.mjs` emits `sites/www/src/styles/tokens.css` from the `:root` block of [`src/index.css`](../src/index.css); `check-token-sync.mjs` gains a third target. This is `.178` — *one fact, one home* — applied to the failure this repo keeps paying for (`.605`: one gate carrying three values in three files).
- **Numbers come from [`contentFloors.ts`](../src/lib/contentFloors.ts)**, which is literal-only with zero imports, so Astro can import it directly. **This fixes the live drift**: the landing page and all 15 locale packs still say `217 exercises` against a catalog of 228. No digit is typed into a blurb.
- **Copy comes from [`landingLocales.ts`](../src/i18n/landingLocales.ts)**, not rewritten.
- **Motion is CSS-first.** `@supports (animation-timeline: view())` drives reveals with zero JS on Chromium and Safari 26+; elsewhere a ~0.6KB island mirrors [`useScrollReveal.ts`](../src/hooks/useScrollReveal.ts) exactly (threshold 0.2, rootMargin `0px 0px -8% 0px`, once). Stagger reuses [`StaggerReveal.tsx`](../src/components/layout/StaggerReveal.tsx)'s tuned `40ms + 50ms × min(i,6)`, capped 340ms.

### Motion vocabulary

Five moves are already shipped and are reused verbatim; two are new. All are built on the repo's single easing token `cubic-bezier(0.22, 1, 0.36, 1)` and its tiers (150 press · 200–250 state · 300–450 entrance).

| Move | What | Timing | Source |
|---|---|---|---|
| `rise` | translateY(14px) + opacity | 450ms | `.reveal`, verbatim |
| `press` | button / card press | 150ms | `.pressable-card`, verbatim |
| `march` | caps ticker | 32s linear | `.ticker-track`, verbatim |
| `stick` | nav gains paper bar + 2px rule past the hero | 200ms | new; **no blur** — `backdrop-blur` is gate-banned |
| `rail` | scroll-snap rail, next card cropped at the edge, 2px progress rule + `01 / 10` in `.section-index` | user-driven | the crop *is* the affordance (Wave 10 §10.6) |
| **`wipe`** | display lines reveal `clip-path: inset(0 0 110% 0)` → `inset(0)`, per line | 520ms, 80ms stagger | **new** — statement sections only |
| **`count`** | stat numerals tick to value, `tabular-nums` so width cannot jitter | 900ms ease-out | **new** — section 03 only |

**`prefers-reduced-motion: reduce` kills all seven**, porting [`src/index.css:541-576`](../src/index.css) verbatim — including its recorded lesson, that the one animation most likely to hurt someone was the one missing from the block. `count` snaps to final; `march` stops; `rail` keeps scroll-snap because it is user-driven, not animation.

Out, per [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) § Motion: scroll-hijacking, parallax, spring/bounce, anything animating twice on one mount.

> **Honest limit.** Wave 10 §10.7 records that motion could **not** be measured — print captures are static. Every timing above comes from MW's own shipped tokens. The references contributed *affordances* (the cropped card, the thumbnail carousel, the counter), not durations.

## 8. Guards

A rule this repo does not enforce dies. Four checks, written to the repo's own standard — **discover rather than enumerate**, falsify with mutants, no date literals.

1. **`check-token-sync.mjs`** — extend to `sites/www`. Paper, ink and all three reds match within ±1/255, or the build fails.
2. **`check-design-system.mjs`** — extend the walk to `sites/www/**`: off-palette hex, raw border-radius, glow/elevation, second typeface.
3. **One-red-action e2e** — port `expectAtMostOneRedAction` from [`redActions.ts`](../tests/e2e/helpers/redActions.ts) to every marketing route. *This is what turns §5 from an intention into a gate.*
4. **Ban-list guard** *(new)* — the founder's five bans, made checkable:

| Ban | Check | Already covered? |
|---|---|---|
| Purple gradients | no `linear-gradient`/`radial-gradient` in `sites/www`; the existing `off-palette-colour` rule already forbids the hues | mostly — gradients are a `DESIGN_SYSTEM` "do not" but only tokens are scanned |
| Emoji as icons | no emoji codepoints in `.astro`/`.tsx` outside allowlisted content strings | no — new |
| Inter as display font | `second-typeface` rule already forbids any non-Archivo family | **yes**, structurally |
| Stock-photo placeholders | [`GrayscalePhoto`](../src/components/marketing/GrayscalePhoto.tsx) renders an honest captioned block when `base` is unset, by design | **yes**, structurally |
| Centred-everything | no `text-center` on a section root | no — new |

## 9. Acceptance

Judged against the existing bars ([DESIGN_PROPOSAL_3.md](DESIGN_PROPOSAL_3.md) §4), plus three specific to this surface.

1. One composition per section — the first viewport has one job
2. **One red action per page**, declared by the designer, measured by `redActions.ts`
3. Tabular nums on all metrics; no layout shift
4. Emotion beat named per section: composure · focus · honor · clarity
5. 44px tap floor
6. **Zero raw hex, zero non-zero radius, zero second typeface, zero glow/shadow** outside dialogs and one `card-boss`
7. **Surface declared** — compact, desktop, or both. Undeclared is rejected
8. **Section boundaries measure inside 190–450px** (statement sections 540–830px) at 1440 — §4, checkable from the built page
9. **Renders complete with JavaScript disabled.** La Huella fails this by 8365pt (Wave 10 §10.5); we do not
10. **< 20KB JS**, ratcheting down only

## 10. Out of scope, and refused

**Out of scope:** the 250 SEO routes (stay in Next.js, this handoff) · IA or route renames · token changes · the app surfaces ([DESIGN_PROPOSAL_3.md](DESIGN_PROPOSAL_3.md) owns those) · Android · locale-prefixed URLs + hreflang (Horizon 3) · anything requiring `PRIVATE_MODE` to flip.

**Refused on sight:** a JS-gated body · purple or any gradient · emoji icons · centred hero copy · before/after body-composition proof (Freeletics' transformation grid — a positioning [brand-guidelines](brand-guidelines.md) § Voice has already refused) · testimonials or logo walls while the beta is private · **any traction number** (hard rule 3) · a second typeface at the auth boundary (CoD's own sign-in break, Wave 10 §10.6) · sale countdowns · navy, emerald or brass.

## 11. Open decisions — before commissioning

1. ~~**The horizon override.**~~ **Closed 2026-08-09** — the founder struck `landing redesign` from the Horizon W forbidden list and commissioned `design_handoff_www_static`. The override is deliberately narrow; the rest of that list stands.
2. **Photography.** Three documentary shots exist (`bare-wrist`, `home-rack`, `phone-bench`); the map wants ~12. Type, data and the live demo carry §01–09 without them, so this does not block — but §05 is thin until it is answered. Separately: `public/learn/*.webp` chapter heroes are still in the **retired navy/emerald palette** (`CONTEXT.md` `.254`) and must not be reused.
3. **Variable Archivo?** Condensed display is 2-of-4 in the references (§3). Adopting `Archivo[wdth,wght]` buys a condensed statement tier at the cost of a larger font payload on routes already under a bundle ratchet. Recommend **no** for v1; revisit if §02/§09 read thin at 96px.
4. **i18n.** 15 locales translate client-side on one URL today. Static Astro forces the choice: EN-only (recommended, matches the existing 250 SEO routes) or locale-prefixed routes + hreflang (Horizon 3 depth).
5. **`/private`.** Does the Astro site replace the gate page, or does the gate stay in Next.js until flip? Replacing it is the only way the new design is *visible* before Horizon 1.

## 12. Verification

```bash
npm run gate                              # 19 steps — 11 and 14 now also cover sites/www; 15 is the www build
npm --prefix sites/www run build          # Astro static build
npm --prefix sites/www run check          # class contract · JS budget
npm run www:tokens && git diff --exit-code sites/www/src/styles/tokens.css   # generated file is current
npx playwright test --config sites/www/playwright.config.ts                  # 390×844 and 1440×900
```

The gate is **19 steps**. The token-sync and design-system guards are extended in place, so the steps that already run them cover the new directory — but the class contract, the JS budget and the rhythm check read build output, and they needed a step of their own (15).

This section originally said the gate would *stay* at 18, on the reasoning that a new step fires `gateDocParity.test.ts` and forces a `CLAUDE.md` renumber. `ciTruth.test.ts` overruled it during the build: while Actions is billing-blocked, a check whose only home is a workflow **is not being checked at all**, and its failure message says to move it into `npm run gate`, *"which is the only thing that actually runs"*. Avoiding a doc edit was not a good enough reason to leave three guards unrun.

Plus: a `surface-split`-style spec asserting compact and desktop are structurally different (not one reflow); axe on every route; the red-budget spec from §8 guard 3; and a **no-JS render test** for acceptance bar 9.

**Falsification, run before any guard is claimed to work** — mutate a token hex, add a gradient, drop in an emoji icon, centre a section root, nullify `.display-statement` with `text-4xl`. Each must go red. Mutant count goes in the LOG entry, per [CLAUDE.md](../CLAUDE.md) §6.
