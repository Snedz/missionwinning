# Mission Winning — brand & front-end architecture review (read-only)
Date: 2026-10-16 · Source: Snedz/missionwinning `master` and Snedz/LiftLog via GitHub API. Nothing changed in code.

## 1. Where every surface lives
| Surface | Location | Stack | Deploy target |
|---|---|---|---|
| Web app + current home/gate | Snedz/missionwinning — `app/`, `src/`, `proxy.ts` | Next.js App Router PWA (`app/manifest.ts`), Tailwind + shadcn | Vercel (www.missionwinning.com) |
| Static marketing site | same repo, `sites/www/` | Astro | separate build (not the live `/`) |
| Native Android | same repo, `apps/android/` | Kotlin + Jetpack Compose, modules `core/designsystem`, `feature/*`, `wear` | Google Play, `com.missionwinning.app` |
| Cross-platform mobile (the only iOS code) | same repo, `apps/mobile/` | Expo / React Native + expo-router, EAS (projectId still placeholder) | App Store + Play, also `com.missionwinning.app` |
| Shared logic | `packages/mw-core/` | TypeScript (coach, economy, identity, workout) — no tokens | consumed by web |
| LiftLog fork | Snedz/LiftLog (public fork of LiamMorrow/LiftLog) | Expo/React Native + .NET backend, **AGPL-3.0** | none of ours |

There is no separate native iOS (Swift) project. iOS = `apps/mobile` (Expo).

## 2. One front end for marketing *and* app? — Yes
- `app/layout.tsx` (root, wraps every route) imports `src/index.css` globally and loads Archivo + Geist. `themeColor` #f3f2f2 (paper).
- `src/index.css` = "Modernist" paper/ink/red theme (#f3f2f2 / #201e1d / #ae1800–#ec3013, radius 0). It drives every shadcn component on every route.
- `app/(app)/layout.tsx` wraps all app screens (/log, /active, /coach, /history, /programs, /account…, ~55 routes) in `HouseShell`, whose `house.css` (`.mw-house`) **re-overrides the same CSS variables** to a dark black+amber skin (#0a0c0f / #ffb000, radius 4px).
- Marketing/SEO pages (`/about`, `/guide`, `/exercises`, `/calculators`, `/vision`, `/press`…) sit OUTSIDE `(app)` and render on the paper theme.
- `/` → `app/page.tsx`: gate on + no cookie → `/private`; cookie → `LandingPage`. `house.css` header says the gated door and cookie homepage also import the house skin (founder override .1137). `/today` and `/train` are retired aliases 308'd to `/log` and `/active` in `proxy.ts`.
- `sites/www/src/styles/tokens.css` is GENERATED from `src/index.css` (`scripts/build-marketing-tokens.mjs`, `check-token-sync`).

Leak paths: (a) any edit to `src/index.css` hits marketing AND the app (app only partly masked by `.mw-house`); (b) house skin edits now hit the door/landing too; (c) a landing restyle (IRONFORGE PR #1065) that touches shared components (`src/components/ui`, buttons, cards) changes in-app screens; (d) web token changes never reach native — native drifts silently.

## 3. Conflicting themes found (no single source)
| Theme | Where | Colours / fonts |
|---|---|---|
| Modernist paper/red | `src/index.css`, `sites/www` tokens | #f3f2f2, #201e1d, #ae1800/#dd2b0f/#ec3013, Archivo |
| House black+amber ("4th skin") | `src/components/house/house.css` | #0a0c0f, #e6ebef, #ffb000, Geist |
| Navy/emerald/brass (old brand) | `apps/android/.../MwColors.kt`, `apps/mobile/src/theme.ts` | #0a0c10, #27b07d, #c7a860 |
| IRONFORGE (new, PR #1065) | landing only | #0a0a0a, #FF5400, Bebas Neue/Oswald/Archivo/JetBrains Mono |
Also chart colours in `src/components/charts/chartTheme.ts`, and unused token tooling under `.claude/skills/design-system`. (No "Bevel"/Claude-orange tokens exist in code now; those were earlier references.)

Automated visual churn: `house.css` changed 4× on 2026-10-15/16 alone (.1136–.1142, all `[skip vercel]` loop commits: "icon rail drops the red mark", "Train set row and a big Log set", "public door is Log a set. Offline."). `src/index.css` had a run of loop-driven rebrand commits (.133–.159, Jul 25–27) then Pump Club/Kaizen craft loops in Aug. Visual changes are being made by numbered automation commits, not a design decision.

Other risks: Android Compose and Expo both claim `com.missionwinning.app` — they cannot both ship to Play; pick one. LiftLog is AGPL-3.0: shipping any of its code in a closed app obliges source release — keep it out of the shipped apps unless that is accepted.

## Root cause
Brand isn't defined once. The web app's global stylesheet is simultaneously the marketing theme and the app's base theme, the app shell layers a second theme on top by overriding the same variables, the door now borrows the app skin, and the two native projects carry a third, older palette copied by hand. Automated loops edit these files directly. So any change "leaks", and nothing ever looks consistent.

## 4. Recommended structure
1. **One token source**: `packages/brand-tokens/tokens.json` (W3C design-token format) holding IRONFORGE: bg #0a0a0a, surface/elevated steps, text, muted, line, accent #FF5400 (+ hover/pressed and an AA text-safe variant), success/danger, radius, spacing, type (Bebas Neue display, Oswald headings, Archivo body, JetBrains Mono numbers).
2. **Generated outputs** (Style Dictionary or a small script; CI fails on drift, reusing `check-token-sync`): `src/styles/tokens.css` (web), `sites/www` tokens, `MwColors.kt` + `Type.kt` (Compose), `apps/mobile/src/theme.ts` (Expo).
3. **Split surfaces by route group, not by override**: `app/(marketing)/layout.tsx` (landing, about, guide, exercises, calculators SEO) and `app/(app)/layout.tsx` (product). Root layout = fonts + tokens only; no visual rules. Delete the `.mw-house` variable overrides once both read the same tokens; each layout may add only *component* styles.
4. **Native**: pick one mobile codebase. Recommendation: Expo (`apps/mobile`) for iOS+Android first since it shares TS with the web; park `apps/android` Compose (or keep it as Wear/Android-only with a different package id). Both consume generated tokens.
5. **Guard visuals from loops**: CODEOWNERS on `packages/brand-tokens/**`, `src/styles/**`, `house.css`, `app/**/layout.tsx`, `apps/*/**/theme*`, `MwColors.kt`; a CI ratchet that fails if a PR touches those paths without a `visual-approved` label; loop prompts/AGENTS.md: "never edit visual files"; Playwright screenshot diffs on key screens so any visual change is visible in the PR.

## 5. Step-by-step IRONFORGE rollout (gate stays on; screenshots to Snowden before each merge)
1. Land PR #1065 (landing) behind the gate as-is.
2. PR A — add `packages/brand-tokens` + generator + drift check; no visual change (outputs not yet wired). Freeze loop edits to visual paths (CODEOWNERS + label ratchet).
3. PR B — create `app/(marketing)` group; move public pages; root layout stripped to fonts/tokens. Screenshot diffs: should be identical.
4. PR C — web marketing on IRONFORGE (swap `src/index.css` values for generated tokens, load Bebas Neue/Oswald/JetBrains Mono via next/font). Screenshots → approval.
5. PR D — app shell: replace `.mw-house` palette with tokens (amber → #FF5400, #0a0c0f → #0a0a0a), screens /log, /active, /coach, /history, /programs, /account; check AA contrast of orange text on black. Screenshots → approval.
6. PR E — Expo `apps/mobile` theme.ts from tokens + fonts; splash/icon bg #0a0a0a. Simulator screenshots → approval.
7. PR F — Android Compose `MwColors.kt`/`Theme.kt` from tokens (or park the module); resolve package-id clash.
8. PR G — regenerate `sites/www` tokens (or retire Astro if Next marketing replaces it), OG images, PWA `themeColor`/manifest colours.
9. Only after all approved: Snowden decides on turning the gate off.
