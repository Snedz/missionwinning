'use strict';

/**
 * Invoice Lite local catalog row.
 * paymentUrl stays empty until a founder wires a real store.
 * Price is UNKNOWN — do not mint a number to look finished.
 * Do not share this file with resume-kit.
 */
module.exports = {
  sku: 'invoice-lite',
  name: 'Invoice Lite',
  status: 'unpublished-draft',
  paymentUrl: '',
  checkout: null,
  price: {
    amountUsd: null,
    cadence: 'UNKNOWN',
  },
  fulfillStatus: 'UNKNOWN',
  invoicePaid: 'UNKNOWN',
  refundStatus: 'UNKNOWN',
  buyerEmail: 'UNKNOWN',
};
