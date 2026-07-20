# Mission Winning — native (Expo)

Wedge-first Android + iOS app. Shared logic: [`packages/mw-core`](../../packages/mw-core).

## Run

```bash
cd apps/mobile
cp .env.example .env   # optional Supabase
npm start              # Expo Go / simulator
```

## Env

| Var | Purpose |
|-----|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same project as web |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `EXPO_PUBLIC_WEB_APP_URL` | Default `https://www.missionwinning.com` |

Without Supabase, I-Day → Today → Train → Coach works fully offline via AsyncStorage.

## Screens (v1)

| Route | Role |
|-------|------|
| `/iday` | Short I-Day |
| `/(tabs)/today` | Hub + adapt banner + start workout |
| `/(tabs)/coach` | Week strip + adapt demo seed |
| `/active` | Set logger + rest |
| `/victory` | Coach-first next action |
| `/auth` | Magic-link sign-in |
| `/(tabs)/account` | Sync + Super Bundle (Stripe web) |

## Stores

See [docs/NATIVE_MOBILE.md](../../docs/NATIVE_MOBILE.md) and `eas.json`.
