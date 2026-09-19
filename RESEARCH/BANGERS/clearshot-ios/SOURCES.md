# SOURCES — ClearShot iOS

Citations for this pack. **Read dates:** 2026-09-19. Third-party MAU/revenue figures are **their marketing or estimators**, not ours. We do not copy them into `CONTEXT.md` as traction.

Fitness product names stay out of this file ([docs/CLASSIFICATION.md](../../../docs/CLASSIFICATION.md)).

---

## 1. What we claim vs what we cite

| We claim (ours) | We only cite (theirs) |
|-----------------|------------------------|
| Wedge: screenshots-first, on-device, honest unlock | Parent-market chart names, ASO tactics, screenshot-share estimates |
| Kill bar: &lt;5 paid intents / 14d | Any “average user has N screenshots” blog math |
| `PAYMENT_URL` is a placeholder | Stripe/Apple pricing pages |
| MW ClearShot mini is reserved, no UI | PhotoKit / App Review text |

If a source is a cleaner-vendor blog (Cleanor, LuminaClean, DB Labs / Swype), treat numbers as **vendor-adjacent**. Use them as order-of-magnitude, not as science.

---

## 2. Platform and policy (primary)

| Source | What we take |
|--------|----------------|
| [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (fetched 2026-09-19) | **2.3.1** — no misleading marketing; iOS virus/malware scanner theater called out. **2.5.1** — public APIs, intended purpose. **3.1.1** — IAP for digital goods in-app. **5.1.1** — privacy policy; **5.1.1(iii)** minimize access, prefer picker when possible; **5.1.1(iv)** do not mine Photos into a sold database. |
| [WWDC 2020 — Handle the Limited Photos Library (10641)](https://developer.apple.com/videos/play/wwdc2020/10641/) + [WWDCNotes](https://wwdcnotes.com/documentation/wwdc20-10641-handle-the-limited-photos-library-in-your-app/) | `.limited` status; `presentLimitedLibraryPicker`; `PHPhotoLibraryChangeObserver`; `PHPhotoLibraryPreventAutomaticLimitedAccessAlert`; Limited cannot fetch/create user albums the same way; PHPicker does not grant library delete power. |
| PhotoKit — `PHAssetMediaSubtype.photoScreenshot` | Practical filter for screenshots ([SO 76816843](https://stackoverflow.com/questions/76816843/ios-photo-kit-filter-screenshots-screen-recordings-and-assets-saved-other-apps): screenshot subtype works; screen recordings and “saved from other apps” are harder). |
| PhotoKit delete | `performChanges` + system confirm; assets go to **Recently Deleted** (~30 days). Third parties cannot skip this. Summarized in [Cleanor PhotoKit note](https://cleanor.app/reference/photokit) and [DB Labs “how cleaners work”](https://dblabsapps.com/blog/how-iphone-photo-cleaner-works/) (vendor blogs; the system behavior matches Apple’s Photos model). |
| [iOS sandbox / “are cleaners safe”](https://dblabsapps.com/blog/iphone-storage-cleaning-apps-safe/) | Third-party apps cannot clear system cache, other apps, Mail, Messages. The honest product surface is the Photos library. |

---

## 3. Parent market and scareware

| Source | What we take | Caution |
|--------|----------------|---------|
| [ASOhack — ASO for phone cleaner apps (2026-06-05)](https://asohack.com/blog/aso-for-cleaning-storage-apps) | Charts crowded (Cleaner Pro / Pixocial, Gemini Photos / MacPaw, Smart Cleaner / Systweak, iMyfone-class Phone Cleaner). Kitchen-sink listings convert worse than a narrow job. **Do not say** boost / RAM / speed / optimizer. Cache-clean claims on iOS are policy-fragile. Long-tail: “similar screenshot cleaner,” video duplicate, blurry remover. Screenshot 1 = before/after storage **only if true**; we prefer **count + DEMO label** over invented GB. ASA after ≥4.3★ and ≥50 ratings. Keyword field: no title repeats; 60–90 day refresh. | Commercial ASO vendor. |
| [Connor Tumbleson — Predatory iOS cleanup applications (2025-01-13)](https://connortumbleson.com/2025/01/13/predatory-ios-cleanup-applications/) | Category is full of weekly trials, junk permissions, and review manipulation. Users already hate this. **Honest unlock is not a slogan; it is anti-that.** | Anecdote + review mining, not a market census. |
| [DB Labs — CleanMyPhone vs Gemini vs Swype (2026)](https://dblabsapps.com/compare/cleanmyphone-vs-gemini-photos/) | Gemini ~$4.99/mo class; screenshots are a **bucket inside** a general cleaner; swipe apps compete on gesture + “free.” | Vendor comparison (they ship Swype). |
| [AppGoblin — Cleanup: Phone Storage Cleaner](https://appgoblin.info/apps/1510944943) | Kitchen-sink listing (dupes, similar, videos, screenshots, mail, contacts, compress, secret space, widgets). Estimator: large rating base, IAP-heavy. Store copy stresses “review before you delete” and “offline and private” — those phrases are table stakes, not a moat. | Third-party analytics; **do not cite as our MAU**. |
| [Applyra — LuminaClean ASO audit (2026-01-22)](https://www.applyra.io/audit/18676346-2517-405e-ab00-b65fc5c45cf7/luminaclean-photo-cleaner) | Parent keywords: photo cleaner, duplicate photos, clean storage, free up space, delete duplicates, iphone storage cleaner, similar photos. Difficulty is **high** on head terms. | Another vendor’s visibility score (3/100) is not a strategy. |

---

## 4. Screenshots-first neighbors

| App / note | Listing fact (2026-09-19 pass) | Steal / avoid |
|------------|--------------------------------|---------------|
| **Native Photos → Screenshots** | Free, system-accurate count, Select / drag-select, Recently Deleted. | **Avoid** claiming we invented the album. **Steal** “we are a review pass on top of it.” |
| **Screenshot Cleaner AI** ([App Store id 6760237510](https://apps.apple.com/us/app/screenshot-cleaner-ai/id6760237510)) | Screenshots-only scan, on-device OCR, search, Saved/Keep, review-first, never auto-delete, “Data Not Collected,” iOS 17+. | **Closest wedge.** Do not copy “AI” as decoration. OCR is a **later door** unless payers demand search. Review-first + on-device is **align**. |
| **Gemini Photos** | Full library: dupes, similar, blur, screenshots, video. Subscription. Huge rating moat. | **Avoid** matching breadth. **Steal** nothing that requires their ratings. ASO: their listing is thinner on screenshot-only long-tail (ASOhack claim — re-check in Connect when we have an app). |
| **Cleanup / Cleaner Pro / Smart Cleaner / CleanMyPhone** | Storage + extras (contacts, vault, animations). | **Avoid** secret space, charging skins, contact merge. Those are a different trust surface and extra permissions. |
| **Swipe cleaners** | Left/right keep-delete. | Later UX, not the sell-first promise. Gesture without honest unlock is still a cleaner. |
| **iCloud+** | 50 GB / 200 GB / 2 TB paid plans (Apple public pricing; confirm at sell time). | Real alternative: **pay Apple** instead of deleting. Our copy must respect that some buyers should buy iCloud, not us. |

---

## 5. Screenshot volume (order-of-magnitude only)

| Source | Figure | Use |
|--------|--------|-----|
| [Cleanor — space screenshots take](https://cleanor.app/blog/how-much-space-screenshots-actually-take-over-a-year) | ~0.5–3 MB/shot; 3/day ≈ 1.6 GB/year; 8/day ≈ 4.4 GB/year at 1.5 MB avg. iCloud Photos counts them. Native album path documented. | Explain **why** a review pass can matter for heavy screenshotters. Do **not** put “save 4.4 GB” on the landing as a promise. |
| [LuminaClean — clean screenshots (2026)](https://luminaclean.app/blog/clean-up-iphone-screenshots.html) | Vendor: 20–50 shots/week, 1k–2.5k/year, 0.5–3 GB accumulated bands. | Same: bands for ICP stories, not metrics. |
| [DB Labs — 121 stats / photo habits 2026](https://dblabsapps.com/statistics/iphone-storage-photos-statistics/) · [study](https://dblabsapps.com/research/iphone-photo-habits-study-2026/) | Screenshots ~10–15% of **item** count, ~4% of **library storage**; videos dominate bytes. Median library ~2.5k photos in their writeup. | **Strategic warning:** screenshots are numerous, not the GB prize. If payers only want GB, they want **video**, and this wedge should **kill**. If payers want **inbox-zero for screenshots**, the wedge lives. |

That last line is the sell-first falsifier in plain language.

---

## 6. ASO notes (closed working set)

### 6.1 Head terms (parent — hard)

`photo cleaner` · `iphone storage cleaner` · `clean storage` · `free up space` · `duplicate photos` · `similar photos` · `delete duplicates`

Use as **secondary** on the landing. Do not build v1 to rank on `duplicate photos` — that is Gemini’s house.

### 6.2 Wedge terms (primary)

`screenshot cleaner` · `screenshots` · `screenshot` · `Screenshots album` · `declutter screenshots` · `similar screenshot cleaner` (long-tail, ASOhack)

### 6.3 Denylist (listing + landing + in-app)

`boost` · `RAM` · `speed up` · `optimizer` · `virus` · `malware` · `cache cleaner` (as system cache) · `deep clean` · `make your iPhone faster` · `storage critical` (as a fake meter) · `threats found`

`phone cleaner` as a **noun** is allowed if not glued to performance claims (ASOhack). We still prefer **screenshot cleaner**.

### 6.4 Metadata sketch (post-binary)

See SELL_FIRST §8. Re-audit in App Store Connect when the record exists — keyword difficulty tools drift.

### 6.5 Conversion stills (post-binary)

Category default is a scary gauge. We invert:

1. Honest count (or DEMO).
2. Review + system confirm.
3. On-device / no upload.
4. Explicit “not System Data / not RAM.”

Icon: not a red warning triangle (ASOhack: warning/trash icons read as junk cleaners).

---

## 7. MW-internal (this repo, not market)

| Path | Relevance |
|------|-----------|
| [docs/contracts/MODULE.md](../../../docs/contracts/MODULE.md) | `utility.clearshot` reserved; photos scopes; no UI. |
| [packages/mw-core/src/module/types.ts](../../../packages/mw-core/src/module/types.ts) | `UTILITY_CLEARSHOT_MANIFEST` — surfaces `android` today. |
| [apps/android/ARCHITECTURE.md](../../../apps/android/ARCHITECTURE.md) | Play id `com.missionwinning.clearshot` reserved; no module yet. |
| [docs/IOS_PLAYBOOK.md](../../../docs/IOS_PLAYBOOK.md) | MW iOS deferred. This track does not open that lane. |

---

## 8. Implementation sketches (not endorsements)

| Source | What we take |
|--------|----------------|
| [SPerekrestova/iphone-cleaner](https://github.com/SPerekrestova/iphone-cleaner) (MIT, 2026) | On-device Vision menu (hash, feature print, blur, screenshot subtype, OCR coverage). **Do not** lift into v1. Proof that the kitchen sink is a weekend of APIs and a year of product. iOS 26+ requirement is a warning, not our min version (we want iOS 17). |

---

## 9. Payment

| Token | Rule |
|-------|------|
| `PAYMENT_URL` | **Only** string allowed in this pack for checkout. Founder replaces on the live landing. |
| Apple IAP | After pass; StoreKit 2; 3.1.1. |
| MW Super Bundle / mute-pay | Unrelated. Do not reuse. |

---

## 10. Re-verify list (when the clock starts)

1. App Review Guidelines — 2.3.1 / 5.1.1 / 3.1.1 still as summarized.
2. Screenshot Cleaner AI listing — still screenshots-only? OCR still on-device?
3. Gemini subtitle/keywords — still thin on screenshot-only?
4. iCloud+ price table.
5. Any new Apple “Clean Up” in Photos that makes the native album good enough to kill us.

Founder or agent may refresh this file in a paper PR. Do not refresh by inventing ranks.
