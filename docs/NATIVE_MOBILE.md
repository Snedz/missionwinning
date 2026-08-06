# Expo prototype (flow reference — not the product)

**Status:** Expo prototype / flow reference only. **Play product path is Kotlin Compose** — see [ANDROID_NATIVE.md](ANDROID_NATIVE.md). iOS deferred: [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md). Umbrella plan: [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md).  
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

## Store submission — do not use Expo for this

Historical Expo/EAS notes removed 2026-08-06. Do **not** build or submit Expo to any store: Android ships from `apps/android` ([ANDROID_NATIVE.md](ANDROID_NATIVE.md)); iOS is native SwiftUI at its gate ([IOS_PLAYBOOK.md](IOS_PLAYBOOK.md)). The Expo `app.json` still claims `com.missionwinning.app` — the same applicationId as the Compose release build; see the bundle-ID collision item in [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) §10.

---

## TWA (optional, not the product)

[TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) remains for packaging the **web** PWA if needed. The shipped Android product path is Compose native ([ANDROID_NATIVE.md](ANDROID_NATIVE.md)).

---

## Out of native v1

Fuel / Move / Mind / Learn depth, wearables, school channel, Phantom USDC — web until retention.
