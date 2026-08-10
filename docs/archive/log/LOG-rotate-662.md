## 2026-08-10 — Coach voice rules English floors (`.647`)

`planVoiceFromRules` returns i18n keys (`coachVoiceDefault` / Deload / Recovery / HighVolume). CoachVoiceCard used `defaultValue: voice.message` — raw key on hydrate or missing pack. New `coachVoiceDefaults` + `coachVoiceLine`; guard covers all rules emits and the card wiring.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-647.md](docs/archive/log/LOG-rotate-647.md).

