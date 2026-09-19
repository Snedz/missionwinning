# fuel/ — unpublished cash-fuel SKUs

Honest paper for two side SKUs. Not the nutrition Fuel pillar (`/nutrition`). Not Mission Winning checkout. Not a war-room memo.

| Path | Concern |
|------|---------|
| [PLAN.md](PLAN.md) | This leftover hop freeze |
| [LAWS.md](LAWS.md) | Standing laws (empty `paymentUrl`, $29 label, UNKNOWN) |
| [scripts/verify-all.mjs](scripts/verify-all.mjs) | Parent + both SKU verifiers |
| [resume-kit/](resume-kit/INDEX.md) | One-page resume · `$29 one-time` label · unpublished |
| [invoice-lite/](invoice-lite/INDEX.md) | One-page invoice · price UNKNOWN · unpublished |

**Not here:** shared `fuel/config.js` (that would leak the resume price onto invoice-lite). ClearShot. kdp-color (sibling draft #982). Mission Winning app routes.

`paymentUrl` is empty on every SKU. There is no store.

## Verify

```bash
node fuel/scripts/verify-all.mjs
```
