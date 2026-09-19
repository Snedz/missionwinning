# FRAMEWORK — ClearShot iOS (BANGERS 02)

**One sentence:** ClearShot is a screenshots-first iPhone cleaner that shows a real count, deletes only what you confirm, and never pretends the phone is dying.

**Status:** Paper. Sell-first not started. `PAYMENT_URL` is the literal placeholder token.

**Kill bar:** fewer than **5 paid intents in 14 days** after a live `PAYMENT_URL`. Soft interest does not save the track.

---

## 1. Claim

iPhone storage anxiety is real. The **Photos library** is the only third-party-accessible pile that actually moves the needle. Inside that pile, **screenshots** are the high-frequency, low-sentimental, already-albumed subset: iOS already files them under Albums → Media Types → Screenshots; people still do not clear them because the native album is a grid of guilt, not a review.

Parent-market apps (photo / storage cleaners) try to be Gemini: duplicates + similars + blur + videos + contacts + “secret space.” That kitchen sink trains users to expect **scareware** — fake “critical storage,” weekly trials, RAM/speed lies. The opening is a **narrow, honest** tool:

1. **Screenshots first** — not the whole camera roll.
2. **On-device** — PhotoKit + local Vision if we ever add OCR. No photo upload.
3. **Honest unlock** — pay for a capability (batch, search, keep-vault). Never pay to “stop the threat.”

If five people will not pay for that sentence in 14 days, the wedge is wrong. Do not build the app to find that out.

---

## 2. Two ClearShots (do not collapse)

| Thing | What it is | What this track is not |
|-------|------------|------------------------|
| **MW `utility.clearshot`** | Reserved mini. `mission://minis/clearshot`. Scopes: `identity.read`, `photos.read`, `photos.write`, `storage.write`. No product UI. Play id reserved `com.missionwinning.clearshot`. Paper in `docs/contracts/MODULE.md`, `packages/mw-core`, `src/lib/mission-os/clearshot.ts`. | Not this bet. Do not implement mini chrome. Do not start `:minis:clearshot`. |
| **BANGERS ClearShot iOS** | Standalone App Store **sell-first** bet. Screenshots-first cleaner. This folder. | Not the MW iOS wedge ([docs/IOS_PLAYBOOK.md](../../../docs/IOS_PLAYBOOK.md) stays deferred). Not Train. Not Coach. |

If sell-first **passes**, a later founder call picks the binary home: new standalone SwiftUI app (own bundle, own App Store Connect record) **or** a future host-mini. That call is **after** money. Default assumption for BUILD_LATER: standalone iOS app, not `apps/ios` MW playbook, not the Android Play id.

Agents do not mint a bundle id in this pack.

---

## 3. Wedge (closed set)

| Law | Means | Violated by |
|-----|-------|-------------|
| **Screenshots-first** | Default scan is `PHAssetMediaSubtype.photoScreenshot` and/or the Screenshots smart album. Camera-roll duplicates, blur, and video are later doors. | Shipping a general “photo cleaner” as v1. |
| **On-device** | Enumeration, thumbnails, optional OCR, and delete requests stay on the phone. Privacy Nutrition Labels: Data Not Collected for photo bytes. | Any upload of library assets “for AI.” |
| **Honest unlock** | Free path: permission → real count → review a subset → system delete confirm → Recently Deleted. Paid path: extra capability, priced in the open. | Scare meters, fake “critical,” fake virus, fake cache %, countdown to “storage death,” locking the scan behind pay, weekly dark-trial. |
| **PhotoKit is the product** | iOS will not let a third party clean system cache, Messages, or other apps. We say so. | “Phone cleaner / boost / RAM / optimizer / deep clean.” |
| **User confirms every delete** | `PHPhotoLibrary.performChanges` + system alert. Recover in Recently Deleted (~30 days). | Auto-delete, “one tap empty device,” suppressing the system sheet. |

These five are the product. Features that break one are not “iteration”; they are a different app.

---

## 4. Parent market

**Category (store):** Utilities and/or Photo & Video — iOS **photo / storage cleaners**.

**Job-to-be-done:** “I am out of space or out of iCloud, and I know my Screenshots album is junk, but I will not sit in the native grid for 40 minutes.”

**Incumbents (named because they are this category, not fitness intel):**

- Kitchen-sink cleaners: Gemini Photos (MacPaw), Cleanup: Phone Storage Cleaner, Cleaner Pro, Smart Cleaner, CleanMyPhone.
- Gesture cleaners: swipe-to-keep / swipe-to-delete photo apps.
- Screenshots-only neighbor: Screenshot Cleaner AI (on-device OCR, review-first). Closest wedge, not a reason to copy scare.
- **Free native:** Photos → Screenshots album + Select. The real competitor for a lazy user.
- **Paid native:** iCloud+ 50 GB / 200 GB / 2 TB. Many “storage” purchases are Apple’s, not a cleaner’s.

**Why a wedge can exist:** incumbents are diffuse (ASO + review corpus: users distrust subscriptions and fake scans). Long-tail (“screenshot cleaner,” “similar screenshot cleaner”) is thinner than “photo cleaner” / “iphone storage cleaner.” Honesty is a positioning asset in a category trained on scams — see SOURCES.

**Why a wedge can die:** native album is free; screenshot bytes are smaller than 4K video (often ~4% of library storage vs 10–15% of item count); Gemini already has a Screenshots bucket; Screenshot Cleaner AI already claims the exact niche. **That is why we sell first.**

---

## 5. Buyer (ICP)

| In | Out |
|----|-----|
| iPhone user who has opened Settings → General → iPhone Storage and seen Photos as the fat row | User who wants a Mac Gemini clone (full similar-photo AI) |
| Person who screenshots receipts, maps, chats, boarding passes, “save this story” | Person who wants a hidden vault / secret space (that is a different trust product) |
| Person who has been burned by a $7/week “cleaner” | Enterprise MDM / family-control |
| English US storefront first (ASO + sell-first copy) | Locale farm, Android v1, MW athlete |

Beachhead of 10 (sell-first, not App Store): people the founder can text who will **pay** to reserve, not “yeah I’d use that.”

---

## 6. Offer (what is for sale before a binary exists)

See [SELL_FIRST.md](SELL_FIRST.md). Summary:

- **Promise:** “ClearShot will let you review and delete iPhone screenshots on-device, with a real count and no scare screens. You are paying to reserve the unlock — not to download a TestFlight today unless the founder later adds one.”
- **Price (hypothesis, not a live SKU):** one-time reserve in the **$7–$12** band, or a clearly labeled deposit that converts to the App Store unlock. Subscription is **not** the sell-first default (a screenshot pass is a job that can complete).
- **Checkout:** `PAYMENT_URL` only. Founder replaces the token. Agents never paste a Stripe/Apple URL into this tree.

---

## 7. Kill / continue / iterate

Clock starts when **all** of these are true: public landing is up, `PAYMENT_URL` is a live checkout, and the founder has sent the first wave of traffic (own list, posts, or ASA — founder-owned).

| Result at day 14 | Action |
|------------------|--------|
| **&lt;5 paid intents** | **Kill.** Archive this folder’s status to killed. Do not start Swift. Do not “just build a spike to see.” |
| **5–14 paid intents** | **Thin continue.** One more 14-day wave with **one** copy or price change. Second miss kills. |
| **≥15 paid intents** or ≥5 **and** written “I need this this week” notes from payers | **Pass.** Open [BUILD_LATER.md](BUILD_LATER.md). Spike per [SPIKE_PLAN.md](SPIKE_PLAN.md). |

**Paid intent** = a completed checkout, refundable deposit, or founder-verified cash that maps 1:1 to a person. Email signups, starry DMs, and “waitlist” rows are **leading indicators only**.

If `PAYMENT_URL` is still the placeholder, the experiment **has not started**. Do not score a kill or a pass.

---

## 8. Horizon vs MW

| MW fact | This track |
|---------|------------|
| Horizon 0 — Alpha, mute-pay, wedge excellence | Unchanged. This pack is not a MW ship. |
| iOS lane deferred until Android Accept B + week-4 + founder open | Unchanged. Do not create `apps/ios`. |
| Agents never invent traction | Applies here. No fake “5 preorders.” |
| Fitness names INTERNAL | Do not write them in this pack. Photo-cleaner names are allowed. |

A BANGERS pass does **not** unlock MW iOS, America, or F5.

---

## 9. Non-goals (closed)

- General duplicate / similar / blur / video-fingerprint engine in v1.
- Contacts, Mail, “secret space,” charging animations, widgets-as-product.
- Scareware, fake meters, “virus scanner,” RAM/boost/optimizer copy.
- Cloud “AI cleanup.”
- Building inside the MW PWA, Train, Today, or Coach.
- Implementing `utility.clearshot` UI or Android `:minis:clearshot`.
- Starting the MW `apps/ios` playbook.
- Live `PAYMENT_URL`, EIN, or StoreKit in this PR.
- Invented ratings, MAU, or revenue.

---

## 10. Decision log

| Date | Decision | Owner |
|------|----------|-------|
| 2026-09-19 | Track 02 = screenshots-first, on-device, honest unlock. Kill &lt;5/14d. `PAYMENT_URL` placeholder. | This pack |
| — | Live checkout URL | Founder only |
| — | Kill / thin-continue / pass | Founder scores the number |
| — | Binary home (standalone vs later mini) | Founder, after pass |

---

## 11. Glossary

| Term | Means here |
|------|------------|
| **BANGERS** | Sell-first bets outside the MW wedge. This tree: `RESEARCH/BANGERS/`. |
| **Honest unlock** | Paywall is a capability, not a threat. Free scan + confirm-delete always exist. |
| **Paid intent** | Completed payment or verified cash. Not an email. |
| **`PAYMENT_URL`** | Placeholder token. Never a live checkout in git. |
| **Recently Deleted** | iOS 30-day safety net after PhotoKit delete. We cannot skip it. |
| **Limited library** | iOS 14+ user-selected subset. A cleaner that needs the Screenshots album must handle `.limited` without lying about “full device scan.” |
