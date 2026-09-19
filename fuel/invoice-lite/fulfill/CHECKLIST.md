# Invoice Lite — fulfill checklist

Operator list for using the local invoice and, later, for the day a real store exists. Rows may stay **UNKNOWN**. Do not mark paid or sent to look finished.

`paymentUrl` is empty. There is no shop to poll. Invoice paid/unpaid is UNKNOWN until marked on a real copy.

| Step | Status now | Notes |
|------|------------|-------|
| Real checkout for this SKU exists | UNKNOWN | Do not invent `paymentUrl` |
| SKU list price set | UNKNOWN | Do not mint a number |
| Invoice sent to a client | UNKNOWN | Local print is not “sent” |
| Invoice marked paid | UNKNOWN | Template default is UNKNOWN |
| Buyer of this pack known | UNKNOWN | Do not invent a customer |

A row may stay UNKNOWN. Forcing “PAID” without evidence is the defect this list exists to prevent.
