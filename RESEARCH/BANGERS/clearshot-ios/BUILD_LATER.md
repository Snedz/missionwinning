# BUILD_LATER — ClearShot iOS

**Gate:** [FRAMEWORK.md](FRAMEWORK.md) §7 **pass** (or thin-continue that then passes). Until then this file is a contract, not a backlog to start.

**Still forbidden after a pass, until the founder says otherwise:** `apps/ios` MW playbook, `utility.clearshot` UI, Android `:minis:clearshot`, live secrets in git.

---

## 1. What v1 is

A standalone iPhone app that:

1. Requests **Photos read/write** with a usage string that names **screenshots**.
2. Enumerates screenshot assets (`PHAssetMediaSubtype.photoScreenshot` and/or the Screenshots smart album).
3. Shows a **real count** (or an explicit Limited-library explanation — never a fake full-device %).
4. Presents a review list (thumbnails via `PHImageManager`). Keep / Delete.
5. Deletes only inside `PHPhotoLibrary.shared().performChanges` so **iOS** shows the confirm sheet.
6. Relies on **Recently Deleted** (~30 days) as the undo. In-app copy says so.
7. Processes on-device. No photo upload.
8. Unlocks **honestly**: free count + review + delete of a **small** free allowance **or** unlimited delete after a one-time IAP. The paywall copy is “batch / unlimited review,” not “your storage is critical.”

v1 is **not** Gemini. Duplicates, similars, blur, video fingerprints, contacts, vaults, widgets-as-product, and OCR search are **later doors** (section 8).

---

## 2. Platform facts we do not get to wish away

| Fact | Consequence |
|------|-------------|
| Sandbox: no system cache, no other apps, no Messages | Copy and UI never claim “phone cleaner” as device-wide clean. |
| PhotoKit is the only meaningful cleaner surface | Product = library management. |
| Delete → Recently Deleted, not instant free GB | Landing and in-app must say space returns when the user empties Recently Deleted or after ~30 days. |
| Limited Photos Library (iOS 14+) | `.limited` is a first-class state. Offer `presentLimitedLibraryPicker`. Do not pretend we scanned the whole phone. |
| Guideline 5.1.1(iii) | Prefer the smallest access that still does the job. A screenshots-first app should **explain why** read/write on the library is required (delete). PHPicker alone cannot batch-delete from the smart album. |
| Guideline 2.3.1 | No malware-scanner theater. Marketing = function. |
| Guideline 2.5.1 | Public APIs only. PhotoKit for Photos. |
| Guideline 3.1.1 | Digital unlock inside the app = IAP (StoreKit 2). Website reserve is **pre-app**. Do not deep-link the website checkout from inside the iOS app as a way to skip IAP (US storefront exceptions exist; do not freelance this — founder + counsel). |
| `NSPhotoLibraryUsageDescription` | Specific: we read/write **screenshots you choose to delete**. Not “to improve experience.” |
| Privacy Nutrition | Target: Data Not Collected for photo content. If we later collect email for support, that is a **different** label. |

---

## 3. Suggested architecture (post-pass)

Default: **native SwiftUI, iOS 17+**, own Xcode project / repo decision by founder. Not React Native. Not the MW PWA. Not Expo.

```
App
├── Permission + Limited-library explanation
├── Scan (PhotoKit fetch, screenshot subtype / smart album)
├── Review (list or later swipe)
├── Commit (performChanges delete)
└── Unlock (StoreKit 2 one-time; receipt local + optional server later)
```

**On-device only:** no MW Supabase requirement. No Mission ID. No Super Bundle.

**Bundle id:** founder mints. Do **not** reuse `com.missionwinning.app`. Do **not** silently steal `com.missionwinning.clearshot` (reserved for a future Android standalone / mini). Write the chosen id in a later pack when it exists.

**Minis path (optional, later):** if the founder wants ClearShot inside Mission OS, that is `utility.clearshot` chrome — **separate** PR family, after this app exists or instead of it. Do not block v1 on a host that is paper.

---

## 4. Permission and scan

### 4.1 Authorization

- `PHPhotoLibrary.requestAuthorization(for: .readWrite)`.
- Handle `.authorized`, `.limited`, `.denied`, `.restricted`, `.notDetermined`.
- Denied: Settings deep link. No scare copy (“you will lose your photos”).
- Limited: banner — “ClearShot can only see the photos you picked. Add the Screenshots album items.” Button → `presentLimitedLibraryPicker`.
- Set `PHPhotoLibraryPreventAutomaticLimitedAccessAlert` only if we provide an in-app picker button (WWDC 2020 / 10641). Do not hide Limited.

### 4.2 Fetch

Preferred predicate (closed):

- `PHAssetMediaType.image` AND `mediaSubtypes` contains `.photoScreenshot`.

Also fetch the **Screenshots** smart album (`PHAssetCollectionSubtype.smartAlbumScreenshots`) and reconcile. Do not trust localized album titles as the only signal.

Screen recordings are **out of v1** (subtype / resource walk is a spike). Saved-from-other-apps that are **not** screenshot-subtyped are **out of v1**.

### 4.3 Count honesty

| State | Number we show |
|-------|----------------|
| Full access, fetch complete | `N` screenshots |
| Limited | `N visible` + “Limited access — not your whole library” |
| Denied | No number. No fake 2,847. |
| Demo / App Review / marketing stills | Badge **DEMO** on the number |

A progress spinner may show **assets examined**, never a red “danger %” unrelated to the fetch.

### 4.4 Thumbnails

`PHImageManager.requestImage` (fast format) for the list. Full pixels only if a later OCR door needs them, still on-device.

---

## 5. Delete path

1. User marks items (or swipes — later).
2. Summary: “Delete *k* screenshots. They go to Recently Deleted for 30 days.”
3. `PHAssetChangeRequest.deleteAssets`.
4. System alert — we do not replace it.
5. On success, drop those locals from the list. Observe `PHPhotoLibraryChangeObserver` so iCloud / other-device deletes stay consistent.
6. Do not claim GB freed until we explain Recently Deleted. Optional: estimate `k * avgBytes` as **estimate**, labeled.

Never: background delete, “empty device,” suppress system alert, delete non-screenshot assets in v1.

---

## 6. Honest unlock (IAP)

**Free forever:**

- Permission education.
- Real count (or Limited honesty).
- Review at least **a first page** (e.g. 20 items) and delete those via the system sheet.

**Paid (one-time, hypothesis $7–$12 to match the reserve):**

- Unlimited screenshot review / batch select-all-in-list (still system confirm).
- Optional later: OCR search, keep-vault (local).

**Forbidden paywalls:**

- Paying to **see the count**.
- Paying to **dismiss a scare**.
- Intro weekly prices.
- Fake countdown (“price goes up in 0:59”).
- Locking Recently Deleted recovery behind pay.

StoreKit 2. Founder creates the product in App Store Connect. Agents do not put shared secrets in git.

Reserve holders from SELL_FIRST: founder emails a promo code or honors the receipt. Mechanism is ops, not this file.

---

## 7. App Store listing (when a binary exists)

Align with [SELL_FIRST.md](SELL_FIRST.md) §8.

| Field | Rule |
|-------|------|
| Name | Brand + screenshot cleaner (30) |
| Subtitle | On-device / confirm / clutter — not boost/RAM |
| Keywords | No title repeats; no virus/boost/RAM |
| Privacy policy URL | Required. States on-device, no photo upload, delete = system Recently Deleted |
| Screenshots | Shot 1 = honest count or DEMO. No red hazard gauge |
| Review notes | Why read/write Photos; Limited handling; IAP what it unlocks |

Category: Utilities or Photo & Video. Founder picks at submit.

---

## 8. Later doors (only after v1 is used)

Each door needs its own spike and must not break wedge laws.

| Door | Why wait |
|------|----------|
| On-device OCR / search (`VNRecognizeTextRequest`) | Screenshot Cleaner AI already sells this; add when payers ask to *find* a receipt, not just delete. |
| Screen recordings | Different subtype; easy to lie about “videos cleaned.” |
| Similar / duplicate photos | Parent-market gravity. Turns us into Gemini. New FRAMEWORK if we pivot. |
| Video size sort | Real GB, different ICP (parents, 4K). New clock if it becomes the wedge. |
| Widgets | Not the product. |
| Host mini `utility.clearshot` | Platform-era. Separate contract. |
| Android | Different Photo picker / MediaStore. New track. |
| iCloud API beyond Photos | We do not sell iCloud. |

---

## 9. Test bar (when code exists)

- Unit: predicate includes screenshots, excludes a non-screenshot fixture.
- Unit: Limited state never formats a “full device” string.
- Unit: paywall copy denylist (boost, RAM, virus, critical storage).
- UI: delete path shows system confirm (simulator snapshot of *our* summary sheet, not a fake system alert).
- Falsify: a mutant that shows a random “storage %” must fail a test.

No date literals in fixtures. Discover denylist strings; do not hide them in one happy-path test.

---

## 10. Explicit non-build (even after pass)

- MW Train / Today / Coach / Fuel.
- `PRIVATE_MODE` / Super Bundle coupling.
- Scareware “scan complete: 4 threats.”
- Uploading assets to an LLM “to classify screenshots.”
- Contact merging, Mail clean, secret vault as v1.
- Starting iOS work in the MW playbook directory without a founder line.
