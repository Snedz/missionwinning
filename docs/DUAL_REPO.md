# Dual repository — public product, private ops

**Audience:** Founder (owns the private repo and visibility flips)  
**Related:** [CLASSIFICATION.md](CLASSIFICATION.md) · [OPEN_SOURCE.md](OPEN_SOURCE.md) · [SECRETS.md](SECRETS.md)

GitHub visibility is all-or-nothing per repository. Mission Winning therefore uses **two trees**:

```text
github.com/Snedz/missionwinning     → product (AGPL, public-ready)
github.com/Snedz/mission-ops        → INTERNAL forever (private)
```

Local staging for ops content: **`ops/`** at the product-repo root (gitignored).  
Sync helper: `npm run ops:sync` → copies templates + listed INTERNAL files into `ops/`.

---

## Product repo (this tree)

- All application code, tests, public docs, agent conventions, `docs/contracts/`
- `CONTEXT.md` states product facts that agents need (gates, PRIVATE_MODE, migrations)
- Does **not** hold competitive strategy dumps, capital, outreach scripts, or session plans

## Ops repo (private)

Suggested layout after `npm run ops:sync` and a first push:

```text
mission-ops/
  README.md
  CLASSIFICATION.md          # copy of policy
  VISION_LONG_EVERYTHING.md  # long-term WeChat-scale thesis
  FOUNDER_CRITICAL_PATH.md   # users / money / legal this week
  STATUS_PRIVATE.md          # founder blockers not for public CONTEXT
  INTERNAL_MANIFEST.md       # files that must not ship public
  strategy/                  # copies of STRATEGY, REDTEAM, …
  archive/                   # old memos
```

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

| Actor | Product repo | Ops repo / `ops/` |
|-------|--------------|-------------------|
| Coding agents | Default workspace | Read only if mounted; never push |
| Founder strategy sessions | Thin pointers | Write VISION, STATUS_PRIVATE, strategy |
| CI | Product only | Never clone ops on public runners |
| Public flip | Scrub INTERNAL paths first | Unaffected (stays private) |

---

## Pre-public checklist (extends SECRETS / OPEN_SOURCE)

1. [ ] `npm run ops:sync` — confirm INTERNAL copies land in `ops/`  
2. [ ] Push `ops/` to private `mission-ops` (founder)  
3. [ ] Decide: **move** vs **summarize** `docs/STRATEGY.md`, `REDTEAM.md`, `PRELAUNCH_CAPITAL.md`, `OUTREACH_VA_BRIEF.md`  
   - Preferred long-term: move full text to ops; leave a one-screen public stub or INDEX pointer  
4. [ ] Confirm `.hermes/` and `ops/` are gitignored and untracked  
5. [ ] `npm run secrets:scan` + optional `gitleaks detect --source . -v` on history  
6. [ ] Enable secret scanning + push protection (free on public)  
7. [ ] Founder flips visibility — agents never do  
8. [ ] Do **not** flip `PRIVATE_MODE` as part of going open source  

---

## Why not one monorepo with secrets in git-crypt?

Possible later. Dual-repo is simpler for solo + multi-agent: wrong path cannot be force-pushed to public if it never lived there. Classification still applies if you later adopt encryption.
