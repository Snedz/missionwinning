# Play Store listing — Mission Winning (Android)

Use with [docs/ANDROID_NATIVE.md](../../docs/ANDROID_NATIVE.md) and [LEGAL_SAFETY.md](../../docs/LEGAL_SAFETY.md).

## Name

Mission Winning

## Short description

Free offline workout logging + weekly AI plans that adapt from your logs — no wearable required.

## Full description

Mission Winning is an adaptive AI training coach for people who train at home, in a park, or anywhere with a phone.

• Free forever core — log workouts offline, no account required to train  
• Mission Coach — weekly plans that adapt when you miss a day or log hard sessions  
• No wearable required — plans come from your workout history  
• Sign in later to sync across devices (optional)  

Privacy: https://www.missionwinning.com/privacy  
Terms: https://www.missionwinning.com/terms  
Refunds: https://www.missionwinning.com/refunds  

Not medical advice. Train smart.

## Category

Health & Fitness

## Founder checklist (Play Internal)

- [ ] Google Play Console (~$25) under LLC when ready  
- [ ] `./gradlew :app:assembleRelease` or Android Studio Generate Signed Bundle  
- [ ] Internal testing track upload  
- [ ] Data safety form from LEGAL_SAFETY.md  
- [ ] Screenshots: I-Day, Today, Active, Coach adapt banner  
- [ ] Run Maestro: `maestro test apps/android/.maestro/wedge.yaml` on emulator  

## Package

`com.missionwinning.app` (debug suffix `.debug` for local installs)
