# Stripe dispute ops — chargeback hygiene

**Not legal advice.** Operational checklist so the first chargeback does not freeze the account while you scramble for paperwork.

Companion: [STRIPE_DISPUTE_EVIDENCE_PACK.md](legal/STRIPE_DISPUTE_EVIDENCE_PACK.md) · [PRE_REVENUE_CHECKLIST.md](PRE_REVENUE_CHECKLIST.md) · [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) · live [`/refunds`](https://www.missionwinning.com/refunds)

---

## What the app does

| Event | Behavior |
|-------|----------|
| `charge.dispute.created` | Email founder (`FOUNDER_DIGEST_EMAIL`) with id, amount, reason, Dashboard link |
| `charge.dispute.updated` | Same (status / deadline changes) |
| `charge.dispute.closed` | Same (won / lost / withdrawn) |

**Never** auto-fights or submits evidence. Human opens Stripe Dashboard and uses the evidence pack.

Webhook: `POST /api/stripe-webhook` (same signing secret as enrollments). Enable events via Dashboard or `node scripts/setup-stripe-webhook.mjs`.

---

## Founder setup (once)

1. **Env:** `FOUNDER_DIGEST_EMAIL` + Resend (`RESEND_*`) on Production so dispute emails send.
2. **Webhook events:** add `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed` (plus existing checkout events).
3. **Stripe email:** Settings → Notifications → turn on dispute / payment failure emails (backup if webhook fails).
4. **Radar:** enable default **Radar** rules for your account. Watch dispute rate under **Radar → Overview** / Disputes in Dashboard.
5. **Not Connect:** **Radar for Platforms** does not apply (single account, not Connect). Optional later: **Radar for Fraud Teams** (paid) — founder decision, not required day one.

---

## Thresholds (rule of thumb)

| Signal | Action |
|--------|--------|
| **First dispute ever** | Investigate immediately — do not wait for a pattern |
| Dispute rate approaching **~0.5–1%** of transactions | Escalate: review copy, refunds UX, fraud filters; verify current Stripe Dashboard risk bands |
| Account warning / reserves | Pause paid ads; counsel + Stripe support; fix root cause before volume |

Never wait for an account freeze. Verify current guidance in Dashboard — network programs change.

---

## Refund visibility (prevent disputes)

- App: Bundle CTA + `UnlockButton` link to `/refunds` (14-day money-back copy).
- Stripe Checkout **custom text** / Payment Link description: point to `https://www.missionwinning.com/refunds` — see [STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md) § Refund policy at Checkout.
- Support auto-reply: refund subject → `/refunds` ([PAY_READY_LEGAL.md](PAY_READY_LEGAL.md)).

---

## When a dispute email arrives

1. Open Dashboard link; calendar the **evidence due** date (days, not weeks).
2. Follow [STRIPE_DISPUTE_EVIDENCE_PACK.md](legal/STRIPE_DISPUTE_EVIDENCE_PACK.md) — refund & lose vs submit evidence.
3. Submit before deadline; post-mortem UX/copy that caused it.

---

## Explicitly out of scope

- Auto-submitting evidence without human review
- Claiming “Stripe-proof” or zero chargebacks
- Paying for Radar for Fraud Teams / buying cyber insurance (optional founder actions)
- B2B Connect / Radar for Platforms
