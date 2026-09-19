'use strict';

/**
 * Resume Kit local catalog row.
 * paymentUrl stays empty until a founder wires a real store.
 * priceLabel is $29 one-time — intended, not charged.
 * Do not share this file with invoice-lite.
 */
module.exports = {
  sku: 'resume-kit',
  name: 'Resume Kit',
  status: 'unpublished-draft',
  paymentUrl: '',
  checkout: null,
  price: {
    amountUsd: 29,
    cadence: 'one-time',
    priceLabel: '$29 one-time',
  },
  fulfillStatus: 'UNKNOWN',
  refundStatus: 'UNKNOWN',
  buyerEmail: 'UNKNOWN',
};
