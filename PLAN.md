# PLAN.md — Public GitHub pass: Beta 0.1 + mission (stars) (`.714`)

**Status:** FROZEN for this PR. Implement against this file; do not expand scope mid-flight.

This is the **PR freeze plan**, not the product roadmap ([docs/PLAN.md](docs/PLAN.md)). INDEX.md §4’s “root PLAN.md moved” refers to that old roadmap, not this file.

**Label:** `2026.07-unified.714`  
**Public name:** `0.1 (beta)` / `Mission Winning 0.1 (beta)` / `Beta 0.1`  
**Branch:** `cursor/public-github-beta-0-1-f521` → draft PR to `master`  
**Excellence-Override:** public GitHub Beta 0.1

---

## Mission (exact sentence — do not paraphrase)

> The mission is advancement of civilization and propagation of consciousness to the stars.

Nested truth (must appear together, never collapse):

1. **North star** = that sentence (stars / civilization).
2. **How we serve it today** = L1 Health: free offline logger + Mission Coach from logs (no wearable; logger free forever).
3. Do **not** pitch “everything app” / WeChat / MySpace on About or README first paint.

---

## Goal

Prepare **this** product tree (`github.com/Snedz/missionwinning`) to go public on GitHub. The founder flips visibility. Agents never change repo visibility, never flip `PRIVATE_MODE`, never unmute `FREE_BETA`, never touch mission-ops.

Honesty model (structure from xai-org/x-algorithm, not their brand): we ship the inspectable product; we do not ship operator secrets or the war room.

---

## Dual-repo (already decided — do not collapse)

| Repo | Role |
|------|------|
| `Snedz/missionwinning` | Public-ready product (this tree) |
| `Snedz/mission-ops` | Forever private war room |

War-room docs in this tree stay **stubs** with `RELOCATED_TO_MISSION_OPS` (`classificationGuard.test.ts`). Do not copy STRATEGY/REDTEAM/YC/capital/outreach/EIN/pricing experiments into this repo. Do not `gh repo create`. Do not rewrite git history.

---

## Adjacent PRs (do not fight, do not steal)

| PR | Label | Relation |
|----|-------|----------|
| #477 | `.698` | Spine order — do not take |
| #478 | `.699` | Spine order — do not take |
| #493 | `.700` | Occupied |
| #490 | `.701` | Occupied |
| #492 | `.704` | Occupied |
| #498 | `.705` | Occupied |
| #500 | `.706` | Occupied |
| #501 | `.707` | Occupied |
| #503 | `.708` | Occupied |
| #497 | `.709` | Occupied |
| #504 | `.710` | Occupied |
| #505 | `.711` | Occupied |
| **#488** | `.712` | Draft: stamps `0.1 (beta)` on gated www / About chip / status bar. **Do not retitle or push that branch.** Constants do **not** exist on master — implement independently here with `.714` and the **same public strings**. |
| #495 | `.713` | Occupied |
| **#494** | legal/About Texas | Separate draft. Add “Texas” on the business line if missing; **do not copy EIN**; do not fight their legal copy. |

Skip `.698`–`.713`. This PR is **`.714` only**.

---

## Public version vs internal label

| Surface | String |
|---------|--------|
| Athlete / GitHub first paint | `0.1 (beta)` · `Mission Winning 0.1 (beta)` · `Beta 0.1` |
| Internal ship id | `APP_BUILD_LABEL = "2026.07-unified.714"` |
| `GET /api/health` `build` | **must** be `APP_BUILD_LABEL` — never `0.1 (beta)` |

Not v1.0. Not invite-only. Not “open beta” as a **GitHub visibility** claim. Site gate `PRIVATE_MODE` stays on (founder-owned). Product framing is **free beta** / **Beta 0.1**.

Constants (same names as #488, implemented here because master lacks them):

```ts
export const APP_BUILD_LABEL = "2026.07-unified.714";
export const APP_PUBLIC_VERSION = "0.1 (beta)";
export const APP_PUBLIC_PRODUCT_VERSION = `Mission Winning ${APP_PUBLIC_VERSION}`;
export const APP_PUBLIC_STATUS_LINE_EN =
  `${APP_PUBLIC_PRODUCT_VERSION} — free beta. Offline logging plus Mission Coach from your logs.`;
```

---

## File map (implementation)

### 1. First paint — README

Rewrite [README.md](README.md) in this order (x-algorithm honesty, our product):

1. **Mission** — exact sentence, then what the product is today (Beta 0.1): Train Anywhere. Win Daily. Free logger forever, no account; Mission Coach from logs; no wearable.
2. **Latest / version line** — Beta 0.1 / Mission Winning 0.1 (beta). AGPL + Source badges stay.
3. **What’s in this repo** vs **What’s not in this repo** — private `mission-ops` war room, Vercel/GitHub secrets, production DB, Stripe keys, EIN, personal email. Invite inspection and criticism of the free core.
4. **Quick start** that actually works (Node 22, clone `https://github.com/Snedz/missionwinning.git`).
5. **Architecture** — short pointer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
6. **License** AGPL-3.0.

Keep: honest surfaces table (Train / Coach / Today / Fuel Move Mind Track Learn / You), Contributing / Security / Conduct links.

Do **not**: invent stars, traction, user counts, “#1”; mention Mercury, Stripe live keys, Hobby quota, Cursor agents, Grok Bot, or the founder’s personal accounts; pitch everything-app on first paint; let Speech own first paint; add Top 8 / social feed / DMs.

### 2. About `/about`

[src/page-components/AboutPage.tsx](src/page-components/AboutPage.tsx) section **01**:

1. Public version chip: `Mission Winning 0.1 (beta)` (`APP_PUBLIC_PRODUCT_VERSION`).
2. Exact founder sentence (new i18n key, e.g. `infoAboutMissionNorthStar`).
3. One nested line: stars/civilization is the north star; L1 Health (Train + Coach) is how we serve it today.
4. Existing product paragraph (`infoAboutMissionP1` / `P1OpenBeta` + `P2`) — free offline logger + Mission Coach from logs, no wearable, logger free forever.

Business line: **Mission Winning LLC (Texas)**. No Delaware. No EIN, personal gmail, phone, or postal. Keep educational / not-medical disclaimers.

Strings live in [src/i18n/infoLocales.ts](src/i18n/infoLocales.ts): update EN defaults; other langs may keep EN via existing `...en` until translated. Follow i18n parity.

Do not fight #494. Soften About “Open beta” business copy to Beta 0.1 / free beta (not a GitHub-visibility claim).

### 3. vision.md

North-star **row** = the exact founder sentence. Keep: body-first wedge, free-core covenant, “not medical care” boundary, Team Humanity / pillars map. Do not turn marketing into Elon/SpaceX cosplay. Do not delete the map.

### 4. Public stamp (independent of #488)

Master has no `APP_PUBLIC_*`. Implement here:

| File | Change |
|------|--------|
| `src/lib/buildInfo.ts` | `.714` + public constants |
| `src/lib/buildInfo.test.ts` | **new** — public vs health split; MUST_STAMP list |
| `src/page-components/AboutPage.tsx` | chip + mission sentence |
| `src/components/public/PublicStatusBar.tsx` | `APP_PUBLIC_STATUS_LINE_EN`; drop invite-only default |
| `src/components/marketing/MarketingNav.tsx` | interpolate `{{productVersion}}` |
| `src/i18n/firstStepsLocales.ts` | `publicStatusOpenBeta` template matching status line |
| `app/private/PrivateTeaserClient.tsx` | kicker `0.1 (beta)`; footer `Mission Winning 0.1 (beta)` |
| `src/components/layout/Sidebar.tsx` | athlete chip = public version; keep `Build {APP_BUILD_LABEL}` as diagnostic where it already is (Profile footer) |
| `src/components/layout/MoreSheet.tsx` | athlete-visible version chip = public stamp; What’s New unseen tracking **stays** `APP_BUILD_LABEL` |
| `src/components/layout/AppLegalFooter.tsx` | public stamp above internal `Build {label}` |
| `app/api/health/route.ts` | **no change** to `build: APP_BUILD_LABEL` |

Do not rewrite all 15 `gateLocales` packs unless a first-paint default still says “invite-only” on the teaser kicker we own. Prefer stamping constants in the teaser over a locale farm.

### 5. Contributor / security / founder one-pager

- [CONTRIBUTING.md](CONTRIBUTING.md): clone URL `https://github.com/Snedz/missionwinning.git` (not `<repo>`). Tone for **outside** contributors, not only internal agents. Keep AGPL + CoC.
- [SECURITY.md](SECURITY.md): keep if already public-ready (`support@missionwinning.com` + SECURITY subject). Touch only if a public reader would hit an internal-only path.
- Optional [docs/PUBLIC_GITHUB.md](docs/PUBLIC_GITHUB.md): founder-only **manual GitHub Settings clicks** (visibility, secret scanning, push protection, topics: `agpl-3.0`, `pwa`, `fitness`, `nextjs`, `offline-first`). Agents do **not** flip those. Point at existing [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md) / [docs/SECRETS.md](docs/SECRETS.md) rather than duplicating war-room.
- [docs/INDEX.md](docs/INDEX.md): one row for `PUBLIC_GITHUB.md` if added.

### 6. Spine for `.714`

- [src/lib/buildInfo.ts](src/lib/buildInfo.ts) → `2026.07-unified.714`
- [LOG.md](LOG.md) heading `## YYYY-MM-DD — … (\`.714\`)` — rotate oldest live entry to `docs/archive/log/` + [docs/archive/INDEX.md](docs/archive/INDEX.md)
- [CONTEXT.md](CONTEXT.md) `## Now`: date + web label `.714`; **one** bullet that this PR is the public-GitHub / Beta 0.1 pass; do **not** dump war-room. Rotate oldest *shipped* bullet if over 25. Standing Status table unchanged (`PRIVATE_MODE` **on**; repo visibility still founder-owned).

### 7. Scrub (this PR)

1. `npm run secrets:scan` if gitleaks is available; else document why + grep.
2. Grep working tree (not history rewrite) for: `sk_live`, `service_role` real values, `PRIVATE_ACCESS_SECRET` real values, real `VERCEL_ORG_ID`, supabase project refs, EIN digits, personal gmail. **Scrub hits. Never commit the EIN — if found, delete, do not echo.**
3. Confirm `.hermes/` and `ops/` gitignored and untracked.
4. Confirm `docs/applications/*` still gitignored except README.
5. Stubs still stubs. Do not restore full STRATEGY/REDTEAM.

---

## Tests

| Check | Why |
|-------|-----|
| `classificationGuard.test.ts` | stubs / hermes / ops |
| `src/lib/buildInfo.test.ts` (new) | public stamp vs health `APP_BUILD_LABEL`; MUST_STAMP surfaces |
| About / locale assertion | exact founder sentence present in EN `infoLocales` + AboutPage renders that key first in section 01 |
| `aboutFreeBetaMute.test.ts` | still no Super Bundle on free-beta About mission/business |
| i18n parity if locales touched | packs vs packs; EN fallback OK for other langs |
| `contextBudget.test.ts` / `logBudget.test.ts` | Now ≤25; LOG ≤15 after rotate |
| `npx tsx --test` on touched tests | repo style |
| `check-build-label` | `.714` > master `.697`; LOG + CONTEXT mention it |

Do not run full `npm run gate` unless time allows. Prefer targeted tests. At most **one** Vercel Preview after implementation (founder allowed Preview 2026-08-13). Plan-only commit: `[skip vercel]`.

---

## Hard bans (this PR)

- Do not flip `PRIVATE_MODE` or `FREE_BETA`
- Do not change GitHub visibility
- Do not merge to master
- Do not steal spine order (`.698` #477, `.699` #478). Stay on `.714` and **draft**
- Do not Preview-spam
- Do not commit EIN, Stripe live keys, deploy hook URLs, personal email
- Do not copy mission-ops into this tree
- No AI slop, no “Team Humanity™” merch, no invite-only language on first paint
- No Top 8 / social feed / DMs
- Speech never owns first paint

---

## PR

- Title: `Public GitHub pass: Beta 0.1 + mission (stars) (.714)`
- Draft to `master`
- Body: summary, what’s not in this repo, founder still owns visibility flip, `PRIVATE_MODE` unchanged, test plan, `Excellence-Override: public GitHub Beta 0.1`

---

## Done when

- [ ] `PLAN.md` on the branch (this file — frozen before product code)
- [ ] README leads with the exact mission sentence + Beta 0.1
- [ ] About section 01 leads with that sentence
- [ ] vision.md north-star row updated
- [ ] `APP_BUILD_LABEL` is `.714`
- [ ] Public version string is `0.1 (beta)`
- [ ] secrets:scan clean **or** documented why the tool wasn’t available + grep clean
- [ ] Draft PR URL in the final report
- [ ] Did not flip visibility or `PRIVATE_MODE`
