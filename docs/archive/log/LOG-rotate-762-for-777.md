# Rotated from LOG.md when `.777` landed

## 2026-08-13 — F-017 first-set verify iterate (`.762`)

Verify + harden the #523 / `.746` first-set contract. `normalizeAppPath`
treats nullish as `/` and strips hash so `/active#x` cannot show the chip.
Header chip coerces `usePathname() ?? ''`. Welcome `welcomeBegin` fallback
is **Begin** (matches EN / first-90). Extended source-scan guards: one-hop
Train children, TAP_BUDGET 5, speech off first paint, `handleLogSet` has
no `await` / `getUser`. Cold path was not run in a browser this session.

**Ship:** `firstSetUngated` edges + HeaderAuthChip + Welcome fallback.
Free logger ungated. `PRIVATE_MODE` unchanged.

Label `.762` (onto master `.761`). Originally reserved `.750`; landed as `.762` past master `.761`.
Excellence-Override below.

Excellence-Override: F-017 first-set verify iterate

Rotated LOG oldest → [LOG-rotate-747-for-762.md](./LOG-rotate-747-for-762.md).
