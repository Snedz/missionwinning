# receipt-ocr-shots — framework

**Claim:** Freelancers will pay a small one-time fee for **receipt photo or screenshot → CSV**, without an expense-suite login.

**Status:** paper. **Pays:** 0. **Checkout:** none.

## Problem

Expense products (Expensify, Veryfi, Shoeboxed, Dext) already charge for receipt OCR. They sell **workflow**: approvals, cards, QuickBooks. A lot of people only want **this shot → these columns** (date, merchant, total, tax, last4).

## Buyer

| Field | Value |
|-------|--------|
| Who | Gig / freelance / small landlord who dumps a Camera Roll of receipts at month-end |
| Who is not | A finance team, an accountant’s practice, anyone who needs approvals or cards |
| Job | Shot or screenshot → one CSV/JSON row, no account |
| Willingness to pay | **UNKNOWN.** Category is proven-paid at the *suite* layer. Buyer density for a $9 CSV tool is untested. |

## Wedge

**Shots, not suite.** Share-sheet or folder drop. On-device if possible (Vision + heuristics). CSV / JSON out. No reimbursements, no corporate card.

If the lander mentions “SmartScan” or “Magic Envelope,” you are competing with Expensify / Shoeboxed on their terms. Don’t.

## MW relationship

None in code. This is adjacent cash. **Fuel (`/nutrition`) is not a receipt book.** Do not bolt OCR onto the athlete product. Do not open `billing.read`. Separate git and checkout until the founder merges them on purpose.

## 14-day test

See [SELL_FIRST.md](SELL_FIRST.md). Bar: **5 cold pays / 14 days**. Rank 3 in [README.md](../README.md). Expect a chance only if the ask is “this shot → these columns,” not “expense management.”

## Incumbents (official pages — re-open before quoting dollars)

| Product | Official | Kind | Listed money (2026-09-19) | Wedge vs us |
|---------|----------|------|---------------------------|-------------|
| **Expensify** | https://www.expensify.com/ · https://www.expensify.com/pricing | Expense suite + SmartScan | Home: free for an individual; companies “start at $5 per member.” First-party Collect blog (2025-05-08): Collect **$5/member/mo**, unlimited SmartScans. `/pricing` is JS-heavy — **re-open before a lander number.** | Suite (approvals, cards, QBO). Not a CSV share-sheet. |
| **Expensify iOS** | https://apps.apple.com/us/app/expensify-travel-expense/id471713959 | App listing | IAP exist; current SKU mix **UNKNOWN** without a live storefront read | Same suite. |
| **Veryfi API** | https://www.veryfi.com/receipt-ocr-api/ · https://www.veryfi.com/ocr-api-pricing/ | OCR API (B2B) | Free: up to 100 docs/mo. Starter: **$500+/mo** min. Receipts **$0.08**/doc on the published table. | They sell JSON to fintechs. We sell one CSV to a human. |
| **Veryfi Expense (SaaS)** | FAQ: https://faq.veryfi.com/en/articles/3743986-what-are-the-plans-prices-for-ocr-api | Consumer-ish expense | FAQ (dated 2026-03-10): **$19.99 / active user / mo** (or $17.50 annual). **Re-open** — not the API page. | CSV/XLS export, no API on that SKU. Still a login suite. |
| **Veryfi iOS** | https://apps.apple.com/us/app/veryfi-receipts-ocr-expenses/id804152735 | App listing | IAP **UNKNOWN** this pass | Line-item / compliance marketing is theirs. |
| **Shoeboxed** | https://www.shoeboxed.com/ · https://www.shoeboxed.com/pricing | Mail-in + scan | Official: Starter **$9/mo** or **$97/yr**; Pro **$29/mo** / **$297/yr**; Plus **$79/mo** / **$797/yr**; Paper Plus **$179/mo** / **$1,997/yr**. | Magic Envelope + human verify. Different job. |
| **Dext** | https://dext.com/us/business/pricing · https://dext.com/us/partner/pricing | Accountant / business capture | Business page shows a starting tile (~**$25.21** extracted 2026-09-19) that **moves with users/docs**. Practice is per-client, sales-shaped. | Bookkeeper workflow. Not a freelancer CSV. |
| **Genius Scan** | https://thegrizzlylabs.com/genius-scan/pricing/ | Document scanner | Basic **free**. Ultra unlocks OCR + expense-report helper. Ultra dollar **UNKNOWN** this fetch (page did not yield a stable number). | Scanner + PDF OCR, not receipt-column CSV. |
| **Wave Receipts** | https://www.waveapps.com/receipts · https://support.waveapps.com/hc/en-us/articles/360059848112-Scan-and-upload-your-receipts | Accounting add-on | Official help: scan is on **Receipts Plan or Pro Plan**, not the free books. Pro marketing: “less than $1 a day.” Exact Receipts-plan dollars **UNKNOWN** without a live `/pricing` read. | Creates bookkeeping transactions. Login + subscription. |
| **iOS Live Text** | https://support.apple.com/en-us/120004 | Built-in | Free. iPhone XS/XR+, iOS 15+. | Copy text. No batch CSV, no merchant/total parse. |

Secondary roundups (kenfromfinance, ratethetool) stay in [SOURCES.md](SOURCES.md). Do not copy their dollars as ours.

Buyer density for a $9 CSV tool: **UNKNOWN**.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Crowded suite category | High | Land on “shots not suite.” Kill if 5 pays fail. |
| Free Live Text | Medium | Offer is **columns + batch CSV**, not “read the photo.” |
| Cloud OCR cost | Product | Prefer on-device Vision. Do not resell Veryfi. |
| Thermal-paper fail | Support | Disclose. Manual correct-before-export. |
| Tax / IRS claims | Legal | Never. Not advice. Not “audit-ready.” |
| MW Fuel confusion | Process | Not `/nutrition`. Not Train. |

## Price hypothesis (not a fact)

$9 one-time or $20/year. **HYPOTHESIS.** Do not print a Stripe URL.
