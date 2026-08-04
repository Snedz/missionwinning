# Form Index media

Clinical movement demos for Train / library / public exercises.

| Path | Role |
|------|------|
| `{exerciseId}/side.webp` | Primary poster (library card + LCP) |
| `{exerciseId}/side.mp4` | Silent ~6s loop (480p); poster used as `poster` |
| `{exerciseId}/front.webp` | Optional second angle |
| `pattern-{squat|hinge|push|pull|core|loco|isolation}/side.webp` | Long-tail shared pattern still |

**Pipeline:** [Form Director](../../media/form-kit/FORM_DIRECTOR.md) sheet → still QA → `media/inbox/form-{id}-side-frame.png` → `npm run media:optimize-inbox` → wire `FORM_PACK_SIDE_IDS` (video only after loop QA).

**Quality reset (`.467`):** loops demoted; `burpees` / `box-jump` / broken patterns demoted. Prefer still-only over glitchy motion.

Do not embed third-party CrossFit or YouTube demos. MW-owned assets only.
