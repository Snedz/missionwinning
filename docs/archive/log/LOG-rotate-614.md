# LOG rotation — `.599`, rotated by `.614`

Rotated out of [LOG.md](../../../LOG.md) when `.614` took the fifteenth slot. Rotation moves; it never deletes.

## 2026-08-08 — A Postgres error reaching a client, and the guard that could not see it (`.599`)

`app/api/mobile/workouts/route.ts:84` returned `{ ...localAck, syncError: error.message }` — a raw Postgres message, at the default **200**. CLAUDE.md §5 forbids exactly this by name: *"Never return a Postgres `error.message` to the client (free schema map)."* A Supabase error names tables, columns and constraints.

**The guard written for this rule is a textbook specimen of both §6 defects at once.** `outboxResilience.test.ts`'s *"never return the database its own words"* **`.filter()`d a six-entry `LEAKY` list** across a repo with **sixty-nine** `route.ts` files — an allowlist wearing the name of a scan, structurally able only to re-check routes somebody had already fixed. And its matcher was `/error:\s*error\.message\s*\},\s*\{\s*status:\s*500/`, keyed to one property name and one status code.

Both halves failed on the same live defect, independently. The offending file was not in the list — the list contains the *different* path `mobile/sync/workouts` — and it would have passed the regex even if it had been: `syncError`, not `error`; 200, not 500. A name claiming more than its enumeration, and a guard keyed to one spelling, in one check, over a rule from §5.

**Rewritten to discover**: walk every `app/api/**/route.ts`, and match an error object reaching a response body under **any** key, at **any** status, through interpolation or spread — while ignoring `console.error`, which is where the detail belongs.

**It found two more leaks on its first run**, neither in the old six:

- `app/api/journey/nudge/route.ts:94` returned the mail provider's message at 500. A **third** spelling axis: the identifier was `sendError`, so even a corrected key-and-status pattern keyed to `error.message` would have missed it. Fixed — opaque `send_failed`, detail already logged.
- `app/api/health/route.ts:53` returns a truncated Supabase message. Kept, as the sole `LEAK_OK` row with a written reason: it is reachable only with `?deep=1` **and** `Authorization: Bearer CRON_SECRET` (the handler 401s first), and telling an authenticated operator why the database ping failed is the endpoint's whole purpose. The exemption list carries the `navTruth.NAV_EXEMPT` mirrors — a row must name a real route, and one that still matches, so an exemption cannot quietly become theatre.

The matcher is also falsified **in the file**: it asserts against the four shapes that shipped and two that must not trip it, so narrowing it back to `error:` + 500 goes red here rather than silently un-guarding sixty-nine routes.

**Sequencing note:** taken ahead of the planned `.599`–`.601` because it is a live information-disclosure fix and the most contained of the four; the wave's remaining concerns are unchanged.

Mutants: 3 killed — restore the exact shipped `syncError:`-at-200 leak → red (the case the old guard could not catch); narrow the matcher back to the old pattern → red; exempt a route that does not leak → red. Tests 2172 → 2174.
