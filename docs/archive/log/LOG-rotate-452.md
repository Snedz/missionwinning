## 2026-08-04 — Coach free-form + soft tip peel (`.437`)

`CoachFreeFormAskPanel` and `CoachSoftBundleChatTip` leave `CoachChatPanel` (492→399). Free `?ask=` cues + soft Bundle tip keep testids; chat SSE loop untouched. Wiring guard.

Mutants: re-inline FreeFormAskPanel → wiring red.
