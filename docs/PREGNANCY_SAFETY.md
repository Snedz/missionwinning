# Pregnancy + miscarriage safety

**Status:** counsel-hold (same posture as PT safety). Educational tools, not a clinician, not 911, not a medical device. Copy in this file and the linked help/Terms sentence must be reviewed by counsel before production. **Not legal advice.**

**Do not promote this surface until counsel signs the copy.** Draft PRs may land on `master` only after that review — agents do not merge.

---

## Flag

Optional, athlete-owned, stored on this device (`mw_pregnancy_flag`):

| Value | Meaning |
|-------|---------|
| `none` | Default. Unset and invalid values parse as `none`. |
| `pregnant` | Athlete set this. |
| `postpartum` | Athlete set this. |
| `miscarriage_recovery` | Athlete set this. |

**Never inferred** from logs, sex, age, cycle, or photos. **Never required to log.** The free logger stays free. Clearing back to `none` is the athlete’s choice.

The control lives under Account → More settings. Not on Today. Not on first paint.

---

## Stop is always legal

Stopping is allowed and shameless. There is no fail, quit, or lazy identity for stopping.

If you have **bleeding, cramping, feel faint, have chest pain, or cannot talk: stop and get help.** This app is **not 911** and not local emergency services.

---

## What this is not

- Not prenatal care.
- Not miscarriage prevention.
- Not a branded prenatal PT product.
- Not a medical device.
- Not a clinician.

We **do not** claim we prevent loss, miscarriage, or complications. We do not sell prenatal PT. No victim names. No service-branch test branding.

---

## Coach (the output gate)

While any hold flag (`pregnant` | `postpartum` | `miscarriage_recovery`) is on:

- Coach **must not** prescribe max-effort, a field test, or a **load jump** (weight / `%` of e1RM rise vs hold).
- That refusal lives in **code** (`capProgressionForPregnancyHold` / `nextTargets`), not in a prompt.
- The only Coach line for that hold: **This is not medical advice; ask your clinician.**
- The logger still works. They can log a normal set.

e1RM **estimates** from already-logged sets may remain. There is no CTA to test a max.

Hard-session / field-test / PFT start paths stay **hidden** while the hold is on. Predicates are exported so PT safety (#519) and field test (#505) can wrap later without this file owning those sessions.

---

## Legal

Terms carry one English educational sentence: we do not provide medical advice; pregnancy / miscarriage / postpartum decisions are clinician-owned. That is not a legal-pack rewrite. **Counsel still reviews.**

Help: [help/pregnancy-safety.md](help/pregnancy-safety.md).

Code: `src/lib/pregnancySafety.ts`.
