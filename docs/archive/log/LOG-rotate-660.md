## 2026-08-10 — Plan exercise why floors (`.645`)

`PlanExerciseLine` still used `i18n.exists(whyKey) ? t(whyKey) : ''` after `.642` fixed the same blanking on CoachAdaptBanner. During bootstrap/hydrate, exists is false so prescribed exercise **why** lines on Coach + Today compact list painted nothing even when the engine had a catalogued key. Now uses `coachWhyLine` English floors; guard covers both banner and line.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-645.md](docs/archive/log/LOG-rotate-645.md).

