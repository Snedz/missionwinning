# Pay-ready legal pack (six documents)

**Not legal advice.** Documents protect the business under the code — counsel should review before disputes. Templates from the internet protect nobody; this pack is Mission Winning–specific.

**Live consumer pages:** [/terms](https://missionwinning.com/terms) · [/privacy](https://missionwinning.com/privacy) · [/usage](https://missionwinning.com/usage) · [/regions](https://missionwinning.com/regions) · [/service-terms](https://missionwinning.com/service-terms) · [/refunds](https://missionwinning.com/refunds) · [/dmca](https://missionwinning.com/dmca)

**Related:** [LEGAL_SAFETY.md](LEGAL_SAFETY.md) · [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) · [PRE_REVENUE_CHECKLIST.md](PRE_REVENUE_CHECKLIST.md) · [COMPLIANCE.md](COMPLIANCE.md) · [legal/DPA.md](legal/DPA.md) · [legal/MSA_TEMPLATE.md](legal/MSA_TEMPLATE.md) · [STRIPE_DISPUTE_OPS.md](STRIPE_DISPUTE_OPS.md) · **Counsel pack:** [legal/COUNSEL_BRIEF.md](legal/COUNSEL_BRIEF.md) · [legal/exports/](legal/exports/)

---

## Status checklist

| # | Document | Status | Where | Owner |
|---|----------|--------|-------|-------|
| 1 | Terms of Service / Use | **Live** | `/terms` · `TermsPage` · `infoLocales` · **Europe not supported** | Agent draft · Founder counsel review |
| 2 | Privacy Policy | **Live** | `/privacy` · deletion SLA 30 days · subprocessors · territorial scope | Agent · Founder |
| 2b | Usage Policy (AUP) | **Live** | `/usage` · [legal/ACCEPTABLE_USE.md](legal/ACCEPTABLE_USE.md) | Agent · Founder |
| 2c | Supported Regions | **Live** | `/regions` · Europe, Canada, **Ukraine**, OIC excluded · `src/lib/legal/supportedRegions.ts` | Agent · Founder |
| 2d | Service-Specific Terms | **Live** | `/service-terms` · Bundle / Coach / Android | Agent · Founder |
| 3 | Data Processing Agreement | **Template** | [legal/DPA.md](legal/DPA.md) — B2B/school only | Agent template · Founder per deal |
| 4 | Refund Policy | **Live** | `/refunds` · 14-day defaults | Agent · Founder ops |
| 5 | Master Service Agreement | **Template** | [legal/MSA_TEMPLATE.md](legal/MSA_TEMPLATE.md) — not consumer footer | Agent template · Founder per deal |
| 6 | Cyber liability insurance | **Founder** | Checklist below — not claimed in Privacy until purchased | Founder |

---

## B2C vs B2B

- **Super Bundle (now):** Terms + Privacy + Refunds are required before charging at scale. DPA/MSA are **not** required for individual consumers (MW is controller).
- **School / enterprise (later):** Attach signed DPA + MSA + Order Form; obtain cyber coverage before “data at scale.”

---

## Founder checklist (insurance + closeouts)

- [ ] Cyber liability quote (~$200–600/yr typical small-SaaS ballpark — verify with broker); bind before school/enterprise or large PII volume
- [ ] Do **not** add “we are insured” to Privacy until a policy exists
- [ ] Counsel review of Terms arbitration + refunds ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1b)
- [x] LLC formation state = **Texas** (confirmed 2026-08-13) — live Terms governing law + [legal/COUNSEL_BRIEF.md](legal/COUNSEL_BRIEF.md) entity table. Stripe business account under the LLC is still pending; do not treat checkout as live while FREE_BETA is on. [LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1d still describes the pre-checkout window.
- [ ] Trademark clearance / filing for “Mission Winning” ([LLC_AND_PAYMENTS.md](LLC_AND_PAYMENTS.md) §1c)
- [ ] DMCA agent filed (see [LEGAL_SAFETY.md](LEGAL_SAFETY.md))
- [ ] Support mailbox knows refund subject line + `/refunds` link
- [ ] Pre-launch capital tiers: [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md)

---

## Agent code map

| Surface | Path |
|---------|------|
| Refunds UI | `src/page-components/RefundsPage.tsx` · `app/(app)/refunds/` |
| Terms / Privacy | `TermsPage.tsx` · `PrivacyPage.tsx` · `src/i18n/infoLocales.ts` |
| Nav | `LegalNav` · `AppLegalFooter` · `MarketingFooter` |
| Hub | This file |
