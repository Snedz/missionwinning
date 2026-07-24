# Open source — Mission Winning

**License:** [AGPL-3.0](../LICENSE) (`AGPL-3.0-only` in `package.json`)  
**Source:** [github.com/Snedz/missionwinning](https://github.com/Snedz/missionwinning)  
**Conduct:** [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) · **Contribute:** [CONTRIBUTING.md](../CONTRIBUTING.md) · **Security:** [SECURITY.md](../SECURITY.md)

Mission Winning is open source so anyone can inspect the free core, improve the harness, and verify privacy claims. Hosted product secrets stay with operators.

---

## What is open

| Area | Notes |
|------|--------|
| Web PWA (Next.js) | App routes, UI, coach/fuel logic under AGPL-3.0 |
| Shared core | [`packages/mw-core`](../packages/mw-core) — pure TS used by web + Android |
| Android Compose | [`apps/android`](../apps/android) — same license |
| Docs | Product, architecture, help, and most strategy docs in-repo |

AGPL §13: operators who modify and run a network service must offer corresponding source. The live app footer links to this GitHub repo (**Source**).

---

## What stays private (operator secrets)

Never commit these; they are not part of the public source offer:

- `.env.local` / Vercel Sensitive env (Supabase service role, Stripe, LLM keys, `PRIVATE_ACCESS_SECRET`, …)
- GitHub Actions secrets (`VERCEL_TOKEN`, deploy hooks, smoke secrets)
- Production databases and user data
- Aikido / third-party security dashboard credentials

See [ENV.md](ENV.md) and [PROTECTION.md](PROTECTION.md).

---

## Public GitHub flip (founder-only)

Agents never change repository visibility.

1. Confirm no secrets in git history for files about to be public (`.env*`, tokens).
2. Note that accelerator / launch docs under `docs/applications/` become world-readable with the repo.
3. GitHub → Settings → **Change repository visibility → Public**.
4. Optional: add topics (`agpl-3.0`, `pwa`, `fitness`, `nextjs`) and verify the README license badge.

`PRIVATE_MODE` (site gate) is unrelated to GitHub visibility — do not flip it as part of going open source.

---

## CI while open

- **PR gate:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — lint, typecheck, unit tests, production build.
- **Production www:** [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) on push to `master` (or a Vercel Deploy Hook — [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md)).
- **Extended / weekly:** [`.github/workflows/ci-extended.yml`](../.github/workflows/ci-extended.yml) — e2e, Android, smokes.

---

## Acceptable use

Do not use or contribute features whose primary purpose violates [legal/ACCEPTABLE_USE.md](legal/ACCEPTABLE_USE.md).
