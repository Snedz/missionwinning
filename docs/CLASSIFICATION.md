# Classification — what may enter git, and what must not

**Audience:** Founder + AI agents  
**Related:** [DUAL_REPO.md](DUAL_REPO.md) · [OPEN_SOURCE.md](OPEN_SOURCE.md) · [SECRETS.md](SECRETS.md) · [SECURITY.md](../SECURITY.md)

Open source is a **trust product** for the free core. It is not a reason to publish the war room. GitHub cannot make half a monorepo private — treat classification as a **path contract**, enforced by agents and by the dual-repo split.

---

## Classes

| Class | Lives where | Examples |
|-------|-------------|---------|
| **PUBLIC** | Product repo (this tree when flipped public) | Source, tests, help, architecture, agent conventions, contracts, design system, LICENSE, SECURITY policy |
| **INTERNAL** | Private ops repo only (`mission-ops`) | STRATEGY detail, REDTEAM attack plans, capital, outreach scripts, long-term everything vision, pricing experiments, accelerator paste packs |
| **SECRET** | Vercel / GitHub Actions / local `.env.local` only | Keys, service role, treasury, deploy tokens |
| **LOCAL** | Machine only — never git | `.hermes/plans/`, `~/.grok/sessions/`, `~/.cursor/plans/`, `ops/` working copy, gbrain |

**Rule of thumb:** if a document would help a funded competitor kill the company in 90 days, it is **INTERNAL**, not PUBLIC.

**Third-party consumer fitness product names** (research, steal/avoid, vs-copy, “like {app}” comments) are **INTERNAL**. They live in `ops/intel/` (local mount of private mission-ops). The product tree uses Mission Winning vocabulary only: set table, Fuel notepad, photo log, pinned home, Super Bundle. OS health stores (Apple Health, Health Connect) and live OAuth partners the product actually talks to may be named at the integration boundary. The plaintext name list is **not** in this file — listing it here would be the leak. Local check: `npm run names:check` (runs when `ops/intel/NAME_DENYLIST.md` is mounted).

---

## PUBLIC (safe in this repo)

| Path | Notes |
|------|--------|
| `src/`, `app/`, `packages/`, `apps/`, `tests/`, `scripts/` | Product code (no secrets) |
| `docs/help/`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DESIGN_*` | Customer + engineering |
| `docs/contracts/` | Interop specs for multi-agent / multi-module future |
| `docs/CLASSIFICATION.md`, `docs/DUAL_REPO.md`, `docs/OPEN_SOURCE.md`, `docs/SECRETS.md` | Security posture |
| `AGENTS.md`, `INDEX.md`, `vision.md` (constitution), `CONTRIBUTING.md` | Agent spine |
| `CONTEXT.md` | Product status only — no private capital/personal PII |
| `ORCHESTRATION.md` | Horizon gates (product discipline, not competitive intel dumps) |
| `LOG.md` | Ship log (product facts) |

## INTERNAL (full text only in mission-ops)

Product tree keeps **stubs** (marker `RELOCATED_TO_MISSION_OPS`). Full text: private [mission-ops](https://github.com/Snedz/mission-ops) `strategy/`.

| Path | Why |
|------|-----|
| `docs/STRATEGY.md` | Competitive positioning, first-user playbook detail |
| `docs/REDTEAM.md` | Pre-mortem + competitor attack plan |
| `docs/PRELAUNCH_CAPITAL.md` | Capital / runway |
| `docs/OUTREACH_VA_BRIEF.md` | Outreach ops |
| `docs/YC_THESIS.md` | Fundraising narrative detail |
| `docs/ACCELERATOR_SPRINT.md` | Accelerator calendar / paste routing |
| `docs/PRICING_REVIEW_2026-08.md` | Pricing experiments |
| `docs/applications/*` answers | Already gitignored — keep that way |
| Long-term everything / board memos | `ops/` or mission-ops only |
| Competitive intel, named steal/avoid, store stills, vs-copy | `ops/intel/` (and mission-ops once pushed). Product ships nameless patterns. |
| Session plans under `.hermes/` | LOCAL — gitignored |

**Scrubbed for public OSS (2026-08-08):** war-room + YC/accelerator/pricing full text removed from product tip; stubs only. Agents **must not** recreate full memos in the product tree — write only in private ops.

## SECRET / LOCAL (never git)

See [SECRETS.md](SECRETS.md). Plus:

| Path | Rule |
|------|------|
| `.hermes/` | **gitignored** — session plans are LOCAL |
| `ops/` | **gitignored** — local staging for mission-ops |
| `.env*.local` | Already gitignored |

---

## Agent rules

1. Before commit: if the path is INTERNAL/SECRET/LOCAL, **do not stage it** for the product repo.  
2. Prefer contracts + public architecture over pasting strategy memos into `src/` comments.  
3. Never invent traction numbers (hard rule).  
4. Never flip GitHub visibility or `PRIVATE_MODE`.  
5. Session plans (`~/.grok`, `.hermes`, cursor plans) are not source of truth — use ORCHESTRATION + contracts + LOG.

---

## Enforcement

| Check | How |
|-------|-----|
| Secrets | `npm run secrets:scan`, gitleaks CI |
| Hermes not tracked | `src/lib/classificationGuard.test.ts` |
| Pre-public scrub | [DUAL_REPO.md](DUAL_REPO.md) § Pre-public checklist · [SECRETS.md](SECRETS.md) |

When dual-repo is active: product CI never clones `mission-ops`.
