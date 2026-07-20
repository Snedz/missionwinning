# Data Processing Agreement (DPA) — draft template

**Not legal advice.** Customize per customer Order Form before signing. Consumer Super Bundle users do not need this DPA — Mission Winning is the **controller** for B2C accounts. Use this when a **business customer** (school, gym, employer) is controller and Mission Winning LLC processes personal data **on their behalf** (GDPR Art. 28–style).

**Status:** Template only — not a live public contract. Request signed copy: `support@missionwinning.com`.

**Related:** [LEGAL_SAFETY.md](../LEGAL_SAFETY.md) · [PAY_READY_LEGAL.md](../PAY_READY_LEGAL.md) · [OWASP_AUDIT.md](../OWASP_AUDIT.md) · [PROTECTION.md](../../PROTECTION.md)

---

## 1. Parties

- **Processor:** Mission Winning LLC (“Processor”, “we”)
- **Controller:** [Customer legal name] (“Controller”, “you”)
- **Effective date:** [date] · **Term:** coterminous with the Order Form / MSA unless terminated earlier

## 2. Roles and scope

Processor processes Personal Data solely to provide the Mission Winning service described in the Order Form (e.g. hosted PWA, auth, sync, optional school/class features), on documented instructions from Controller.

For direct consumer Super Bundle users of missionwinning.com, Mission Winning acts as **controller** — this DPA does not apply to those end-users.

## 3. Duration

Processing lasts for the term of the services agreement plus a reasonable period for deletion/return (see §8), unless law requires longer retention.

## 4. Nature and purpose

- Provide, secure, and support the Mission Winning application and related APIs
- Auth, cloud sync, optional email (consent/youth), optional analytics if configured for the Customer tenant
- Payments for Customer-billed seats may involve Stripe/PayPal as independent controllers/processors under their terms

## 5. Categories of data subjects

As determined by Controller, typically: students/athletes, teachers/coaches, parent contacts (youth consent), administrators.

## 6. Types of personal data

Aligned with [LEGAL_SAFETY.md](../LEGAL_SAFETY.md) inventory (as applicable to the deployment):

| Category | Examples |
|----------|----------|
| Identifiers | Email, account IDs |
| Fitness / activity | Workouts, logs, assessments, journey progress |
| Nutrition | Meal logs; optional meal photos for estimates (not ad library) |
| Communications | Support tickets; youth consent emails |
| Optional analytics | Typed product events if Customer enables |
| Optional AI context | Minimal coach summary if LLM features enabled |

**Not intended:** advertising IDs, Meta Pixel, Google Analytics ads tags.

## 7. Subprocessors

Controller authorizes Processor’s use of subprocessors necessary to deliver the service, including (as enabled):

| Subprocessor | Purpose |
|--------------|---------|
| Supabase | Auth, database, hosting |
| Vercel | Application hosting |
| Stripe / PayPal | Payments (when enabled) |
| Resend | Transactional email (when enabled) |
| PostHog (EU) | Product analytics (when allowed) |
| OpenAI-compatible LLM (e.g. SpaceXAI/xAI) | Optional AI coach features |

Processor will impose data-protection obligations no less protective than this DPA. Material subprocessor changes: notice via email or docs update; Controller may object on reasonable grounds.

## 8. Security

Processor implements technical and organizational measures appropriate to the risk, including access controls, TLS in transit, platform encryption at rest (host), webhook verification, and practices described in [PROTECTION.md](../../PROTECTION.md) and [OWASP_AUDIT.md](../OWASP_AUDIT.md). No SOC 2 / ISO / HIPAA certification is claimed by this DPA alone.

## 9. Breach notification

Processor will notify Controller **without undue delay** and where feasible within **72 hours** after becoming aware of a Personal Data Breach affecting Controller’s data, with available details and cooperation for Controller’s notification duties.

## 10. Assistance, audits, deletion

- Assist with data subject requests and DPIAs reasonably related to the processing
- Make available information necessary to demonstrate compliance; audits by mutual agreement (remote preferred; no more than annually unless material incident)
- On termination: delete or return Personal Data (Controller’s choice) within a commercially reasonable period, except copies required by law

## 11. International transfers

Where transfers from the EEA/UK require safeguards, parties will execute SCCs / UK IDTA or rely on other lawful mechanisms as applicable to the deployment.

## 12. Liability and governing law

Liability allocation follows the MSA / Order Form. Governing law: [state of formation of Mission Winning LLC / as in MSA], without conflict-of-law rules.

---

**Signature blocks** (Controller / Processor) — attach to Order Form.
