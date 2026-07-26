# CLAUDE.md

Claude Code boot order for this repo — pointers only, content lives in the spine:

1. [CONTEXT.md](CONTEXT.md) — one-screen status, trap terms, hard rules
2. [AGENTS.md](AGENTS.md) — tool-agnostic contract (conventions · glossary · commands)
3. [INDEX.md](INDEX.md) — task → doc routing; never open stale paths in §4
4. The folder `INDEX.md` where you will work

Notes: `.claude/skills/` are design/marketing/SEO tooling only — never app architecture. Horizon gates in [ORCHESTRATION.md](ORCHESTRATION.md) decide what may be built now. Android work: also read [apps/android/AGENTS.md](apps/android/AGENTS.md).

## gstack

Install once per machine — it lives in your user config, not this repo:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

Requires `bun` (`brew install bun`). Run `/gstack-upgrade` to update.

### Web browsing

Use the **`/browse`** skill from gstack for **all** web browsing.

**Never use the `mcp__claude-in-chrome__*` tools.**

### Available skills

**Planning & review**
- `/office-hours` — YC-style office hours on an idea or plan
- `/autoplan` — runs the CEO, design, eng, and DX reviews back-to-back with auto-decisions
- `/plan-ceo-review` — CEO/founder-mode plan review
- `/plan-eng-review` — eng manager-mode plan review
- `/plan-design-review` — designer's-eye plan review
- `/plan-devex-review` — developer-experience plan review
- `/review` — code review
- `/devex-review` — live developer-experience audit
- `/careful` — safety guardrails for destructive commands

**Design**
- `/design-consultation` — proposes a complete design system with font + color previews
- `/design-shotgun` — generates multiple design variants and a comparison board
- `/design-html` — production-quality HTML/CSS finalization
- `/design-review` — visual QA: inconsistency, spacing, hierarchy, AI-slop patterns

**Browser & QA**
- `/browse` — fast headless browser (use this for all web browsing)
- `/connect-chrome` — launch GStack Browser, AI-controlled Chromium with the sidebar extension
- `/qa` — systematically QA a web app and fix the bugs found
- `/qa-only` — report-only QA, no fixes
- `/setup-browser-cookies` — import real-browser cookies into the headless session

**Ship & deploy**
- `/ship` — merge base, run tests, review diff, bump VERSION, update CHANGELOG, push, open PR
- `/land-and-deploy` — land and deploy workflow
- `/canary` — post-deploy canary monitoring
- `/benchmark` — performance regression detection
- `/setup-deploy` — configure deployment settings for `/land-and-deploy`

**Investigate & document**
- `/investigate` — systematic debugging with root-cause analysis
- `/retro` — weekly engineering retrospective
- `/document-release` — post-ship documentation update
- `/document-generate` — generate missing docs from scratch
- `/learn` — manage project learnings

**Edit boundaries**
- `/freeze` — restrict edits to a specific directory for the session
- `/guard` — full safety mode: destructive-command warnings + directory-scoped edits
- `/unfreeze` — clear the freeze boundary

**Other**
- `/codex` — OpenAI Codex CLI wrapper
- `/cso` — Chief Security Officer mode
- `/setup-gbrain` — set up gbrain (CLI, local brain, MCP registration)
- `/gstack-upgrade` — upgrade gstack to the latest version
