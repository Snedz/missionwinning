# fuel/ — standing laws

Paper only. A later Judge grades. This file is not a checkout catalog.

| Law | Meaning |
|-----|---------|
| `paymentUrl` stays `""` | No invented Stripe / Gumroad / shop URL on any SKU |
| Resume `priceLabel` is `$29 one-time` | Label only. Not charged. Not a subscription |
| Invoice price is UNKNOWN | Do not copy `$29`. Do not mint `amountUsd` |
| ClearShot PARKED | Do not mention as live product in this tree |
| Builder ≠ Judge | This hop does not self-LGTM |
| No tip-promote | No tip / donate / bonus-funnel ask |
| No poison restore | Do not restore deleted cinematic `/` or parked minis |
| UNKNOWN is first-class | Unpaid / unsent / no-store / no-buyer stay UNKNOWN |

Do not add a shared `fuel/config.js`. Each SKU owns its own `config.js` so a price cannot leak across folders.
