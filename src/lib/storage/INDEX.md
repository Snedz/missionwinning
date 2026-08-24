# src/lib/storage/

> One concern: the only sanctioned access to browser storage.

## Why this exists

A bare `localStorage.setItem` throws in Safari private browsing and when the disk is
full. 59 files called it directly, many with no `try/catch` anywhere — including page
components and module-init paths — so a full disk could blank a page on a product whose
promise is offline-first logging without an account.

All 59 are migrated (`.126`–`.128`). Everything the app persists now passes through
`safeStorage`, and the migration **removed** ~40 hand-rolled `try/catch` blocks and ~35
SSR guards rather than adding any: one module that cannot throw beats guard code repeated
at every call site.

## Files

| File | Purpose |
|------|---------|
| `safeStorage.ts` | `readRaw` / `writeRaw` / `readJson` / `writeJson` / `remove` / `keysWithPrefix` — never throw |
| `safeSessionStorage.ts` | `sessionStore()` — sessionStorage probe, never throw, null when denied |
| `keys.ts` | Registry of every app-owned key (typing + discoverability) |
| `athleteLocalState.ts` | Explicit sign-out wipe + storage-owner bind so PAR-Q cannot follow the next account (P1-5). `SIGNED_OUT` without `markExplicitSignOut` keeps the guest log (`.941`) |

## Rules

1. Nothing outside this folder calls `localStorage` directly. `eslint.config.js`
   enforces it as a plain **error** — the `LEGACY_DIRECT_STORAGE` allowlist is gone
   as of `.128`, so there is no backlog for a new violation to join.
   `STORAGE_KEYS` is where keys come from; a fixed key inlined as a string literal
   is a bug waiting to be a typo.
2. `src/lib/backup.ts` is the one exception: export/restore must enumerate raw
   `mw_*` keys at runtime, because a stale registry would silently drop a key from
   a user's only safety net.
3. Writes return `false` when the value did not durably land. Callers that care
   (sync, backup) should react; callers that don't can ignore it.
4. Storage denied entirely → an in-memory fallback keeps the session working for
   the length of the tab. `isPersistent()` reports the truth; `SyncStatusRow`
   surfaces it to the user rather than pretending.
5. Don't add SSR guards around these calls. `safeStorage` no-ops during SSR by
   design; a `typeof window === 'undefined'` check around a read is dead code, and
   around a write it drops data the memory fallback would have kept. Guard only the
   surrounding `window` work — `dispatchEvent`, `location`.
6. `keysWithPrefix()` is for runtime-suffixed keys nobody wrote from a fixed
   constant (`mw_event_*`, `mw_teacher_pin_*`). It is the slow path; anything with a
   fixed key reads `STORAGE_KEYS` instead.

## Related

- [../sync/INDEX.md](../sync/INDEX.md) — the outbox, which persists through here
- `src/components/profile/SyncStatusRow.tsx` — honest UI for failures
