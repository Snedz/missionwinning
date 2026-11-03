# Qatar START: research refresh (fetched Sat Oct 24, 2026, ~4:50 PM ET)
Replaces the Oct 9–21 pack for anything below. Older files are still valid for pricing comps, export controls, and the OSS stack: /workspace/research/2026-10-09-qatar-gpu-cloud.md, /workspace/research/QATAR_NONWEST_COMPS_2026-10-21.md

## Program (official pages, fetched today)
| Fact | Today | Changed vs mid-Oct? | Source |
|---|---|---|---|
| Status | Open. No deadline or cohort date is published anywhere, so it's rolling. Apply via the "online application form" link (F6S). | No | https://www.qdb.qa/en/financing-and-funding/equity-and-investment/startup-qatar-investment-program |
| Funding | START up to US$1.1M, "trenched based on mutually agreed milestones". GROW up to $5.5M. | No | same, and https://startupqatar.qa/en/investment-program |
| START criteria (the 4 the panel scores) | (1) unmet market need with a clear objective and an execution plan backed by a detailed technology roadmap; (2) **validated concept**; (3) market readiness: research, business model, monetization; (4) committed leadership team with relevant experience. | No | QDB FAQ |
| **Stage expectation** | Startup Qatar's page: START "targets entrepreneurs with a **Proof of Concept (PoC) or Minimum Viable Product (MVP)**". | **Newly flagged.** Our draft treated this as soft. It's the biggest gap. | https://startupqatar.qa/en/investment-program |
| Who may apply | "Tech startups … to establish or expand operations in Qatar". No nationality rule, no rule against a solo founder, and incorporating in Qatar first isn't required. GulfPitch (secondary): "Open to companies from abroad — Must establish or expand operations in Qatar". | No | QDB; https://gulfpitch.com/programs/startup-qatar-investment-program/ |
| Terms | Equity (QDB invested via this program in Multiverse Computing, Aug 2026). The stake size isn't published. | New context | GulfPitch (secondary) |
| Benefits | Registration and licence-fee waivers, entrepreneur visa, subsidized coworking and housing, R&D grants, industry adoption | No | QDB |
| F6S form | **Still login/bot-gated.** WebFetch returned 403 and curl got a JS bot check. Questions are NOT verbatim. | No | f6s.com/sqinvestmentprogram |

## AI Compute Credits (Qai): still offered
- Separate program with a separate application. It needs a **registered/incorporated company** with current or planned operations in Qatar, founders or core tech team based (or planned) in Qatar, and a justified GPU need. Preference goes to a prototype, MVP or traction. Credits are "capped", with no amount published. Onboarding is done by Qai engineers. https://startupqatar.qa/en/ai-credits
- Implication: apply AFTER the company exists. It's a good T1 milestone and can support an MVP.

## Residency (Jusour), current rules
- Endorsement by a partner incubator (QDB, QFTH, QBIC, Scale 7, QSTP) **or Startup Qatar**.
- Overseas applicants: passport with 6+ months validity, photo, CV, **attested 3-month bank statement with a minimum of US$10,000**, and an **attested police clearance**. Attestation goes issuer → the issuing country's MFA → the Qatar Embassy. A Qatar branch of his bank can't attest.
- It's a "self-sponsored five-year residency". https://jusour.qa/en/programs/entrepreneurs ; https://jusour.qa/en/faqs ; https://www.invest.qa/docs/FAQs-Residency-Programs.pdf (via search snapshot; jusour.qa blocked direct fetch today)
- **Honest read:** START is for launching *in Qatar*. Visa perks only make sense if a founder lives there. Being US-based and running a Qatar company remotely contradicts the program, so he needs a real Doha commitment, or at least a credible Doha-based cofounder or GM. Nothing official says a non-resident founder is disqualified at the application stage.

## Competitors / suppliers (sourced today)
- **Qai** (QIA): deploying "latest generation" GPUs in a MEEZA QSTP data centre (Oct 4–7, 2026). Pitched to *enterprises*. No public API, price or self-serve product. https://www.trustqai.com/media/qai-and-meeza-to-deliver-ai-infrastructure-services ; LinkedIn post Oct 7, 2026
- **Ooredoo / Syntys**: AI BareMetal on Hopper, plus a Rafay GPU PaaS with "self-service access to GPU resources" and **NVIDIA NIM Model-as-a-Service** for enterprise customers (Dec 15, 2025). No public price. https://www.ooredoo.qa/web/en/press-release/ooredoo-qatar-expands-leadership-in-sovereign-ai-infrastructure/ ; https://www.ooredoo.qa/web/en/business/ict-solutions/nvidia/
  - ⚠ This is the closest competitor to an "OpenAI-compatible inference API in Qatar". Our pitch can't claim "first inference API in Qatar". Defensible claim: *publicly priced, pay-as-you-go, developer self-serve, Arabic-first*. That's an inference from public pages showing no prices.
- **MEEZA MAI**: GPUaaS "hosted and managed entirely within Qatar" (Nov 2, 2025). No price. https://www.meeza.net/meeza-launches-mai-...
- **MintAI** (Doha): "2,000 GPUs planned", 5 MW. "Model deployment and managed AI". Products are "in pilot". https://mintai.me/
- **Fanar** (QCRI): its terms still license use "for personal and non-commercial purposes only". **We can't resell the Fanar API.** The open Fanar weights on HF (Fanar-2-27B, Apache-2.0 per the Oct 9 pack) are the commercial route; recheck the licence before launch. https://fanar.qa/en/terms-of-services
- Core42 (UAE): H100 from $2.50/hr (aggregator, Oct 9 pack, not re-fetched today). Its UAE-only US export exception (July 2026) still stands per the Oct 9 pack.

## QCB in-country angle (unchanged; sourced Oct 14)
QCB Cloud Computing Regulation §21.4: PII and financial information must be "processed within Qatar only". QCB approval is required before a cloud arrangement. https://www.qcb.gov.qa/Documents/InformationSecurity/Cloud%20Computing%20Regulation.pdf . Outside finance and sensitive government data, PDPPL allows cross-border flows, so residency is a sector-driven need, not universal.

## Material changes vs the Oct 14 draft
1. **Concept reset:** the Oct 14 draft made "Marṣad" the company, renting GPUs by the hour. Snowden's current choice is a **new Qatar company**, separate from Mission Winning and Marṣad, selling an **OpenAI-compatible Arabic inference API** on leased in-country NVIDIA GPUs. answers.md is rewritten for that.
2. The PoC/MVP expectation is now explicit, so a tiny working demo before submitting matters more than anything else.
3. Qai is now live-deploying with MEEZA, and Ooredoo has NIM MaaS. The differentiation claim is narrowed.
4. Fanar's hosted API can't be resold, so we serve open-weight models only.
