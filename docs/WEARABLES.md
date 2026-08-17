# Wearables integration

**Status:** Schema + adapters + Settings UI ship behind `NEXT_PUBLIC_WEARABLES=true`. Live OAuth/hub sync unlocks after Horizon 3 (week-4 retention) per [ORCHESTRATION.md](../ORCHESTRATION.md), unless the founder overrides.

**Product rule:** Win Score stays **log-derived** ([REDTEAM.md](REDTEAM.md) A8). Wearables enrich Track, optional recovery context, and live session HR — they never become Mission Score.

**Code:** `src/lib/wearables/` · Migration: `supabase/migrations/20260719_wearable_connections.sql` · Manual import: `src/lib/healthImport.ts`

---

## Two lanes

1. **Platform hubs** (highest device coverage) — Apple HealthKit, Google Health Connect / Fit, Samsung via Health Connect. Need thin native shell ([TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md)).
2. **Brand OAuth** (web-friendly) — Whoop, Strava, a ring tracker, Garmin, Fitbit, Polar, ….

All sources normalize to one ingest shape before UI:

| Field | Role |
|-------|------|
| `source` | Provider id (`whoop`, `healthkit`, `manual`, …) |
| `kind` | `workout` \| `activity` \| `sleep` \| `hr` \| `hrv` \| `steps` \| `recovery` |
| `started_at` / `ended_at` | ISO timestamps |
| `metrics` | jsonb (BPM, distance, recovery %, …) |
| `external_id` | Dedupe across hub + brand double-connect |

---

## Option matrix

### A — Platform hubs (native later)

| Source | Covers | Web PWA live? | Path |
|--------|--------|---------------|------|
| Apple Health / HealthKit | iPhone + Watch + apps writing into Health | No | Capacitor/iOS + HealthKit → hub ingest API |
| Apple Watch | HR, workouts, sleep via Health | Indirect | Same HealthKit path |
| Google Health Connect | Android hub (Fit, Pixel Watch, many wearables) | No | TWA/Capacitor + Health Connect |
| Google Fit API | Legacy cloud | Declining | Prefer Health Connect; Fit REST only if needed |
| Galaxy Watch | Watch via the Android health store | No | Prefer Health Connect |

### B — Brand OAuth (web)

| Source | Best for | Env (server) |
|--------|----------|--------------|
| Whoop | Recovery / strain / sleep | `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET` |
| Strava | Runs / rides (Track) | `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` |
| a ring tracker | Sleep / readiness | `OURA_CLIENT_ID`, `OURA_CLIENT_SECRET` |
| Garmin | Training load / activities | `GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET` |
| Fitbit (Google) | Steps / sleep / activities | `FITBIT_CLIENT_ID`, `FITBIT_CLIENT_SECRET` |
| Polar AccessLink | Training + HR zones | `POLAR_CLIENT_ID`, `POLAR_CLIENT_SECRET` |
| Coros / Suunto / Ultrahuman | Demand-driven | Add adapter when API + beachhead request |

Ship order when unlocked: Whoop → Strava → a ring tracker → Garmin → Fitbit → Polar.

### C — No account linking

| Source | Role |
|--------|------|
| Apple Shortcuts → JSON | Manual dump into Track import |
| Google Takeout / Fit export → JSON or CSV | Same import path |
| Web Bluetooth HR (Polar H10, Wahoo, …) | Live BPM on Active workout (Chrome/Android; Safari weak) |

---

## Unlock criteria

| Phase | When | Deliverable |
|-------|------|-------------|
| **0** | Now | This doc + JSON/CSV import help |
| **1** | Week-4 retention holds (or founder override) | OAuth batch behind flag |
| **2** | After Android TWA / thin iOS | HealthKit + Health Connect |
| **3** | Optional | Web Bluetooth live HR (also available behind flag earlier) |

---

## Privacy

- Minimal OAuth scopes per provider.
- Disconnect deletes connection tokens and optionally synced samples.
- Free core never requires a wearable.
- Document each live vendor in the public privacy policy before enabling production OAuth.
- Customer help: [help/pillars.md](help/pillars.md) (Track), [help/privacy-and-data.md](help/privacy-and-data.md).

---

## Env

See [ENV.md](ENV.md) § Wearables. Master client flag: `NEXT_PUBLIC_WEARABLES=true`.
OAuth `state` requires `WEARABLES_OAUTH_STATE_SECRET` in production (no source fallback).
Callback origin is `WEARABLES_OAUTH_REDIRECT_BASE` or `NEXT_PUBLIC_APP_URL`, never the request Host.
