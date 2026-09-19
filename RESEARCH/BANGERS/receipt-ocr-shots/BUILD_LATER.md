# receipt-ocr-shots — build later

**Gate:** [SELL_FIRST.md](SELL_FIRST.md) result = **PASS** (5 cold pays / 14 days) or a written founder override.

Until then, no iOS OCR app, no cloud Veryfi-style API, no QuickBooks OAuth, no Fuel integration.

---

## Forbidden now

- iOS / Android receipt app or share extension  
- Cloud OCR reseller (Veryfi, Google Vision, AWS Textract) as *our* backend  
- QuickBooks / Xero / Dext OAuth  
- Anything under `/nutrition` or Fuel  
- Tax-filing, “IRS-ready,” or accountant claims  
- A hosted expense suite  
- Invented checkout URL

---

## If the bar passes — smallest binary

1. **One** share extension + tiny host (or a folder-drop Mac/CLI). Separate bundle id.  
2. On-device text (Vision) + heuristics for date / merchant / total / tax / last4.  
3. Manual **correct-before-export**.  
4. CSV / JSON out. No account. No cloud.  
5. Fail visibly on unreadable thermal paper — do not invent a total.  
6. IAP or Stripe **after** a real processor exists. Price matches the lander ($9 HYPOTHESIS).

Out of v1: line-item SKUs, multi-currency books, mileage, approvals.

---

## Later (not v1)

Batch Camera Roll. Optional very-small LLM *after* the lander sold it. MW Fuel: **no.**
