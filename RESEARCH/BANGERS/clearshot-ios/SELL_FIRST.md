# SELL_FIRST — ClearShot iOS

**Rule:** nobody writes Swift until the kill bar is scored. This file is the experiment.

**Checkout:** `PAYMENT_URL` — placeholder only. Founder replaces it. Agents never invent a Stripe, Apple, Lemon, or crypto link.

---

## 1. Why sell first

The parent market is loud and distrusted. Building a PhotoKit app to “see if people want it” burns a Developer account cycle and a month of review risk on a category Apple already watches for misleading cleaners ([App Review 2.3.1](https://developer.apple.com/app-store/review/guidelines/) — marketing must match function; virus/malware-scanner theater is called out).

A landing page plus a real charge answers one question: **will five humans pay for screenshots-first + on-device + no scare** in two weeks?

If they will not, Gemini and the native Screenshots album already won. Kill is cheaper than a binary.

---

## 2. What the buyer is buying

They are **not** buying a TestFlight unless the founder later says so.

They **are** buying a **reserve unlock**:

> You are first in line for ClearShot — an iPhone app that lists your Screenshots album, shows a real count, and deletes only what you confirm. Work stays on the device. There is no “storage critical” theater. If we kill the product, you get a refund of the reserve.

Refund policy (founder publishes on the landing, not here as legal advice):

- Kill → full refund of reserve.
- Ship → reserve converts to the App Store unlock (or a promo code). StoreKit vs external pay is a **later** 3.1.1 problem; sell-first is a **website** checkout, not an app IAP.

Do not promise a ship date. Promise a **decision date**: 14 days after the clock starts.

---

## 3. Price hypothesis (not a live SKU)

| Option | Band | Use |
|--------|------|-----|
| **A — default** | **$9** one-time reserve | Matches “job that can finish.” Easy to explain. |
| B | $7 | If A feels heavy in the first 48h of founder conversations (not A/B theater). |
| C | $12 | If five people say “that’s cheap for getting off a $50/year cleaner.” |

**Not the sell-first default:** $4.99/week, $9.99/month, 3-day trials, or any “unlock to see results” pattern. That is the category’s scareware shape.

Apple IAP pricing is BUILD_LATER. Do not put a StoreKit product id in this folder.

---

## 4. Landing (minimum page)

One scroll. English. Paper/ink is allowed (MW tokens) but **not required** — this is not the MW PWA. No Train. No Coach.

### 4.1 Above the fold

- **Name:** ClearShot
- **Line:** Screenshots first. On your iPhone. No scare screens.
- **Proof of honesty (three chips):** On-device · You confirm every delete · Recently Deleted still works
- **CTA 1:** `Reserve unlock — $9` → `PAYMENT_URL`
- **CTA 2:** `Email me when it’s real` (waitlist; **not** a paid intent)

If `PAYMENT_URL` is still the placeholder, CTA 1 is **disabled** or hidden. Shipping a button that 404s is a lie.

### 4.2 What it does (6 lines, no adjectives we cannot keep)

1. Reads the Screenshots the system already filed (Photos → Albums → Screenshots).
2. Shows **how many** — the number comes from the library after you allow Photos, not from a spinner of doom.
3. Lets you keep / delete in a review list (later: swipe). Delete uses the **system** confirm.
4. Deleted items land in Recently Deleted for ~30 days.
5. Nothing is uploaded to us.
6. We cannot clear iOS “System Data,” other apps, or RAM. We do not claim to.

### 4.3 What it does not do (required; this *is* the wedge)

- No fake “87% storage critical” meter.
- No virus / malware scanner copy (Guideline 2.3.1).
- No “boost,” “RAM,” “optimizer,” “speed up your iPhone.”
- No weekly trial that converts while you are in the gym.
- No paywall on the **count**. The count is the honesty proof.

### 4.4 FAQ (short)

| Q | A |
|---|---|
| Is this Gemini / Cleanup? | No. Screenshots first. They do the whole kitchen. |
| Why not the built-in album? | You can. Most people do not. We are a review pass, not a new place photos live. |
| Will you see my photos? | Sell-first: we see an email and a payment, not your library. App: PhotoKit on-device; privacy policy will say Data Not Collected for photo bytes. |
| iCloud? | Deleting screenshots can reduce iCloud Photos use. We do not sell iCloud. We do not promise a GB number on the landing unless it is labeled **example**. |
| MW? | Separate product. This page does not enroll anyone in Super Bundle. |

### 4.5 Footer

Privacy (short), refund (kill = refund), `PAYMENT_URL` not linked if placeholder, founder contact. No invented user counts.

---

## 5. Copy blocks (ready to paste)

**Headline:** Clear the Screenshots album. Keep the memories.

**Sub:** ClearShot is a screenshots-first iPhone cleaner. On-device. You confirm every delete. No fake “storage critical” screens.

**Button:** Reserve unlock — $9

**Tweet-length:** Your iPhone already files screenshots in their own album. ClearShot is a review pass for that album — on-device, no scareware. $9 reserve. `PAYMENT_URL`

**Honest constraint line (must appear near the price):** This is a reserve, not an App Store download. If we kill it in 14 days, you get the $9 back.

Do not use: *boost, RAM, virus, deep clean, optimizer, “last chance,” countdown clocks, “your phone is in danger.”*

---

## 6. The 14-day clock

### 6.1 Start conditions (all required)

1. Landing is public (any host; not necessarily MW Vercel).
2. `PAYMENT_URL` is a **live** checkout that can take $7–$12.
3. Founder has sent the **first** traffic (personal graph, post, or paid — founder-owned).
4. A tally sheet exists (spreadsheet is fine): date, person, amount, refunded Y/N.

Agents do not start the clock. Agents do not mark founder tasks done.

### 6.2 Daily log (founder)

| Day | Visits (approx) | Emails | Paid intents | Notes (verbatim objections) |
|-----|-----------------|--------|--------------|-----------------------------|
| 1–14 | | | | |

One row per day. Objections are the only qualitative that matters (“I can just select-all in Photos,” “I want video,” “I won’t pay until TestFlight”).

### 6.3 Score at 14

See [FRAMEWORK.md](FRAMEWORK.md) §7.

| Score | Do |
|-------|----|
| &lt;5 paid | Kill. Refund. Do not build. |
| 5–14 | One copy or price change. One more 14-day clock. Second miss = kill. |
| ≥15, or ≥5 with written urgency from payers | Pass → BUILD_LATER |

### 6.4 What does **not** count

- Waitlist emails.
- “I’d pay if it existed.”
- Agent-invented numbers.
- MW Super Bundle checkouts.
- Family members who were handed the phone and told to click (if they would not have paid unprompted, note it; do not hide it).

---

## 7. Channels (founder-owned)

Ranked by honesty, not by fantasy CAC:

| # | Channel | Why | Do not |
|---|---------|-----|--------|
| 1 | Founder’s own iPhone-using graph (text, not a blast) | Fastest path to 5 true pays | Script a “viral” TikTok as a substitute for the ask |
| 2 | Public post (X / notes) with the honest-constraint line | Filters for people who hate scareware | Fake before/after GB |
| 3 | Reddit / forums **only** if the post is a question + landing, not astroturf | Category users are already angry at cleaners | Shill reviews |
| 4 | Apple Search Ads | **After** a binary exists and rating ≥4.3 with ≥50 ratings ([ASOhack 2026](https://asohack.com/blog/aso-for-cleaning-storage-apps)). Not sell-first. | Buy ASA against a landing-only “app” |
| 5 | Product Hunt / directories | Optional after pass | Launch a vapor binary |

Sell-first **is** the personal graph + one public URL. If that cannot get 5 pays, ASA will not save a vapor product.

---

## 8. ASO as ad copy (pre-binary)

We cannot rank in the App Store without an app. We **can** steal listing language for the landing and for the day a binary exists. Closed keyword set for **this** wedge (see SOURCES for difficulty notes):

**Use (landing + future listing):**

- screenshot, screenshots, screenshot cleaner
- photo cleaner *(parent; secondary)*
- free up space, storage *(outcome; never “boost”)*
- declutter, Screenshots album

**Do not use (policy + honesty):**

- boost, RAM, speed, optimizer, virus, malware, cache cleaner, deep clean, “make your iPhone faster”

**Title / subtitle sketch (30/30, for later Connect, not for this PR):**

- Title: `ClearShot: Screenshot Cleaner` (29)
- Subtitle: `On-device. You confirm.` (23) — or `Free up screenshot clutter` (27)

**Keyword field sketch (100 chars, commas, no title repeats):**

`screenshots,storage,free space,declutter,photo cleaner,album,review,delete,iphone photos`

Revisit every 60–90 days **after** ship (ASOhack). Not a sell-first task.

**Store screenshot story (later, not now):**

1. Real Screenshots album count — or a still labeled **DEMO**.
2. Review list with Keep / Delete, system-confirm implied.
3. “On-device. No upload.”
4. “We do not clean System Data or RAM.”

First store shot is **not** a red warning gauge.

---

## 9. Measurement hygiene

- Do not invent traction in `CONTEXT.md`, this folder, or social.
- Do not add pixels that exfiltrate photo thumbnails.
- A waitlist form may collect **email + optional “about how many screenshots?”** (self-report). That is not Photos access.
- If analytics exist on the landing, they are page views + CTA clicks. No fingerprint theater.

---

## 10. Kill checklist (when the number loses)

1. Refund every paid intent.
2. Email waitlist: killed, why (one sentence: not enough paid demand in 14 days).
3. Mark [INDEX.md](INDEX.md) status **killed** in a follow-up PR.
4. Do not keep a zombie “coming soon” that still charges.
5. Do not pivot this folder into a general Gemini clone without a **new** FRAMEWORK and a **new** clock.

---

## 11. Founder-only (agents do not check these off)

- [ ] Replace `PAYMENT_URL` with a real checkout.
- [ ] Publish the landing.
- [ ] Send the first asks.
- [ ] Run the 14-day tally.
- [ ] Score kill / thin-continue / pass.
- [ ] EIN / entity / refunds ops as required by the payment rail.

---

## 12. Agent-only (this PR and next paper PRs)

- [x] Write this pack.
- [ ] If founder asks: static landing **copy only** in a later PR (still no live URL).
- [ ] Never wire StoreKit, Stripe secrets, or MW mute-pay to this bet.
- [ ] Never start `apps/ios` from this track.
