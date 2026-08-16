# Anti-library — what is already dead, and what may never be cited

**Always loaded.** Every role reads this file in full, in every context pack. It
is the one part of the graph that is never sampled, never summarised and never
rotated away.

**Why it survives rotation.** `src/lib/contextBudget.test.ts` records what
happens otherwise: a budget guard that counted bullets, checked the archive
existed, and asserted *nothing about which facts survive* — so a rotation carried
off the single line stating that the beta gates were red, and for ten builds an
agent booting cold would have concluded features were allowed. **A memory system
that forgets what it killed will re-propose it forever.** When a hypothesis
dossier rotates to `docs/archive/mechanics/`, its row here stays.

Fingerprints are token sets joined with `+`, derived by `fingerprintOf` in
`src/lib/ideaGraph/derive.ts` — never authored by hand, because a hand-written
fingerprint is a field an author can tune until their idea slips past the floor.

---

## Killed ideas

A candidate whose fingerprint is within `NOVELTY_EPSILON` of one of these is
refused by the selector with the citation attached.

| fingerprint | why it is dead | citation |
|---|---|---|
| `return+add+M-07+ladder+public+standing+today` | Two independent deaths: no population to contest a rung, and rank on the logging path corrupts the planner's only input | `H-04`, `X-01`, `X-06` |
| `tell+add+compare+competitor+hub+versus` | Competitor comparison hub removed at `.668`; `/compare/*` is a permanent redirect to `/welcome` | `app/INDEX.md` |
| `trust+add+chat+today+assistant+conversation` | Chat on Today is a standing ban in every spawn prompt in the repo | `docs/GRAPH_LOOP.md` bans |
| `trust+change+cinematic+landing+hero+restore` | Restoring `CinematicWww` as `/` is a standing ban; `/` is `.696` | `docs/GRAPH_LOOP.md` bans |
| `trust+add+wearable+score+strap+sync` | Wearables may be inputs, never the score's master — REDTEAM A8 | `docs/WEARABLES.md`, `vision.md` |
| `activate+add+america+school+pft+marketing` | America and school tracks are parked by default and need legal plus a real channel | `src/lib/surface.ts`, `ORCHESTRATION.md` |
| `pay+change+gate+logger+paywall+free` | The free logger is never gated. Ever | `X-02` |
| `trust+add+M-15+calibrated+confidence+misreading+readiness` | Shows a number the engine knows to be untrue; `X-07` is the one rule this codebase is built on | `H-11`, `M-15`, `load.ts` header |
| `return+add+season+boost+tier+start` | The T4 season-start boost was struck by decision; standing is monotonic, no decay and no relegation | `docs/IDENTITY_SOCIAL_PLAN.md` C9 |
| `return+remove+M-16+undo+first+set+back+window` | History/outbox absence mid-session already holds without a window, so the named instrument cannot fail; does not grade return | `H-12` |
| `activate+change+M-16+hold+first+log+window` | M-16's own B-01 backfire is this target; first-90 only ratifies TAP_BUDGET not rising | `H-13` |
| `trust+measure+M-16+planner+ignores+inflight` | No window means an identity filter; adapt.test cannot fail until a sibling ships | `H-14` |
| `depth+change+M-17+victory+finish+next+action` | Victory only mounts after Finish; named instrument cannot fail | `H-16` |
| `depth+add+M-18+one+new+work+after+due+session` | Victory already returns exactly one next action; named instrument cannot fail | `H-17` |
| `depth+measure+M-18+week+does+not+add+while+due` | adapt already never introduces a new lift id on a later-day rewrite; subset assertion cannot fail | `H-18` |
| `tell+add+M-18+share+waits+due+set` | first-90 path already has no share control before Log set; assertion cannot fail | `H-19` |
| `tell+change+M-19+share+waits+box` | Share is Finish-only and absent on the logger; no box exists to wait for | `H-20` |
| `pay+remove+M-19+identify+off+box` | Identification chrome already absent on first-90 and `/active` | `H-21` |
| `tell+measure+M-19+share+after+box` | Share×elapsed cannot be measured (no field, no corpus, no box) | `H-22` |
| `tell+remove+M-20+today+no+tell` | First-session Today already has no share control | `H-23` |
| `pay+change+M-20+identify+after+dated` | Sign-in chip already hidden until first workout | `H-24` |
| `pay+measure+M-20+identify+on+today` | Unit already holds; no /log waitlist telemetry | `H-25` |

---

## Unciteable sources — never class `E1`

These circulate widely and state no methodology. A `seen_in` row citing one of
these hosts as `E1` fails `npm run idea:validate`. Record the *mechanic* from
them if it is useful; record any *number* from them as `E2` with a reason, or
not at all.

This list exists because the research pass that seeded this graph returned a
large set of engagement figures — "social features cut churn 20–35%", "friend
streaks lift completion 22%", "9 of 10 experiments fail" — that trace to vendor
content marketing or to secondary summaries of a primary source nobody had read.
`X-07` is the rule; this is the enforcement surface.

| source | why it is not `E1` |
|---|---|
| `trophy.so` | gamification vendor content marketing; no methodology stated |
| `strivecloud.io` | gamification vendor content marketing; no methodology stated |
| `trypropel.ai` | vendor teardown; retention figures with no method |
| `vwo.com` | conversion vendor; attributes an unread primary source |
| `globenewswire.com` (gamification PR) | the "$700M in failed gamification projects" figure is a vendor press release with no denominator |
| `orizon.co` · `darewell.co` · `digia.tech` | the Duolingo retention-statistic cluster; every figure traces back to the same unmethodologised marketing posts |

### Named claims that may never be cited, whatever the host

| claim | why |
|---|---|
| Gartner "80% of gamified applications will fail by 2014" | A **prediction issued in Nov 2012 about 2014**, not a measurement. No sample, no denominator, no operationalisation of "fail", never retrospectively measured. Cite Brian Burke's *diagnosis* — points-badges-leaderboards instead of an economy — never the number |
| "Users approve 93% of agent permission prompts" | No study exists. Traced to blog posts attributed to unlinked telemetry |
| "30–50% of software features have no or marginal value" | Widely repeated, primary source never confirmed |
| "Runna's adaptive plans cut marathon DNF rates 38% in clinical trials" | No trial, protocol or publication named; "clinical trial" is an implausible frame for a consumer training app |

**Defensible anchors instead.** Roughly one third of well-designed experiments at
a mature experimentation platform move their target metric — that is the number
to budget against, not a vendor's success story. And an evolutionary coding agent
with *perfect machine-checkable evaluators* improved on the state of the art in
about a fifth of open problems it attempted; this product's evaluator is far
weaker than that.

**On what gamification is worth here, specifically.** BE ACTIVE (*Circulation*,
Apr 2024, n=1,062, 12-month intervention plus 6-month follow-up) found that after
the intervention ended, **gamification alone was not significantly above
control** — only gamification *plus* financial incentives held. TRIPPA
(*Lancet Diabetes & Endocrinology*, 2016) found the cash-incentive effect did not
survive withdrawal of the cash, and no health outcome moved in any arm.

This corroborates the line `docs/IDENTITY_SOCIAL_PLAN.md` already carries —
*"durable effect is g=0.15, so rewards support the loop and are never the
retention thesis"* — and it caps what any future rewards candidate may claim.
Both are `E2 / indexed`: neither paper was opened.
