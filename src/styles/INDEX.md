# src/styles/

> Costume tokens that are not the modernist `:root` in `src/index.css`.

| File | Purpose |
|------|---------|
| `patreonTokens.css` | Live Patreon-costume tokens, scoped under `.ptn`. Shared by www and signed-in / public chrome. [docs/DESIGN_PATREON.md](../../docs/DESIGN_PATREON.md) |

Do not fold these values into `src/index.css` — token-sync still pins the modernist sheet.
