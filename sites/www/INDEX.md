# sites/www — the public marketing site

**Surface:** `design_handoff_www_static` — pre-sign-in marketing only. Not the desktop app, not the mobile app.
**Spec:** [docs/DESIGN_PROPOSAL_WWW.md](../../docs/DESIGN_PROPOSAL_WWW.md) · **Reference bar:** [docs/DESIGN_RESEARCH.md](../../docs/DESIGN_RESEARCH.md) §Wave 10 · **Commissioned:** founder override 2026-08-09

Astro 7 + Tailwind 4, **static output**, deployed to Cloudflare Pages. No adapter, no CMS, no server.

## Layout

| Path | Role |
|------|------|
| `src/pages/` | Routes. One `.astro` file per URL — `index.astro` (homepage), `start.astro` (conversion), `week.astro` (dedicated landing), `about.astro` (commissioned about; Next keeps the host and Next `/about`), `vision.astro` (commissioned vision; Next keeps Next `/vision`), `compare.astro` (index only; Next keeps `/guide/mission-winning-vs-*`) |
| `src/layouts/Base.astro` | `<head>`, font preload, canonical, OG |
| `src/components/` | Page pieces. `CtaSlot.astro` is the one action; `StagePhoto.astro` makes a photograph a ground; `LogToPlanDemo` and `CoachAdaptDemo` are the two live islands |
| `src/lib/appLinks.ts` | Every link that leaves this build (`INVITE_URL`, `HOME_URL`, `START_URL`). One home, because the host split is undecided |
| `src/styles/tokens.css` | **GENERATED** — do not edit. `npm run www:tokens` |
| `src/styles/global.css` | The `@theme` block, type tiers, rhythm, motion |
| `public/fonts/` | Archivo variable, latin, weight axis only |

## Commands

Driven by `npm --prefix`, **not** npm workspaces — the root `package.json` declares none, and adding one would rewrite `package-lock.json` and hoist Astro/Tailwind against the app's pinned `tailwindcss@^3.4.17`. `apps/mobile` and `ops/dashboard` set the precedent.

```bash
npm run www              # dev server
npm run www:build        # static build → dist/
npm run www:check        # astro check + class · link · JS budget · rhythm · composition
npm run www:tokens       # regenerate tokens.css from src/index.css
```

## What is guarded, and where

Nothing here is enforced by prose. The gate is **19 steps**: the token-sync and design-system guards were *extended in place* to walk this directory rather than gaining steps of their own, and step 15 was added for the checks that need build output.

> This paragraph said "stays at 18 steps" until `.640`. That was the plan — avoid a step, avoid renumbering `CLAUDE.md` — and `ciTruth.test.ts` overruled it: while Actions is billing-blocked a workflow-only check is not being checked at all, so `www:gate` had to move into `npm run gate`. `CLAUDE.md` was updated and this line was not. **A map of the gate that cannot see a step is how the step stops being run** — `.596` found a documented 16-step gate running 18, and this is the same defect two files later.

| Check | Where it runs | Catches |
|-------|--------------|---------|
| `check-token-sync` | gate step 14 | A brand colour here drifting from `src/index.css`. Fails loudly if `tokens.css` is missing or carries none of the checked colours — a `—` in every row would otherwise pass while checking two surfaces of three |
| `check-design-system` | gate step 11 | Off-palette hex, raw radius, glow, second typeface, **and** the founder ban list: gradients, emoji-as-icon, centred section roots. The last three carry `scope: WWW_ONLY` — run repo-wide they report 312 findings in the app, ~250 of them legitimate `text-center` and every `→`/`✓`, which this product sets as type |
| `check-alias-imports` | `www:build` / `www:check` | A `@/` import of a file that does not exist. `.668` deleted `compareStories` and left this surface importing it; `astro build` only said so after CI had already installed Chromium. Discover, not enumerate. |
| `www-class-contract` | `www:check` | A class referenced in source with no rule in the built CSS. The island failure mode: a missing `.eyebrow` or `.reveal` renders invisible content and nothing fails. **Blind spot, recorded rather than implied away:** it reads `class="…"`, `class='…'` and ``class={`…`}`` only, so `class:list={[…]}` and `class={cn(…)}` are neither checked nor counted as dynamic — they are silently unexamined. Tailwind still generates their utilities, so they work; they just have no safety net |
| `www-link-contract` | `www:check` | An internal `href` pointing at an id or a route this build does not emit. Added at `.640` after **every CTA on the homepage** turned out to target `/#invite`, which exists nowhere — and after it found eleven more on its first run. This is the one defect class that survives a screenshot: a button that scrolls nowhere photographs exactly like a button that works |
| `www-bundle-budget` | `www:check` | Gzipped initial JS over 20KB. Ratchets down only; a missing `dist` is a hard failure, never a skip |
| `www-rhythm` | `www:check` | The spec's central claim — section boundaries inside 190–450px, statement boundaries 540–830px, measured at 1440 the same way the references were |
| `www-composition` | `www:check` | How much of the page is a photograph. Added at `.641`, because the page shipped matching the reference type scale AND the reference rhythm with every guard green, and still rendered as a wireframe: **nothing had ever measured imagery.** Floors from [DESIGN_RESEARCH](../../docs/DESIGN_RESEARCH.md) §11.5 — fold ≥60%, page ≥35%, ≥1 full-bleed, ≥1 text block over an image. Union of image rects, never the sum: three reference captures sum past 100% because carousel layers stack |

## Rules

- **No hex, no digit, no colour literal.** Colours come from `tokens.css`; content counts come from `src/lib/contentFloors.ts`, which is literal-only with zero imports. Typing `228` here is how the app's landing page ended up claiming `217` in fifteen locale packs against a catalogue of 228.
- **`tokens.css` is generated and committed.** Editing it by hand is drift and the gate fails on it. Change `src/index.css`, then `npm run www:tokens`.
- **One red action per page.** The poster field carries the red; a nested action inverts to paper so the field does not add a second. The *action* repeats on the cadence Wave 11 §11.4 measured (one instance per ~800px); the *red* does not.
- **`/` hands off to `/start`; `/start` terminates.** `CtaSlot` takes a `terminal` prop and only `/start` sets it, so the funnel is one verb wide and there is exactly one capture point to maintain. Wave 11 §11.4: a dedicated page is nav-less because that is what auth and checkout surfaces do — not because dedicated pages are short (Freeletics' Nutrition landing page keeps full nav and runs as long as their homepage).
- **Renders complete with JavaScript disabled.** The reference that set the visual bar fails this by 8365pt of empty scroll. *(This line used to claim "this surface carries ~250 SEO URLs". It carries **one page**. The ~271 URLs — 228 exercises · 6 guide · 6 muscle · 6 equipment · 6 paths · 19 static — are generated by `app/sitemap.ts` on the Next app, and stay there. Compare stories left with `.668`.)*
- **Anything not emitted by this build is an absolute URL**, from `src/lib/appLinks.ts` and nowhere else. `astro build` produces one HTML file; `/welcome` and `/private` are Next routes on the Vercel origin, and a relative path to any of them 404s on Cloudflare. Which origin serves `www.missionwinning.com` is **undecided** — `astro.config.mjs` and `src/lib/seoMetadata.ts` both claim it, and there is no `_redirects`, no `wrangler.toml` and no deploy workflow. That module is the one place the answer lands.
- **Desktop and compact are two compositions**, not one reflow — the same rule the app's `useIsCompact()` draws at 768px.
- **A photograph is a ground, not an illustration.** `StagePhoto` puts the image behind the type; Wave 11 §11.3 measured 40–100% of reference text spans sitting inside an image box. On a dark ground, `.on-dark` inverts exactly four utilities (`text-quiet`, `eyebrow`, `border-rule`/`bg-rule`, `border-ink`) and **not** `bg-paper` or `text-ink` — those are what an author writes when they want a paper element *on* the dark, and inverting them turned the nav monogram and two demo rows black. A paper card nested inside a dark section carries `.ground-paper` to opt its subtree back out.
- **Islands are vanilla, not React.** `@astrojs/react` would put react + react-dom (~45KB gzipped) on a marketing page for two small state machines; both demos plus the nav swap and stat count-up ship **2.1KB**. `LogToPlanDemo` runs the real engine — `suggestNextSetTarget`, the same function `/active` calls — and computes its no-JS state at build time, so the fallback cannot drift the way the app's hardcoded `8 × 82.5 kg` can. `CoachAdaptDemo` runs **no** engine: its two weeks are literal arrays, exactly as in the app, and its copy must never imply otherwise.
- **Do not import from `src/` at runtime.** Build-time frontmatter only. `src/i18n/landingLocales.ts` in particular is one 52KB module whose 14 packs cannot be tree-shaken.
