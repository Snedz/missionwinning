# Stripe dispute evidence pack

**DRAFT ops template — not legal advice.** Use when `charge.dispute.created` fires. Fill placeholders, attach files in Stripe Dashboard, submit **before** the due date.

Companion: [STRIPE_DISPUTE_OPS.md](../STRIPE_DISPUTE_OPS.md) · live [Refunds](https://www.missionwinning.com/refunds) · [Terms](https://www.missionwinning.com/terms)

---

## Timeline (days, not weeks)

1. Acknowledge dispute in Stripe Dashboard; put **evidence due** on calendar.
2. Pull checklist below into one folder (PDF/screenshots).
3. Decision tree → refund & lose **or** submit evidence.
4. Fill Stripe’s reason-specific fields; attach pack; submit.
5. Post-mortem: fix UX/copy that caused the dispute.

---

## Evidence checklist

| Item | Where / how |
|------|-------------|
| Refund policy | Screenshot/PDF of `https://www.missionwinning.com/refunds` + date captured |
| Terms (premium / digital goods) | Screenshot of Terms premium section + URL + date |
| Checkout / charge IDs | Stripe: Charge `{{charge_id}}`, PaymentIntent `{{payment_intent_id}}`, Checkout Session `{{session_id}}` |
| Customer identity | Email `{{customer_email}}`; name if present |
| Delivery proof | Supabase `enrollments` row for email / `user_id` (premium unlocked) |
| Support thread | Export if any refund/dispute conversation |
| Login / activity | Note if available (last login, coach week generated) — optional |
| Product description | Digital Super Bundle / educational fitness software (PWA SaaS) — not physical goods |

---

## Decision tree

| Dispute reason (typical) | Prefer |
|--------------------------|--------|
| Fraudulent / unrecognized | Submit evidence (AVS/CVC, IP, customer history) if you believe legitimate; else refund |
| Product not received | Submit delivery proof (enrollment + access) + refunds policy showing digital delivery |
| Not as described / defective | Consider **refund & lose** if UX gap; else evidence + policy screenshots |
| Subscription canceled | Portal cancellation proof + Terms; refund unused period if fair |
| Duplicate / already refunded | Show prior refund receipt |

When in doubt and amount is small: **refund & lose** often cheaper than fighting + Radar risk. Escalate pattern disputes (same email/card) with tighter Radar / manual review.

---

## Response template (paste into notes / cover letter)

```text
Dispute response — Mission Winning (educational fitness software)

Dispute ID: {{dispute_id}}
Charge ID: {{charge_id}}
PaymentIntent: {{payment_intent_id}}
Checkout Session: {{session_id}}
Amount: {{amount}}
Customer email: {{customer_email}}
Dispute reason: {{reason}}

Product: Mission Winning Super Bundle — digital educational software (PWA).
No physical shipment. Access granted via account enrollment after successful payment.

Refund policy (published before purchase):
{{refund_policy_url}}
Captured: {{refund_policy_capture_date}}

Terms:
{{terms_url}}

Customer received access:
- Enrollment / premium status: {{enrollment_proof_note}}
- Support contact: support@missionwinning.com

We request the dispute be resolved in the merchant’s favor based on
(1) clear digital delivery, (2) published refund policy at checkout,
and (3) attached Stripe + enrollment evidence.

Submitted: {{submit_date}}
Operator: {{operator_name}}
```

**Placeholders:** replace all `{{…}}` before submit. Default URLs:

- `{{refund_policy_url}}` → `https://www.missionwinning.com/refunds`
- `{{terms_url}}` → `https://www.missionwinning.com/terms`

---

## After submit

- Watch `charge.dispute.updated` / `charge.dispute.closed` founder emails.
- If lost: note reason code; update copy or refunds UX if avoidable.
- If first dispute: still treat as a process drill — do not wait for rate thresholds ([STRIPE_DISPUTE_OPS.md](../STRIPE_DISPUTE_OPS.md)).
