# Mission Winning

**The Free Global "Everything App" for Health — The Path to a Healthier World for All**

**Mission**: Become the #1 health super app — the entrance to the *right path* (evidence-based, holistic, consistent habits for strength, health, and resilience) vs. the path of average, excuses, and destruction. Core mission (workout tracking and foundational tools) is **100% free and accessible to everyone worldwide**, with no money barrier. Premium depth and the "Super Bundle" (synergistic pillars for training, nutrition, mobility, mind, tracking, and learning) sustain the mission while delivering transformative value.

Inspired by successful freemium + bundle models like Freeletics (free core hook + paid Coach + discounted "Super Bundle" of 7 holistic apps: training + nutrition + Calm + Pliability + Waking Up + Skill Yoga + MapMyFitness at 50% off promos for synergy and retention). Our version: free core tracker/library/nutrition basics for global impact (PWA, bodyweight focus, multi-lang) + premium modules + flagship Super Bundle.

This is *mainly a free app* serving the vision of making the world better and healthier for **all**. Revenue from optional premium layers and bundles — never at the expense of the core mission.

See [vision.md](vision.md) for the full guiding document (the "constitution" for every decision).

**Start here (2026-07 launch package):**
- [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) — the founder's copy-paste critical path to public launch + revenue
- [STRATEGY.md](STRATEGY.md) — lean business plan, customer profile, pricing, first-10-users playbook
- [REDTEAM.md](REDTEAM.md) — assumptions audit, pre-mortem, competitor attack plan (read quarterly)

**Environment setup:** See [ENV.md](ENV.md) for `.env.local`, Vercel variables, and the private development gate.

**Build plan & log:** See [PLAN.md](PLAN.md) and [LOG.md](LOG.md).

## Features (Freemium + Super Bundle Model)
- **Free Core (Accessible to Everyone, No Money Barrier)**: Full workout logger/tracker (RPE, rests, cues), basic library (M&S-style filters, bodyweight/minimal-equip global focus), basic nutrition logging + accessible recipes, basic assessments/streaks/challenges, 1RM benchmarks, history. Installable PWA — works offline anywhere in the world (Africa, Russia, low-resource areas). Core mission (tracking + fundamentals) is free forever.
- **Calculators & Basics**: 1RM, macros/TDEE, strength standards, readiness score — free.
- **Premium Modules** (individual or via Super Bundle): Advanced AI Coach/personalized plans, deep nutrition, mobility/Pliability-style, mindfulness (Calm/Waking Up-style), advanced tracking (MapMy-style), full specialist education programs (/learn pillar from practical high-value content).
- **Super Bundle**: Flagship — one subscription unlocks premium across multiple holistic pillars (train + fuel + move + mind + track + learn) at discounted pricing (modeled on 50% off promos, 6-12 month access, "X apps/tools for the price of 1"). Synergy for better results and retention.
- **PWA First**: Zero store fees/cuts. Global, offline-first, accessible.
- **Vision-Driven**: See vision.md. Free core for impact + equity; premium/bundle for depth and sustainability of the mission. "Mainly a free app."

Built with React (Next.js), TypeScript, Tailwind, shadcn/ui, Zustand, Recharts, Supabase, PayPal (for bundles/subs).

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
- next-pwa for installable offline-first PWA
- Payments: Demo/request-based for now (Super Bundle access via "Request" buttons that grant demo premium). Real processor (e.g. Stripe / Lemon Squeezy / PayPal) will be added once LLC/business setup complete. Webhook placeholder at /api/paypal-webhook remains ready for future.

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
