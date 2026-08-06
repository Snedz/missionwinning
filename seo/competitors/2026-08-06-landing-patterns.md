# Competitor landing patterns — founder screenshot batch, 2026-08-06

Source: founder screenshots (D14 batch 3) of Instagram ads and landing pages — **Ladder** (joinladder.com), **HWPO Training**, **Ibex** (ibextrained.com), **JuggernautAI**, **Reshape**. Product-pattern screenshots from the same batches (Pump Club home, Apple Journal) were built as wave D14 (`docs/DESIGN_ORCHESTRATION.md`); this note holds the *marketing* patterns.

**Standing block:** these are patterns to adapt **post-EIN**, when payments and public flip unlock. The landing is frozen during Horizon W, trials/pricing need live Stripe + LLC/EIN, and **no invented numbers for Mission Winning** — every social-proof figure below is theirs, not ours. Nothing here is a build instruction.

## Headline formulas

| App | Headline | Formula |
|---|---|---|
| Ladder | "Get stronger and workout more, **without planning workouts**" | outcome + outcome, minus the chore |
| Ibex | "Serious training. Real results." + "Structured workouts, clear weekly progress, evolving training" | identity claim + 3-noun proof line |
| Reshape | "Stop chasing, start pulling." + "AI-powered coaching that adapts to you" | verb-flip hook + adaptivity claim |
| HWPO | "Unlock 12 training programs from world-class coaches" | quantified catalog + authority |

Ladder's line is our Mission Coach wedge said from the athlete's side. Our positioning line ("the free workout tracker that works anywhere") leads with free+anywhere; a post-launch Coach-focused variant could borrow the "without planning workouts" clause — it names the chore the AI removes, in user-speak.

## Pricing presentation

- **Anchor + collapse (HWPO):** "$299.98 → $49/month" — sums the per-program price to anchor, then collapses into the all-access sub. Our analog when live: sum pillar-by-pillar substitutes (Calm + Pliability + a tracker sub) against the Super Bundle price. Keep to real substitute prices only.
- **Price framing words:** "for an unbeatable price", "All Access Pass" (HWPO); "Unlimited access to ALL plans" (Ibex).

## Trial + risk-reversal framing

- 14-day free trial (HWPO) · two-week free trial (JuggernautAI) · "Start free" / "Try for free" CTAs everywhere.
- Risk reversal chips: "**No credit card required**" (Ladder), "**Instant access · Cancel anytime**" (Ibex).
- Blocked for us until Stripe live; the free-forever logger is a stronger risk reversal than any trial — say that instead when the pricing page ships.

## Funnel devices

- **TAKE QUIZ (Ibex):** quiz → plan recommendation as the second CTA next to the trial. Our `/welcome` I-Day already is this flow; a public "Find your plan" entry into it is the analog — no new surface needed.
- **Lead magnet (Ibex):** "Free macro guide — Claim Now!" exit popup. Candidate analog: an existing guidebook chapter as a downloadable — but email capture is blocked until `MAIL_POSTAL_ADDRESS` exists (CAN-SPAM footer).
- **HSA/FSA banner (Ladder):** "Use your HSA/FSA funds" — US-only payment angle, needs legal review; America lane is gated. Recorded, not proposed.

## Social proof layouts

- Laurel badges: "Apple Finalist — App of the Year 2025" + "100k+ Reviews" (Ladder); "Trusted by 1M+ users" (Reshape); "Join 40,000+" with avatar row (Ibex); "40,000+ athletes train on one plan. Rated 5 stars." (Ibex ad).
- Community-as-benefit: "Plus, access to a supportive community of coaches and athletes!" (JuggernautAI).
- We have no numbers to put in these slots and will not invent them (hard rule 3). The honest pre-traction analogs: concrete product facts (exercise count, languages, works-offline) — already our landing's approach.

## In-product moments used as ad creative

- Ladder shows a live workout screen with a social reaction overlay ("Brandon G cheered you on!" + fire emoji) — the ad sells the feeling of not training alone. Social backend is out (device-first privacy posture); our sharable analog is the existing week-recap share card.
- JuggernautAI shows a per-lift e1RM history chart ("Estimated Max 270 lb") — we already compute this (`src/lib/coach/progress.ts`); a polished share/still of it is ad-creative material when ads unlock (organic-first until then).
- Reshape shows a week strip + daily targets — shipped as D14's log week strip (honest marks only).
