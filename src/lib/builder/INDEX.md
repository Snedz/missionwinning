# src/lib/builder/

> One concern: Builder first-paint chrome (`/builder`).

## Read order

1. `builderSheetChrome.test.ts` — Blank first; templates / sign-in in Show all
2. `builderGroupLoading.test.ts` — `/builder` client nav is not group Loading; segment loading is house leftover (`.1058`)

The page lives in `src/page-components/BuilderPage.tsx`.
