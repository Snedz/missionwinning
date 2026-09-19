# clearshot-ios — framework

**Claim:** People already pay for iOS screenshot cleaners (redact / blur / share-sheet). A small on-device cleaner can take 5 cold pays in 14 days **if** the lander is a share-sheet demo, not a “platform.”

**Status:** paper. **Pays:** 0. **Checkout URL:** none.

---

## Problem

iOS markup is free and weak for **privacy**: hiding names, emails, card digits, message previews, and API keys before a screenshot leaves the phone. The job is daily for support, indie devs, teachers, and anyone posting chat logs.

Mac already has a paid category-leader (**CleanShot X**). iOS has several paid cleaners (ScreenCut, Shotpop, Screenshot Editor – Blur Text). The category is **not empty**. That is good: it means strangers already buy. It is also why this is a **sell-first** test, not a greenfield invention.

---

## Buyer

| Field | Value |
|-------|--------|
| Who | People who share screenshots for work (bugs, receipts, chats, App Store reviews) and have leaked a name once |
| Job | Redact → annotate → export, from the **share sheet**, on-device |
| Not | Designers who want mockup art (that is [screenshot-stack-pages](../screenshot-stack-pages/)); Mac-only CleanShot X users |

---

## Wedge

| Must be true | Why |
|--------------|-----|
| **On-device Vision** — no upload | Shotpop and Screenshot Editor already advertise this. Matching it is table stakes, not a moat. |
| **Share-sheet first** | ScreenCut’s wedge. If the app opens as a camera roll browser, you already lost. |
| **Cleaner, not beautifier** | Blur / redact / crop / one annotation set. Mockup templates are a different SKU. |
| **One price** | Lifetime or cheap annual. The category already lists $5–50. |

Do not pitch “AI cloud redact.” That is a privacy objection and a cost center.

---

## Competitor / proof table

| Product | Platform | Listed money | Proof of paid category | Wedge vs us |
|---------|----------|--------------|------------------------|-------------|
| **CleanShot X** | Mac | Paid Mac app (see cleanshot.com — **current $ UNKNOWN without a live pricing read**) | Category-defining “hide desktop + redact” | Not iOS. Do not clone the name. |
| **Screenshot Editor – Blur Text** | iOS | Listing showed IAP including **Pro Lifetime $29.99**, plus $1.99 / $12.99 SKUs (re-open listing) | On-device text detect, blur/pixel/cover, no account, no ads | Closest peer. We need a sharper share-sheet + fewer tools. |
| **Shotpop** | iOS 18+ | Site: free; Pro **$4.99/mo · $24.99/yr · $49.99 lifetime** (shotpop.app) | Auto-redact emails/cards/keys on-device; mockups | Beautifier + redaction. Heavier than a cleaner. |
| **ScreenCut** | iOS | Site claims **70,000+ users** (marketing — not audited). IAP on listing: Premium SKUs **$5.99–$24.99** (re-open) | Share-menu editor; blur/redact/pixel | Closest distribution. Their user count is **their claim**. |
| **iOS Markup** | Built-in | Free | Always the alternative | Weak redact; no auto text hide |

**MW ClearShot mini:** `utility.clearshot` at `mission://minis/clearshot` is a **reserved stub** — photos scopes, **never** `billing.read`, no UI. It is not a competitor and not a shipped app. Do not tell buyers “it’s already in Mission Winning.”

---

## 14-day test

Easiest bar in this pack. See [SELL_FIRST.md](SELL_FIRST.md).

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Crowded IAP category | Medium | Sell a **narrow** cleaner. Kill if 5 pays fail. |
| **CleanShot** trademark | High | Working folder is `clearshot-ios`. Shipped name needs counsel. |
| App Store 5.1.1 (privacy) | Medium | On-device only; no account. |
| MW mini confusion | Process | Standalone binary first. No host mount. |
| ScreenCut “70k users” | Honesty | Their marketing. **UNKNOWN** to us as a fact. |

---

## Price hypothesis

**HYPOTHESIS:** $9.99 one-time or $19.99 lifetime. Do not undercut into $0.99 race. Do not invent an App Store product id.

---

## Overnight notes (GLM 5.3)

Dated **2026-09-19**. Complementary only. Does **not** change the claim, wedge, incumbent rows, or price HYPOTHESIS above. Pays stay **0**. Checkout URL stays **none**.

### Sibling offers — link, do not merge

| Slug | Job | Why this folder stays separate |
|------|-----|--------------------------------|
| [unlock-code-utils](../unlock-code-utils/) (idea 08) | Pull Wi-Fi / gift / backup **codes** from a screenshot and format them | Opposite verb: they **copy out** a secret; we **redact** so it never leaves. Same share-sheet habit. Prefer a later *mode* only if both 14-day bars pass — not a second brand this week. |
| [screenshot-stack-pages](../screenshot-stack-pages/) (idea 10) | Store-ready **mockup stacks** for one app listing | Beautify / frame / locale. We stay **redact-first**. Shotpop already sells both; we do not ship a megapp lander. |

Do not merge the three offers into one “screenshot studio.”

### MW stub (unchanged)

`utility.clearshot` at `mission://minis/clearshot` stays a **reserved stub** — photos scopes, **never** `billing.read`, no UI. This paper is a standalone App Store experiment first. Do not mount the mini. Do not tell buyers it already ships in Mission Winning.

### Trademark

**CleanShot / ClearShot shipped-name clearance: UNKNOWN.** Official USPTO TSDR did not return a readable case row (JS client). Status API returned **401**. Secondary aggregator pages are not counsel. Working folder name stays `clearshot-ios`. Do not file as CleanShot.

### IAP re-verify (first-party, this night)

Confirms the competitor table; does not invent our SKU or a pay URL.

| Source | Opened | Money seen |
|--------|--------|------------|
| Shotpop site | shotpop.app | $4.99/mo · $24.99/yr · $49.99 lifetime — unchanged |
| ScreenCut listing | App Store `id6480429347` | IAP $5.99–$24.99 — unchanged |
| Screenshot Editor – Blur Text | App Store `id6757922494` | $1.99 / $12.99 / Pro Lifetime $29.99 — unchanged |
| CleanShot X pricing | cleanshot.com/pricing | Basic **$35** once; Pro **$10**/user/mo annual. Mac only. Fills the prior “open pricing before quoting” gap. Not iOS. Not our checkout. |
