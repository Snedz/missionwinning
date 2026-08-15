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
| `return+add+season+boost+tier+start` | The T4 season-start boost was struck by decision; standing is monotonic, no decay and no relegation | `docs/IDENTITY_SOCIAL_PLAN.md` C9 |

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

**Defensible anchors instead.** Roughly one third of well-designed experiments at
a mature experimentation platform move their target metric — that is the number
to budget against, not a vendor's success story. And an evolutionary coding agent
with *perfect machine-checkable evaluators* improved on the state of the art in
about a fifth of open problems it attempted; this product's evaluator is far
weaker than that.
