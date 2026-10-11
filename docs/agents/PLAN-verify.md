# PLAN-verify — Verify Gate kit

Decision record for `npm run verify`. The default branch is `master`. There is no `origin/main`.

## What ships

One command, `npm run verify` (`node scripts/verify.mjs`), that a builder and the merge bot run before a PR can merge. Node standard library only. No new test framework.

Fail-fast chain, in order:

1. `npm run check-build-label`
2. `npm run check-excellence-gate`
3. `npm run lint`
4. `npm run typecheck`
5. `npm test`
6. Start `next dev` on `VERIFY_PORT` (default **3099**, hostname `127.0.0.1`). Shallow `GET /api/health` must return HTTP 200, JSON `ok === true`, and a non-empty `build` string. Then kill that server.

Each step prints PASS or FAIL with its seconds. Steps after the first failure are SKIP. The last lines are `VERIFY PASS` or `VERIFY FAIL` and the total wall time. Exit 0 only when every step passed.

## What it does not do

- It does not nest `npm run gate`. Gate already re-runs lint, typecheck, and unit tests, then coverage, i18n, security, design, a production webpack build, the bundle budget, and Playwright `@gate` and `@a11y`. Chromium is not part of this kit. [docs/CI_LOCAL.md](../CI_LOCAL.md) keeps hero e2e off the merge bar while Actions minutes are red. `npm run gate` stays the full local gate.
- It does not call `/api/health?deep=1` (that needs `CRON_SECRET`).
- It does not copy `.env.local`, talk to production, or set `PRIVATE_MODE`.
- It does not lower a coverage floor, bundle budget, or test threshold.

## Docs

- [TEST_AUDIT.md](TEST_AUDIT.md) — four questions for every new test, adapted from OpenClaw's test-audit skill (MIT). A bug-fix test must fail on the old code before the fix.
- [DONE_CONTRACT.md](DONE_CONTRACT.md) — done means the file exists, `npm run verify` passes, and that output is pasted. Three failures, then stop and name the blocker.

`AGENTS.md` tells agents to run `npm run verify` before opening or merging any PR and to follow those two docs.

## Label

This kit adds `scripts/verify.mjs`, so `APP_BUILD_LABEL` is `2026.07-unified.1124`, strictly above `origin/master` (`2026.07-unified.1123`). `LOG.md` and `CONTEXT.md` `## Now` cite it in the same commit. Budgets stay: 15 LOG entries, 25 Now bullets, the LOG byte ratchet. Oldest LOG section `.1105` and oldest shipped Now bullet `.1102` rotate into `docs/archive/`. Standing status lines stay.
