# Compliance monitor (Vanta-lite)

**Not a certification.** This hub is continuous **control monitoring + evidence pointers** for Mission Winning. It does **not** issue SOC 2, ISO 27001, or HIPAA attestations. Product and marketing must not claim those certifications.

**HIPAA:** Framework **mapping only** for technical safeguards that resemble our stack. We are **not** a covered entity and **do not** claim to process PHI under HIPAA. See [LEGAL_SAFETY.md](LEGAL_SAFETY.md).

**Related:** [PROTECTION.md](../PROTECTION.md) · [OWASP_AUDIT.md](OWASP_AUDIT.md) · [SECURITY_AUDIT_TRIAGE.md](SECURITY_AUDIT_TRIAGE.md) · [SECURITY.md](../SECURITY.md)

---

## Quick start

```bash
npm run compliance:status
npm run compliance:status -- --write-md   # refresh snapshot below
npm run compliance:status -- --ci         # write compliance-status.json (CI artifact)
```

Catalog source of truth: [`compliance/controls.yaml`](compliance/controls.yaml).

Logic: [`src/lib/compliance/`](../src/lib/compliance/).

---

## Current snapshot

<!-- compliance-snapshot:start -->

_Generated 2026-07-20T05:31:00.834Z (catalog v1). Re-run `npm run compliance:status -- --write-md`._

| Framework | Pass | Partial | Manual | N/A | Fail |
|-----------|------|---------|--------|-----|------|
| soc2 | 30 | 7 | 2 | 1 | 0 |
| iso27001 | 29 | 6 | 1 | 1 | 0 |
| hipaa | 6 | 4 | 0 | 4 | 0 |

**Overall:** pass=32 · partial=7 · manual=2 · n_a=4 · fail=0

<!-- compliance-snapshot:end -->

---

## What this covers

| Framework | How we use it |
|-----------|----------------|
| **SOC 2** | Trust Services Criteria *subset* mapped to gate, CI, webhooks, headers, privacy docs |
| **ISO 27001** | Annex A *subset* aligned to the same evidence (not a full ISMS) |
| **HIPAA** | Security Rule technical-safeguard *map only* — BAA / covered-entity rows are `n_a` |

One control can list multiple frameworks (crosswalk).

---

## Founder cadence (weekly)

1. Open latest CI artifact `compliance-status.json` (or run locally).
2. Clear or schedule **manual** / **partial** controls (Supabase probe, Sentry DSN, DMCA agent, audit triage).
3. Do **not** market pass counts as certification.

---

## CI evidence

- Workflow: `.github/workflows/ci.yml` → `compliance:status --ci` (soft) + artifact upload
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
