# src/lib/storage/

> One concern: the only sanctioned access to browser storage.

## Why this exists

A bare `localStorage.setItem` throws in Safari private browsing and when the disk is
full. Ten files used to call it with no `try/catch` anywhere — including three page
components — so a full disk could blank a page on a product whose promise is
offline-first logging without an account.

## Files

| File | Purpose |
|------|---------|
| `safeStorage.ts` | `readRaw` / `writeRaw` / `readJson` / `writeJson` / `remove` — never throw |
| `keys.ts` | Registry of every app-owned key (typing + discoverability) |

## Rules

1. Nothing outside this folder calls `localStorage` directly. `eslint.config.js`
   enforces it as an **error**, with a shrinking `LEGACY_DIRECT_STORAGE` allowlist —
   only ever delete lines from that list.
2. `src/lib/backup.ts` is the one exception: export/restore must enumerate raw
   `mw_*` keys at runtime, because a stale registry would silently drop a key from
   a user's only safety net.
3. Writes return `false` when the value did not durably land. Callers that care
   (sync, backup) should react; callers that don't can ignore it.
4. Storage denied entirely → an in-memory fallback keeps the session working for
   the length of the tab. `isPersistent()` reports the truth; `SyncStatusRow`
   surfaces it to the user rather than pretending.

## Related

- [../sync/INDEX.md](../sync/INDEX.md) — the outbox, which persists through here
- `src/components/profile/SyncStatusRow.tsx` — honest UI for failures
