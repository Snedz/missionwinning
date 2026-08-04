## 2026-08-04 — Hero form mid-phase motion (`.456`)

Sixteen hero form SVGs gain CSS-in-SVG mid-phase bob + cue pulse (`inject-form-motion.mjs`), gated on `prefers-reduced-motion: no-preference` so animation works under `<img src>` without a runtime player. `media:form-all` chains inject after regenerate. Unit guard pins the hero set.

Mutants: drop form-phase-mid from push-ups → motion test red; inject twice → style count still 1 (idempotent).
