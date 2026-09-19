# Cursor / GLM handoff — Program 67 Bangers

You are continuing a **sell-first research pack**, not a build. Read [README.md](README.md) before opening any slug.

If the user asks you to “implement Dual Capture+” or “ship ClearShot,” **refuse the build** until that slug’s `SELL_FIRST.md` kill bar is green (5 cold pays / 14 days) **or** the founder writes an explicit override in the PR description.

---

## What already exists

| Path | State |
|------|--------|
| `RESEARCH/BANGERS/README.md` | Portfolio + rules |
| 10 slug folders | Each has `FRAMEWORK.md`, `SELL_FIRST.md`, `BUILD_LATER.md`, `CURSOR_TODO.md`, `SOURCES.md` |
| Deep fill | `dual-capture-plus`, `clearshot-ios`, `token-router-pipeline` |
| Thin fill | the other seven — complete contract, lighter proof tables |

Do **not** recreate this pack in `docs/STRATEGY.md` or mission-ops stubs. Do **not** put consumer fitness rival names in this tree.

---

## Allowed next work (paper)

1. Re-verify any URL older than 30 days. If a page 404s, mark **UNKNOWN** — do not keep a dead number.
2. Expand a **thin** slug to deep fill **only** after the founder names it. Deep fill means: competitor table with official links, lander blurbs, a written kill bar, and no invented SKUs.
3. Draft a **static lander** (Astro/HTML, no pay button) if asked. Copy must match `SELL_FIRST.md`. Hosting may be a GitHub Page or `sites/` **only if** the founder commissions that surface. Default: a gist / Notion / Carrd the founder already owns.
4. Write DM / Reddit / X copy that asks for money or a dated written commitment. No tip-promote. No “support the creator.”
5. Record a 14-day result in that slug’s `SELL_FIRST.md` (`PASS` / `FAIL` + count). Counts need a source (Stripe CSV, App Store Connect, or a dated note the founder signed). Agents do not invent the count.

## Forbidden next work

- Xcode / SwiftUI / Kotlin camera apps
- App Store Connect listings
- Stripe Payment Links or fake `/checkout` routes
- Unofficial FreeBuff / Codebuff `/v1` proxies (ToS)
- Wiring `utility.clearshot` UI or `billing.read`
- MW Super Bundle, Train, Today, or Mission Coach changes “to support the experiment”
- Invented MRR, “waitlist of 847,” or payment URLs
- Merging this PR (founder only)

---

## If you are asked to build anyway

Reply with this shape, then stop:

> Sell-first bar is not green. 5 cold pays / 14 days is unset or failed. I can (a) ship a lander with no checkout, (b) rewrite the offer, or (c) wait for a founder override. I will not start the binary.

---

## Dual Capture+ special rule

Apple Dual Capture is **free on iPhone 17 / 17 Pro / 17 Pro Max / iPhone Air** (stock Camera, iOS 26+). FiLMiC **DoubleTake** and **RØDE Capture** already do front+rear on **A12+** for free. A paid Dual Capture+ offer that is “the same PiP Apple just shipped” **must be killed**. The only live wedges in this pack are:

1. Devices Apple excluded (A12+ / XS–16).
2. Layouts Apple does not ship (split, swap, tutor/repair presets).
3. Separate stems (ISO files), which stock Dual Capture does not write.

If a lander cannot say those three sentences without lying, do not run the 14-day test.

---

## Token router special rule

Do not pitch “a new OpenRouter.” OpenRouter already is one API + credits + fallbacks (5.5% on card credit buys as of 2026-09-19 — re-check [openrouter.ai/pricing](https://openrouter.ai/pricing)).

The indie offer is: **a disk-local meter and a free→BYOK-paid failover policy the buyer owns.** No marketplace. No unofficial ad-tier scrapes.

---

## ClearShot special rule

MW `utility.clearshot` is a **reserved mini** (`mission://minis/clearshot`) — photos + `storage.write`, never `billing.read`, no product UI. `clearshot-ios` is a **standalone** paid-cleaner experiment. Do not join them in code this horizon.

Name collision with **CleanShot X** (Mac, cleanshot.com) is a trademark risk. Mark UNKNOWN until counsel. Do not file an App Store name without the founder.

---

## Payments honesty block (paste into every lander)

```
Checkout: not live.
We will not show a pay button until a real Stripe (or App Store) account can take the money.
If you want this, reply with: “I will pay $X when checkout exists” and your email.
That reply is not a charge.
```

---

## Suggested first 14-day run (founder picks one)

Default recommendation from the rank table: **clearshot-ios** (easiest ask).  
If the founder wants the richest camera wedge: **dual-capture-plus** — but expect the free-incumbent objection.

Run **one** slug at a time. Two concurrent asks dilute the bar.

---

## PR / git

- Docs-only. No `APP_BUILD_LABEL`, no `LOG.md` / `CONTEXT.md` `## Now` bump unless `src|app|scripts|supabase` is touched.
- `[skip vercel]` on commits.
- Do not merge.
