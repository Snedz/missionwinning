# Rotated from LOG.md when `.789` landed

## 2026-08-14 — LLM daily dollar cap + lifetime Grok gate (`.775`)

Request caps (60 chats/day) did not implement “never cost more than they
paid.” Lifetime is $149 once; Grok is pay-per-token forever. Default 4.6
reasoning is billed and not capped by `max_tokens`.

**Ship:** `centsFromUsage` (provider ticks, else grok-4.6 list; reasoning =
output). Per-identity default **15¢/day**, org breaker **$25/day**. Fail-closed
if the store throws. `allowLlmInference` = request quota then $ cap. Chat,
insight, voice, debrief, meal vision. Lifetime uses the same cap. Public-flip
checklist in LAUNCH_RUNBOOK §5.

Mutants: ticks ignored → list-price used; reasoning omitted → undercount; store
throw → allow (must deny); $ cap 0 with request cap 60 → allow.

Label `.775` (onto master `.774`).
Excellence-Override below.

Excellence-Override: llm spend cap

Rotated LOG oldest → [docs/archive/log/LOG-rotate-760-for-775.md](docs/archive/log/LOG-rotate-760-for-775.md).
