# Android TWA / thin native playbook

**Status:** Optional packaging only. **Product path is native Compose** ([ANDROID_NATIVE.md](ANDROID_NATIVE.md)); iOS is native SwiftUI at its gate ([IOS_PLAYBOOK.md](IOS_PLAYBOOK.md)). Umbrella: [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md).  
**Companion:** [REDTEAM.md](REDTEAM.md) A1 · [STRATEGY.md](STRATEGY.md) · [docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md)

---

## When to open this playbook

| Signal | Action |
|--------|--------|
| Beta/public users repeatedly drop saying “is there an app?” / won’t install PWA | Start **Android TWA** |
| TWA live + week-4 retention still holds | Superseded — iOS ships native SwiftUI at its gate ([IOS_PLAYBOOK.md](IOS_PLAYBOOK.md)); no WebView shell |
| Retention &lt;10% and nobody asks for an app | **Do not build native** — fix Today / Coach / first-workout loop |

Full dual native (React Native / Flutter rewrite) is the highest-risk use of capital for this product.

---

## Why TWA first (not iOS first)

- Wraps the **existing PWA** — one codebase, Play Store discovery  
- Cheaper and faster than App Store native  
- Tests A1 (app-store distribution) without rewriting Mission Winning  
- iOS PWA limits (no push until installed, Add to Home Screen friction) are the usual complaint; Android TWA proves demand before paying Apple $99 + review cycles

---

## Android Trusted Web Activity (outline)

When evidence clears:

1. Confirm production is public (`PRIVATE_MODE=false`) and PWA install works  
2. Create Android project with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) or PWABuilder TWA  
3. Digital Asset Links: `/.well-known/assetlinks.json` on `www.missionwinning.com`  
4. Play Console under the LLC; free app listing; link to same privacy/terms  
   - Fill **Data safety** from [LEGAL_SAFETY.md](LEGAL_SAFETY.md) §2 (do not invent labels before this step)  
5. Measure: Play installs → I-Day complete → week-4 loggers vs web cohort  

**Do not** fork business logic into Kotlin. TWA should load `https://www.missionwinning.com`.

---

## Thin iOS shell (only after TWA proves demand)

**Superseded 2026-08-06:** iOS is locked to native SwiftUI ([IOS_PLAYBOOK.md](IOS_PLAYBOOK.md)) — no Capacitor/WebView shell. Retained for history only.

1. Apple Developer account under LLC ($99/yr)  
2. Capacitor (or similar) WebView shell pointing at production URL  
3. TestFlight → App Store with clear “free core” listing copy  
4. Same privacy/terms URLs; no duplicate feature matrix  

Still one product: the web app. Native is distribution packaging.

---

## Explicit non-goals (now)

- Rewriting Train/Fuel in Swift/Kotlin  
- Wearables / HealthKit / Google Fit as launch blockers (strategy + scaffolding: [WEARABLES.md](WEARABLES.md); hubs attach to this shell later)  
- Separate Android and iOS feature sets
