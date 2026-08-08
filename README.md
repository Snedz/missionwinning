# Mission Winning

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Source](https://img.shields.io/badge/source-GitHub-181717?logo=github)](https://github.com/Snedz/missionwinning)

**Train Anywhere. Win Daily.**

Adaptive AI coaching for train-anywhere athletes — free offline workout logging (no account required), and weekly plans that adapt from your logs alone (no wearable required).

The free logger is never gated. Premium deepens the path; it does not close the door.

---

## Why this exists

The best training outcomes have always come from a coach who knows you. That privilege should not require a gym membership, a wearable, or another stacked subscription. Mission Winning is the free core of that coach — on any phone, offline first, bodyweight-friendly.

**Constitution:** [vision.md](vision.md) · **One-page product truth:** [docs/THESIS.md](docs/THESIS.md)

---

## What you get

| Surface | What it does |
|---------|----------------|
| **Train** | Offline-first set logger (RPE, rest timer, victory) |
| **Mission Coach** | Weekly plans from logs alone — fatigue-aware, no wearable required |
| **Today** | One clear next action (route `/log`) |
| **Fuel · Move · Mind · Track · Learn** | Supporting pillars (free basics; depth grows with retention) |
| **You** | Athlete identity & earned record (`/profile`) — settings on `/account` |
| **PWA + Android** | Web installable worldwide; native Compose under `apps/android` |

Built with Next.js, TypeScript, Tailwind, Zustand, Supabase.

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

Open http://localhost:3000. Unlock `/private` if `PRIVATE_MODE` is on.

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

## Documentation

**[docs/README.md](docs/README.md)** — hub for all audiences.

| Audience | Start |
|----------|--------|
| Athletes | [docs/help/](docs/help/INDEX.md) |
| Developers | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/API.md](docs/API.md) · [CONTRIBUTING.md](CONTRIBUTING.md) |
| **AI agents** | **[CONTEXT.md](CONTEXT.md)** first → [AGENTS.md](AGENTS.md) → [INDEX.md](INDEX.md) → [ORCHESTRATION.md](ORCHESTRATION.md) |
| Platform contracts | [docs/contracts/](docs/contracts/INDEX.md) |
| Security / OSS | [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md) · [docs/SECRETS.md](docs/SECRETS.md) · [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md) |

Ship history: [LOG.md](LOG.md). Status lives only in `CONTEXT.md` `## Now`.

---

## For AI agents

1. Read **CONTEXT.md** (status + hard rules).  
2. **AGENTS.md** (conventions) then **INDEX.md** (routing).  
3. **ORCHESTRATION.md** (what is allowed *now*).  
4. Folder `INDEX.md` for the area you edit.  
5. Prefer [docs/contracts/](docs/contracts/INDEX.md) for identity / economy / modules.  

Do not use chat session plans as product truth. Do not invent traction. Do not flip `PRIVATE_MODE`. War-room strategy full text is **not** in this tree (stubs only) — private ops when mounted.

---

## Open source & privacy

| Commitment | Detail |
|------------|--------|
| **License** | [AGPL-3.0](LICENSE) |
| **Secrets** | Never in git — [docs/SECRETS.md](docs/SECRETS.md) · `npm run secrets:scan` |
| **Local-first** | Workouts stay on-device until sign-in sync |
| **Analytics** | Off until the user allows; no session replay; DNT respected |
| **AI coach** | Rules by default; optional LLM with Zero Data Retention when configured |
| **Classification** | [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md) — public product vs private ops |

Private founder continuity (diary, strategy memos, local Mission Control dashboard) lives outside this public tree — see [docs/DUAL_REPO.md](docs/DUAL_REPO.md) and [docs/OPS_LOCAL.md](docs/OPS_LOCAL.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`).
