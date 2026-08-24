# Open source — Mission Winning

**License:** [AGPL-3.0](../LICENSE) (`AGPL-3.0-only` in `package.json`)  
**Working origin:** [github.com/Snedz/missionwinning](https://github.com/Snedz/missionwinning)  
**Alpha snapshot (progress report):** [github.com/Mission-Winning/missionwinning](https://github.com/Mission-Winning/missionwinning)  
**Conduct:** [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) · **Contribute:** [CONTRIBUTING.md](../CONTRIBUTING.md) · **Security:** [SECURITY.md](../SECURITY.md)

Mission Winning is open source so anyone can inspect the free core, improve the harness, and verify privacy claims. Hosted product secrets stay with operators.

---

## What is open

| Area | Notes |
|------|--------|
| Web PWA (Next.js) | App routes, UI, coach/fuel logic under AGPL-3.0 |
| Shared core | [`packages/mw-core`](../packages/mw-core) — pure TS used by web + Android |
| Android Compose | [`apps/android`](../apps/android) — same license |
| Docs | Product, architecture, help, contracts, design — **not** war-room strategy (stubs only; full text in private mission-ops) |

AGPL §13: operators who modify and run a network service must offer corresponding source. The live app footer **Source** still points at `Snedz/missionwinning` until a later cutover. The inspectable Alpha photo is the org snapshot.

---

## What stays private (operator secrets)

Never commit these; they are not part of the public source offer:

- `.env.local` / Vercel Sensitive env (Supabase service role, Stripe, LLM keys, `PRIVATE_ACCESS_SECRET`, …)
- GitHub Actions secrets (`VERCEL_TOKEN`, deploy hooks, smoke secrets)
- Production databases and user data
- Aikido / third-party security dashboard credentials
- Personal emails, real infra IDs, treasury private keys (see scrub rules)

**Program:** [SECRETS.md](SECRETS.md) — vaults, `npm run secrets:scan`, rotate-on-leak, pre-public checklist.  
Also: [ENV.md](ENV.md), [PROTECTION.md](PROTECTION.md).

---

## Public GitHub flip (founder-only)

Agents never change repository visibility. Full checklist: [SECRETS.md § Pre-public flip](SECRETS.md) · [DUAL_REPO.md](DUAL_REPO.md) · [CLASSIFICATION.md](CLASSIFICATION.md).

1. Confirm private **mission-ops** is current (`npm run ops:sync` skips stubs; push full `strategy/` from local ops).
2. War-room + GTM memos are **stubs** in product tip (`RELOCATED_TO_MISSION_OPS`) — enforced by `classificationGuard.test.ts`.
3. Confirm `.hermes/` and `ops/` are gitignored and untracked.
4. `npm run secrets:scan` clean (**0** findings); optional history `gitleaks detect --source . -v`.
5. Read history residual in [SECRETS.md](SECRETS.md) § History residual (treasury pubkey).
6. Accelerator **paste packs** stay local (`docs/applications/*` gitignored — see [applications/README.md](applications/README.md)).
7. Enable GitHub **Secret scanning** + **Push protection** (free once Public).
8. Prefer GitHub **Environments** with required reviewers for `deploy-production` / `sync-vercel-env` / `apply-migration` ([VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md)).
9. GitHub → Settings on **`Mission-Winning/missionwinning`** → **Change repository visibility → Public** (founder only). One-pager: [PUBLIC_GITHUB.md](PUBLIC_GITHUB.md).
10. Optional: topics (`agpl-3.0`, `pwa`, `fitness`, `nextjs`) and LICENSE badge. Disable Dependabot on the snapshot repo — it is not the working origin.

**Cleanup shipped 2026-08-08** — scrub + dual-repo structure. Snapshot exporter `.928`. **Visibility flip remains founder-owned.**

`PRIVATE_MODE` (site gate) is unrelated to GitHub visibility — do not flip it as part of going open source.

**Three trees:** working product is `Snedz/missionwinning`; the public Alpha photo is `Mission-Winning/missionwinning` (`npm run snapshot:public`); INTERNAL strategy lives in private `mission-ops` (local staging: `ops/`).

---

## Self-host / fork fail-closed (operators)

| Misconfig | Expected behavior |
|-----------|-------------------|
| No `CRON_SECRET` | Cron routes **503** (not open) |
| No `PRIVATE_ACCESS_SECRET` while PRIVATE_MODE | Gate/password unlock broken — do not open admin by default |
| `DEMO_PREMIUM=true` in production | Deploy readiness / premium refuse |
| No Supabase RLS applied | **Unsafe** — run migrations; see [SECURITY_SERVICE_ROLE_MAP.md](SECURITY_SERVICE_ROLE_MAP.md) |
| Missing webhook secrets | Stripe/PayPal webhooks **401/503** |

Security program: [SECURITY_PUBLIC_OSS_AUDIT_2026-08.md](SECURITY_PUBLIC_OSS_AUDIT_2026-08.md) · [SECURITY_REVIEW_PASS_2026-08.md](SECURITY_REVIEW_PASS_2026-08.md) · `npm run security:check` (secrets scan + npm audit high).

---

## CI while open

- **PR gate:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — lint, typecheck, unit tests, production build.
- **Production www:** [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) on push to `master` (or a Vercel Deploy Hook — [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md)).
- **Extended / weekly:** [`.github/workflows/ci-extended.yml`](../.github/workflows/ci-extended.yml) — e2e, Android, smokes.

---

## Acceptable use

Do not use or contribute features whose primary purpose violates [legal/ACCEPTABLE_USE.md](legal/ACCEPTABLE_USE.md).
