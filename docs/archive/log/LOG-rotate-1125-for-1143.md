## 2026-10-12 — Next 16.4 prerender on Track (`.1125`)

Dependabot #1014 bumps `next` from 16.3.4 to 16.4.0. `build-and-test` dies in the production build while prerendering `/track`:

`TypeError: Cannot read properties of undefined (reading '__NEXT_PRIVATE_MINIMIZE_MACRO_FALSE')`

Next's server compiler wraps `useEffect` as `process.env.__NEXT_PRIVATE_MINIMIZE_MACRO_FALSE && useEffect(...)`, then the minifier replaces that member expression with `false` and drops the effect. `useFileUploadQueue` destructured its file worker as `process`. In 16.4 the minifier leaves a shadowed binding alone, so the check reads the worker function's `.env` (undefined) and throws. Track's activity import and Profile backup both call that hook during prerender.

The option is now `processFile`. Call sites in `ActivityImportPanel` and `ProfileBackupCard` use the same name. No other client function both binds `process` and calls `useEffect` or `useLayoutEffect`.

Label `2026.07-unified.1125`.

`[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1106-for-1125.md](docs/archive/log/LOG-rotate-1106-for-1125.md) (`.1106`).
