# Cursor-local CI (while Actions minutes are red)

**Frozen plan (.743).** Implement exactly this; do not grow scope.

1. Reproduce `build-and-test` locally on current `master` (the job in `.github/workflows/ci.yml`).
2. Fix shared master breakage that makes every PR fail. Do not delete tests or weaken the gate.
3. Standing rule: while GitHub Actions minutes are exhausted / limited, the **merge bar is Cursor-local green** (`npm test`, lint, typecheck, excellence) + craft LGTM. Actions red is not a product fail.
4. `[skip vercel]` on every commit unless the founder asked for a Preview (Hobby is capped).
5. Tighten spend only: concurrency cancel-in-progress, skip docs-only on the expensive job, honor `[skip ci]`. Do **not** disable gitleaks / CodeQL / aikido. Do **not** add new paid jobs.

---

## Merge bar (now)

While Actions minutes are red, a PR may merge when **all** of these are true:

1. **Cursor-local green** on the cheap half of `build-and-test`:
   - `npm run check-build-label`
   - `npm run check-excellence-gate` (or `Excellence-Override:` in the commit / PR body)
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
2. **Craft LGTM** from the founder (phone / review). Horizon W RESULT stays unscored until that sign-off.
3. **No secrets, no `PRIVATE_MODE` flip, no invented traction.**

`build-and-test` red on GitHub is **not** a product fail. It is usually quota, a queue, or a shared lint on `master` — not a veto.

Security jobs stay on: **gitleaks**, **CodeQL** (manual while private), **aikido**. Those are not the merge bar; do not turn them off to save minutes.

## Commands (same order as `ci.yml`, minus Playwright)

```bash
npm run check-build-label
npm run check-excellence-gate
npm run check-display-type
npm run check-token-sync
npm run check-design-system
npm run check-locale-split
npm run lint
npm run typecheck
npm test
npm run test:routes
# optional: npm run coverage · i18n:parity · i18n:coverage · npm run build
```

Hero e2e (`npm run e2e:gate`) needs Chromium (`npx playwright install chromium`) and a production server. Skip it on a Cloud agent unless you already installed browsers. The local merge bar above does **not** require e2e while minutes are red.

Full local gate (when you have browsers): `npm run gate`.

## Skip tokens

| Token | Where | Effect |
|-------|--------|--------|
| `[skip vercel]` | every commit message | No Hobby Preview. Use unless the founder asked for a Preview. |
| `[skip ci]` | follow-up nits | GitHub skips **all** Actions workflows for that push, including security. Prefer this on nits so we do not spend minutes proving a typo fix. |
| docs-only paths | automatic | `ci.yml` / `ratchets.yml` `paths-ignore` — markdown, `docs/`, `seo/`, `media/`. Security workflows still run. |

Do not put `[skip ci]` on a first push that needs gitleaks. Do put `[skip vercel]` on every commit.

## What `.743` changed

- Shared `master` lint: `src/lib/readinessDisplay.test.ts` used `require()`, which `@typescript-eslint/no-require-imports` fails. Every PR died at Lint before typecheck/tests. Replaced with ESM imports. Test kept.
- `ci.yml` + `ratchets.yml`: `paths-ignore` for docs-only (they already had concurrency).
- `aikido.yml`: concurrency `cancel-in-progress` (was missing). gitleaks / CodeQL / aikido still enabled.

When minutes refill, PR CI is the merge bar again. This file stays as the fallback.

Excellence-Override: local CI unblock
