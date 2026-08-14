# Compliance monitor (Vanta-lite)

**Not a certification.** This hub is continuous **control monitoring + evidence pointers** for Mission Winning. It does **not** issue SOC 2, ISO 27001, or HIPAA attestations. Product and marketing must not claim those certifications.

**HIPAA:** Framework **mapping only** for technical safeguards that resemble our stack. We are **not** a covered entity and **do not** claim to process PHI under HIPAA. See [LEGAL_SAFETY.md](LEGAL_SAFETY.md).

**Related:** [PROTECTION.md](PROTECTION.md) · [OWASP_AUDIT.md](OWASP_AUDIT.md) · [SECURITY_AUDIT_TRIAGE.md](SECURITY_AUDIT_TRIAGE.md) · [SECURITY.md](../SECURITY.md) · [PAY_READY_LEGAL.md](PAY_READY_LEGAL.md) · current census [security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md)

---

## Quick start

```bash
npm run compliance:status
npm run compliance:status -- --write-md   # refresh snapshot below
npm run compliance:status -- --ci         # write compliance-status.json (CI artifact)
```

Catalog source of truth: [`docs/compliance/controls.yaml`](compliance/controls.yaml).

Logic: [`src/lib/compliance/`](../src/lib/compliance/).

---

## Current snapshot

<!-- compliance-snapshot:start -->

_Generated 2026-08-14T07:09:24.188Z (catalog v2). Re-run `npm run compliance:status -- --write-md`._

| Framework | Pass | Partial | Manual | N/A | Fail |
|-----------|------|---------|--------|-----|------|
| soc2 | 44 | 7 | 5 | 1 | 0 |
| iso27001 | 27 | 6 | 4 | 1 | 0 |
| hipaa | 6 | 4 | 1 | 4 | 0 |
| ccpa | 11 | 0 | 0 | 0 | 0 |
| coppa | 4 | 0 | 0 | 0 | 0 |
| play_data | 1 | 1 | 0 | 0 | 0 |
| ftc_ai | 2 | 0 | 0 | 0 | 0 |

**Overall:** pass=48 · partial=8 · manual=5 · n_a=4 · fail=0

<!-- compliance-snapshot:end -->

---

## What this covers

| Framework | How we use it |
|-----------|----------------|
| **SOC 2** | Trust Services Criteria *subset* mapped to gate, CI, webhooks, headers, privacy docs |
| **ISO 27001** | Annex A *subset* aligned to the same evidence (not a full ISMS) |
| **HIPAA** | Security Rule technical-safeguard *map only* — BAA / covered-entity rows are `n_a` |
| **CCPA / CPRA** | Access, delete, no sale/share — `source_scan` against the executor, not the Privacy page alone |
| **COPPA** | Youth surface parked + consent secret fail-closed |
| **Play Data safety** | LEGAL_SAFETY §2 inventory; Console form is founder/partial until Internal |
| **FTC AI** | Live Privacy AI disclosure + LLM ZDR fail-closed |

One control can list multiple frameworks (crosswalk). `source_scan` is the default for code-backed rows. `doc_exists` remains only when the document *is* the control (Privacy page, Terms, SECURITY.md, AUP). Known-open hunt items evaluate as `partial` until the scan passes, then the catalog `known_open` flag must be removed or CI goes red.

---

## Founder cadence

**Weekly (10 min):** open `compliance-status.json` (or `npm run compliance:status`). Clear or schedule **manual** / **partial** controls (Supabase probe, Sentry DSN, DMCA agent, audit triage). Do **not** market pass counts as certification.

**Monthly (agent, when asked):** scoped hunt or `/cso` daily mode. Update the REDTEAM date only if a verdict *changed*. Refresh [OWASP_AUDIT.md](OWASP_AUDIT.md) the same way. Living census stays [security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md).

**Quarterly (founder):** advisory accept review (Solana `bigint-buffer`), secret rotation, cyber-insurance quote, Play Data safety form if Internal is open. Agents list these; they never tick them.

---

## CI evidence

- Workflow: `.github/workflows/ci.yml` → `compliance:status --ci` (fails the step on any `fail`; known-open hunts are `partial`) + artifact upload
- Dependabot: `.github/dependabot.yml` (npm + GitHub Actions, weekly)
- Optional CodeQL: `.github/workflows/codeql.yml` — enable GitHub Advanced Security on the repo if the job no-ops

---

## Appendix — Optional Probo later

When preparing for a **real** audit, consider self-hosting [Probo](https://github.com/getprobo/probo) (MIT GRC):

1. Deploy upstream Docker compose on a private host (not required for beta).
2. Import or re-enter controls from `docs/compliance/controls.yaml`.
3. Point evidence links at this repo’s CI artifacts and runbooks.
4. Keep product copy free of certification claims until an independent auditor issues a report.

**Out of scope for this repo slice:** deploying Probo, full HR policy pack, SIEM, paid Vanta/Drata.
