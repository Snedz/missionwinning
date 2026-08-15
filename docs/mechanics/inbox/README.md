# Inbox — raw observations, not nodes

Anything here is a **fact somebody saw**, waiting for an anatomist. Nothing in
this folder is loaded into a context pack, scored, or selected, and nothing here
can become a queue row without being decomposed into a `mechanic` node first.

Two ways in, both landing in the same place:

- **Founder-fed.** Drop a link, a screenshot note, a dogfood observation. No
  format required beyond a source and a date.
- **Scout harvest.** A weekly batched sweep — changelogs, app-store updates,
  launches, reviews and complaints, open-source projects. Scouts write facts and
  a link. **A scout never writes a recommendation**, because a recommendation
  arriving with the evidence is how the evidence stops being read.

## What an anatomist does with one

Promotes it to a `mechanic` node, or discards it. Promotion means answering the
whole ontology in `src/lib/ideaGraph/schema.ts` — including the two fields that
are always the ones dropped:

- **`precondition`** — what must already be true for this to work at all. A
  ladder needs a population, a leaderboard needs concurrency, kudos need a club.
  Skipping this is how a mechanic gets copied into a product that cannot run it.
- **`also_seen_in_failures`** — where else this appeared, including products that
  died. Mining only winners is *connecting the winning dots*: a mechanic present
  in successes and failures alike is table stakes or noise, and there is no way
  to tell without the column.

## What never enters git

Competitor pixels. Measurements and verdicts only — carried over unchanged from
`GAUNTLET_LOOP` §4, which already says so for reference captures.

## Naming

`YYYY-MM-DD-source-slug.md`. Delete it when it has been promoted or discarded;
the inbox is a queue, not an archive. The record of what was decided lives in
the node, or in `ANTILIBRARY.md` if the answer was no.
