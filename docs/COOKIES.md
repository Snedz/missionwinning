# COOKIES — first-party inventory note (`.737`)

The live inventory is [`src/lib/cookiePolicy.ts`](../src/lib/cookiePolicy.ts), rendered on `/cookies`.

Strictly necessary first-party cookies added for locale:

| Name | Purpose |
|------|---------|
| `mw_locale` | Confirmed UI language (display preference). SameSite=Lax, 1 year. |
| `mw_country` | Confirmed country, or a detected blocked ISO so hosted signup/checkout stay closed. |

Do Not Track = reject non-essential analytics. The consent banner is Accept / Reject non-essential / Manage. It never blocks the free logger. It does not geo-hide.

Counsel should review this inventory before a public flip. This file does not rewrite Privacy or Terms bodies.
