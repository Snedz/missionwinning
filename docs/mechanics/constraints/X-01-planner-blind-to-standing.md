---
id: X-01
type: constraint
title: The planner is blind to standing
rule: Nothing under src/lib/coach/ or packages/mw-core/src/ may reach rewards, leaderboard or social — transitively, by static, dynamic or type import. The logging path may emit through a declared door symbol and must discard the result; it may never read back.
enforcer: src/lib/domainBoundary.test.ts
enforcer_anchor: 'C1: no planner module can reach a social module'
authority: docs/IDENTITY_SOCIAL_PLAN.md
---

The load-bearing one. Everything else in the constitution is recoverable; a
planner that can read rank is the failure the whole social plan exists to
prevent, and it is the one that would never announce itself — the plans would
simply get quietly worse for the athletes who care most about their standing.

The argument is not about tone. In Strava a logged run is a post; here a logged
set is the Coach's input. A session withheld because it looked bad is a lie told
to the planner, and the planner then prescribes for an athlete who does not
exist: deloads will not fire, progression runs on a fictional record. **Social
comparison is an input-integrity attack on the core algorithm.**

For the Idea Loop this constraint does most of its work by killing translations
rather than mechanics. `M-02` and `M-07` both come from the same source product;
one survives and one dies here, and the difference is exactly which primitive
configuration was extracted.
