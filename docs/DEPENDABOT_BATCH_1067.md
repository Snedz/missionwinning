# Frozen plan — Dependabot leftovers batch (unstamped on `.1067`)

**Status: AMENDED after Merge Steward correction.** Filename kept. Do not stamp this chore. Paper on master is now `.1067` via CoachConcept `#932` (`58375212`). This leftover train is unstamped on top of that tip. Do not revert CoachConcept. Do not mint `.1068`.

**Branch:** `cursor/dependabot-leftovers-batch-8c8c`  
**Base:** current `origin/master` (`58375212` CoachConcept `.1067`; leftover commits originally branched at `2df9f3c0` / `#925`)  
**Excellence-Override:** dependabot leftovers batch (non-major, unstamped)  
**Hard rules:** do not flip `PRIVATE_MODE`; no secrets; no EIN; no traction numbers; `[skip vercel]` on every commit; local `npm test` + lint + typecheck only (no GitHub Actions). Actions red is OK. Do not merge. Do not promote. Live www stays `.697`. Leave the PR **draft** until Merge Steward squash.

Does **not** replace [PLAN.md](PLAN.md) (build phases A–I).

---

## Goal / one concern

Apply remaining **safe non-major** Dependabot leftovers on one Cursor chore PR so Merge Steward does not squash-merge raw Dependabot PRs (they burn Actions + Vercel Hobby). One coherent lockfile. No product features. No paper stamp bump.

Master moved while this batch was assigned. Unstamped Dependabot squashes already on master: `#919` react-i18next, `#922` next, `#924` radix-dialog, `#925` bundle-analyzer. This PR does not re-apply those.

---

## Take (apply on this branch)

| PR | Bump | State | Action |
|----|------|-------|--------|
| #923 | `@playwright/test` 1.62.1 → 1.63.0 | Closed dirty / unmerged | Apply locally. Also bump sibling `playwright` 1.62.1 → 1.63.0 so runner and browser package stay one version. Dev only. |
| #926 | `posthog-js` 1.396.5 → 1.429.5 | Closed into this train | Apply via `package.json` + one lockfile refresh. Lock may lift `web-vitals` and `@posthog/*`. No product analytics code. |
| #927 | `@supabase/ssr` 0.12.3 → 0.12.7 | Closed into this train | Apply. Lock may lift `@supabase/supabase-js` 2.110.8 → 2.116.0. Keep `package.json` `@supabase/supabase-js` at `^2.107.0` (caret covers peer `^2.114.0`). No new auth/sync product code. |
| #928 | `i18next` 26.3.1 → 26.4.2 | Closed into this train | Apply. Includes `deepExtend` GHSA-6jcc-5g8w-32mx (fixed in 26.3.4). No i18n product string work. |

If a taken bump breaks `npm test`, lint, or typecheck **newly** (not a pre-existing master fail): revert **that** bump only, keep the others, document the skip.

---

## Already on master — do not re-bump

| PR | Bump |
|----|------|
| #919 | `react-i18next` 17.0.11 → 17.0.13 |
| #922 | `next` 16.3.3 → 16.3.4 |
| #924 | `@radix-ui/react-dialog` 1.1.15 → 1.1.23 |
| #925 | `@next/bundle-analyzer` 16.2.10 → 16.3.4 |

---

## Skip / HOLD

| PR | Bump | Why |
|----|------|-----|
| #920 | `eslint` 9.39.4 → 10.10.0 | **MAJOR.** Closed skip. Do not take. |
| #921 | `stripe` 22.5.0 → 22.6.2 | **HOLD.** Closed unmerged. SDK pins API `2026-08-26.dahlia`. Keep `stripe` `^22.5.0` and `src/lib/stripeServer.ts` `apiVersion: '2026-07-29.dahlia'`. |
| (none open) | Tailwind 4 | Permanent skip. |

---

## Files

- `package.json` + `package-lock.json` — `posthog-js` ^1.429.5, `@supabase/ssr` ^0.12.7, `i18next` ^26.4.2, `@playwright/test` ^1.63.0, `playwright` ^1.63.0
- this file (amended)
- `docs/INDEX.md` — one row pointing at this file

Do **not** edit `src/lib/buildInfo.ts`, `CONTEXT.md`, or `LOG.md` for a `.1067` stamp. Do **not** edit `src/lib/stripeServer.ts`. Do **not** edit product UI, checkout, webhooks, eslint config, Tailwind, or `PRIVATE_MODE`.

---

## Refuse

- Do not merge the listed Dependabot PRs themselves.
- Do not take eslint 10, Tailwind 4, or stripe 22.6.2.
- Do not stamp this chore. Do not revert master `.1067` CoachConcept. Do not mint `.1068`.
- Do not flip `PRIVATE_MODE`.
- Do not invent traction. No EIN. No promote. Live www stays `.697`.
- Do not force-push `master` / `main`.
- Do not burn Vercel Hobby (`[skip vercel]` on every commit; zero Preview).
- Do not smash product code to land a bump.
- Do not merge this PR — Merge Steward squash when ready. Stay draft until then.

---

## Ship protocol

1. No `APP_BUILD_LABEL` bump. Paper stays `2026.07-unified.1067` (CoachConcept `#932`).
2. Commit trailer: `Excellence-Override: dependabot leftovers batch (non-major, unstamped)`
3. Commit trailer: `[skip vercel]`
4. Keep one **draft** batch PR on `master` (do not merge). Title: `chore dependabot leftovers batch (unstamped on .1067)`.
5. PR body must say: Do not merge the listed Dependabot PRs; this absorbs/supersedes #923 #926 #927 #928; skip #920 eslint major; stripe #921 HOLD; already-merged #919 #922 #924 #925 do not re-merge; no PRIVATE_MODE flip; no promote; live stays .697; paper stays .1067 CoachConcept.

---

## Verify (Cursor VM, not Actions)

```
npm test
npm run lint
npm run typecheck
```

No `npm run gate`, no e2e, no Vercel, no merge. Report results in the batch PR body. Do not wait on GitHub Actions green. Pre-existing master fails are not this batch's job.

---

## Done when

- One open **draft** batch PR on `master` that does not revert `.1067` CoachConcept, with a coherent lockfile and taken leftovers applied.
- eslint 10, Tailwind 4, and stripe 22.6.2 absent from the take list.
- Clear absorb list for Merge Steward: #923 #926 #927 #928 after squash.
- Local suite result reported in the PR body.
