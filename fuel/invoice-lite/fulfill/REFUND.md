# Invoice Lite — refund

Refund status is **UNKNOWN**. There is no payment, so there is nothing to refund. SKU price is UNKNOWN.

Do not write a “7-day guarantee” to look like a store. Do not invent a refund URL. Do not copy another SKU’s number into this file.

When a real charge exists, the founder writes the real rule here and points at the real processor. Until then:

| Fact | State |
|------|-------|
| Charge exists | UNKNOWN |
| SKU list price | UNKNOWN |
| Refund window | UNKNOWN |
| Processor | UNKNOWN — `paymentUrl` is empty |
| Requests received | UNKNOWN |

A row may stay UNKNOWN.
