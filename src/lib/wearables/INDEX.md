# src/lib/wearables/

> One concern: Multi-vendor wearable ingest (OAuth brands + platform hubs + BLE HR).

**Horizon:** Live OAuth/hubs gated by `NEXT_PUBLIC_WEARABLES` and [docs/WEARABLES.md](../../../docs/WEARABLES.md). Mission Score stays log-derived.

## Files

| File | Role |
|------|------|
| `flags.ts` | `NEXT_PUBLIC_WEARABLES` + provider credential checks |
| `types.ts` | Sample kinds, provider ids, labels |
| `adapter.ts` | OAuth adapter + hub ingest contracts |
| `oauthProviders.ts` | Whoop, Strava, a ring tracker, Garmin, Fitbit, Polar |
| `oauthState.ts` | Signed OAuth `state` (dedicated secret, no source fallback) + origin-bound redirect URI |
| `hubs.ts` | HealthKit / Health Connect / Fit native bridge normalize |
| `mapSamples.ts` | Samples → Track activity hints |
| `connections.ts` | Supabase upsert/disconnect/samples (service-role) |
| `status.ts` | Provider list for Settings UI |
| `bleHeartRate.ts` | Web Bluetooth HR (0x180D) |
| `index.ts` | Public exports |

## Related

- API: `app/api/wearables/**`
- UI: `ProfileWearablesCard`, `LiveHeartRate`
- Migration: `20260719_wearable_connections.sql`
- Manual import (no OAuth): `src/lib/healthImport.ts`
