# Mission Winning

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Source](https://img.shields.io/badge/source-GitHub-181717?logo=github)](https://github.com/Snedz/missionwinning)

**Train Anywhere. Win Daily.**

Adaptive AI coaching for train-anywhere athletes — free offline workout logging (no account required), and weekly plans that adapt from your logs alone (no wearable required).

**AI agents:** read [AGENTS.md](AGENTS.md) then [INDEX.md](INDEX.md) first.

**Mission:** Make the fundamentals of getting stronger accessible worldwide. The free logger is never gated. See [vision.md](vision.md) for the full constitution.

## Open source & privacy (trust)

Mission Winning is open source so anyone can inspect how the free core works, improve the harness, and verify our privacy claims.

| Commitment | Detail |
|------------|--------|
| **License** | [AGPL-3.0](LICENSE) — network use requires sharing corresponding source |
| **Source** | [github.com/Snedz/missionwinning](https://github.com/Snedz/missionwinning) — see [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md) |
| **Conduct** | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| **Acceptable use** | [docs/legal/ACCEPTABLE_USE.md](docs/legal/ACCEPTABLE_USE.md) |
| **Security / secrets** | [SECURITY.md](SECURITY.md) · [docs/SECRETS.md](docs/SECRETS.md) — keys stay with operators, never in git |
| **Local-first** | Workouts, nutrition, and journey progress stay on-device until you sign in to sync |
| **Product analytics** | **Off by default** until you allow them. No session recording, no autocapture. Do Not Track is respected |
| **Optional AI coach** | Rules by default (no API key). Operators may enable LLM voice with Zero Data Retention — see [docs/ENV.md](docs/ENV.md) |
| **Free core** | Tracking and foundational tools stay free forever — never paywalled |

Hosted secrets and production keys stay with operators — they are never committed. Run `npm run secrets:scan` before contributing env-related changes.

## Documentation

**[docs/README.md](docs/README.md)** — hub for all audiences:

- **Athletes & teachers** — [docs/help/](docs/help/INDEX.md)
- **Developers** — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), [CONTRIBUTING.md](CONTRIBUTING.md)
- **AI agents** — [AGENTS.md](AGENTS.md) + [INDEX.md](INDEX.md)
- **Ops** — [docs/ENV.md](docs/ENV.md), [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md), [LOG.md](LOG.md)

## What you get

- **Train** — Offline-first workout logger (sets, RPE, rest timer), library, history, victory loop
- **Mission Coach** — Weekly plans that adapt when life happens, from workout history alone
- **Today** — Daily dashboard tying the habit loop together
- **Fuel / Move / Mind / Track / Learn** — Supporting pillars around the Train + Coach wedge
- **PWA** — Installable, works offline; no app-store tax for the web product
- **Android** — Native Compose app under [`apps/android`](apps/android)

Built with Next.js, TypeScript, Tailwind, Zustand, Supabase.

## Getting started

```bash
git clone https://github.com/Snedz/missionwinning.git
cd missionwinning
cp .env.example .env.local   # see docs/ENV.md
npm install
npm run dev
```

Open http://localhost:3000. Unlock `/private` if `PRIVATE_MODE=true`.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run secrets:scan` | Gitleaks scan (working tree) |
| `npm run gate` | Local CI gate while Actions may be blocked |

## Data storage

Workout data starts on-device for instant offline use and syncs to Supabase when signed in. Core tracking stays free. See [vision.md](vision.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Do not commit secrets — [docs/SECRETS.md](docs/SECRETS.md).

## License

[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`).
