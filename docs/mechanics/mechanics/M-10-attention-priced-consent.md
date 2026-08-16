---
id: M-10
type: mechanic
title: Consent priced by arrival rate
primitives:
  trigger: state-change
  cost_to_produce: low
  visibility: self-only
  reciprocity: no
  durability: session
  reversibility: yes
  forgiveness: yes
  optimum_direction: less
  precondition: none
seen_in:
  - product: Dependabot — roughly 85% of security pull requests go unmerged, closed later by an unrelated update
    url: https://nesbitt.io/2026/01/10/16-best-practices-for-reducing-dependabot-noise.html
    date: 2026-01-10
    class: E2
    retrieval: fetched
    why_not_e1: page opened 2026-08-16; satirical Dependabot advice (open-pull-requests-limit 0), not a source for an 85% unmerged-security-PR figure
  - product: Browser security warnings — the most common SSL warning had the lowest adherence rate
    url: https://www.researchgate.net/publication/262285806_Alice_in_warningland_A_large-scale_field_study_of_browser_security_warning_effectiveness
    date: 2013-08-14
    class: E2
    retrieval: indexed
    why_not_e1: peer-reviewed (Akhawe and Felt, USENIX Security 2013) but read via search index only
also_seen_in_failures:
  - Cursor agent mode 2026 — multiple reports of edits applying with no accept/reject diff, and a forum thread titled you are throwing away your best UX advantage. The same surface, removed rather than diluted
produces:
  - B-03
backfires:
  - behavior: B-03
    how: past a threshold the consent surface stops being read; the documented fix is varying the surface, not making it louder or more severe
    class: E2
    url: https://pmc.ncbi.nlm.nih.gov/articles/PMC7751389/
---

**The precondition `M-01` never declared.** A proposal-and-approve surface
assumes proposals are **scarce relative to reviewer attention**. Dependabot is
the control experiment: structurally identical machinery to a human pull request
— propose, diff, evidence attached, approve, history persists — and roughly 85%
go unmerged. Nothing about the interface changed. Only the arrival rate did.

The security-warning literature gives the same shape with a sharper edge: the
**most common** warning had the **lowest** adherence, and habituation is
measurable neurally, not just behaviourally. A Go maintainer publicly called
Dependabot a *"noise machine"* that should be turned off.

**What actually works, and it is not what teams reach for.** Not severity, not
better copy. **Variation** — polymorphic warnings that change appearance
significantly outperform static ones. And *grouping*: Renovate collapses many
updates into one branch, and moves "what is outstanding" out of the notification
stream into a single durable dashboard.

**Why this is filed as a mechanic rather than a note.** It is a real dynamic with
its own primitives and its own optimum direction — `less` — and it points a
`backfires` edge at `B-03` through the mechanic this graph likes most. `H-08`
exists because of it.
