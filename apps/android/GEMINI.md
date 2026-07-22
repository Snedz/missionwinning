# GEMINI.md — apps/android

Gemini in Android Studio boots from this Gradle root, not the repo root. Read in order:

1. [AGENTS.md](AGENTS.md) — Android lane rules (one Issue / one screen per PR)
2. [INDEX.md](INDEX.md) — module map + commands
3. Repo root [../../CONTEXT.md](../../CONTEXT.md) — current status + hard rules
4. [../../docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) — horizons A–E

Never port the coach planEngine to Kotlin — call `/api/mobile/coach/*` (or `LocalCoachSeed`). The free offline logger is never paywalled.
