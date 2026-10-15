Rotated out of LOG.md on 2026-10-15 so the live file stays within 15 entries after `.1135`. The live floor stays `.1113` because its predecessor `.1112` is the archived boundary the budget test checks.

## 2026-09-24 — Personal trainer on the set in front of you (`.1123`)

Today, Train, and Coach show one
card: the next set, a Library
form cue, and the plan name.
The sentence is composed on
the device from those facts.
A live line is optional.

Free model: `gemini-2.5-flash`
via Google `generateContent`
when `GEMINI_API_KEY` or
`GOOGLE_GENERATIVE_AI_API_KEY`
is set. Else `COACH_LLM_*`
if that is configured. Else
the library line. A model
line that changes the lift
or the load is dropped.
The free logger does not
need a gate cookie. Free
beta entitles the signed-out
caller, so the same Flash
line is the one they hear.
Beta off and signed-out
stays on the library line.
An exhausted daily cap stays
on the library answer (200,
not 401 or 429). The cap is
the existing daily-insight
window so the ledger feature
list stays closed. The card
sends `deviceId` for that
meter only.

The card does not add a
filled action. Library is a
ghost link to `/exercises/[id]`.
No checkout URL.

**Mutants killed:** a missing
plan inventing a lift; zero
weight printed as 0 kg; a
model line with a different
load kept; another product
name kept; a signed-out
caller hitting the model
with free beta off; a call
with no key; quota exhaustion
returning 429; `GEMINI_MODEL`
pointing off the Gemini host.

`[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1123`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1104-for-1123.md](docs/archive/log/LOG-rotate-1104-for-1123.md) (`.1104`), for the ≤15 entry budget.
