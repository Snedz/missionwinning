# Mission Winning

**The All-in-One Global Health & Workout App + Elite Practical Training Education**

Mission Winning: train your strength, conditioning, nutrition, and coaching skills anywhere in the world.

This is a premium education platform (practical specialist programs drawn from top industry curricula) + powerful interactive tools (rebranded/enhanced from StrongLifts/CrossFit-style logging + proven programming principles like those in HWPO). Not an issuing body for official certifications — practical skill development and business education. Using missionwinning.com domain (or alias). Global mission: accessible training and health for everyone, everywhere. "Win daily."

## Features
- **Free Public Tools**: Full workout logger, popular program templates (5x5, Texas Method, etc.), 1RM benchmarks, history. Works offline as installable PWA.
- **Calculators**: 1RM, macros/TDEE, strength standards, more (expanding).
- **Premium Unlocks** (via program purchases or subscription): Advanced periodization, custom builders, full nutrition logging/tracking, detailed analytics, specialist templates (bodybuilding, corrective, conditioning).
- **Education Programs**: Buy self-paced practical specialist programs covering PT fundamentals + nutrition, bodybuilding, corrective exercise, strength & business of training, online coaching, conditioning.
- **High-Touch Coaching**: Online coaching packages.
- **PWA First**: Installable on iOS/Android/desktop from browser — zero Apple/Google developer fees or App Store cuts. Full offline support.

Built with React, Vite, TypeScript, Tailwind, shadcn/ui, Zustand, Recharts, Supabase, Stripe.

## Core App Features

- **Home Dashboard** — Quick-start workouts and recent activity stats
- **Benchmarks** — 1RM statistics, estimated vs actual rep maxes, timeline, and progress chart
- **Workout Builder** — Custom workouts plus Beginner, Advanced, and Pro program templates (5×5, Texas Method, Smolov, bodybuilding splits, corrective protocols, conditioning WODs, etc.)
- **Active Workout Logger** — Timer, rest timer, set logging (reps/weight/RPE), auto-save
- **History** — Past workouts with volume totals and detail view
- **Library** — Searchable, filterable exercise database with cues, progressions, alternatives (global/accessible focus)
- **Nutrition** — Daily macro/water tracker, targets, simple recipes (premium)
- **PWA** — Installable with service worker caching (zero store fees/cuts)
- **Dark mode** — Elite fitness-themed UI (deep navy + strong accents)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Tech Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) with localStorage + Supabase sync
- [React Router](https://reactrouter.com/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- Supabase (auth, DB, storage)
- Stripe (payments)

## Data Storage

Workout data starts in localStorage for instant offline use and syncs to Supabase when signed in (premium features require account). Premium status managed via Supabase + Stripe.
