# Frozen plan — Dependabot quality batch (`.928`)

**Rebased 2026-08-24 onto master `.930`.** Founder landed `#770` (`.928` Public Alpha snapshot), `#771` (`.929`), `#773` (`.930`). This branch no longer mints a spine label. Keep master's `APP_BUILD_LABEL` `2026.07-unified.930`. Next ONE to prod is `.697` — not this PR. Diff is the four taken bumps only. Recharts stays 2.x. Tailwind stays 3.x. Do not merge. `[skip vercel]`.

**Status: FROZEN then rebased.** Do not merge the listed Dependabot PRs (that burns GitHub Actions minutes and Vercel Hobby). This branch supersedes them.

**Label:** none — keep master's `2026.07-unified.930`  
**Branch:** `cursor/dependabot-batch-1a20` rebased onto `origin/master` (`907c1648` · `.930`)  
**Excellence-Override:** dependabot quality batch (non-major)  
**Hard rules:** do not flip `PRIVATE_MODE`; no secrets; no EIN; no traction numbers; `[skip vercel]` on every commit; local `npm test` + lint + typecheck only (no GitHub Actions). Actions red is OK. Do not write `.928` over `.930`.

Does **not** replace [PLAN.md](PLAN.md) (build phases A–I).

---

## Goal / one concern

Five Dependabot PRs opened 2026-08-24 (`#764`–`#768`). Apply the **safe non-major** bumps on one new branch from current `master`, verify locally, open one squash-ready batch PR, then close the individual Dependabot PRs unmerged with a one-line comment each. Skip majors. No product merge train.

---

## Take (apply on this branch)

| PR | Bump | Why |
|----|------|-----|
| #764 | `tsx` 4.22.4 → 4.23.12 | Minor in v4. Test runner. Revert if suite breaks. |
| #765 | `resend` 6.12.4 → 6.21.0 | Minor in v6. Mail client. Revert if suite breaks. |
| #766 | `typescript-eslint` 8.65.0 → 8.67.0 | Minor in v8. Lint. Revert if lint/typecheck breaks. |
| #767 | `@radix-ui/react-tooltip` 1.2.13 → 1.2.16 | Patch line. Revert if suite breaks. |

If a taken bump breaks `npm test`, lint, or typecheck: revert **that** bump only, keep the others, document the skip.

Search again before close. Any other open Dependabot PR that arrives this run: take if non-major; skip if major. Do not smash product code to land a major.

---

## Skip

| PR | Bump | Why |
|----|------|-----|
| #768 | `recharts` 2.15.4 → 3.10.1 | **Major.** Will not take Recharts 3 in 0.1 (same posture as Tailwind 4). Close unmerged. |
| (none open) | Tailwind 4 | Permanent skip if one appears. Same comment style. |

---

## Files

- `package.json` + `package-lock.json` — the four taken pins only
- this file (rebase note: no spine label)
- Do **not** edit `src/lib/buildInfo.ts`, `LOG.md`, or `CONTEXT.md` `## Now`. Master's `.930` stays.

---

## Refuse

- Do not merge `#764`–`#768` themselves.
- Do not flip `PRIVATE_MODE`.
- Do not invent traction. No EIN.
- Do not force-push `master` / `main`.
- Do not burn Vercel Hobby (`[skip vercel]` on every commit; zero Preview).
- Do not touch counsel-hold product PRs (`#505` field test, `#519` PT, `#536` pregnancy) or founder Preview-gated `#522`.
- Do not start a product merge train. This is one Dependabot batch only.
- Do not take Recharts 3 or Tailwind 4. Do not rewrite charts or CSS to land a major.

---

## Ship protocol (same commit as the bumps)

1. `APP_BUILD_LABEL` → `2026.07-unified.928` in `src/lib/buildInfo.ts`
2. `LOG.md` — new `.928` heading; rotate `.913`
3. `CONTEXT.md` `## Now` — add `.928`, drop `.914`
4. Commit trailer: `Excellence-Override: dependabot quality batch (non-major)`
5. Commit trailer: `[skip vercel]`
6. Open one batch PR on `master` (do not merge). Body lists taken vs skipped, local suite result, and that Dependabot PRs stay unmerged.
7. Close `#764` `#765` `#766` `#767` unmerged with one line pointing at the batch.
8. Close `#768` unmerged: will not take Recharts 3 in 0.1 (same posture as Tailwind 4).

---

## Verify (Cursor VM, not Actions)

```
npm test
npm run lint
npm run typecheck
```

No `npm run gate`, no e2e, no Vercel, no merge. Report results in the batch PR body.

---

## Done when

- One open batch PR on `master` with the taken bumps. Tailwind 4 / Recharts 3 absent.
- `#764` `#765` `#766` `#767` closed unmerged with comments pointing at the batch.
- `#768` closed unmerged as skipped major.
- Local suite result reported in the batch PR body.
- Report: taken list, skipped list, batch PR URL.
