# Mission Winning

**AI agents:** read [AGENTS.md](AGENTS.md) then [INDEX.md](INDEX.md) first.

**The Free Global "Everything App" for Health — The Path to a Healthier World for All**

**Mission**: Become the #1 health super app — the entrance to the *right path* (evidence-based, holistic, consistent habits for strength, health, and resilience) vs. the path of average, excuses, and destruction. Core mission (workout tracking and foundational tools) is **100% free and accessible to everyone worldwide**, with no money barrier. Premium depth and the "Super Bundle" (synergistic pillars for training, nutrition, mobility, mind, tracking, and learning) sustain the mission while delivering transformative value.

Inspired by successful freemium + bundle models like Freeletics (free core hook + paid Coach + discounted "Super Bundle" of 7 holistic apps: training + nutrition + Calm + Pliability + Waking Up + Skill Yoga + MapMyFitness at 50% off promos for synergy and retention). Our version: free core tracker/library/nutrition basics for global impact (PWA, bodyweight focus, multi-lang) + premium modules + flagship Super Bundle.

This is *mainly a free app* serving the vision of making the world better and healthier for **all**. Revenue from optional premium layers and bundles — never at the expense of the core mission.

See [vision.md](vision.md) for the full guiding document (the "constitution" for every decision).

## Open source & privacy (trust)

Mission Winning is open source so anyone can inspect how the free core works, improve the harness, and verify our privacy claims.

| Commitment | Detail |
|------------|--------|
| **License** | [AGPL-3.0](LICENSE) — network use requires sharing corresponding source |
| **Acceptable use** | [ACCEPTABLE_USE.md](ACCEPTABLE_USE.md) — illegal deepfakes, CSAM, fraud, and similar abuse are banned |
| **Security** | [SECURITY.md](SECURITY.md) — private vulnerability reports |
| **Local-first** | Workouts, nutrition, and journey progress stay on-device until you sign in to sync |
| **Product analytics** | **Off by default** until you allow them (banner + Profile). No session recording, no autocapture. Do Not Track is respected |
| **Optional AI coach** | Rules by default (no API key). When operators enable LLM voice/insight, prefer SpaceXAI/xAI with **team Zero Data Retention (ZDR)**; see [ENV.md](ENV.md) and [xAI ZDR FAQ](https://docs.x.ai/developers/faq/security#what-is-zero-data-retention-zdr) |
| **Free core** | Tracking and foundational tools stay free forever — never paywalled |

We are not a clone of any coding-tool vendor; the parallel is **transparent software + user control over data**. Hosted secrets, Stripe, and production keys stay with operators — they are never committed.

**Start here (2026-07 launch package):**
- [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) — the founder's copy-paste critical path to public launch + revenue
- [STRATEGY.md](STRATEGY.md) — lean business plan, customer profile, pricing, first-10-users playbook
- [REDTEAM.md](REDTEAM.md) — assumptions audit, pre-mortem, competitor attack plan (read quarterly)

**Environment setup:** See [ENV.md](ENV.md) for `.env.local`, Vercel variables, and the private development gate.

**Build plan & log:** See [PLAN.md](PLAN.md) and [LOG.md](LOG.md).

## Documentation

**[docs/README.md](docs/README.md)** — hub for all audiences:

- **Athletes & teachers** — [docs/help/](docs/help/INDEX.md) user guides
- **Developers** — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), [CONTRIBUTING.md](CONTRIBUTING.md)
- **AI agents** — [AGENTS.md](AGENTS.md) + [INDEX.md](INDEX.md)
- **License & AUP** — [LICENSE](LICENSE), [ACCEPTABLE_USE.md](ACCEPTABLE_USE.md), [SECURITY.md](SECURITY.md)

## Features (Freemium + Super Bundle Model)
- **Free Core (Accessible to Everyone, No Money Barrier)**: Full workout logger/tracker (RPE, rests, cues), basic library (M&S-style filters, bodyweight/minimal-equip global focus), basic nutrition logging + accessible recipes, basic assessments/streaks/challenges, 1RM benchmarks, history. Installable PWA — works offline anywhere in the world (Africa, Russia, low-resource areas). Core mission (tracking + fundamentals) is free forever.
- **Calculators & Basics**: 1RM, macros/TDEE, strength standards, readiness score — free.
- **Premium Modules** (individual or via Super Bundle): Advanced AI Coach/personalized plans, deep nutrition, mobility/Pliability-style, mindfulness (Calm/Waking Up-style), advanced tracking (MapMy-style), full specialist education programs (/learn pillar from practical high-value content).
- **Super Bundle**: Flagship — one subscription unlocks premium across multiple holistic pillars (train + fuel + move + mind + track + learn) at discounted pricing (modeled on 50% off promos, 6-12 month access, "X apps/tools for the price of 1"). Synergy for better results and retention.
- **PWA First**: Zero store fees/cuts. Global, offline-first, accessible.
- **Vision-Driven**: See vision.md. Free core for impact + equity; premium/bundle for depth and sustainability of the mission. "Mainly a free app."

Built with React (Next.js), TypeScript, Tailwind, shadcn/ui, Zustand, Recharts, Supabase, Stripe (Super Bundle) + PayPal webhook scaffold.

## Core App Features

- **Home Dashboard** — Quick-start workouts and recent activity stats
- **Benchmarks** — 1RM statistics, estimated vs actual rep maxes, timeline, and progress chart
- **Workout Builder** — Custom workouts plus Beginner, Advanced, and Pro program templates (5×5, Texas Method, Smolov, bodybuilding splits, corrective protocols, conditioning WODs, etc.)
- **Active Workout Logger** — Timer, rest timer, set logging (reps/weight/RPE), auto-save
- **History** — Past workouts with volume totals and detail view
- **Library** — Searchable, filterable exercise database with cues, progressions, alternatives (global/accessible focus)
- **Nutrition** — Daily macro/water tracker, targets, simple accessible recipes (free basics; premium deep plans)
- **PWA** — Installable with service worker caching (zero store fees/cuts)
- **Dark mode** — Elite fitness-themed UI (deep navy + strong accents)

## Getting Started (copy these lines exactly)

Open a terminal and run these commands **one block at a time**:

```bash
cd ~/missionwinning
pwd
```

You should see `/Users/snedz/missionwinning`.

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**Important**: Never paste the explanations or # comments into the terminal. Only paste the actual command lines.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) with localStorage + Supabase sync
- Supabase (auth, DB, storage)
- Serwist (`@serwist/next`) for installable offline-first PWA (disabled while `PRIVATE_MODE=true`)
- Payments: **Stripe Payment Links** → verified webhook → Supabase `enrollments` (see [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md)). Pricing source of truth: monthly **$11.99**, founders 12-month **$59**, lifetime **$149** (`src/lib/bundleConfig.ts` + [STRATEGY.md](STRATEGY.md)). Without live Stripe links, `/bundle` uses an honest founders waitlist. PayPal webhook at `/api/paypal-webhook` remains available. `DEMO_PREMIUM` is blocked in production builds.

## Data Storage

Workout data starts in localStorage for instant offline use and syncs to Supabase when signed in. **Core mission (tracker, basic tools) is free for all**. Premium (modules + Super Bundle) managed via Supabase status + PayPal (webhooks + client success for fulfillment). See vision.md for free core promise and bundle model.

## Local Development (exact commands)

Open a **new terminal tab**.

Paste these blocks **exactly as shown**, one after another. Do not paste the text around them.

Block 1:
```bash
cd ~/missionwinning
pwd
```

Block 2:
```bash
npm install
npm run dev
```

Then visit http://localhost:3000.

The core (workout log, library, nutrition, calculators) is free with no login required. "Request Access" buttons on /bundle and pillar pages grant demo premium for testing.

## Deployment to Vercel + Custom Domain (www.missionwinning.com)

### Step-by-step (copy only the command blocks)

**Open a brand new terminal tab every time you start.**

**1. Go to the project (always do this first):**

```bash
cd ~/missionwinning
pwd
```

**2. Commit your current changes:**

```bash
cd ~/missionwinning
git add -A
git commit -m "Ready for Vercel deploy - free core + Super Bundle"
```

**3. Clean build:**

```bash
cd ~/missionwinning
rm -rf .next
npm run build
```

**4. Deploy (this is interactive):**

```bash
cd ~/missionwinning
npx vercel
```

Follow the prompts:
- Log in with your Vercel account (it will open a browser).
- Choose to create a new project.
- It will deploy and give you a `*.vercel.app` URL.

**5. After the first deploy succeeds**, come back here and tell me the URL. I will give you the exact steps to add `www.missionwinning.com` and point the domain.

Production notes:
- The free core (tracker etc.) has no paywall.
- Demo "Request Access" buttons still work for testing the bundle flow.
- PWA will be installable on the live site (the 404 you saw on /manifest.json only happens in dev mode — normal).

See SETUP.md for more details if needed.
