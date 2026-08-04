## 2026-08-04 — Coach chat client helpers (`.445`)

`coachChatCopyForStatus`, `classifyCoachChatStreamChunk`, and `buildCoachChatRequestContext` leave `CoachChatPanel` (399→349). Fetch/SSE loop stays in the panel; HTTP + stream error maps are one-home with unit + wiring guards.

Mutants: re-inline `status === 429` in the panel → wiring red; drop `coach_quota` from classifier → unit red.

