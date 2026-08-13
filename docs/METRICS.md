# Metrics — week-4 retained weekly loggers

**Boss metric (year one):** week-4 retained weekly loggers.
**We do not invent traction.** No marketing site number, no public live-user count, no EIN, no emails in the payload.

Companion: [POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md) (workout-completion RPC) · [SEO_ANALYTICS.md](SEO_ANALYTICS.md) (PostHog setup) · [WEEK4_LOGGER_EVENTS_PLAN.md](WEEK4_LOGGER_EVENTS_PLAN.md) (frozen `.740` plan).

---

## Definition (set-level, `.740`)

An **install** is week-4 retained when:

1. It saved ≥1 **working set** in some local ISO week W₀ (`YYYY-Www`).
2. The current local ISO week Wₙ satisfies `isoWeekOffset(W₀, Wₙ) ≥ 3` (1-indexed week ≥ 4).
3. It saved ≥1 working set in Wₙ.

Weeks 2–3 may be empty. This is return-in-week-4, not a four-week streak.

A **working set** is a saved set whose `kind` is not `warmup`. `normal`, `failure`, and `drop` count.

### Events (PostHog, consent-gated)

| Event | When | Properties |
|-------|------|------------|
| `set_logged` | A working set is saved (guest or signed-in) | `source`: `guest` \| `account` · `exercise_id` · `has_load` (weight > 0) |
| `week_logged` | First working set saved in the current local ISO week | `source` · `iso_week` |

No PII. No emails. No EIN.

### Derived flag (this install only)

`retained_week_4` is computed on the device from `mw_week4_retention` (first logged ISO week + weeks with a working set). It is shown on `/account` → More settings → **Under the Hood**, and in this doc. It is **not** a public vanity counter and must never be rendered as “X users retained”.

### What is NOT counted

- Warm-up sets (`kind === 'warmup'`, UI label **W**)
- Empty sessions (finish with no working set saved)
- Planned / incomplete sets
- Pageviews, I-Day steps, or `workout_completed` alone (those are other funnel steps)
- Invented cohort percentages on the marketing site

---

## Sinks

| Who | PostHog | Device | Supabase `week_logged` |
|-----|---------|--------|------------------------|
| Guest | If they allowed analytics | Local rollup only | **Never** — no server write |
| Signed-in | If they allowed analytics | Local rollup | Optional upsert `(user_id, iso_week)` after CoS applies `20260813_week_logged.sql` |

The table is service-role write from `POST /api/metrics/week-logged` (session required). Agents do not apply the migration.

---

## Related instrument (completed workouts)

`mw_week4_retention()` counts **completed, non-deleted workouts** in days 21–27 after the first workout. That RPC is still the founder-digest number. `.740` adds the **working-set** instrument so empty finishes and warmup-only sessions cannot inflate the habit metric.

Do not treat the two as interchangeable, and do not publish either as traction until the founder reads a real cohort.
