# Form Index media

Clinical movement demos for Train / library / public exercises.

| Path | Role |
|------|------|
| `{exerciseId}/cast-{letter}.webp` | Cast-set still (`.736` — `squats` / `push-ups` / `pull-ups`). Product picks one via `formCast.ts`. Representation ≠ service territory. |
| `{exerciseId}/side.webp` | Primary poster (library card + LCP) when no cast set |
| `{exerciseId}/side.mp4` | Silent ~6s loop (480p); poster used as `poster` |
| `{exerciseId}/front.webp` | Optional second angle |
| `pattern-{squat|hinge|push|pull|core|loco|isolation}/side.webp` | Long-tail shared pattern still |

**Pipeline:** [Form Director](../../media/form-kit/FORM_DIRECTOR.md) sheet → still QA → `media/inbox/form-{id}-side-frame.png` → `npm run media:optimize-inbox` → wire `FORM_PACK_SIDE_IDS` (video only after loop QA).

**Quality reset (`.467`):** loops demoted; `burpees` / `box-jump` / broken patterns demoted. Prefer still-only over glitchy motion.

**Landmine (`.473` / `.772`):** still-only packs for `landmine-press`, `landmine-row` (floor pivot), `landmine-squat`. Other landmines use pattern media + structured guides.

**Library cards (`.772`):** unique Form Index stills only (38 wired). Shared `pattern-*` rasters stay in the form sheet with an honest caption — they are not card posters. Wave B: `dead-bug`, `side-plank`, `mountain-climbers`, `hollow-hold`, `cable-row`, `lateral-raise`, `dumbbell-press`, `dumbbell-row`.

Do not embed third-party CrossFit or YouTube demos. MW-owned assets only.
