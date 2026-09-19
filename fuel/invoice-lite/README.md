# Invoice Lite (`invoice-lite`)

A **one-page invoice pack**: local HTML invoice, listing draft, ICP, and a fulfill checklist.

This pack is **unpublished**. It has no store, no sales, and no checkout. `paymentUrl` is empty on purpose.

**Price is UNKNOWN.** Do not invent a list price to look finished.

## What you get

- A one-page invoice HTML you can print to PDF locally
- A listing draft marked unpublished
- A fulfill checklist that keeps paid / sent as UNKNOWN until marked
- Buyer / refund notes that stay unsent / UNKNOWN
- One ICP page, an honest FAQ, and one-channel outreach drafts (not sent)

## What this is not

- Not a live store
- Not a payment product
- Not Mission Winning, resume-kit, or a coloring book
- Not an accounting suite
- Not a collection-speed claim

## Preview

Open `pages/index.html` or `templates/invoice.html` in a browser. Print the invoice to PDF when you want a proof.

## Verify

```bash
node fuel/invoice-lite/scripts/verify.mjs
```
