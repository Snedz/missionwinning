# Native Android + iOS (Expo)

**Status:** Expo prototype / flow reference only. **Play product path is Kotlin Compose** — see [ANDROID_NATIVE.md](ANDROID_NATIVE.md). iOS deferred: [IOS_DEFERRED.md](IOS_DEFERRED.md).  
**Code:** [`apps/mobile`](../apps/mobile) · shared pure TS [`packages/mw-core`](../packages/mw-core)  
**Thesis:** [YC_THESIS.md](YC_THESIS.md) · **Legal:** [LEGAL_SAFETY.md](LEGAL_SAFETY.md) · **LLC:** [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md)

Web PWA at `www.missionwinning.com` stays live for SEO, accelerator demos, and pillars not yet in native. Expo is **not** what users download from Play.

---

## Architecture

```
packages/mw-core   → adapt summary, seed plan, victory next-action (pure TS)
apps/mobile        → Expo Router UI + AsyncStorage + Supabase auth/sync
src/lib/coach/*    → full web coach engine (planEngine, adapt, …); adaptSummary re-exports mw-core
```

**Rule:** New Coach/logger **logic** lands in `packages/mw-core` first when portable; UI stays separate (RN vs web).

---

## Local development

```bash
cd apps/mobile
cp .env.example .env   # optional EXPO_PUBLIC_SUPABASE_*
npm start
```

Offline works without Supabase. Magic-link sign-in + `profiles.coach_plan` / `workout_logs` sync when env is set.

Super Bundle uses **Stripe Checkout on the web** (`/bundle` via `expo-web-browser`) — no native IAP in v1 (free core + web subscription).

---

## EAS Build / store submission (founder)

1. Create LLC + Apple Developer ($99) + Google Play Console ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md)).
2. Install EAS CLI: `npm i -g eas-cli` → `eas login` → from `apps/mobile`: `eas init` (replace `extra.eas.projectId` in `app.json`).
3. Builds:
   - Internal: `npm run eas:build:ios` / `eas:build:android` (preview profile)
   - Production: `npm run eas:build:production`
4. Submit: fill `eas.json` → `submit.production` placeholders → `eas submit -p ios` / `-p android`.
5. Store Data safety / privacy nutrition labels from [LEGAL_SAFETY.md](LEGAL_SAFETY.md) §2.
6. Listing copy (wedge):

> **Mission Winning** — Adaptive AI training coach for people who train at home or in a park. Free offline workout logging (no account required). Weekly plans that adapt from your logs alone — no wearable required.

Privacy / Terms / Refunds: `https://www.missionwinning.com/privacy` · `/terms` · `/refunds`

---

## TWA (optional, not the product)

[TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) remains for packaging the **web** PWA if needed. The shipped product path is Expo native.

---

## Out of native v1

Fuel / Move / Mind / Learn depth, wearables, school channel, Phantom USDC — web until retention.
