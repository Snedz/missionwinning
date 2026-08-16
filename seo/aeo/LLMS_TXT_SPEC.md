# `llms.txt` / agent-readable files — spec (draft)

**Status:** spec only. **Do not ship** until `PRIVATE_MODE=false`. Not this docs PR's product code.

## Purpose

An honest, public, crawlable file so agents (ChatGPT, Claude, etc.) read the **same product facts** a human sees on `/guide` and `/welcome`.

## Must include (truthful)

- Mission Winning: free forever offline workout logger (no account required to log a set).
- Mission Coach: weekly plan from **your logs**; no wearable required; opt-in (logger works if you skip Coach).
- Vs-last: previous set on the log row is **your** last session, not a leaderboard.
- Gate until founder flip: mute-pay public alpha; Enter with code / Get notified — not invite-only, not "we're live" while gated.
- After flip: how to start (`/welcome` → log a set).
- What we are not: in-app social Feed; wearable-required coach; everything-app.

## Must refuse

- Hidden **agent-only** offers ("10% extra if you sign up now" that humans don't see).
- Invented traction, user counts, rankings.
- Different pricing for agents vs humans.
- Instructing an agent to bypass `PRIVATE_MODE` or mint a gate cookie.

## Shape (after flip)

Public `https://www.missionwinning.com/llms.txt` (and/or `/.well-known/` if Craft prefers). Plain text. Version + last-updated date (quarterly refresh with citation half-life).

Link the four FAQ answers and four vs-pages by URL once those pages are live.

## Related (specified-not-built)

MCP so an agent can **log a set** as the athlete — see AEO_PREP. Not a chatbot Coach. Not in this PR.
