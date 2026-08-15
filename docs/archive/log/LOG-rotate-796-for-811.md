# Rotated from LOG.md when `.811` landed

## 2026-08-14 — Logger dock stays above the keyboard (`.796`)

Outdoor one-thumb: Log set already lived in the compact dock with 52px
steppers, but `h-screen` does not shrink when the iOS keyboard opens,
so the red control sat under the keys. Enter still logged; the thumb
could not see the button.

**Ship:** `visualViewportKeyboardOverlap` + AppLayout `paddingBottom`.
No restyle of LogConsole. TAP_BUDGET unchanged. No `PRIVATE_MODE` flip.

Label `.796` (onto master `.795`).

Excellence-Override: outdoor Log set was under the keyboard (surface; RESULT unscored)
