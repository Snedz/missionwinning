# Dual Capture+ — how it gets done

End-to-end sequence from this paper pack to either a refund pile or a TestFlight. **No step invents a payment URL or commits an app binary to this repo.**

Owners: **Founder** (money, clock, lander host, Xcode, App Store). **Agents** (paper, later: spike assistance *after* PASS, never checkout).

---

## 0. Already done (this pack)

| Object | File |
|--------|------|
| Definition vs Apple Dual Capture | [FRAMEWORK.md](FRAMEWORK.md) |
| Price + kill bar | [SELL_FIRST.md](SELL_FIRST.md) |
| Lander prose | [LANDER_DRAFT.md](LANDER_DRAFT.md) |
| Spike recipe | [SPIKE_PLAN.md](SPIKE_PLAN.md) |
| Sources | [SOURCES.md](SOURCES.md) |
| Agent checklist | [CURSOR_TODO.md](CURSOR_TODO.md) |

---

## 1. Founder: checkout (blocks the clock)

1. Pick a processor the founder can **refund from** (Stripe Payment Link, Lemon Squeezy, etc.). Entity / EIN constraints are the founder’s; if money cannot be taken legally, **HOLD** — do not start the clock.
2. Create a **$9 USD** one-time product named Dual Capture+ Founder Preorder.
3. Success page: “You’re in. If we kill the track, you get a refund. If we build, you get the app.”
4. Copy the live URL.
5. Paste it into the hosted lander **only**. In git the token remains `PAYMENT_URL`.
6. Place a $9 **founder** test charge and refund it. That test is **warm** and does not count.

Agents never paste a guessed `https://buy.stripe.com/...` or similar.

---

## 2. Founder: host the lander

The draft is markdown/HTML-ready prose in [LANDER_DRAFT.md](LANDER_DRAFT.md). Host wherever the founder already controls a hostname (Carrd, a single `sites/` page the founder adds later, a Notion public page). Requirements:

- One URL
- CTA is the real checkout
- vs-Apple table intact
- A12+ + refund-if-killed intact
- No fake social proof

Do **not** put the lander on www.missionwinning.com as a nav item. This is not the wedge. A hidden `/dual-capture` on a personal domain is enough.

When **URL is public** and **checkout charges**, stamp **T0**. Clock rules: [SELL_FIRST.md](SELL_FIRST.md) §4.

---

## 3. Founder: 14 days of selling (not building)

Daily, 15 minutes:

- Is checkout alive? If not, pause the clock.
- How many **cold** pays (processor unique ids)?
- One public post max per day. No ads. No “please buy so we hit five.”

Agents may rewrite lander copy **only if** the founder pastes actual objections (“I thought this was free on my 16”). They may not start Xcode.

At T_end or at 5 cold pays:

| Result | Founder does |
|--------|----------------|
| **KILL** | Refund all. Write KILL + date into a later paper PR if desired. Stop |
| **PASS** | Start [SPIKE_PLAN.md](SPIKE_PLAN.md) within **24 hours** |

---

## 4. After PASS: one-day spike (not this repo)

Location: founder Mac, separate directory, **not** `apps/` in Mission Winning.

Path:

1. Download **AVMultiCamPiP** from Apple’s doc page ([SOURCES.md](SOURCES.md) §1).
2. Run on an **A12+ physical device** (simulator is not MultiCam).
3. Execute the accept bars in `SPIKE_PLAN.md`.
4. Write results (formats, `hardwareCost`, thermal) into a note. Optional later PR into this folder as `SPIKE_RESULTS.md` — facts only, no secrets.

**Spike FAIL** (cannot record two cameras, cannot write two files, thermal death at 30s on every device): treat as product FAIL. Refund. Do not “build around it” for a month.

**Spike PASS:** v1 scope in [BUILD_LATER.md](BUILD_LATER.md). Still no monorepo binary.

---

## 5. After spike PASS: smallest ship

1. New private git (founder). Dual Capture+ is not AGPL’d into MW by accident.
2. Implement MVP list in `BUILD_LATER.md`.
3. TestFlight to preorder emails (founder sends; agents do not scrape).
4. App Store paid listing or IAP — founder + 3.1.1 ([BUILD_LATER.md](BUILD_LATER.md) §7).
5. Redeem preorders without teaching the app to hit a random web unlock API if that violates IAP. Coupon / paid app is the conservative path.

---

## 6. Role split

| Task | Founder | Agent |
|------|---------|-------|
| Flip MW `PRIVATE_MODE` | Only founder (unrelated; never for this track) | Never |
| Create `PAYMENT_URL` | Yes | No |
| Stamp T0 / count cold pays | Yes | No (do not invent) |
| Edit paper / lander draft | Yes | Yes |
| Xcode / device spike | Yes (owns the phone) | Assist **after** PASS, still off-repo |
| App Store Connect | Yes | No |
| Commit `.ipa` / Xcode proj here | No | No |
| Name Apple / DoubleTake / RØDE in `src/` | No | No |

---

## 7. Time box (effort, not a calendar promise)

| Phase | Bound |
|-------|--------|
| This paper | Done in the research PR |
| Checkout + host lander | Founder, hours not days of engineering |
| Sell window | **14 days** then a binary decision |
| Spike | **≤1 working day** after PASS |
| v1 after spike | Small Swift app. If it grows a LUT browser, it has left the track |

Do not publish a ship date on the lander other than “if we build, TestFlight follows a one-day spike.” Specific dates become refunds.

---

## 8. Failure modes (and the move)

| Failure | Move |
|---------|------|
| Nobody clicks | KILL. Category name was not enough |
| Clicks, no pays | Copy or price. **One** founder rewrite max; else KILL |
| Pays, spike cannot MultiCam | Refund. API is not the product if it will not run |
| Pays, App Review rejects the name | Rename. Thesis intact |
| Pays, Review rejects external unlock | Paid listing; refund anyone who refuses the new path |
| Agent opens `apps/ios/` in this repo | Revert. Read [INDEX.md](INDEX.md) |

---

## 9. Done / not done

**Done for this PR:** a founder can paste `LANDER_DRAFT.md`, replace `PAYMENT_URL`, and run the clock without asking an agent what Dual Capture+ is.

**Not done:** a product. A checkout. A count. A spike. An App Store page.
