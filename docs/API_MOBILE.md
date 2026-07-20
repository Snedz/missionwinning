# Mobile HTTP API

Contract: [openapi-mobile.yaml](openapi-mobile.yaml) · Guide: [ANDROID_NATIVE.md](ANDROID_NATIVE.md)

| Method | Path | Notes |
|--------|------|--------|
| GET/POST | `/api/mobile/coach/plan` | Seed week from mw-core; query `adaptDemo` |
| POST | `/api/mobile/coach/adapt` | Mark session done / bump revision |
| POST | `/api/mobile/workouts` | Log workout; Bearer optional for Supabase sync |

Auth: public bootstrap when not `PRIVATE_MODE`; otherwise Bearer / cookie / gate. See `src/lib/mobileAccess.ts`.
