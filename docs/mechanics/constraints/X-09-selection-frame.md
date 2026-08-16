---
id: X-09
type: constraint
title: Cohort numbers declare their selection frame
rule: Any week4_retained or cohort_eligible figure produced under src/lib must go through frameCohort or formatFramedCohort. unknown=yes is a legal declaration and must remain visible in the formatted output.
enforcer: src/lib/selectionFrame.test.ts
enforcer_anchor: every week4_retained / cohort_eligible producer goes through frameCohort
authority: docs/mechanics/hypotheses/H-09-selection-frame-guard.md
---

Engagement programmes recruit the already-engaged, and this product's own
features censor its own logs. A cohort percentage without saying who could have
appeared is a number we cannot sign. The guard is the first commission; this
node exists because the enforcer exists.
