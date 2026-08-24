# Dual repository — public product, private ops

**Audience:** Founder (owns the private repo and visibility flips)  
**Related:** [CLASSIFICATION.md](CLASSIFICATION.md) · [OPEN_SOURCE.md](OPEN_SOURCE.md) · [SECRETS.md](SECRETS.md)

GitHub visibility is all-or-nothing per repository. Mission Winning therefore uses **three trees**:

```text
github.com/Snedz/missionwinning              → working product (daily origin, PRs, Vercel)
github.com/Mission-Winning/missionwinning    → Alpha progress snapshot (orphan; not daily origin)
github.com/Snedz/mission-ops                 → INTERNAL forever (private)
```

Refresh the snapshot from this checkout: `npm run snapshot:public`. It does **not** change `origin`, does not push, and does not delete local caches. Founder clicks Public on the **org** repo. Agents never flip visibility or `PRIVATE_MODE`.

Local staging for ops content: **`ops/`** at the product-repo root (gitignored).  
Sync helper: `npm run ops:sync` → copies templates + listed INTERNAL files into `ops/`.

---

## Working product repo (this tree)

- All application code, tests, public docs, agent conventions, `docs/contracts/`
- `CONTEXT.md` states product facts that agents need (gates, PRIVATE_MODE, migrations)
- Daily `git remote origin` stays `Snedz/missionwinning`
- Does **not** hold competitive strategy dumps, capital, outreach scripts, or session plans

## Public Alpha snapshot (org)

- Filtered **progress report** of Alpha 0.1.0 — Train + Mission Coach, tests, product docs
- One orphan commit per refresh. No 1,155-commit working history
- Not the Vercel project. App footer **Source** stays on Snedz until a later cutover
- Drop leftover `PLAN.md` / hop folders / gauntlet stills. Keep `docs/archive/` (unit tests need rotation history)
- Command: `npm run snapshot:public` · deny tests: `npm run snapshot:check`

## Ops repo (private)

Layout (private `Snedz/mission-ops` / local `ops/`):

```text
mission-ops/
  README.md · AGENTS.md
  CONTINUITY/                # diary, sessions, decisions, prompts, CURRENT
  dashboard/                 # local Mission Control UI (npm run ops:dashboard)
  standards/                 # multi-model, best practices, dev/prod
  strategy/                  # full STRATEGY, REDTEAM, YC, pricing, …
  history/EVOLUTION.md
  production/STATUS_PRIVATE.md
  FOUNDER_CRITICAL_PATH.md
  VISION_LONG_EVERYTHING.md
  INTERNAL_MANIFEST.md
  scripts/new-session.mjs
```

War-room docs in the **product** tree are stubs only (`RELOCATED_TO_MISSION_OPS`). Full text is here.

Create the empty private repo once (founder-only):

```bash
# after ops:sync has populated ./ops
cd ops
git init
git add .
git commit -m "ops: initial private war room"
# create private repo on GitHub, then:
# gh repo create Snedz/mission-ops --private --source=. --remote=origin --push
```

Agents never run the `gh repo create` or visibility flip unless the founder explicitly asks in that session.

---

## Workflow

| Actor | Working product (`Snedz/…`) | Snapshot (`Mission-Winning/…`) | Ops repo / `ops/` |
|-------|------------------------------|--------------------------------|-------------------|
| Coding agents | Default workspace. Ship MW vocabulary only. | Refresh with `npm run snapshot:public` when asked. Never force-push Snedz. | Read `ops/intel/` if mounted; never `git add ops/` from the product repo |
| Founder strategy sessions | Thin pointers | Skim the tree, then Public click | Write VISION, STATUS_PRIVATE, strategy, intel |
| CI | Product only. `names:check` no-ops without the ops denylist. | Snapshot is not the deploy origin. Do not merge Dependabot there. | Never clone ops on public runners |
| Public flip | Stays the working cloud copy | Founder-only. Secret scanning free once Public. | Unaffected (stays private) |

Research happens in `ops/intel/`. Product PRs translate patterns (`logger-table`, `fuel-modes`, `home-summary`) into `src/` / `docs/` without naming the source app. Compare / AEO drafts that name rivals stay in `ops/intel/seo/` until a founder GTM exception republishes them.

---

## Pre-public checklist (extends SECRETS / OPEN_SOURCE)

1. [ ] `npm run ops:sync` — confirm INTERNAL copies land in `ops/`  
2. [ ] Push `ops/` to private `mission-ops` (founder)  
3. [ ] Decide: **move** vs **summarize** `docs/STRATEGY.md`, `REDTEAM.md`, `PRELAUNCH_CAPITAL.md`, `OUTREACH_VA_BRIEF.md`  
   - Preferred long-term: move full text to ops; leave a one-screen public stub or INDEX pointer  
4. [ ] Confirm `.hermes/` and `ops/` are gitignored and untracked  
5. [ ] `npm run secrets:scan` + optional `gitleaks detect --source . -v` on history  
6. [ ] Enable secret scanning + push protection (free on public)  
7. [ ] Founder flips **`Mission-Winning/missionwinning`** Public — agents never do  
8. [ ] Do **not** flip `PRIVATE_MODE` as part of going open source  
9. [ ] Do **not** archive or transfer `Snedz/missionwinning` in this step  

---

## Why not one monorepo with secrets in git-crypt?

Possible later. Dual-repo is simpler for solo + multi-agent: wrong path cannot be force-pushed to public if it never lived there. Classification still applies if you later adopt encryption.
