## 2026-08-04 — NL unicode + residual word fractions (`.436`)

Unicode vulgar fractions (½ ⅓ ⅔ ¾ / 1½), `half of a cup`, `three quarters`, and hyphen `two-thirds` parse to true qty. Phone paste no longer silently becomes a full cup.

Mutants: drop unicode map → full cup → red; drop `of` in halfPortion → `half of a cup` full → red.
