# SPIKE_PLAN — ClearShot iOS

Falsifiable spikes. **None of these start before FRAMEWORK §7 pass** (or a founder override written in this file).

Paper-only work that may run **before** pass is listed in §0. It is not Swift.

---

## 0. Pre-pass (paper / founder)

| ID | Spike | Falsifier | Output |
|----|-------|-----------|--------|
| P0 | 14-day sell-first | &lt;5 paid intents | Kill. No S1. |
| P1 | Keyword harvest in a free ASO tool (optional) | Head terms only, no screenshot-cleaner volume | Do not change the wedge to “photo cleaner” to chase volume. Note it here. |
| P2 | Re-read Screenshot Cleaner AI + Gemini listings | Neighbor already **is** honest + screenshots-only + cheap | Tighten our reserve offer or kill. Do not clone OCR as v1. |
| P3 | Native album dogfood (founder, 10 minutes) | Founder clears the album without pain | Wedge is weak; say so in the tally. |

P1–P3 do not unlock S1.

---

## 1. Post-pass order

```
S1 fetch → S2 limited honesty → S3 delete → S4 copy denylist → S5 StoreKit
```

One spike per PR. Sibling repo preferred ([HOW_IT_GETS_DONE.md](HOW_IT_GETS_DONE.md) §6). Simulator is enough. No TestFlight until S3 is green.

---

## S1 — Screenshot fetch

**Question:** Can we list screenshot assets with a count that matches Photos → Screenshots (± iCloud pending)?

**Build:** Throwaway SwiftUI screen. `requestAuthorization(for: .readWrite)`. Fetch `.photoScreenshot` **and** `smartAlbumScreenshots`. Print both counts and a 20-thumbnail grid.

**Pass:**

- Full access: counts agree within a documented reason (iCloud hold, burst, or subtype-only vs album-only). Write the reason down.
- Non-screenshot camera photos do not appear.
- Time to first grid on a 2k-screenshot library is usable (founder’s phone or a fixture library). If it is not, v1 is a progress + pagination design, not a rewrite of Gemini.

**Fail:**

- We cannot tell screenshots from photos without a cloud API.
- We need to upload pixels to classify “is screenshot.”

**Not in S1:** delete, IAP, OCR, swipe chrome.

---

## S2 — Limited library honesty

**Question:** Does `.limited` make us lie?

**Build:** Same app. Force Limited. Show the exact strings we will ship.

**Pass:**

- UI says **visible count**, not “your iPhone has N screenshots,” unless we have full access.
- Button presents `presentLimitedLibraryPicker`.
- Adding Screenshots album items updates the count via `PHPhotoLibraryChangeObserver`.
- Denied: no invented number.

**Fail:**

- Any code path that interpolates a random or cached “storage %.”
- Copy that says “full scan complete” under Limited.

**Falsify the test:** a mutant string `full device scan complete` in the Limited state must fail CI (when CI exists).

---

## S3 — Delete → Recently Deleted

**Question:** Does our delete path match iOS?

**Build:** Select 1–3 screenshots. Summary sheet. `deleteAssets`. Confirm **system** alert appears.

**Pass:**

- Items leave the app list after success.
- Items appear in Photos → Recently Deleted.
- Recover in Photos restores them; observer updates us.
- We never claim GB is free until Recently Deleted is emptied (copy check).

**Fail:**

- Silent delete, custom “confirm” that skips the system sheet, or deleting a non-screenshot.

**Not in S3:** batch 10k without pagination; emptying Recently Deleted ourselves (we cannot / should not).

---

## S4 — Honest-copy denylist

**Question:** Can a reviewer or user find scareware language?

**Build:** Static list in code + landing markdown. Scan UI strings and Info.plist usage description.

**Closed denylist (must match SOURCES §6.3):**

`boost`, `RAM`, `speed up`, `optimizer`, `virus`, `malware`, `deep clean`, `make your iPhone faster`, `storage critical`, `threats found`

**Pass:** zero hits in product strings. Usage description names **screenshots** and **delete**.

**Fail:** paywall or onboarding uses a red danger meter.

This spike can be a unit test **before** pretty UI.

---

## S5 — StoreKit one-time (after S1–S4)

**Question:** Can we unlock “unlimited screenshot review” without a scare paywall?

**Build:** StoreKit 2 configuration file. Free: count + first page (e.g. 20). Paid: rest of the list / batch select. Product name: “ClearShot unlock” — not “Remove virus.”

**Pass:**

- Count visible before purchase.
- Restore Purchases works.
- No weekly product in the config.

**Fail:**

- Unlock required to see N.
- Intro offer that looks like the category’s $7/week pattern.

**Founder:** creates the real product id in Connect. Agents use StoreKit testing.

---

## 2. Explicitly deferred spikes

| Idea | Why not now |
|------|-------------|
| `VNRecognizeTextRequest` OCR index | Neighbor already ships it; payers must ask. |
| Perceptual hash duplicates | Parent-market gravity. New FRAMEWORK. |
| Screen recordings | Separate fetch; easy to over-claim. |
| Video-by-size | Different JTBD (GB, not inbox-zero). |
| Host `utility.clearshot` | MW platform paper. |
| Android MediaStore | New track. |

---

## 3. Spike notes (empty until run)

| ID | Date | Result | Evidence |
|----|------|--------|----------|
| S1 | — | not started | |
| S2 | — | not started | |
| S3 | — | not started | |
| S4 | — | not started | |
| S5 | — | not started | |

Do not fill these with hypothetical “would pass.”
