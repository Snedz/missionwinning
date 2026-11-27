# Architecture

| Workspace | Owns |
|---|---|
| `apps/web` | Next.js 16 App Router, Tailwind styling, Zustand notebook, browser interactions, Serwist worker |
| `packages/core` | Legacy exercise data and IDs, coach planner/adaptation/progression, shared seed and summaries, workout recovery, sync normalization and outbox, portable backup |

The six static pages share a notebook UI and client store. The first render avoids browser storage, then hydration recovers the diary through `safeStorage` and the legacy recovery predicate. A logged set writes synchronously through the adapter before the UI updates; denied writes fall back to memory with a warning. Finishing the session uses the legacy completed-set filter and persists history and the cleared active session together. Per-workout deletion writes a tombstone; device deletion removes Mission Winning keys.

Coach generates a deterministic strength week from equipment, frequency, local week, and workout history. The citation is derived independently from the actual visible log and does not invent a set when no weighted set exists.

The notebook is local-only unless built with both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. For evaluation, use the public key of a local or staging project and allow its v2 `/profile` URL in Supabase Auth's redirect allowlist. You supports same-browser PKCE email links for existing accounts; logging never requires an account. The first eligible sign-in copies the guest diary into account-scoped storage without erasing the guest copy. Each account has its own durable workout outbox. Authenticated reads and writes use the existing `workout_logs` table under RLS; plans and templates are not synced.

Serwist precaches the versioned production app, navigation documents and static assets. Network requests outside the precache are not written to runtime caches. Offline use requires one successful online install of the shell, and durable storage is still subject to the browser's private-mode, quota, and eviction policies.

`npm run verify` runs strict type checking, the colocated Node tests, the production build, and mobile Chromium Playwright. Legacy assertions that open removed page/component files stay with the old app; the v2 browser suite checks corresponding user flows where they exist.
