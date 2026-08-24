# Mission Winning

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

**The mission is advancement of civilization and propagation of consciousness to the stars.**

**Alpha 0.1.0** · **Train Anywhere. Win Daily.**

This repository is a **public progress snapshot** of Mission Winning — a working partial product (the Train + Mission Coach wedge), not a live mirror of every internal commit. Development continues on the working tree. Refreshing this snapshot is manual.

Adaptive AI coaching for train-anywhere athletes — free offline workout logging (no account required), and weekly plans that adapt from your logs alone (no wearable required). The free logger is never gated.

---

## What's here

The inspectable Alpha: Next.js 16 PWA, Mission Coach engine, Android Compose under `apps/android`, shared `packages/mw-core`, tests, and product docs. AGPL-3.0.

| Surface | What it does |
|---------|----------------|
| **Train** | Offline-first set logger (RPE, rest timer, victory) |
| **Mission Coach** | Weekly plans from logs alone — fatigue-aware, no wearable required |
| **Today** | One clear next action (route `/log`) |
| **Fuel · Move · Mind · Track · Learn** | Supporting pillars (free basics) |
| **PWA + Android** | Web installable; native Compose under `apps/android` |

## What's not here

Operator secrets and the founder war room are not in this snapshot.

| Kept private | Where |
|--------------|--------|
| Strategy, red-team full text, capital, outreach | Private mission-ops (this tree keeps **stubs** only) |
| Vercel / GitHub secrets, Stripe keys, production DB | Operator vaults — [docs/SECRETS.md](docs/SECRETS.md) |
| EIN, personal email, postal, phone | Never in git |

Site gate (`PRIVATE_MODE`) is separate from GitHub visibility and is founder-owned.

---

## Quick start

**Node.js 22.** npm.

```bash
git clone https://github.com/Mission-Winning/missionwinning.git
cd missionwinning
cp .env.example .env.local   # see docs/ENV.md
npm install
npm run dev
```

Open http://localhost:3000. No env vars are required for local demo: the private gate is off in development, premium depth is unlocked, and cloud services degrade to on-device storage.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

---

## License

[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`).
