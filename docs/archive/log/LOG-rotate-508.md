# Rotated for .508

## 2026-08-05 — Landing At-a-glance bottom rule (`.492`)

Flush checkable-stat grid (217 / 3min / 0 / $0) used `section-seam`, which paints the bottom 2px rule as a **section background**. Opaque `bg-background` cells covered it — the bottom line was missing by construction. Switched to real `border-b-2 border-border`; internal gutters `gap-px` → `gap-0.5` (2px Modernist rules). Guard `landingStatRow.test.ts` pins border + forbids section-seam / gap-px on that block.

Mutants: restore section-seam without border → red; gap-px again → red.


