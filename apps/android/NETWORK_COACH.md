# Network coach (private gate) — Android

Room is always the source of truth. Network coach is **optional** while `PRIVATE_MODE` gates www.

Full API table: [docs/API_MOBILE.md](../../docs/API_MOBILE.md) · OpenAPI: [docs/openapi-mobile.yaml](../../docs/openapi-mobile.yaml)

## Modes

| Mode | Behavior |
|------|----------|
| **Offline (default)** | `LocalCoachSeed` + Room plan cache. No cookie needed. |
| **Network** | `MobileApiClient` → `GET/POST /api/mobile/coach/*`, workout outbox flush, `GET /api/mobile/premium/status` |
| **Auth** | Optional email OTP via Supabase; Bearer on mobile APIs when signed in (`AuthRepository`) |

On any API failure (403/network), repository falls back to Room seed/cache.

## Enable network coach on emulator/device

1. Sign in to the private gate in a browser on www (or local Next).
2. DevTools → Application → Cookies → copy **value** of `mw_private_access` (token only).
3. In `apps/android/local.properties` (gitignored):

```properties
mw.apiBaseUrl=https://www.missionwinning.com
mw.privateAccessCookie=<token>
```

Local Next from emulator:

```properties
mw.apiBaseUrl=http://10.0.2.2:3000
mw.privateAccessCookie=<token>
```

4. Rebuild/install (BuildConfig embeds the cookie):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:installDebug
```

5. Pull-to-refresh on **Today** (or Coach resume) to prefer network plan when online.
6. Finish a workout → outbox flushes when online + cookie valid.

## Smoke without Android

```bash
export COOKIE='mw_private_access=…'
curl -sS -H "Cookie: $COOKIE" \
  'https://www.missionwinning.com/api/mobile/coach/plan?equipment=bodyweight' | head -c 300
```

## Production flip

When the private gate opens for public mobile:

1. Clear or omit `mw.privateAccessCookie` for release builds (do not bake secrets into Play AAB).
2. Prefer signed-in Supabase Bearer (`AuthRepository` + OTP on Account) for multi-device sync — **auth is live**, not a stub.
3. Anonymous coach seed may use public `/api/mobile/coach/*` when `PRIVATE_MODE` is false; otherwise cookie/Bearer.
4. Keep offline Room path forever — free train without account.

## Security

- Never commit `local.properties` or real cookies.
- Release Internal AAB must **not** embed founder private cookies; use offline + future auth.
