# clearshot-ios — sources

Checked **2026-09-19**.

| # | What | URL | Used for | Notes |
|---|------|-----|----------|-------|
| 1 | CleanShot X | https://cleanshot.com/screenshots | Mac paid-category proof | Hide / redact / annotate. iOS is not this product. Trademark risk for our working title. |
| 2 | Shotpop | https://shotpop.app/ | iOS paid cleaner + beautifier | On-device redact. Pro $4.99/mo, $24.99/yr, $49.99 lifetime (site). |
| 3 | ScreenCut site | https://screencut.app/ | Share-sheet wedge | Claims 70k+ users — **marketing, not audited**. |
| 4 | ScreenCut App Store | https://apps.apple.com/us/app/screenshot-editor-screencut/id6480429347 | IAP exists | Listing showed Premium SKUs ~$5.99–$24.99. Re-open. |
| 5 | Screenshot Editor – Blur Text | https://apps.apple.com/us/app/screenshot-editor-blur-text/id6757922494 | On-device peer | Listing showed Pro Lifetime $29.99 + cheaper IAPs. On-device, no ads, no account. |
| 6 | MW module contract | `docs/contracts/MODULE.md` | Host stub | `utility.clearshot` reserved; no UI; no `billing.read`. |
| 7 | MW manifest | `packages/mw-core/src/module/types.ts` | Same | `UTILITY_CLEARSHOT_MANIFEST` version 0.1.0, `freeCore: true`. |

## UNKNOWN

| Item | Why |
|------|-----|
| ScreenCut true install count | Only their site claim. |
| CleanShot X current Mac price | Did not rely on a third-party “$29” rumor. Open cleanshot.com/pricing before quoting. |
| Our buyer count | Untested. |
| App Store name clearance | Counsel. |

## Re-verify (2026-09-19 · GLM 5.3 Lane B)

Opened the URLs above plus first-party pricing. No link 404'd. **No checkout URL invented for us.** Rows above are unchanged; this section is the dated read.

| # | What | Result |
|---|------|--------|
| 1 | cleanshot.com/screenshots | Live. Mac redact / annotate. Not iOS. |
| 1b | https://cleanshot.com/pricing | Live. Basic **$35** once; Pro **$10**/user/mo billed annually. Fills the prior “open pricing before quoting” gap in UNKNOWN. Still Mac. **Not our SKU.** |
| 2 | shotpop.app | Live. Pro **$4.99/mo · $24.99/yr · $49.99 lifetime**. On-device. Share-sheet. Beautifier + redact. |
| 3 | screencut.app | Live. Still claims **70,000+ users** — marketing, not audited. |
| 4 | ScreenCut App Store `id6480429347` | Live. IAP listed: $5.99, $9.99, $14.99, $19.99, $24.99. Range matches the existing note. Listing privacy nutrition includes tracking — contrast only. |
| 5 | Screenshot Editor – Blur Text `id6757922494` | Live. IAP: $1.99, $12.99, **Pro Lifetime $29.99**. On-device, no account, “Data Not Collected.” |
| 6–7 | MW stub | Manifest still `utility.clearshot`, `freeCore: true`, no `billing.read`. Not a product UI. |

### Trademark (still UNKNOWN)

Official TSDR (`tsdr.uspto.gov`) returned an empty case table (JS client). USPTO status API returned **401**. Secondary aggregator pages are **not** a primary read and are **not** clearance. Shipped name needs counsel. Do not file as CleanShot.
