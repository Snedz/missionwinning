# Security audit — public OSS readiness (2026-08-05)

**Status:** Agent audit complete for phases A0–C (code + workflows). History gitleaks + GH settings remain **founder**.  
**Scope:** “If `github.com/Snedz/missionwinning` were public open source, what security issues exist or get worse?”  
**Tip audited:** web `2026.07-unified.538` on `master`.  
**Plan:** [.hermes/plans/2026-08-05_220314-public-oss-security-audit.md](../.hermes/plans/2026-08-05_220314-public-oss-security-audit.md)  
**Related:** [SECRETS.md](SECRETS.md) · [OWASP_AUDIT.md](OWASP_AUDIT.md) · [OPEN_SOURCE.md](OPEN_SOURCE.md) · [SECURITY.md](../SECURITY.md) · [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) R1

**Agents did not:** change repo visibility, flip `PRIVATE_MODE`, rotate credentials, or run full-history gitleaks (founder machine).

---

## 1. Executive summary

| Verdict | Detail |
|---------|--------|
| **Ready for Public source?** | **Conditionally.** Working tree has no confirmed live secrets in git. Existing AGPL + secrets program is solid. |
| **Blockers before flip** | (1) Founder **history** gitleaks + rotate if hits; (2) enable GH **secret scanning + push protection**; (3) treat **workflow_dispatch** jobs that hold deploy/DB secrets as environment-protected once the repo is public. |
| **Highest product/config risk** | **Mobile Bearer vs private gate (R1):** with `PRIVATE_MODE` on (default in production when unset), `proxy.ts` does **not** accept `Authorization: Bearer` — only gate cookie, optional cookie JWT bypass flag, or allowlisted public APIs. Android “bake cookie” is a dev posture, not GA. |
| **Highest dependency noise** | **11 high** npm advisories in optional **Solana/Phantom** graph — already triaged as Accept while crypto is optional ([SECURITY_AUDIT_TRIAGE.md](SECURITY_AUDIT_TRIAGE.md)). |
| **Critical code vulns found this pass?** | **None confirmed** in money webhooks, DEMO_PREMIUM, cron fail-closed, or beta-admin fail-closed paths reviewed. |

Public OSS **increases attacker knowledge** of every control below; it does not by itself open the live product if `PRIVATE_MODE` and secrets stay correct.

---

## 2. Method

| Phase | What ran | Result |
|-------|----------|--------|
| A0 | `npm run secrets:scan` | 2 **false positives** (i18n key names `rewardBadgeIron*Desc`) — not secrets |
| A0 | `git ls-files` env/keystores | Only `*.example` + create script; `docs/applications/*` answers **not** tracked (only README) |
| A0 | `git log --all --full-history -- .env.local .env` | **Empty** (no commits for those paths in this clone’s history) |
| A0 | Grep `sk_live_…` / `xai-…` / PEM headers in tree (excl. node_modules) | **No hits** in scanned tree |
| A0 | Local `.env.local` | Contains operator PII (admin email) — **gitignored**; must never be committed |
| B | Workflow review | No `pull_request_target`; no `uses:…@main`; dispatch-only deploy/sync/migrate |
| B | `npm audit --audit-level=high` | 11 high / 10 moderate — Solana/Phantom chain |
| C | Code review + unit pins | Stripe signature helper; cron Bearer; DEMO_PREMIUM prod refuse; beta admin fail-closed |
| C | Perimeter read | `PUBLIC_API_PATHS_WHILE_GATED` + cookie-only session bypass path |

**Not run (founder):** `gitleaks detect --source . -v` full history; live prod curl red-team; Supabase dashboard RLS apply verification.

---

## 3. Confirmed findings

| ID | Sev | Finding | Evidence | Public OSS impact | Recommendation |
|----|-----|---------|----------|-------------------|----------------|
| **F1** | **High (config / GA)** | ~~Private gate ignores mobile Bearer~~ → **Fixed `.539`** | `hasVerifiedSupabaseUser` + `authAccessToken` | — | Bake-cookie remains dev-only |
| **F2** | **Medium (ops)** | Powerful **workflow_dispatch** jobs (`sync-vercel-env`, `deploy-production`, `apply-migration`) inject many production secrets | Workflow YAML | On a **public** repo, anyone with write access (or compromised PAT) can dispatch | Add GitHub **Environments** with required reviewers; restrict who can run; prefer Deploy Hook for prod (already documented) |
| **F3** | **Medium (deps)** | npm **high** advisories via `@solana/web3.js` / Phantom | `npm audit` 11 high | More Dependabot noise; supply-chain review burden | Keep Accept in triage while crypto optional; quarantine crypto package path; re-audit before marketing crypto |
| **F4** | **Medium (ops)** | Actions **billing blocked** → gitleaks/CodeQL CI may not run | CONTEXT / known | Public flip without CI secret scan if Actions still dead | Local `secrets:scan` mandatory pre-flip; restore billing or rely on GH native secret scanning (free on public) |
| **F5** | **Low** | `secrets:scan` false positives on `rewardBadgeIron25Desc` / `100Desc` | gitleaks `generic-api-key` | Noise hides real leaks | Allowlist `rewardBadge.*Desc` (or path) in `.gitleaks.toml` |
| **F6** | **Low (info)** | CodeQL workflow cron disabled while private | `codeql.yml` comments | Missed static analysis | Re-enable schedule when Public; enable Code scanning in GH settings |
| **F7** | **Info** | Local `.env.local` holds founder admin email | Disk only; gitignored | If ever committed → Critical | Pre-flip history scan; rotate mental model: treat laptop env as sensitive |
| **F8** | **Info** | `docs/applications/*Answers*` exist on disk, gitignored | `git check-ignore`; `git ls-files` only README | Good | Keep ignore; never force-add |
| **F9** | **Info (positive)** | Stripe webhook fails closed without secret/signature | `stripeWebhookAuth.ts` + money routetests | — | Maintain tests |
| **F10** | **Info (positive)** | Cron routes 503 without `CRON_SECRET`, 401 on bad Bearer | `app/api/cron/*` | Fork footgun if secret missing (safe fail) | Document in OPEN_SOURCE operator notes |
| **F11** | **Info (positive)** | Beta admin fails closed if env unset | `betaAdminAuth.ts` | — | Maintain |
| **F12** | **Info (positive)** | `DEMO_PREMIUM` refused in production | premiumEnrollment + money tests | — | Maintain |
| **F13** | **Info (positive)** | No `pull_request_target` workflows found | `.github/workflows` | Classic public-repo footgun avoided | Keep avoiding |
| **F14** | **Low** | Gated public API allowlist includes payment webhooks, leads, crypto-checkout, crons | `PUBLIC_API_PATHS_WHILE_GATED` | Expected for gated beta; each path must keep own auth | Re-review allowlist at `PRIVATE_MODE=false`; ensure crypto still requires sign-in (confirmed on intent/confirm) |
| **F15** | **Medium (accepted prior)** | Youth client consent skip UX vs server fail-closed | OWASP residual | Same | No change this pass |
| **F16** | **High if true (uncleared)** | Secrets in **older git history** not covered by tree scan | SECRETS.md warning; history scan not run here | Public clone of full history | **Founder:** `gitleaks detect --source . -v` before Public; rotate any hit |

---

## 4. Hypotheses cleared / narrowed

| Plan ID | Status |
|---------|--------|
| H1 history secrets | **Uncleared** — path-specific log empty for `.env*`; full gitleaks still required |
| H2 docs PII in git | **No gmail in `git grep`**; local only |
| H3 Bearer/R1 | **Confirmed** as config/architecture (F1) |
| H4 cron unauth | **Cleared** for reviewed cron routes (fail-closed) |
| H6 DEMO_PREMIUM | **Cleared** (tests green) |
| H7 Stripe forge | **No issue found** in auth helper + tests (full webhook handler not line-audited end-to-end this pass) |
| H10 npm high | **Confirmed noise/accept** (F3) |
| H12 PR target | **Cleared** (none) |

---

## 5. Pre-public checklist status ([SECRETS.md](SECRETS.md))

| # | Item | Status |
|---|------|--------|
| 1 | `npm run secrets:scan` clean | **Almost** — 2 FP (F5); treat as clean after allowlist |
| 2 | History gitleaks | **Founder pending** (F16) |
| 3 | No personal gmail / real Vercel IDs in docs | **No gmail in git grep** this pass |
| 4 | applications paste packs gitignored | **OK** (only README tracked) |
| 5 | GH secret scanning + push protection | **Founder** (free when Public) |
| 6 | CodeQL enable | **Founder** (F6) |
| 7 | Flip Public | **Founder only** |
| 8 | Do not flip PRIVATE_MODE with OSS | **Still correct** |

---

## 6. Residual accepted risks (carry forward)

- Solana/Phantom high CVEs while crypto optional  
- No SIEM (A09 partial)  
- Youth client consent UX skip  
- Multi-instance rate limit depends on Upstash/config  
- Service-role surface is large (~20 modules) — deeper RLS live verify still recommended (Phase D founder)  
- Actions billing may block CI enforcement until restored  

---

## 7. Remediation backlog

| Priority | Action | Owner |
|----------|--------|-------|
| P0 | Full-history gitleaks + rotate if needed | Founder |
| P0 | Before Android GA: resolve F1 (Bearer or allowlist or public mode) | Founder + API |
| P1 | GH Environment protection on deploy/sync/migrate workflows | Founder |
| P1 | Enable secret scanning / push protection at Public | Founder |
| P2 | Gitleaks allowlist reward badge i18n keys | Agent (this follow-up) |
| P2 | Re-enable CodeQL schedule when Public | Founder |
| P3 | Crypto package quarantine / upgrade path | Eng when marketing crypto |
| P3 | Phase D live RLS review on Supabase | Founder |

---

## 8. What public OSS would *not* automatically break

- Stripe signature checks  
- Cron without secret (stays 503)  
- Beta admin without config (stays closed)  
- Free offline logger (client-local)  
- AGPL obligation (legal, not a vuln)  

---

## 9. Follow-up agent work (optional Go)

1. Patch `.gitleaks.toml` allowlist for `rewardBadge.*Desc`  
2. Add unit test or doc note that proxy does not honor Bearer (pin F1 so it cannot regress silently once fixed)  
3. Phase D: service-role call map → RLS checklist  
4. Refresh [OWASP_AUDIT.md](OWASP_AUDIT.md) residual with link to this doc  

---

Changelog: `2026-08-05 — initial public OSS readiness audit (agent A0–C).`
