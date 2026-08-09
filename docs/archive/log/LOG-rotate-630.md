## 2026-08-08 — Platform contracts, dual-repo, public OSS scrub (`.615`)

**Structure for multi-agent scale + product tip safe enough to open-source later.**

**Dual-repo / classification.** [docs/CLASSIFICATION.md](docs/CLASSIFICATION.md) and [docs/DUAL_REPO.md](docs/DUAL_REPO.md). Local staging is gitignored **`ops/`**; **`npm run ops:sync`** stages founder + strategy into private [mission-ops](https://github.com/Snedz/mission-ops) without committing it to the product tree. `.hermes/` is gitignored. `classificationGuard.test.ts` fails if hermes/ops are tracked **or** if relocated INTERNAL stubs regrow into full war-room memos.

**Public OSS scrub (founder: move all borderline docs).** Full text of STRATEGY, REDTEAM, PRELAUNCH_CAPITAL, OUTREACH_VA_BRIEF, YC_THESIS, ACCELERATOR_SPRINT, and PRICING_REVIEW now lives only in **mission-ops** `strategy/`. Product paths keep short stubs marked `RELOCATED_TO_MISSION_OPS`. `secrets:scan` is **0** (gitleaks allowlist for i18n FP `footerLegalA11y`). History residual documented in SECRETS (treasury pubkey in old LOG; no private key found). Audit note: [docs/SECURITY_PUBLIC_OSS_AUDIT_2026-08-08.md](docs/SECURITY_PUBLIC_OSS_AUDIT_2026-08-08.md). Workflow Environments guidance for public repos in VERCEL_DEPLOY_CHECKLIST §1.3.

**Platform contracts.** [docs/contracts/](docs/contracts/INDEX.md) — IDENTITY, ECONOMY, MODULE, AI_INTEROP. `packages/mw-core` adds **economy** + **module** pure types (`HEALTH_TRAIN_MANIFEST` free-core seed). Identity kernel already S1–S2; [src/lib/identity/INDEX.md](src/lib/identity/INDEX.md) resume card.

**Not this ship:** GitHub visibility flip (founder later); `PRIVATE_MODE` flip; history rewrite; games/metaverse.

Rotated LOG `.600` → [docs/archive/log/LOG-rotate-615.md](docs/archive/log/LOG-rotate-615.md).
