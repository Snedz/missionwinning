## 2026-08-05 — Rest final-seconds outdoor glance (`.485`)

Rest dock clock stays ink-on-ink until the last 10s, then switches to `accent-400` so outdoor athletes get an “about to go” signal without reading digits. Pure `isRestFinalSeconds` / `REST_FINAL_SECONDS` shared by UI and tests; `data-rest-final` for e2e if needed.

Mutants: threshold 0 → never accent; threshold 90 → whole rest looks urgent.
