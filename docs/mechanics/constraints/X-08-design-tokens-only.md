---
id: X-08
type: constraint
title: Design tokens only
rule: Paper and ink, radius 0, Archivo, light-only. No off-palette hex, no raw border-radius, no glow or elevation, no second typeface. Checked against source, with an allowlist that must justify itself.
enforcer: scripts/check-design-system.mjs
enforcer_anchor: export const ALLOWLIST
authority: docs/DESIGN_SYSTEM.md
---

Included in the graph not because a behavioural mechanic often violates it, but
because the ones that do violate it *invisibly*: a mechanic imported whole from
another product arrives wearing that product's chrome. Confetti, glow, a second
accent for the "achievement" state, a rounded pill for the badge — the surface
comes attached to the dynamic unless someone separates them.

That separation is what `schema.ts` forces at the point of recording. A mechanic
stored as primitives has no chrome to import.
