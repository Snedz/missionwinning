# Android TWA / thin native playbook

**Status:** Deferred until evidence. Do **not** start this while private beta gates are unmet or week-4 retention is unknown.  
**Companion:** [REDTEAM.md](../REDTEAM.md) A1 · [STRATEGY.md](../STRATEGY.md) · [docs/POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md)

---

## When to open this playbook

| Signal | Action |
|--------|--------|
| Beta/public users repeatedly drop saying “is there an app?” / won’t install PWA | Start **Android TWA** |
| TWA live + week-4 retention still holds | Consider thin **iOS** shell (Capacitor/TestFlight) |
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
5. Measure: Play installs → I-Day complete → week-4 loggers vs web cohort  

**Do not** fork business logic into Kotlin. TWA should load `https://www.missionwinning.com`.

---

## Thin iOS shell (only after TWA proves demand)

1. Apple Developer account under LLC ($99/yr)  
2. Capacitor (or similar) WebView shell pointing at production URL  
3. TestFlight → App Store with clear “free core” listing copy  
4. Same privacy/terms URLs; no duplicate feature matrix  

Still one product: the web app. Native is distribution packaging.

---

## Explicit non-goals (now)

- Rewriting Train/Fuel in Swift/Kotlin  
- Wearables / HealthKit / Google Fit as launch blockers  
- Separate Android and iOS feature sets
