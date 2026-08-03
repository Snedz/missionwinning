## 2026-08-03 — Victory progression is structured + i18n (`.290`)

`buildProgressionInsight` returns a pure payload (reason · lift · numbers), not a
hard-coded English sentence. Bodyweight sessions get rep-based cues. Victory sheet
maps keys (EN/ES/FR/PT); BW work no longer skipped because `weight <= 0`.
