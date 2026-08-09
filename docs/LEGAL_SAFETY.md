# Legal safety shield

**Not legal advice.** This doc is operational hygiene for Mission Winning: what we disclose, what data we touch, and founder checklists before relying on arbitration/DMCA language in a dispute. Have counsel review material Terms changes.

**Live pages:** [`/privacy`](https://missionwinning.com/privacy) · [`/terms`](https://missionwinning.com/terms) · [`/usage`](https://missionwinning.com/usage) · [`/regions`](https://missionwinning.com/regions) · [`/service-terms`](https://missionwinning.com/service-terms) · [`/dmca`](https://missionwinning.com/dmca) · [`/refunds`](https://missionwinning.com/refunds)

**Related:** [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) · [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) · [help/privacy-and-data.md](help/privacy-and-data.md) · [COMPLIANCE.md](COMPLIANCE.md) (control monitor — not a certification) · [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) (six docs before payments) · [legal/COUNSEL_BRIEF.md](legal/COUNSEL_BRIEF.md) (outside counsel engagement pack)

---

## 0. Territory (founder policy)

**Platform posture:** global consumer product (Alibaba-style multi-market), not a single-country “home market.” Entity remains Mission Winning LLC (Texas) for governing law — that is formation fact, not marketing focus.

**Hosted service commercial exclusions:**
- **Europe** (EEA, UK, Switzerland, France, associated territories)
- **Canada**
- **Ukraine** (commercial product exclusion — not marketed as single-country sanctions compliance)
- **Organisation of Islamic Cooperation (OIC)** — all 57 member states

**Sanctions honesty (counsel):** Consumer copy uses **multi-jurisdiction** sanctions / export / trade-control language (restricted-party lists and laws where we and partners operate) — not a US-only OFAC voice. Founder chose **UA-only** as a commercial exclusion while **RU/BY remain open** in product logic (pin in tests). Do not market the UA block as “sanctions compliance.” Counsel may still map partner obligations under individual regimes (including US/EU/UN lists) offline.

Live policy: [`/regions`](https://missionwinning.com/regions). Product logic: `src/lib/legal/supportedRegions.ts`. Edge: Cloudflare (founder — add **UA**). In-app hard block: signup (`SignInPanel`) + checkout (`/api/checkout`, crypto intent/confirm, `UnlockButton`). Not a substitute for counsel review of geo-blocking/enforcement.

## 1. Risk areas covered

| Risk | Product response |
|------|------------------|
| AI disclosure (FTC) | Landing + Privacy state optional AI clearly; free core needs no AI key |
| Arbitration / class waiver | Terms → Dispute resolution |
| Store privacy labels | Data inventory below (fill Play/App Console when TWA opens — do not invent early) |
| UGC / DMCA | Terms → User content + Copyright; public `/dmca` notice channel |
| Medical / mental-health marketing | Educational fitness only; see §3a + [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md) |

---

## 2. Data inventory (pre-store “nutrition label”)

Use this table when filling Apple Privacy Nutrition Labels / Google Play Data safety. Aligns with live Privacy policy third parties. **We do not use Meta Pixel or Google Analytics advertising tags.**

| Data type (label category) | Purpose | Linked to third party? | User control |
|----------------------------|---------|------------------------|--------------|
| Email / account identifiers | Sign-in, sync, support, youth consent mail | Supabase Auth; optional Resend | Local-only free core; delete via support |
| Fitness / workout logs | Training, Win Score, coach rules | Supabase when signed in | Export/restore Profile; delete account |
| Nutrition / meal logs | Fuel pillar | Supabase when signed in | Same |
| Photos (meal estimate) | Optional photo → macro estimate API | Estimate API / optional LLM path when enabled; **not** an ad photo library | Feature opt-in (user picks photo); see Privacy collect |
| Product analytics (opt-in) | Typed funnel events | PostHog only if allowed (not targeted at EU consumer accounts) | Banner / Profile → Privacy; DNT keeps off |
| Payment / purchase history | Super Bundle | Stripe and/or PayPal when enabled | Billing portal / support |
| Optional AI coach context | Chat/voice/daily insight when operators enable LLM | OpenAI-compatible provider (preferred SpaceXAI/xAI + ZDR) | Feature only when enabled; free rules coach needs no key |
| Advertising ID / AAID / IDFA | — | **Not collected** | N/A |
| Cross-app tracking pixels | — | **Not used** (no Meta Pixel / GA ads) | N/A |

**TWA / store:** When [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) opens, copy rows into Play/App listings from this table — do not invent categories ahead of shipping stores.

---

## 3. Founder checklist

- [ ] **Business postal address — blocks all list email.** CAN-SPAM §7704(a)(5) requires a valid physical postal address in every commercial email footer. Confirm with **Bizee** (Texas registered agent) whether their RA address may be published as the business mailing address — RA addresses often accept only service of process and state correspondence, and the terms may forbid advertising it. If not permitted, a USPS PO box or a CMRA private mailbox both satisfy the rule. Then set `MAIL_POSTAL_ADDRESS` in Vercel ([ENV.md](ENV.md)) — until it is set, waitlist confirmations drop to text-only and the launch broadcast + beta-invite senders refuse to run by design. **Same address serves the DMCA row below** — decide once.
- [ ] Register designated DMCA agent at [copyright.gov DMCA directory](https://www.copyright.gov/dmca-directory/) (~$6); put **exact** name, email, and postal address on `/dmca` (replace interim placeholder — same address as the CAN-SPAM row above)
- [ ] Update support mailbox auto-reply to mention DMCA notices → `/dmca` + agent email
- [ ] Counsel review of Terms arbitration + class waiver (AAA Consumer Rules, **governing law = Texas** — Mission Winning LLC)
- [x] Formation state in Terms: **State of Texas** / Mission Winning LLC (Texas) — agent draft `.547`; counsel still recommended
- [ ] CCPA: we do not sell/share for cross-context ads — Privacy California section; respond to access/deletion at `support@missionwinning.com`
- [x] Data deletion SLA on Privacy: erase cloud personal data **within 30 days** of verified request (legal exceptions) — `.547`
- [x] Liability cap: fees paid in prior **12 months** (or $0 if free) — `.547`
- [x] User indemnification section on Terms — `.547`
- [ ] At native Play Internal time: fill Play Data safety from §2 (Compose wedge answers also in [apps/android/PLAY_LISTING.md](../apps/android/PLAY_LISTING.md)); App Privacy labels when iOS opens
- [ ] Cyber liability insurance quote (~$200–600/yr ballpark — verify with broker); bind before school/enterprise or data at scale — see [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md)
- [ ] Do not claim “we are insured” in Privacy until a policy exists
- [ ] Support auto-reply: refund requests → `/refunds` + `support@missionwinning.com`

### 3a. Exercise / mood / mental-health marketing checklist

Source of truth: [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md). Aligns with Terms/Privacy (“not a medical provider”) in `infoLocales.ts` and [ACCEPTABLE_USE.md](legal/ACCEPTABLE_USE.md).

- [ ] Do **not** claim MW diagnoses, treats, or cures depression or any mental illness
- [ ] Do **not** advise stopping or changing prescribed medication or therapy
- [ ] Mood/energy copy framed as outcomes of training or readiness inputs — not clinical outcomes
- [ ] SSRI / “as effective as” comparisons only with mild–moderate / research-setting context + citation from the thesis doc
- [ ] “92%” claim uses **mental health professionals** (survey sample), not “doctors,” unless a doctors-only cite exists
- [ ] Landing hero / Product Hunt lead stays Train + Coach — not clinical depression
- [ ] Any public evidence angle includes: educational only · not medical advice · not a substitute for care
- [ ] Coach / insight LLM prompts: never diagnose; reinforce exercise-medicine boundaries ([coachChatServer](../src/lib/coachChatServer.ts))

---

## 4. Code map

| Surface | Path |
|---------|------|
| Privacy / Terms / Usage / Regions / Service terms / DMCA UI | `PrivacyPage`, `TermsPage`, `UsagePolicyPage`, `SupportedRegionsPage`, `ServiceTermsPage`, `DmcaPage`, `RefundsPage` |
| Copy | `src/i18n/infoLocales.ts` |
| Landing AI line | `src/i18n/landingLocales.ts` (`landingProofNoAiKey`) |
| Public routes | `src/lib/publicRoutes.ts`, `app/sitemap.ts` |
| Nav | `LegalNav`, `AppLegalFooter`, `MarketingFooter` |
