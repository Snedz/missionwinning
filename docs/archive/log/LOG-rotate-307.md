## 2026-08-03 — Rest timer default is one source of truth (`.292`)

Store `startRestTimer()` no longer invents **30s**. Duration resolves through
`resolveStartRestSeconds` → saved default / **90s** fallback shared with exercise
heuristics. Guard: store must not hardcode 30.
