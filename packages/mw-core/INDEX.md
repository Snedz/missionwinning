# packages/mw-core

> Shared pure TypeScript for web + Expo native. No `window`, `localStorage`, Next, or React Native imports.

## Exports

| Path | Contents |
|------|----------|
| `@missionwinning/mw-core` | Re-exports coach + workout |
| `@missionwinning/mw-core/coach` | Types, adapt summary, mergePlans, demo seed plan |
| `@missionwinning/mw-core/workout` | Victory next-action (Coach wedge) — **canonical** `pickVictoryNextAction` |

## Rule

New Coach / logger **logic** lands here first; web (`src/lib/coach/`, `src/lib/workout/workoutVictory.ts`) and `apps/mobile` both consume it (web may re-export until fully migrated). Victory CTA is one definition here — web re-exports; do not fork a second body.

## Do not put here

- Supabase clients, AsyncStorage, Stripe, UI components
- Files that import `@/data/exercises` or browser APIs
