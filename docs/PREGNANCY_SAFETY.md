# Pregnancy + miscarriage safety

**Status:** counsel-hold (same posture as PT safety). Educational tools, not a clinician, not 911, not a medical device. Copy in this file and the linked help/Terms paragraph must be reviewed by counsel before production. **Not legal advice.**

**Do not promote this surface until counsel signs the copy.** Draft PRs may land on `master` only after that review — agents do not merge.

**v1 (decision 011):** the optional flag changes **exactly one** product behavior — which stop-symptoms line appears on the hard-session warning sheet. Coach prescriptions and start CTAs are unchanged.

---

## Flag

Optional, athlete-owned, stored on this device (`mw_pregnancy_flag`):

| Value | Meaning |
|-------|---------|
| `none` | Default. Unset and invalid values parse as `none`. Clearing to `none` deletes the key. |
| `pregnant` | Athlete set this. |
| `postpartum` | Athlete set this. |
| `miscarriage_recovery` | Athlete set this. |

**Never inferred** from logs, sex, age, cycle, or photos. **Never required to log.** The free logger stays free. Silent flag-off — no “what happened?” prompt.

The control lives under Account → More settings. Not on Today. Not on first paint. No analytics property. No cloud sync in v1.

---

## Stop is always legal

Stopping is allowed and shameless. There is no fail, quit, or lazy identity for stopping.

---

## What the flag changes

On the existing hard-session warning sheet only:

- **Flag on:** Stop if you have bleeding, cramping, chest pain, feel faint or dizzy, have severe shortness of breath, or cannot talk.
- **Flag off:** Stop if you have chest pain, feel faint, have severe shortness of breath, or cannot talk.

The flag does not change Coach prescriptions. It does not hide max-effort, field-test, or PFT start CTAs. It does not substitute exercises or cap intensity.

If asked whether training caused a loss: do not answer; that is a clinician’s question. (Draft refusal copy only in v1 — not wired into Coach.)

---

## What this is not

- Not prenatal care.
- Not miscarriage prevention.
- Not a branded prenatal PT product.
- Not a medical device.
- Not a clinician.
- Not emergency services.

We **do not** claim we prevent loss, miscarriage, or complications. We do not sell prenatal PT. No victim names. No service-branch test branding.

This app is **not 911**. Call local emergency services if you need them.

---

## Legal

Terms carry one English educational paragraph covering strenuous sessions and clinician-owned pregnancy / miscarriage / postpartum decisions. That is not a legal-pack rewrite. **Counsel still reviews.**

Help: [help/pregnancy-safety.md](help/pregnancy-safety.md). Hard-session sheet: [help/pt-safety.md](help/pt-safety.md).

Code: `src/lib/pregnancySafety.ts`.
