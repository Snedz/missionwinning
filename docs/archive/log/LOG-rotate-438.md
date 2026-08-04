## 2026-08-04 — MoreSheet soft chrome + NL mixed qty (`.423`)

MoreSheet Premium kicker drops bare `opacity-90` for solid `text-primary-foreground` (soft chrome, not Bundle deepen). NL meal log parses mixed numbers (`1 1/2 cup rice` → 1.5×, not the trailing half) before fraction matchers — Fuel accuracy residual. i18n uncovered cap stays 16.

Mutants: drop mixed-before-fraction order → `1 1/2 cup` becomes half → red; leave opacity-90 → soft-chrome intent lost.
