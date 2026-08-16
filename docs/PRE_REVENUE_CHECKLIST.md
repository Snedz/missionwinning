# Pre-revenue checklist — before you take a dollar

**Gate:** Do not charge the first Super Bundle customer until every **Required** row is done — **except** the interim path below while LLC/EIN are pending. Optional rows can wait days, not months, once volume grows.

**Not legal/tax advice.** Companion: [ENTITY_RESEARCH.md](legal/ENTITY_RESEARCH.md) · [OPERATING_AGREEMENT_DRAFT.md](legal/OPERATING_AGREEMENT_DRAFT.md) · [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) · [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) · [STRIPE_DISPUTE_OPS.md](STRIPE_DISPUTE_OPS.md) · [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md)

### Interim while Texas LLC + EIN pending (~4 weeks)

You may take beta dollars on **Stripe individual / sole prop** (and optional Phantom list Lifetime) before LLC formation completes — [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1d · [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §4. Entity rows below stay open until Bizee returns; still require legal pack (§2), payments ops on the **individual** Stripe account (§3), and dispute shield (§4) before first live charge.

---

## 1. Entity (Required before scale; deferred for interim sole-prop beta)

| Done | Item |
|------|------|
| ⬜ | LLC formed (default: home state — [ENTITY_RESEARCH.md](legal/ENTITY_RESEARCH.md)) — *Texas filing in progress via Bizee* |
| ⬜ | EIN obtained |
| ⬜ | Operating agreement signed ([OPERATING_AGREEMENT_DRAFT.md](legal/OPERATING_AGREEMENT_DRAFT.md) + counsel) |
| ⬜ | Business checking under LLC name |
| ⬜ | Formation **state** written into `/terms` governing law (replace placeholder) — Texas when approved |
| ⬜ | IP assigned into LLC |

## 2. Legal pack (Required)

| Done | Item |
|------|------|
| ⬜ | `/terms` `/privacy` `/refunds` `/dmca` live |
| ⬜ | Counsel review of pay-ready pack ([PAY_READY_LEGAL.md](PAY_READY_LEGAL.md), [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1b) |
| ⬜ | Support inbox live; auto-reply knows Refund request → `/refunds` |

## 3. Payments ops (Required)

| Done | Item |
|------|------|
| ⬜ | Stripe account **under the LLC** after the pricing study + live Checkout / Payment Links |
| ⬜ | Webhook `https://www.missionwinning.com/api/stripe-webhook` with enrollment **and** dispute events ([STRIPE_PREMIUM_SETUP.md](STRIPE_PREMIUM_SETUP.md)) |
| ⬜ | `/refunds` linked on Bundle + UnlockButton; Stripe Checkout custom text points to refunds URL |
| ⬜ | Profile → Manage billing (Customer Portal) works |
| ⬜ | Support can issue refunds in Stripe Dashboard |

## 4. Dispute shield (Required before scale; strongly before first charge)

| Done | Item |
|------|------|
| ⬜ | Dispute emails on `charge.dispute.*` → `FOUNDER_DIGEST_EMAIL` ([STRIPE_DISPUTE_OPS.md](STRIPE_DISPUTE_OPS.md)) |
| ⬜ | Stripe Dashboard: Radar enabled; dispute / payment emails on |
| ⬜ | Evidence pack bookmarked ([legal/STRIPE_DISPUTE_EVIDENCE_PACK.md](legal/STRIPE_DISPUTE_EVIDENCE_PACK.md)) — fill before first claim |
| ⬜ | Know the SLA: respond in **days**, not weeks |

## 5. Optional day-one / soon

| Done | Item |
|------|------|
| ⬜ | Cyber liability quote ([LEGAL_SAFETY.md](LEGAL_SAFETY.md)) |
| ⬜ | Trademark clearance / filing ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1c) |
| ⬜ | Bookkeeping (Wave / QuickBooks) separate from personal |
| ⬜ | Sales tax / nexus check with CPA if selling goods/services in multiple states |

---

## Supersedes

Payment steps in root [SETUP.md](archive/SETUP.md) §1 that still mention demo PayPal-first flows — prefer this checklist + [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) for live Stripe Sessions.
