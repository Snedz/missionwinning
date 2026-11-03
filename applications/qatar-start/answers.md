# Qatar START: draft answers (DRAFT, NOT SUBMITTED). Updated Oct 24, 2026, ET
**Wording warning:** the F6S form is login-gated, so **none of these questions is verbatim.** Tags: [CRITERIA] = maps to an official START criterion (QDB FAQ). [ASSUMED] = a typical accelerator question. [FILL] = only Snowden can answer. Re-map these once he screenshots the real form. Answers are kept to about 500 characters or less because limits are unknown.
Honesty rules: no traction, LOIs, partners or customers are claimed. Suppliers are named only as *intended* suppliers. Any number without a source is marked ESTIMATE.

## A. Company and product
**Q1. Company name / website** [ASSUMED]
[FILL: company name]. A new company to be incorporated in Qatar (planned: QSTP-LLC, to be confirmed with Qatari counsel). No website yet. [FILL: domain if bought]

**Q2. One-line pitch** [ASSUMED]
An Arabic-first, OpenAI-compatible AI inference API running on NVIDIA GPUs inside Qatar, with public pay-as-you-go pricing, so Qatari developers and regulated firms can ship Arabic AI without sending data abroad.

**Q3. Unmet need** [CRITERIA 1]
QCB requires regulated firms to process PII and financial data "within Qatar only" (Cloud Computing Regulation §21.4). Today in-country GPU and inference capacity (Ooredoo, MEEZA, Qai) is sold by quote to enterprises. In our desk research we found no publicly priced, pay-per-token, developer self-serve API in Qatar serving Arabic models. Startups and fintech teams need to prototype on day one with a card, not a sales cycle.

**Q4. Solution** [CRITERIA 1]
A software layer on top of leased in-country NVIDIA capacity: an OpenAI-compatible endpoint (drop-in for existing SDKs), open-weight Arabic and multilingual models (e.g. Fanar-2-27B, Qwen3 and others, licences checked), usage metering and billing, a console and keys, audit logs, and in-Qatar data processing with no prompt retention by default. Later: dedicated endpoints and fine-tuning for regulated clients. We lease GPUs rather than buy them.

**Q5. Proof of concept / MVP** [CRITERIA 2]
OPTION A (if a demo is built first): "Working PoC since [FILL date]: [FILL URL]. OpenAI-compatible endpoint serving [model] on NVIDIA GPUs (currently outside Qatar; it moves in-country at T1)."
OPTION B: "Concept stage (October 2026). Architecture and open-source stack selected (vLLM, NVIDIA GPU Operator, Kubernetes, OpenMeter). No MVP yet." ← weakest answer; START targets PoC/MVP stage.

**Q6. Technology roadmap (ESTIMATE timing)** [CRITERIA 1]
M0–3: incorporate, apply for Qai AI Compute Credits, lease the first in-country NVIDIA capacity, public API beta with metering and a price page. M4–9: dedicated endpoints, audit logs, start ISO 27001, QCB documentation pack for regulated buyers. M10–18: fine-tuning service, reserved-capacity contracts, Arabic dialect evaluation suite. Stack: vLLM, Kubernetes, NVIDIA GPU Operator, DCGM, OpenMeter (all permissive licences).

**Q7. Validation to date** [CRITERIA 2]
No customers, LOIs, pilots or partnerships yet. Done: desk research (Oct 2026) on Qatari regulation (QCB, PDPPL), in-country providers and public GPU pricing; open-model licence review. [FILL: any real conversations with Qatari developers or buyers; leave out if none.] [FILL: PoC metrics if Option A.]

## B. Market and model
**Q8. Target customers** [CRITERIA 3]
1) Qatari startups and developers building Arabic AI products. 2) QCB-regulated fintechs, banks and insurers needing in-country processing. 3) Later: healthcare and government-adjacent bodies. Market size: [FILL or omit]. We have no sourced Qatar figure and won't invent one.

**Q9. Business model** [CRITERIA 3]
Pay-as-you-go per million tokens, with public prices; monthly dedicated endpoints; enterprise tiers for in-country hosting, audit and SLA. The margin is token revenue over leased GPU cost. Benchmark: the only public in-Qatar H100 price we found is Google Cloud Doha at about $13.34 per GPU-hour (GPUQuant, Sep 2026), versus Asian neoclouds at roughly $2.50–4 per hour. Our price points are ESTIMATE until supplier quotes come in.

**Q10. Competitors and differentiation** [CRITERIA 3]
In Qatar: Ooredoo/Syntys (GPU PaaS plus NVIDIA NIM model-as-a-service for enterprises), MEEZA MAI (GPUaaS), Qai (QIA; deploying GPUs at MEEZA, Oct 2026), MintAI (2,000 GPUs planned). Regional: Core42 (UAE), HUMAIN (KSA). None publishes self-serve per-token prices on their sites as of Oct 24, 2026. Our difference: a public price page, sign-up in minutes, Arabic-first models and docs, data processed in Qatar. Several incumbents are also our intended suppliers.

**Q11. Go-to-market** [CRITERIA 3]
Developer-led: free trial credits, docs and SDK compatibility, Arabic AI hackathons. Direct outreach to fintech cohorts (QFTH, QBIC) and QDB portfolio companies. Use START's "adoption by industries" introductions for the first regulated pilot. No outreach has started yet.

## C. Team
**Q12. Founders** [CRITERIA 4]
Solo founder: [FILL legal name], [FILL 2–3 lines: real experience with software, infra, AI, shipping products]. Plan: hire a Doha-based Arabic-speaking cofounder (enterprise sales or infra). Nobody is identified yet.

**Q13. Team size** [ASSUMED]
1 (founder). No employees.

**Q14. Will founders be based in Qatar?** [ASSUMED; central to the program]
[FILL decision.] If yes: "Yes. I will relocate to Doha on the Jusour Entrepreneur Residency after endorsement, by [FILL month/year]." (Overseas requirements: attested 3-month bank statement of at least US$10K and an attested police clearance.) Don't answer yes unless it's true.

## D. Legal and financial
**Q15. Registration status** [ASSUMED]
Not yet incorporated. Planned QSTP-LLC after acceptance (START waives registration fees). [FILL: whether to disclose the founder's separate US LLC, if asked.]

**Q16. Funding raised** [ASSUMED] US$0.
**Q17. Revenue (last 12 months)** [ASSUMED] US$0.

**Q18. Funding requested / use of funds (ESTIMATE)** [ASSUMED]
Up to US$1.1M over 18 months in milestone tranches: founder salary $120K; 2 Doha engineers $264K; Arabic-speaking cofounder or GM $100K; leased in-country GPU capacity $205K (quote pending); security and compliance $60K; legal including export-control counsel $40K; relocation $40K; go-to-market $50K; reserve $221K. No hardware purchases.

**Q19. Milestones per tranche (proposal)** [ASSUMED]
T1 (M0–3): company set up, founder residency, Qai credits applied for, public API beta live in Qatar. T2 (M4–9): 3 paying customers including 1 QCB-regulated pilot. T3 (M10–15): a revenue target agreed with QDB and a first reserved contract. T4 (M16–18): ISO 27001 and a fine-tuning service.

**Q20. Key risks** [ASSUMED]
Well-funded incumbents could publish self-serve prices; suppliers are also competitors; solo founder not yet in Qatar; US export rules on advanced GPUs (we lease only from in-country holders and get written counsel advice); thin reseller margins; residency demand concentrated in finance and government; open-model licence drift.

**Q21. Why Qatar / how did you hear of us** [ASSUMED]
QCB's in-country processing rule, Qatar's national AI strategy, new local GPU capacity (Qai/MEEZA, Ooredoo), and START plus Qai compute credits let a startup launch on sovereign capacity without buying hardware. Heard via: [FILL].

## Uploads (likely; confirm on the form)
- Pitch deck: the old /workspace/qatar/pitch-deck.pdf describes the Marṣad GPU-rental concept. **It must be rebuilt for the API concept.**
- Founder CV or profile: [FILL facts].
- Financials: /workspace/qatar/financials.xlsx needs re-basing to token revenue (ESTIMATE).
- Demo link: needed for Option A.
