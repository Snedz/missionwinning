# Security audit — public OSS prep (2026-08-08)

**Status:** Cleanup implemented on product tip — **GitHub visibility still PRIVATE** (founder flips later).  
**Branch intent:** public-ready scrub + dual-repo; not a site `PRIVATE_MODE` flip.  
**Related:** [SECURITY_PUBLIC_OSS_AUDIT_2026-08.md](SECURITY_PUBLIC_OSS_AUDIT_2026-08.md) · [CLASSIFICATION.md](CLASSIFICATION.md) · [SECRETS.md](SECRETS.md) · [OPEN_SOURCE.md](OPEN_SOURCE.md)

---

## Executive summary

| Verdict | Detail |
|---------|--------|
| **Ready for Public source?** | **Much closer.** War-room full text removed from product tip; `secrets:scan` green; ops private. |
| **Still founder-owned** | Visibility flip; GH secret scanning once Public; Environments on dispatch jobs; optional treasury rotation |
| **ops/** | Never in product git; remote [Snedz/mission-ops](https://github.com/Snedz/mission-ops) **PRIVATE** |
| **Critical app vulns this pass** | None newly confirmed beyond prior audit baseline |

---

## Measurements

| Check | Result |
|-------|--------|
| `npm run secrets:scan` (working tree) | **0** leaks (FP `footerLegalA11y` allowlisted) |
| `gitleaks detect --source .` history (756 commits) | **2** same FP only; no live key material |
| History residual (manual) | Solana treasury **pubkey** in old LOG; secret file path noted historically |
| INTERNAL full memos in tip | **Stubs only** — STRATEGY, REDTEAM, capital, outreach, YC, accelerator, pricing |
| `ops/` / `.hermes/` tracked | **0** |
| npm high advisories | ~11 high — largely Solana/Phantom (accepted while crypto optional) |
| Dependabot open | 21 (monitor; no force-fix this pass) |

---

## What changed this pass

1. Relocated full war-room + GTM docs → private mission-ops; product **stubs** with `RELOCATED_TO_MISSION_OPS`.  
2. `classificationGuard.test.ts` fails if stubs grow into full memos again.  
3. `.gitleaks.toml` allowlist for i18n/nav false positives.  
4. SECRETS history residual table; OPEN_SOURCE pre-public checklist updated.  
5. VERCEL_DEPLOY_CHECKLIST §1.3 Environments guidance for public repos.  
6. Dual-repo / contracts / platform types (`.615` structure) included in the public-safe tip.

---

## Founder flip checklist (do not automate)

See [OPEN_SOURCE.md](OPEN_SOURCE.md) § Public GitHub flip. Summary:

- [ ] mission-ops private and current  
- [ ] `npm run secrets:scan` = 0  
- [ ] Read history residual (treasury)  
- [ ] Enable secret scanning + push protection **after** Public  
- [ ] Environments on dangerous workflows  
- [ ] **Do not** flip `PRIVATE_MODE` with OSS  
- [ ] Change visibility → Public  

---

## Residual accepted risks

| Risk | Mitigation |
|------|------------|
| Solana/Phantom high CVEs | [SECURITY_AUDIT_TRIAGE.md](SECURITY_AUDIT_TRIAGE.md); server-fixed USDC amount + session confirm |
| Treasury pubkey in history | Public-by-design receive address; private key offline only |
| Strategy still in **old git history** | Tip scrubbed; full rewrite out of scope unless private key leak proven |
| Dispatch workflows with secrets | Deploy Hook primary; Environments when Public |
