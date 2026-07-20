# Legal safety shield

**Not legal advice.** This doc is operational hygiene for Mission Winning: what we disclose, what data we touch, and founder checklists before relying on arbitration/DMCA language in a dispute. Have counsel review material Terms changes.

**Live pages:** [`/privacy`](https://missionwinning.com/privacy) · [`/terms`](https://missionwinning.com/terms) · [`/dmca`](https://missionwinning.com/dmca) · [`/refunds`](https://missionwinning.com/refunds)

**Related:** [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) · [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) · [help/privacy-and-data.md](help/privacy-and-data.md) · [COMPLIANCE.md](COMPLIANCE.md) (control monitor — not a certification) · [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) (six docs before payments)

---

## 1. Risk areas covered

| Risk | Product response |
|------|------------------|
| AI disclosure (FTC) | Landing + Privacy state optional AI clearly; free core needs no AI key |
| Arbitration / class waiver | Terms → Dispute resolution |
| Store privacy labels | Data inventory below (fill Play/App Console when TWA opens — do not invent early) |
| UGC / DMCA | Terms → User content + Copyright; public `/dmca` notice channel |

---

## 2. Data inventory (pre-store “nutrition label”)

Use this table when filling Apple Privacy Nutrition Labels / Google Play Data safety. Aligns with live Privacy policy third parties. **We do not use Meta Pixel or Google Analytics advertising tags.**

| Data type (label category) | Purpose | Linked to third party? | User control |
|----------------------------|---------|------------------------|--------------|
| Email / account identifiers | Sign-in, sync, support, youth consent mail | Supabase Auth; optional Resend | Local-only free core; delete via support |
| Fitness / workout logs | Training, Win Score, coach rules | Supabase when signed in | Export/restore Profile; delete account |
| Nutrition / meal logs | Fuel pillar | Supabase when signed in | Same |
| Photos (meal estimate) | Optional photo → macro estimate API | Estimate API / optional LLM path when enabled; **not** an ad photo library | Feature opt-in (user picks photo); see Privacy collect |
| Product analytics (opt-in) | Typed funnel events | PostHog EU only if allowed | Banner / Profile → Privacy; DNT keeps off |
| Payment / purchase history | Super Bundle | Stripe and/or PayPal when enabled | Billing portal / support |
| Optional AI coach context | Chat/voice/daily insight when operators enable LLM | OpenAI-compatible provider (preferred SpaceXAI/xAI + ZDR) | Feature only when enabled; free rules coach needs no key |
| Advertising ID / AAID / IDFA | — | **Not collected** | N/A |
| Cross-app tracking pixels | — | **Not used** (no Meta Pixel / GA ads) | N/A |

**TWA / store:** When [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) opens, copy rows into Play/App listings from this table — do not invent categories ahead of shipping stores.

---

## 3. Founder checklist

- [ ] Register designated DMCA agent at [copyright.gov DMCA directory](https://www.copyright.gov/dmca-directory/) (~$6); put **exact** name, email, and postal address on `/dmca` (replace interim placeholder)
- [ ] Update support mailbox auto-reply to mention DMCA notices → `/dmca` + agent email
- [ ] Counsel review of Terms arbitration + class waiver (AAA Consumer Rules, governing law = Mission Winning LLC formation state)
- [ ] Confirm formation state in [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) and keep Terms “state of formation” language accurate
- [ ] CCPA: we do not sell/share for cross-context ads — Privacy California section; respond to access/deletion at `support@missionwinning.com`
- [ ] At TWA time: fill Play Data safety + App Privacy labels from §2 (not before)
- [ ] Cyber liability insurance quote (~$200–600/yr ballpark — verify with broker); bind before school/enterprise or data at scale — see [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md)
- [ ] Do not claim “we are insured” in Privacy until a policy exists
- [ ] Support auto-reply: refund requests → `/refunds` + `support@missionwinning.com`

---

## 4. Code map

| Surface | Path |
|---------|------|
| Privacy / Terms / DMCA UI | `src/page-components/PrivacyPage.tsx`, `TermsPage.tsx`, `DmcaPage.tsx` |
| Copy | `src/i18n/infoLocales.ts` |
| Landing AI line | `src/i18n/landingLocales.ts` (`landingProofNoAiKey`) |
| Public routes | `src/lib/publicRoutes.ts`, `app/sitemap.ts` |
| Nav | `LegalNav`, `AppLegalFooter`, `MarketingFooter` |
