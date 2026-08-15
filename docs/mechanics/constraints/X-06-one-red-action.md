---
id: X-06
type: constraint
title: One red action, measured not eyeballed
rule: A screen carries zero red controls in main and at most one in the screen dock. Red is exactly three tokens; measurement reads computed backgrounds rather than class names.
enforcer: tests/e2e/helpers/redActions.ts
enforcer_anchor: const RED_RGB
authority: docs/DESIGN_ORCHESTRATION.md surface bar 2
---

The design system's answer to the same pressure `X-04` resists: every new idea
believes it deserves the primary button. This one is worth citing in the graph
because it is measured off computed style rather than asserted off markup, so a
candidate cannot satisfy it by naming its button something else.

Practically, any hypothesis proposing a second call to action on a wedge surface
must say in `removes` which existing red action it takes down. That is the field
doing its job rather than the reviewer doing it.
