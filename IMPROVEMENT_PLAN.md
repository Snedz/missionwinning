# Mission Winning — Project Improvement Plan

**Date:** 2026-07-02 (rev 3) · **Reviewed against:** integration branch `cursor/integration-master-699d` ([PR #69](https://github.com/Snedz/missionwinning/pull/69)).

Engineering health review — CI, tests, security, branch hygiene, docs. Product scope: [vision.md](vision.md) · [VISION_STATUS.md](VISION_STATUS.md).

---

## Executive summary

**All agent-executable plan items are complete.** [PR #69](https://github.com/Snedz/missionwinning/pull/69) is a single merge-ready integration that supersedes #62, #63, and #65–#68. CI is green on GitHub (lint, typecheck, 282 tests, locale export, build).

What remains is **user-side launch work** (beta gates, Vercel env, Supabase migrations, `PRIVATE_MODE=false`) — not code the agent can unblock alone.

---

## Progress tracker

| Priority | Item | Status |
|----------|------|--------|
| P0 | CI lint + typecheck gates | ✅ PR #65 → #69 |
| P0 | Merge #43→#48 chain | ✅ Already in `master` history |
| P0 | Merge #62 + #63 | ✅ Conflicts resolved in PR #69 |
| P1 | Fix ESLint + tsc errors | ✅ 0 errors |
| P1 | npm audit quick wins + Next 16.2.10 | ✅ 9 → 3 moderate (nested postcss only) |
| P1 | Hook deps hardening | ✅ Rule promoted to error |
| P2 | API route tests (Stripe, PayPal, premium) | ✅ 21 tests |
| P2 | Youth consent API route tests | ✅ +10 tests (31 API total) |
| P2 | Component tests (UnlockButton, YouthParentGate) | ✅ 14 tests |
| P3 | next-pwa → @serwist/next | ✅ Clears 5 high audit advisories |
| P3 | Consolidate deploy docs → `DEPLOY.md` | ✅ |
| P4 | Major dep upgrades, Lighthouse | ⬜ Post-launch |

**Test count:** 119 (session start) → **282** (237 lib + 31 api + 14 components).

---

## Merge instructions (P0 — user action)

1. **Merge [PR #69](https://github.com/Snedz/missionwinning/pull/69)** into `master` (CI already green on GitHub).
2. **Close superseded PRs:** #62, #63, #65, #66, #67, #68, and stale planning #9.
3. **Optional:** merge docs-only #61, #64 after #69 lands.

---

## Post-merge launch checklist (user-side)

From [DEPLOY.md](DEPLOY.md) and [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md):

- [ ] Beta gates: ≥10 users; I-Day ≥80%; Basic Training ≥60%
- [ ] `DEMO_PREMIUM=false` on Vercel Production
- [ ] Supabase migrations applied in production
- [ ] GitHub Secrets → Sync Vercel env workflow
- [ ] Stripe/PayPal live credentials when LLC ready
- [ ] `RESEND_API_KEY` for youth consent emails in prod
- [ ] `npm run gate-smoke -- https://www.missionwinning.com`
- [ ] Set `PRIVATE_MODE=false` → redeploy → verify PWA install + offline

Run locally anytime: `npm run phase-h-readiness` (11 automated checks).

---

## Deferred (P4 — post-launch)

- Tailwind 4, TypeScript 6, Recharts 3, Lucide 1.x, ESLint 10
- Lighthouse audit on marketing landing + Today hub (after PWA enabled)
- Rate-limit review on `/api/leads`, `/api/fuel/*` (needs production traffic data)

---

## House rules (going forward)

1. **Same-commit build bump** — `buildInfo.ts` + `LOG.md` header in the same commit as feature code.
2. **CI must stay green** — lint + typecheck + test before merge.
3. **High-stakes routes get tests first** — payments, premium gates, youth consent, school class auth.
