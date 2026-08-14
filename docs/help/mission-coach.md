# Mission Coach

Mission Coach is your **weekly training plan** — deterministic rules plus optional AI voice briefing. It lives at `/coach` and on the Today dashboard.

## Who gets Coach?

- **Premium / Super Bundle** subscribers get full weekly plans and adaptation.
- **Taster:** New users may see a limited preview before subscribing (device-local).

If Coach shows a lock icon, see [premium-and-billing.md](premium-and-billing.md).

## How the plan works

1. **Context** — Coach reads your equipment, days per week, goals, workout history, and readiness scores from Today.
2. **Generate** — Each week you get sessions (strength, conditioning, recovery) with specific exercises from the library.
3. **Why this week** — The plan cites **inputs · rule · effect** from your logs (not a chatbot).
4. **Adapt** — Miss a session, change equipment, or report low readiness — the plan adjusts (swap to recovery, reschedule focus).
5. **Voice briefing** (optional) — A short weekly summary via AI when configured; falls back to rule-based messages if AI is unavailable.

Chat on `/coach` is Super Bundle chrome. It does not replace the week.

## Daily insight vs weekly plan

| Feature | Where | What |
|---------|-------|------|
| **Daily insight** | Today card | One-line nudge for *today* (strain, protein, mobility) |
| **Weekly plan** | `/coach` | Full week of sessions with exercises |

Both respect your pillar balance; daily insight does not replace the weekly schedule.

## Using your plan

1. Open **Coach** → review the week strip.
2. Tap today's session → start exercises in **Train**.
3. On a session line, **Swap** offers one or two floor or garage stand-ins when the machine is not there. It changes that line only — it does not rebuild the week.
4. Log sets as usual — history feeds next week's plan.
5. Change preferences in Profile (days per week, equipment, goals).

## Privacy

Plans are computed on your device from local history. Cloud sync (when signed in) backs up plan state — not shared with other users. School leaderboards never expose raw user IDs to teachers.

## Troubleshooting

- Plan looks empty → complete I-Day and log at least one workout.
- Same exercises repeating → normal for familiarity; variety increases over weeks.
- Locked features → confirm premium status in Profile.

More: [faq.md](faq.md), [troubleshooting.md](troubleshooting.md).
