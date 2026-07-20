# apps/android — Mission Winning (Compose)

> Play product path. Read [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) first.

## Modules

| Module | Role |
|--------|------|
| `:app` | Nav host, feature screens (iday/today/active/coach/auth packages) |
| `:core:designsystem` | Brand colors, Theme, MW buttons |
| `:core:data` | Room + repositories (offline coach/workouts) |
| `:core:network` | Mobile OpenAPI client |

## Commands

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :app:assembleDebug
./gradlew :app:installDebug
```

## AI lane

Only edit `apps/android/**` and Maestro under `.maestro/`. Do not rewrite coach engine — use Room seed + `/api/mobile/coach/*`.
