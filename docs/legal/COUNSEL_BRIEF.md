# Counsel brief — Mission Winning (consumer SaaS / fitness PWA)

**Not legal advice.** This pack is for outside counsel reviewing consumer Terms, Privacy, Refunds, and DMCA readiness.  
**Export of live EN legal text:** [exports/2026-08-04-consumer-legal-en.md](exports/2026-08-04-consumer-legal-en.md) (regenerate after material `infoLocales` changes).  
**Ops playbooks:** [LEGAL_SAFETY.md](../LEGAL_SAFETY.md) · [PAY_READY_LEGAL.md](../PAY_READY_LEGAL.md) · [LLC_AND_PAYMENTS.md](../LLC_AND_PAYMENTS.md)

---

## 1. Ask of counsel

Please review and redline the **consumer legal pack** (Terms · Privacy · Refunds · DMCA) for a US-formed LLC offering a free-first fitness PWA with optional paid Super Bundle and optional AI features.

**Priority opinions:**

1. Can we rely on the arbitration + class waiver language as drafted?  
2. What must change before first real paid charge (Stripe / PayPal / Phantom USDC)?  
3. DMCA safe-harbor readiness given interim agent (no postal on page yet)?  
4. CAN-SPAM / commercial email: postal address requirements for our invite/waitlist mailers?  
5. Health / exercise marketing vs educational disclaimer consistency?  
6. Optional AI features disclosure sufficient for FTC expectations?

**Out of scope for this engagement (unless you recommend otherwise):** full GDPR EU representative, enterprise DPA negotiation, trademark prosecution, insurance brokering.

---

## 2. Product snapshot (one screen)

| Item | Fact |
|------|------|
| **Brand** | Mission Winning — “Train Anywhere. Win Daily.” |
| **Product** | Adaptive coaching for train-anywhere athletes |
| **Free core** | Offline workout logger **without account**; Mission Coach weekly plans from logs (rules-based; no AI key required) |
| **Hard product rule** | Free logger is never gated behind paywall |
| **Paid SKU** | Super Bundle (Coach depth + other pillars) — muted in free-beta UI |
| **Surfaces** | Next.js PWA (primary) · native Android in progress · iOS deferred |
| **Not claimed** | Medical device; treatment of depression; government affiliation |

Wedge pitch: Train + Mission Coach — not “everything app.” Constitution: repo `vision.md`.

---

## 3. Entity (founder fill-in)

| Field | Value |
|-------|--------|
| Legal name | Mission Winning LLC |
| Formation state | **[FOUNDER: confirm]** |
| Registered agent / mailing address for public use | **[FOUNDER: Bizee RA vs PO box/CMRA — see LEGAL_SAFETY §3]** |
| Officers / members | **[FOUNDER]** |
| Support email | support@missionwinning.com |
| Coaching inquiries | hello@missionwinning.com |
| EIN | **[FOUNDER: pending / issued]** |
| Stripe / PayPal account state | **[FOUNDER]** |

---

## 4. Data & subprocessors (for Privacy accuracy)

Aligned with live Privacy + [LEGAL_SAFETY.md](../LEGAL_SAFETY.md) §2. Confirm against production env.

| Category | Handling |
|----------|----------|
| Free core without account | Workouts/logs primarily **on device** (localStorage / durable outbox) |
| Account | Supabase Auth (Apple/Google/Microsoft/Facebook/magic link) |
| Sync | Supabase when signed in |
| Hosting | Vercel |
| Payments | Stripe and/or PayPal when enabled |
| Email | Resend when enabled (blocked if `MAIL_POSTAL_ADDRESS` unset) |
| Product analytics | PostHog EU **only if user allows**; DNT keeps off; no Meta Pixel / GA ads |
| Optional AI | LLM provider when operators enable (preferred xAI / SpaceXAI + ZDR) — free rules coach needs no key |
| Meal photos | Optional photo → macro estimate API; not an ad library |
| Youth / school | Surfaces largely parked; expand COPPA language when enabled |

---

## 5. Live legal surfaces (URLs)

| Doc | Path | Code |
|-----|------|------|
| Terms | `/terms` | `TermsPage.tsx` · `infoLocales` |
| Privacy | `/privacy` | `PrivacyPage.tsx` · `infoLocales` |
| Refunds | `/refunds` | `RefundsPage.tsx` · `infoLocales` |
| DMCA | `/dmca` | `DmcaPage.tsx` · `infoLocales` |
| Full AUP (internal) | not public route | [ACCEPTABLE_USE.md](ACCEPTABLE_USE.md) — short summary in Terms only |
| DPA / MSA | templates only | [DPA.md](DPA.md) · [MSA_TEMPLATE.md](MSA_TEMPLATE.md) — B2B later |

**Frozen text:** [exports/2026-08-09-consumer-legal-en.md](exports/2026-08-09-consumer-legal-en.md) (Ukraine refresh; supersedes 2026-08-04/05/06 snapshots for live copy)

---

## 5b. Territory policy (2026-08-09) — founder-locked, counsel must see

| Exclusion | Status | Note |
|-----------|--------|------|
| Europe (EEA/UK/CH/FR+) | Product block | GDPR representative not appointed |
| Canada | Product block | Commercial |
| **Ukraine (`UA`)** | **Product block** | **Commercial only** — not OFAC country embargo of free Ukraine |
| OIC 57 | Product block | Commercial |
| Russia (`RU`) / Belarus (`BY`) | **Still open** | Founder asymmetry vs US foreign-policy posture — **please opine** |
| Destinations restricted under U.S. sanctions/export programs | No reliable CDN map in many cases | Generic contractual right to refuse under sanctions/export clause (do **not** list sub-national place names in consumer copy) |

Live code: `src/lib/legal/supportedRegions.ts`. Tests pin **RU/BY allowed**.

---

## 6. Known open items (honest gaps)

| Item | Status |
|------|--------|
| Published physical postal address | **Open** — blocks list email + DMCA postal line |
| copyright.gov DMCA agent filing | **Open** — page says interim |
| Counsel review of arbitration / class waiver | **Open** |
| Formation state printed in Terms | **Texas** stated in live Terms (.547+) — confirm against formation docs |
| Cyber liability insurance | Not purchased; do not claim in Privacy |
| Free-beta: Bundle UI muted | Refunds still describe Super Bundle for when pay is on |
| Youth / COPPA full policy | Parked surfaces; light language only |
| Cloudflare edge rule for **UA** | **Founder ops** after product ship |
| UA-only vs RU open | **Founder accepted** — counsel review recommended |

---

## 7. Founder questions for counsel call

1. Is AAA Consumer Arbitration + class waiver appropriate for our free + freemium fitness PWA? Any Texas-specific issues?  
2. Is the **Ukraine commercial exclusion** wording adequate? Any risk in **not** blocking Russia/Belarus while blocking UA?  
3. Is the new **sanctions / export / SDN** clause appropriate for a mass-market fitness PWA (no formal SDN screening product)?  
4. 14-day refund windows for monthly / annual / lifetime (incl. USDC manual refunds) — any consumer-protection gaps?  
5. Is interim DMCA agent + “postal TBD” fatal to safe harbor until filing?  
6. Minimum age / COPPA: what to publish now while youth is off?  
7. Cookie / local-storage disclosure: separate notice or Privacy section only?  
8. Exercise-as-medicine / mood research citations on marketing pages — any required modifications?  
9. Crypto (Phantom USDC) refunds: any extra disclosures?  
10. Before first Stripe charge, what is the minimum legal set that must be live and accurate?

---

## 8. Attachments checklist for counsel email

- [ ] This brief  
- [ ] [exports/2026-08-09-consumer-legal-en.md](exports/2026-08-09-consumer-legal-en.md)  
- [ ] [LEGAL_SAFETY.md](../LEGAL_SAFETY.md) §0 territory  
- [ ] [PAY_READY_LEGAL.md](../PAY_READY_LEGAL.md)  
- [ ] [EXERCISE_AS_MEDICINE.md](../EXERCISE_AS_MEDICINE.md) (claim boundaries)  
- [ ] Screenshots: free logger, free-beta mute, checkout (if any), Coach, `/regions`  
- [ ] Entity docs / formation certificate (**founder**)  
- [ ] Proposed public postal address (**founder**)

---

## 9. After counsel returns

1. Founder approves redlines.  
2. Agent applies to `src/i18n/infoLocales.ts` EN + any new routes (e.g. `/acceptable-use`).  
3. Bump “Last updated,” re-export EN pack, ship with normal build protocol.  
4. Founder files DMCA agent + sets `MAIL_POSTAL_ADDRESS` — agents do not mark these done.

---

*Last scaffolded for counsel engagement. Update the export path when regenerating the frozen legal text.*
