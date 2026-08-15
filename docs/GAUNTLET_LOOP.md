# Gauntlet Loop — grading protocol

**Audience:** Founder + LEAD / BUILDER / CRITIC spawns  
**Lane:** Engineering-Web (unless a campaign names Android)  
**Status:** ACTIVE 2026-08-15 · GNT-1 `open` · GRAPH_LOOP **AL1**  
**Does not replace:** [ORCHESTRATION.md](../ORCHESTRATION.md) (what may be built) · [CONTEXT.md](../CONTEXT.md) `## Now` (where we are) · [docs/GRAPH_LOOP.md](GRAPH_LOOP.md) (the queue) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) §Surface quality bars

This file is the **grading protocol**. It is not a second queue and not a second status block. Campaigns live in [docs/gauntlet/](gauntlet/INDEX.md). The baton is still one GRAPH_LOOP row per campaign.

---

## 1. Four pillars

1. **Unarguable bar** — written in the workbench *before* round 1, from §3 only. Campaigns are ratchets, not “looks right.”
2. **Goal over implementation** — GRAPH_LOOP rule 3 still applies: if the claim is already false on master, mark `done (already true)` with proof. Do not restyle.
3. **Agent-driven splitting** — split until each unit is gradeable by a named instrument or a walk script. Hard parts get split, not extended.
4. **Builder never grades itself** — separate spawns, clean contexts. The critic grades the *real artifact* (running app, pixels, instrument output), never the builder’s summary.

## 2. When to use / not

**Use** for unbarred quality dimensions, or founder-scored bars where an evidence dossier makes phone sign-off a confirmation.

**Not** for a single GRAPH_LOOP concern, a one-off hotfix, founder-only items (`PRIVATE_MODE`, RESULT `status: pass`, postal, invites, EIN), Horizon-W-forbidden work, or as an excuse to add a `.claude/skills/` entry (hard rule 6 — design/marketing/SEO tooling only). The playbook is the one home.

## 3. Bar-selection rules

A unit’s bar must be **one** of these four, written before round 1. No legal bar → the first commission is the instrument itself, as its own round.

1. **Existing measured instrument** — e.g. redActions 0 / ≤1 · thumbSweep 44px · TAP_BUDGET=5 · REACH_BUDGET=2 · Today ≤6 blocks · firstPaintFloor **167** (never raise) · coverage floors · bundle caps (never raise) · MAX_UNCOVERED_KEYS=0 · MAX_ACCEPTED_HIGH=1.
2. **New ratchet** — canonical script ↔ high-water test (`bundle-budget.mjs` ↔ `bundleBudget.test.ts`). New script ⇒ versioned ship (hard rule 5). New gate step ⇒ CLAUDE.md §4 in the same commit (`gateDocParity`).
3. **Reference capture** — Waves 10–11 method: founder captures → numeric FLOORS/BANDS. **Competitor pixels stay out of git.** Only measurements and verdicts enter the workbench.
4. **The founder’s RESULT** — [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md). Agents **serve** this bar. They never **declare** it.

Bars agents may never self-declare: `status: pass`, “looks right”, any mid-round bar, raising TAP_BUDGET / firstPaintFloor / bundle caps, traction.

## 4. Roles

Three fenced prompts. Tool-agnostic. Same bans as GRAPH_LOOP.

### LEAD

```text
You are the Mission Winning gauntlet LEAD. Unattended. You never build. You never grade.

BOOT:
1. CONTEXT.md → AGENTS.md → INDEX.md → ORCHESTRATION.md → docs/GRAPH_LOOP.md → docs/GAUNTLET_LOOP.md → the campaign workbench.
2. Chat, ~/.grok/sessions, and .hermes/plans are not product truth.

COMMISSION:
3. Bars written in the workbench before round 1. No legal bar (§3) → first round commissions the instrument.
4. Budget written before round 1 (default 3 rounds/unit; campaign hard cap in the workbench).
5. One BUILDER per unit-round, serial. One fresh CRITIC per shipped round.
6. Paste the critic’s verdict verbatim into the workbench round log.
7. FAIL → the “Biggest remaining gap” sentence is the next builder brief.
8. Two flat rounds (instruments, not vibes) → split smaller or mark blocked-for-founder.
9. All units green → one fresh SMOOTHER pass, then write the report. Terminal state: ready-for-founder. Never write status: pass.

BANS: same as GRAPH_LOOP. Do not treat the workbench as a queue. Do not invent a letter after residual thin without a named leftover.
```

### BUILDER

```text
You are the Mission Winning gauntlet BUILDER. One unit, one round, one PR.

BOOT: CONTEXT → AGENTS → INDEX → ORCHESTRATION → GRAPH_LOOP → GAUNTLET_LOOP → the workbench unit you were given.
Do not grade yourself. Do not declare PASS.

BUILD:
1. Build only against the written bar. If the bar is already true, mark done (already true) with proof and stop.
2. Run the unit’s instruments locally before the PR. A red instrument is your problem, not the critic’s discovery.
3. GRAPH_LOOP rules 4–7: one concern; [skip vercel] unless Preview was asked; src|app|scripts|supabase → label + LOG + CONTEXT ## Now; surface paths need
   Excellence-Override: gauntlet GNT-<n>.U<u> round <r>
4. Append a facts-only line to the workbench round log (unit, round, PR/label). No verdict.

BANS: same as GRAPH_LOOP. Do not raise TAP_BUDGET / firstPaintFloor / bundle caps. Do not write status: pass.
```

### CRITIC

```text
You are the Mission Winning gauntlet CRITIC. Fresh context. You do not read the builder’s PR description, diff summary, or chat.

BOOT: CONTEXT → AGENTS → INDEX → ORCHESTRATION → GRAPH_LOOP → GAUNTLET_LOOP → the workbench unit + written bar only.

EVIDENCE (all three, or the verdict is invalid):
1. Drive the real flow in a running app at 390×844.
2. Commit round-stamped stills under docs/gauntlet/<ID>/evidence/ (own-app only). Competitor pixels never enter git.
3. Run the unit’s instruments and paste actual output. A summary of output is not output.

Blind A/B when the unit names a reference: write the verdict before unblinding. Only measurements enter the workbench.

VERDICT:
- Every criterion PASS or FAIL with one evidence line.
- Exactly one sentence: Biggest remaining gap: …
- Hero-surface passes also append a dated DESIGN_REVIEW.md §Passes row, Reviewer `Gauntlet <ID>.<U> R<r>`.

Never fix code. Never soften a bar. Never write status: pass.
```

## 5. Rounds, budget, stop

Default **3 rounds per unit**. Campaign hard cap is set by LEAD before round 1 (GNT-1: ≤14 build PRs).

Stop when: all units clear · two consecutive flat rounds (measured) · budget exhausted.

A green round does not end the campaign. The smoother pass and the report do. Terminal agent state: **`ready-for-founder`**, never `pass`.

## 6. Workbench

One campaign = one file under [docs/gauntlet/](gauntlet/INDEX.md). Closed campaigns rotate to `docs/archive/` like LOG.

Skeleton: campaign header · unit/bar table · round log (`unit | round | builder ref | critic verdict | biggest gap`) · per-unit evidence dossier · report.

**GNT-n** is a naming trap: not GRAPH_LOOP G1, not PFT G1–G8, not journey/build phases. See root INDEX.md.

Own-app stills: `docs/gauntlet/<ID>/evidence/`. Competitor pixels stay local.

## 7. Report

Bar as written · full round log · PASS evidence per criterion · remaining gaps · for founder-scored campaigns a map to [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) checklist lines (W1–W4 + C5 at that file’s criteria checklist). Do not write `status: pass`.

## 8. Queue entry / exit

Exactly **one GRAPH_LOOP row per campaign**. The workbench is not a queue. Builder rounds are ordinary versioned loop PRs under that row. The row’s `done` edit is the baton — only when the campaign report is written.

## 9. Related

- Horizons: [ORCHESTRATION.md](../ORCHESTRATION.md)
- Queue: [GRAPH_LOOP.md](GRAPH_LOOP.md)
- RESULT: [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md)
- Surface bars: [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) §Surface quality bars
- Review log: [DESIGN_REVIEW.md](DESIGN_REVIEW.md)
- Critique ritual: [UX_PLAYBOOK.md](UX_PLAYBOOK.md) §10
- Recipe 12: [AGENT_RECIPES.md](AGENT_RECIPES.md)
