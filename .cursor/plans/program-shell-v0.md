# Program shell v0 — local templates

**Status:** implement on this branch. Draft PR only. Do not merge.
**Paper:** stamp `.1111`. Live www stays `.697`. No tip-promote.
**Law:** `[skip vercel]`. `PRIVATE_MODE` stays. Empty payment fields. No AGPL paste. No kitchen-sink schema dump.

Not `docs/PLAN.md` (build phases A–I). Not root `PLAN.md` (house skin freeze).

## Goal

One offline program template an athlete can browse and start from, shaped as Program → Week → Session → exercise → suggested set. Local-first TypeScript. The free Train logger stays ungated.

The shape is reimplemented. It is not a copy of Snouzy/workout-cool (MIT) models, UI, or billing tables.

## In

- `Program`: `level`, `durationWeeks`, `sessionsPerWeek`, `equipment[]`
- `ProgramWeek` → `ProgramSession` → exercises → `SuggestedSet`
- One seed program (full-body, two weeks, two sessions a week)
- Device library via `safeStorage` (`mw_program_shell`) for programs the athlete saves
- Minimal list + detail on Builder, inside the existing Show all fold
- Start a template session by handing suggested sets to the existing `startWorkout` and opening `/active`

## Out

- `isPremium`, `paymentUrl`, Stripe, Subscription, RevenueCat, License, price, currency
- Multi-locale slug/title farms, coach bios, enrollment cloud, participant counts
- Prisma, new migrations, new API routes
- Replacing `src/data/programTemplates.ts` (flat Builder cycles stay)
- Merging this tree into logged workout history
- A premium gate on the logger

## Separation

`ProgramSession` here is a template. Logged work stays `ActiveWorkout` / history in the workout store. The only door into Train is `sessionToTrainDraft`, which returns `WorkoutExerciseTemplate[]` (reps, weight, optional hold seconds). It does not write history by itself.

`parseProgram` rejects any object that carries a billing key, anywhere in the tree. Known fields are copied. Unknown billing is not stored.

## Files

- `src/lib/programShell/` — types, parse, seed, library, train draft, tests, `INDEX.md`
- `src/components/builder/ProgramShellPanel.tsx` — list, detail, save-on-device
- `src/page-components/BuilderPage.tsx` — mount the panel inside Show all; start calls `startWorkout` then `/active`
- `src/lib/storage/keys.ts` — `programShell`
- `src/i18n/builderLocales.ts` — chrome strings
- Stamp: `buildInfo.ts`, `LOG.md`, `CONTEXT.md` `## Now`

## Done when

A draft PR contains the shell types, one browsable offline template, a start path into Train, and zero billing code.
