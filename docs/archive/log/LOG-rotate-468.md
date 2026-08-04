## 2026-08-04 — Coach chat stream reader peel (`.453`)

`readCoachChatStream` + `isCoachChatAbortError` leave `CoachChatPanel`. Fetch stays in the panel; SSE loop + abort detection are one-home with unit + wiring guards. Panel 287→281.

Mutants: re-inline getReader on the panel → wiring red; drop AbortError name check → unit red.
