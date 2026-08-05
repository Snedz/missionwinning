## 2026-08-04 — Form guide loop autoplay mid-set (`.480`)

Form Index loops finally teach without a play tap. `FormGuideSheet` autoplays muted looping video when a pack has `mediaType: video`; `prefers-reduced-motion` falls back to the poster still via pure helpers in `formGuideMedia.ts`. Media height ratchet max-h-64 → max-h-80 for outdoor mid-set glance. Connects `.476`–`.479` packs to Train excellence.

Mutants: reduced-motion true + video pack → still poster; remove autoPlay → mid-set tap required again.

