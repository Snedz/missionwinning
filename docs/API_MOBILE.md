# Mobile HTTP API

Contract: [openapi-mobile.yaml](openapi-mobile.yaml) · Guide: [ANDROID_NATIVE.md](ANDROID_NATIVE.md) · Compose client: [`MobileApiClient`](../apps/android/core/network/src/main/java/com/missionwinning/core/network/MobileApiClient.kt)

| Method | Path | Notes |
|--------|------|--------|
| GET/POST | `/api/mobile/coach/plan` | Seed week from mw-core; query `adaptDemo` |
| POST | `/api/mobile/coach/adapt` | Mark session done / bump revision |
| POST | `/api/mobile/workouts` | Log workout; Bearer optional for Supabase sync |
| POST/GET | `/api/mobile/sync/workouts` | Cursor push/pull workouts (Bearer) |
| POST/GET | `/api/mobile/sync/routines` | Cursor push/pull routines (Bearer) |
| POST/GET | `/api/mobile/sync/customs` | Custom exercises push/pull (Bearer) |
| POST/GET | `/api/mobile/sync/prefs` | Units / rest / equipment / bar prefs (Bearer) |
| POST | `/api/mobile/telemetry` | Install heartbeat |

## Auth while private gate is on

| Mode | How Android connects |
|------|----------------------|
| **Offline** | Room seed (`LocalCoachSeed`) — **always works**, no network |
| **Network coach** | When `PRIVATE_MODE` is not `true`, coach bootstrap is cookie-free (Bearer optional). When private, need gate cookie **or** Supabase Bearer |
| **Sync** | Always requires signed-in Bearer |

### Debug `local.properties` (gitignored)

```properties
mw.apiBaseUrl=https://www.missionwinning.com
# Cookie value only (after browser POST /api/private-access sets mw_private_access)
mw.privateAccessCookie=<token from DevTools Application → Cookies>
```

Or local Next:

```properties
mw.apiBaseUrl=http://10.0.2.2:3000
mw.privateAccessCookie=<token>
```

### Smoke (host machine)

```bash
# After signing in to gate on www — paste cookie:
export COOKIE='mw_private_access=…'
curl -sS -H "Cookie: $COOKIE" \
  'https://www.missionwinning.com/api/mobile/coach/plan?equipment=bodyweight' | head -c 200
```

See `src/lib/mobileAccess.ts` (`hasMobileAppAccess`, `allowMobileCoachBootstrap`).
