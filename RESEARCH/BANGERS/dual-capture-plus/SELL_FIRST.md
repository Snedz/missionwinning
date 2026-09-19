# Dual Capture+ — sell first

**This file owns money, the clock, and the kill.** Framework owns the product definition. Agents do not start [SPIKE_PLAN.md](SPIKE_PLAN.md) from this page unless the PASS row below is true.

Constitution: [FRAMEWORK.md](FRAMEWORK.md). Lander copy: [LANDER_DRAFT.md](LANDER_DRAFT.md). Sequence: [HOW_IT_GETS_DONE.md](HOW_IT_GETS_DONE.md).

---

## 1. Why sell before build

The capability is not a secret. Apple documented `AVCaptureMultiCamSession` in 2019. DoubleTake and RØDE Capture already ship split / PiP / two files on A12-class phones. Apple Dual Capture just made the **search term** free.

Building first would spend a day of MultiCam thermal debugging to discover that people who wanted this already installed a free app. **A lander with a price discovers that in two weeks without an `.ipa`.**

Sell-first is not a vibe. It is this bar:

> After the public lander has a **working** checkout (`PAYMENT_URL` replaced by the founder), if **fewer than 5 cold pays** land in **14 days**, the track is **KILL**. Refund. No spike. No “we were so close.”

Five is not a business. Five is the smallest number that is not the founder and two polite friends. If Dual Capture+ cannot get five strangers to pay $9 after Apple spent a keynote teaching the category, it cannot get App Store featuring.

---

## 2. Offer (one SKU)

| SKU | Price (USD) | What they buy | When charged |
|-----|-------------|---------------|--------------|
| **Founder preorder** | **$9** | Lifetime unlock of the Dual Capture+ iOS app **if it ships**, plus TestFlight when a binary exists | **Now**, via founder checkout |
| **Street (App Store, if we ship)** | **$14.99** one-time | Same unlock, bought in-app / paid listing | After App Review |
| Subscription | **None in v0** | — | Do not add a $2.99/mo to “make the bar easier” |

**Why $9 / $14.99**

- Below impulse-kill for a camera utility; above “I didn’t notice I subscribed.”
- $9 is a **preorder discount** vs $14.99 street so the lander has a reason to pay *now*.
- RØDE Capture is $0. If $9 does not clear five cold pays, a $4.99 SKU will not save the thesis — it will only prove people will not pay for this name. Do not discount the bar; kill.

**What $9 is not**

- Not Mission Winning Super Bundle.
- Not a deposit on MW iOS.
- Not equity.
- Not a guarantee of 4K HDR dual, ProRes, or a ship date.

**What $9 must say on the lander (legal-plain, not counsel):**

- This is a **preorder of software that does not exist yet**.
- Device floor: **A12+ iPhone** (XS / XR and later) **or** iPad Pro A12X+; record still requires `isMultiCamSupported` at runtime.
- Not affiliated with Apple. Not the stock Dual Capture button.
- If the track is **KILL**, **full refund** of the preorder within 14 days of the kill date (founder executes; see §7).
- If the track is **PASS** and the app never ships within **90 days of PASS**, founder refunds or ships a dated written delay with a new refund-by date. Do not silently sit on the money.

Founder pastes the real checkout into the lander as `PAYMENT_URL`. **Agents do not invent Stripe Payment Links, Lemon Squeezy, Gumroad, PayPal.me, or treasury addresses.**

---

## 3. Cold pay (closed definition)

A **cold pay** is a completed charge that meets **all** of:

1. **Unique payment identity** — unique card fingerprint / unique processor customer id. Same human, two cards = one cold pay.
2. **Not the founder.** Not a card the founder can see in a household wallet.
3. **Not solicited as a counter.** A DM that says “buy so we hit five” is a **warm pay**. It may be accepted as money; it **does not increment the bar**.
4. **Arrived from a public surface** — lander URL, search, social post that does not name the recipient, App Store pre-order page (if used later). A Slack to five friends is warm.
5. **Not refunded** before the clock ends. A refunded charge is removed from the count the hour it reverses.
6. **Gross $9 (or more if the founder later raises the SKU).** A $1 “test charge” is not a cold pay.

**Warm pays** (founder, household, asked friends) are logged in a private note, never in this public repo as a vanity count, and **never** written into `CONTEXT.md`.

**Do not invent a count.** Until the founder writes a number into a private ops note, the public count is **unknown**, not zero-as-proof and not five-as-hope.

---

## 4. The 14-day clock

| Event | Effect |
|-------|--------|
| Lander is public **and** `PAYMENT_URL` charges a real card | **T0** — clock starts. Date is founder-stamped in a private note |
| Lander public, checkout still `PAYMENT_URL` or a 404 | Clock **has not started**. Traffic is not a test |
| Day 14 23:59 in the founder’s local timezone | Clock **stops**. Count cold pays with `created ≤ T0+14d` |
| **Cold pays ≥ 5** at any time before day 14 | **PASS (early).** Spike may start the same calendar day |
| **Cold pays &lt; 5** at clock stop | **KILL** |
| Checkout breaks for ≥24h during the window | Clock **pauses** for the downtime; founder extends the end date by the paused hours. Do not “quietly” ignore a dead link |

**Channels allowed during the 14 days** (founder, not agents inventing ads):

- Personal social, niche Discords / subreddits **without** fake-user astroturf
- A single lander URL, UTM optional
- Search: “Dual Capture iPhone 16”, “Dual Capture two files”, “Dual Capture split screen”

**Channels forbidden during the 14 days**

- Paid ads (MW rule of no paid ads before week-4 does not apply to this SKU, but **this track still forbids ads during the kill window** — ads would buy a false PASS)
- Buying five gift-card redemptions
- App Store paid UA

---

## 5. PASS / KILL / HOLD

| Result | Meaning | Next |
|--------|---------|------|
| **PASS** | ≥5 cold pays inside the (possibly paused) 14-day window | [SPIKE_PLAN.md](SPIKE_PLAN.md) starts within **24 hours**. Then [BUILD_LATER.md](BUILD_LATER.md) MVP |
| **KILL** | &lt;5 cold pays | Refund §7. Folder stays. No binary. No “v2 lander with new headline” in the same 14 days |
| **HOLD** | EIN / processor / counsel blocks taking the dollar | Clock does not start. Paper may still be edited. Do not fake a Stripe |

A second 14-day clock on a rewritten lander is a **new founder decision**, not an agent default. One rewrite maximum, and only if the first run’s traffic was ~zero (broken link, lander not actually public). A lander that was seen and not paid is information. Do not A/B it into a pass.

---

## 6. What we are testing (so we do not move the goal)

The lander tests **one claim**:

> Strangers will pay $9 *now* for Dual Capture that works on A12+ and writes **two files / split / swap**, because stock Dual Capture is 17-only and one-file PiP.

It does **not** test:

- Whether MultiCam thermal is solvable (that is the spike)
- Whether App Review accepts the name “Dual Capture+”
- Whether 4K dual is possible on a 15 Pro
- Whether Mission Winning users want a camera

If someone pays and then emails “I thought this was the Apple button,” that is a **copy bug**. Refund them. Do not count them as product-market fit. Fix the lander before restarting a clock (founder call).

---

## 7. Refunds and money hygiene

| Case | Action |
|------|--------|
| KILL | Refund **every** preorder (cold and warm) within **14 days of KILL** |
| Buyer remorse before ship | Refund on request — preorder goodwill. Remove from cold-pay count |
| PASS then slip past 90 days with no binary | Refund or published new date + refund-by |
| Chargeback | Treat as refunded; do not fight a $9 preorder as if it were a subscription |

Processor, tax, and entity are **founder-owned**. This pack does not pick Stripe vs Lemon vs Apple Small Business. It forbids collecting money into a personal handle that cannot refund.

Do not write live payout account numbers, wallet addresses, or Payment Link URLs into this repo. `PAYMENT_URL` is the only checkout token that may appear in git.

---

## 8. Merchandising rules (so sell stays honest)

**Must show**

- Device floor (A12+ / runtime MultiCam)
- vs Apple Dual Capture in one table or four bullets ([LANDER_DRAFT.md](LANDER_DRAFT.md))
- Two-files + split + swap
- $9 now / $14.99 later
- Preorder + refund-if-killed
- `PAYMENT_URL` as the only CTA

**Must not show**

- “4K Dolby Vision Dual Capture” as *our* spec (that is Apple’s 17 stock line)
- “Works on every iPhone”
- Fake star ratings, fake “2,400 creators,” fake countdown inventory
- Competitor dunking that we cannot source ([SOURCES.md](SOURCES.md))
- MW Super Bundle, crypto rails, or Kalligator

**Name risk:** “Dual Capture” is Apple’s feature name. The lander says **not affiliated**. Final App Store name is a later trademark/Review problem. Working name in this folder stays Dual Capture+. A rename does not reset a failed clock.

---

## 9. Founder scoreboard (private)

Keep off git:

```
T0 (ISO date, lander+checkout live):
T_end:
Cold pays (unique processor ids):
Warm pays (excluded):
Refunds:
PASS / KILL / HOLD:
```

Public repo stays at “clock not started” until the founder chooses to write a non-invented result into this file in a later PR.

---

## 10. Agent stop-rule

If a prompt says “just stub the SwiftUI shell while we wait for pays”:

> **No.** Sell bar is red. Spike is illegal. Edit paper or stop.

If a prompt says “set PAYMENT_URL to a Lemon demo”:

> **No.** Founder pastes a real link. Do not invent one.
