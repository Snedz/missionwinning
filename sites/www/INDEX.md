# sites/www — the public marketing site

**Surface:** `design_handoff_www_static` — pre-sign-in marketing only. Not the desktop app, not the mobile app.
**Spec:** [docs/DESIGN_PROPOSAL_WWW.md](../../docs/DESIGN_PROPOSAL_WWW.md) · **Reference bar:** [docs/DESIGN_RESEARCH.md](../../docs/DESIGN_RESEARCH.md) §Wave 10 · **Commissioned:** founder override 2026-08-09

Astro 7 + Tailwind 4, **static output**, deployed to Cloudflare Pages. No adapter, no CMS, no server.

## Layout

| Path | Role |
|------|------|
| `src/pages/` | Routes. One `.astro` file per URL |
| `src/layouts/Base.astro` | `<head>`, font preload, canonical, OG |
| `src/components/` | Page pieces. `CtaSlot.astro` is the one action; `LogToPlanDemo` and `CoachAdaptDemo` are the two live islands |
| `src/styles/tokens.css` | **GENERATED** — do not edit. `npm run www:tokens` |
| `src/styles/global.css` | The `@theme` block, type tiers, rhythm, motion |
| `public/fonts/` | Archivo variable, latin, weight axis only |

## Commands

Driven by `npm --prefix`, **not** npm workspaces — the root `package.json` declares none, and adding one would rewrite `package-lock.json` and hoist Astro/Tailwind against the app's pinned `tailwindcss@^3.4.17`. `apps/mobile` and `ops/dashboard` set the precedent.

```bash
npm run www              # dev server
npm run www:build        # static build → dist/
npm run www:check        # astro check + class contract + JS budget + rhythm
npm run www:tokens       # regenerate tokens.css from src/index.css
```

## What is guarded, and where

Nothing here is enforced by prose. The gate is **19 steps**: the token-sync and design-system guards were *extended in place* to walk this directory rather than gaining steps of their own, and step 15 was added for the checks that need build output.

> This paragraph said "stays at 18 steps" until `.640`. That was the plan — avoid a step, avoid renumbering `CLAUDE.md` — and `ciTruth.test.ts` overruled it: while Actions is billing-blocked a workflow-only check is not being checked at all, so `www:gate` had to move into `npm run gate`. `CLAUDE.md` was updated and this line was not. **A map of the gate that cannot see a step is how the step stops being run** — `.596` found a documented 16-step gate running 18, and this is the same defect two files later.

| Check | Where it runs | Catches |
|-------|--------------|---------|
| `check-token-sync` | gate step 14 | A brand colour here drifting from `src/index.css`. Fails loudly if `tokens.css` is missing or carries none of the checked colours — a `—` in every row would otherwise pass while checking two surfaces of three |
| `check-design-system` | gate step 11 | Off-palette hex, raw radius, glow, second typeface, **and** the founder ban list: gradients, emoji-as-icon, centred section roots. The last three carry `scope: WWW_ONLY` — run repo-wide they report 312 findings in the app, ~250 of them legitimate `text-center` and every `→`/`✓`, which this product sets as type |
| `www-class-contract` | `www:check` | A class referenced in source with no rule in the built CSS. The island failure mode: a missing `.eyebrow` or `.reveal` renders invisible content and nothing fails |
| `www-bundle-budget` | `www:check` | Gzipped initial JS over 20KB. Ratchets down only; a missing `dist` is a hard failure, never a skip |
| `www-rhythm` | manual / CI | The spec's central claim — section boundaries inside 190–450px, statement boundaries 540–830px, measured at 1440 the same way the references were |

## Rules

- **No hex, no digit, no colour literal.** Colours come from `tokens.css`; content counts come from `src/lib/contentFloors.ts`, which is literal-only with zero imports. Typing `228` here is how the app's landing page ended up claiming `217` in fifteen locale packs against a catalogue of 228.
- **`tokens.css` is generated and committed.** Editing it by hand is drift and the gate fails on it. Change `src/index.css`, then `npm run www:tokens`.
- **One red action per page.** The poster field carries the red; a nested action inverts to paper so the field does not add a second.
- **Renders complete with JavaScript disabled.** The reference that set the visual bar fails this by 8365pt of empty scroll; this surface carries ~250 SEO URLs and cannot.
- **Desktop and compact are two compositions**, not one reflow — the same rule the app's `useIsCompact()` draws at 768px.
- **Islands are vanilla, not React.** `@astrojs/react` would put react + react-dom (~45KB gzipped) on a marketing page for two small state machines; both demos together ship **1.6KB**. `LogToPlanDemo` runs the real engine — `suggestNextSetTarget`, the same function `/active` calls — and computes its no-JS state at build time, so the fallback cannot drift the way the app's hardcoded `8 × 82.5 kg` can. `CoachAdaptDemo` runs **no** engine: its two weeks are literal arrays, exactly as in the app, and its copy must never imply otherwise.
- **Do not import from `src/` at runtime.** Build-time frontmatter only. `src/i18n/landingLocales.ts` in particular is one 52KB module whose 15 packs cannot be tree-shaken.
