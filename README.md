# Mission Winning

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Source](https://img.shields.io/badge/source-GitHub-181717?logo=github)](https://github.com/Snedz/missionwinning)

**The mission is advancement of civilization and propagation of consciousness to the stars.**

**Alpha 0.1.0** · Mission Winning Alpha 0.1.0

**Log a set. Offline.** No account. No wearable.

Adaptive AI coaching for train-anywhere athletes — free offline workout logging (no account required), and weekly plans that adapt from your logs alone (no wearable required). The free logger is never gated.

---

## Latest

**Mission Winning Alpha 0.1.0** — inspectable free core. Site gate (`PRIVATE_MODE`) is separate from GitHub visibility and is founder-owned.

Constitution: [vision.md](vision.md) · One-page product truth: [docs/THESIS.md](docs/THESIS.md) · What shipped: [CHANGELOG.md](CHANGELOG.md) · [/changelog](/changelog)

---

## What's in this repo

The product: Next.js 16 PWA, Mission Coach engine, Android Compose under `apps/android`, shared `packages/mw-core`, tests, and product docs. AGPL-3.0. Fork it, read the coach, run it locally, tell us where it is wrong.

| Surface | What it does |
|---------|----------------|
| **Train** | Offline-first set logger (RPE, rest timer, victory) |
| **Mission Coach** | Weekly plans from logs alone — fatigue-aware, no wearable required |
| **Today** | One clear next action (route `/log`) |
| **Fuel · Move · Mind · Track · Learn** | Supporting pillars (free basics; depth grows with retention) |
| **You** | Athlete identity & earned record (`/profile`) — settings on `/account` |
| **PWA + Android** | Web installable worldwide; native Compose under `apps/android` |

## What's not in this repo

We ship the inspectable product. We do not ship operator secrets or the war room.

| Kept private | Where |
|--------------|--------|
| Founder war room (strategy, red-team full text, YC/capital/outreach) | Private [`mission-ops`](https://github.com/Snedz/mission-ops) — this tree keeps **stubs** only |
| Vercel / GitHub secrets, Stripe keys, production DB | Operator vaults — [docs/SECRETS.md](docs/SECRETS.md) |
| EIN, personal email, postal, phone | Never in git |

Invite inspection and criticism of the **free core**. Dual-repo: [docs/DUAL_REPO.md](docs/DUAL_REPO.md) · [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md).

---

## Quick start

**Node.js 22** (CI). npm.

```bash
git clone https://github.com/Snedz/missionwinning.git
cd missionwinning
cp .env.example .env.local   # see docs/ENV.md
npm install
npm run dev
```

Open http://localhost:3000. No env vars are required for local demo: the private gate is off in development, premium depth is unlocked, and cloud services degrade to on-device storage. Unlock `/private` only if you set `PRIVATE_MODE` on.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (`src/**` + `packages/mw-core`) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run secrets:scan` | Gitleaks (working tree) |
| `npm run gate` | Full local CI gate |

---

## Architecture

Short map: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

`app/` is thin Next.js route shells. UI lives in `src/page-components/` and `src/components/`. Domain logic is `src/lib/` (Mission Coach: `src/lib/coach/`). Shared pure TS: `packages/mw-core`.

**[docs/README.md](docs/README.md)** — hub for all audiences (athletes, developers, agents).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Security reports: [SECURITY.md](SECURITY.md).

## License

[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`).
