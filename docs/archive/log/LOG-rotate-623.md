# Rotated from LOG.md for `.623`

Oldest live entry moved when shipping You S4a page share + private note.

## 2026-08-08 — The load model gets a screen (`.608`)

**The best thing in the codebase had never been shown to anybody.**

`coach/load.ts` implements Foster session-RPE and an EWMA acute:chronic workload ratio from logged sets alone, returns `null` under 14 days rather than a plausible number, and feeds planning through `loadGuard.ts` **cap-only** — a high band may hold a rise, never force a deload, never touch session shape. Its 35-line header explains that ACWR is descriptive rather than predictive and was never validated for recreational lifters. That is the WHOOP claim without the strap, implemented and hedged honestly.

A grep for its exports across every `.tsx` in the repo returns **nothing**. It reached `loadGuard` (planning), `contextBuilder` (LLM context) and one `debrief` line after a session. No standing surface, no way for an athlete to go and look. `.606` promoted it into the second beat of the wedge, so it had to become visible before that sentence was honest.

**New `CoachLoadBand` on `/coach`, and the decision is not in it.** `resolveLoadBandView` is a pure function with a test, following `.598`: the component is wiring, and the branch that matters — *refusing to speak* — is the one a Playwright pass is least likely to seed, so it cannot live inside a JSX conditional. It also does not re-derive when there is enough evidence; it asks `loadBands` and believes the answer, so the screen cannot drift from the model's own opinion of its evidence.

**The refusal is the feature.** Under 14 days the card says "not enough history yet" and how many days remain — never a zero, never a dash dressed as a reading. A ratio shown on day three would be `.602`'s seeded `50/50/50` wearing a lab coat, and worse, because a load ratio *looks* like physiology. The copy stays descriptive for the same reason `REDTEAM` A8 prescribes: this describes recent workload, it does not predict injury or measure recovery.

Mutants: 3 killed — speak anyway inside the window → red; never speak at all, the lazy always-unmeasured "fix" → red; `daysRemaining` collapsing to 0 so the empty state is blank rather than actionable → red. Coverage floor 391 → 392 through the documented escape hatch, reasoned in `FLOORS` and lockstep in `coverageBudget.test.ts`: the card is wiring, its sibling `loadBandView.ts` shipped *with* a test, which is why it is +1 and not +2. Tests 2216 → 2219.

