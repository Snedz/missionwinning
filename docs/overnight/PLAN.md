# Frozen: Pregnancy + miscarriage safety v1 — counsel-hold, symptom line only (`.761`)

**Status:** FROZEN. Implement only this plan. Decision 011 v1 (ops #18). Same legal posture as PT safety ([PR #519](https://github.com/Snedz/missionwinning/pull/519)): educational tools, not a clinician, not 911, not a medical device. Draft PR. Counsel reviews copy before production. Do not merge. Do not promote.

**Label:** `2026.07-unified.761` (past origin/master `.760`; this branch first minted `.746` while master was `.697`, then `.752` while master was `.751`). One Preview max. Follow-ups `[skip vercel]`. Existing Vercel Preview is **not** a review or E-Day surface.

**Excellence-Override:** pregnancy/miscarriage safety

**Supersedes** the earlier `.746` freeze in this file (Coach load-jump caps + CTA hide). Those behaviors are a **follow-on decision**, not v1.

**Addendum (Counsel + CoS, unsigned label):** athlete-facing “Miscarriage recovery” / presenting `miscarriage_recovery` as finished copy stays **UNSIGNED**. Grief-adjacent option labels need counsel + founder before any review surface. Keep the stored enum value in code. Do not invent a cute synonym for loss. Athlete labels until founder reads: **None / Pregnant / Postpartum** only.

---

## Goal

The optional pregnancy flag changes **exactly one** product behavior: which stop-symptoms line appears on the existing #519 hard-session warning sheet.

We do **not** claim we prevent loss or complications. We do **not** sell “safe pregnancy PT.” Do not invent law or medical claims.

---

## v1 product (keep)

### Flag (device-local)

- Optional, athlete-owned stored values: `none` | `pregnant` | `postpartum` | `miscarriage_recovery`.
- **Athlete-visible labels (signed for this draft):** None / Pregnant / Postpartum only. Do not show “Miscarriage recovery”. Do not invent a synonym for loss.
- `miscarriage_recovery` may stay in the parser / hold set (if already stored, the stop line still uses the hold string). It is **UNSIGNED** as athlete copy — not an option in the Account control.
- Never inferred from logs, sex, age, cycle, or photos. Never required to log. Unset / invalid → `none`.
- Silent flag-off: clearing to `none` **deletes** the storage key (no “what happened?” UI, no derived hold state left behind).
- Settings control under **Account → More settings** only. Not Today. Not first paint.
- Storage key `mw_pregnancy_flag` via `STORAGE_KEYS` + `safeStorage`. No analytics property. No cloud/outbox sync.
- Logger ungated. `handleLogSet` / `logSet` must not import or call pregnancy helpers.

### Hard-session stop line (the one behavior)

Bring the #519 hard-session warning sheet onto this branch (it is not on `master`) so the flag has a home. Do not hide the sheet or the start CTAs.

When the flag is **on** (`pregnant` | `postpartum` | `miscarriage_recovery`):

> Stop if you have bleeding, cramping, chest pain, feel faint or dizzy, have severe shortness of breath, or cannot talk.

When the flag is **off** (`none` / unset / invalid), keep the #519 line:

> Stop if you have chest pain, feel faint, have severe shortness of breath, or cannot talk.

One pure selector owns those two strings. The sheet renders that selector. Back still works. Logging a normal set is never blocked.

### Combined Terms educational paragraph

Replace **both** #519 and #536 rewrites of `infoTermsEducationalBody` with this **one** English paragraph (counsel still reviews; comment in source). Do not rewrite About, Privacy, counsel exports, or non-EN overlays. No EIN.

> Mission Winning is educational fitness software, not medical care and not emergency services. Strenuous or max-effort sessions carry extra risk; stopping is always allowed. This app cannot prevent a medical emergency — call local emergency services, not the app. We do not provide medical advice. Pregnancy, miscarriage, and postpartum decisions are clinician-owned.

### Cause-talk refusal (copy only)

Scripted refusal **COPY** may stay as draft / not-for-prod text: if asked whether training caused a loss, do not answer; point to a clinician. Do **not** implement Coach programming, chat, or voice changes.

---

## Remove from this PR (follow-on, not v1)

- Hiding max-effort / field-test / PFT start CTAs
- Coach load-jump caps
- `capProgressionForPregnancyHold` / `nextTargets` pregnancy arg / `holdPrescriptionsInPlan` / `pregnancyHold.ts`
- Coach `pregnancyFlag` on `CoachContext` / context hash / selector
- `PregnancyHoldNote` on Coach, fitness-test, or PFT
- Any intensity cap, exercise substitution, or prenatal programming

Coach prescriptions stay as they are on `master`. The flag does not change them.

---

## Non-goals (hard bans)

- Do not flip `PRIVATE_MODE`.
- Do not mint `.698`–`.745`.
- Do not infer the flag. Do not gate the free logger.
- Do not implement prenatal programming, miscarriage-prevention protocols, ECG, or PAR-Q as a logger gate.
- Do not rewrite the legal pack. No EIN. Texas LLC already present.
- Do not change `supportedRegions.ts` / geo-block.
- Do not add a new tab, pillar, locale, or America/PFT clone.
- Do not name victims. No USMC/ACFT branding. No “safe PT” sell.
- Do not put the control on Today or first paint.
- Do not sync the flag to cloud/outbox.
- Do not open a second PR. Stay draft. Do not merge.
- Do not present “Miscarriage recovery” as finished athlete copy. Do not treat Preview as a review or E-Day surface.

---

## Contract + help

`docs/PREGNANCY_SAFETY.md` and `docs/help/pregnancy-safety.md` must match v1:

- Flag optional, never inferred, never required to log.
- Stop is always legal.
- App is not prenatal care, not miscarriage prevention, not “safe pregnancy PT.”
- The flag **does not** change Coach prescriptions or hide CTAs.
- The flag **does** change the hard-session stop-symptoms line (and only that).
- Counsel reviews copy before production.

Copy-guard bans: `safe for pregnancy` · `safe pregnancy PT` · `prevents miscarriage` · `prevent miscarriage` · `prevents loss` · `prenatal care` as a product claim · `we keep you safe` · victim names · `USMC` · `ACFT` as product name.

---

## Files (expected)

| Path | Role |
|------|------|
| `docs/PREGNANCY_SAFETY.md` | Contract — v1 symptom line only |
| `docs/help/pregnancy-safety.md` | Help — v1 |
| `src/lib/pregnancySafety.ts` | Pure flag + stop-line selector. No load cap. No CTA hide. |
| `src/lib/pregnancySafety.test.ts` | Optional flag; logging; no inference; no analytics; flag-off deletes; logger never blocked; stop-line switch |
| `src/lib/pregnancySafetyCopyGuard.test.ts` | Banned phrases cannot ship |
| `src/lib/workout/hardSession.ts` | #519 when-to-warn (unchanged marks) |
| `src/components/workout/HardSessionWarningSheet.tsx` | Sheet uses stop-line selector |
| `src/components/profile/ProfilePregnancyCard.tsx` | Quiet Account control |
| `src/page-components/AccountPage.tsx` | Card under More settings |
| `src/i18n/notificationLocales.ts` + `activeWorkoutLocales.ts` + `infoLocales.ts` | EN keys; other langs `...en` |
| `src/lib/storage/keys.ts` | `pregnancyFlag` |
| INDEX rows | lib, components, help, docs |
| `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` `## Now` | Ship protocol `.746` — v1 wording |

**Must not remain:** `src/lib/coach/pregnancyHold.ts`, `PregnancyHoldNote.tsx`, pregnancy args on `nextTargets` / `CoachContext`.

---

## Tests

- Flag optional: unset / `none` / garbage → `none`; hold true only for the three named values.
- Logging works with no flag: Active `handleLogSet` / workout `logSet` do not import pregnancy helpers.
- No inference path: parse never maps sex/age/cycle/yes/female to a hold.
- No analytics property: pregnancy module + Account card do not call `track` / analytics.
- Flag-off deletes derived state: `savePregnancyFlag('none')` removes the key (does not leave `'none'` stored).
- Logger never blocked: Log set path does not read the flag.
- Stop line: hold on → pregnancy string; hold off → #519 string. Sheet wiring uses the selector.
- Tests **do not** require Coach load-cap or CTA-hide as this PR’s behavior. `nextTargets` without a pregnancy arg still load-ups on all-easy (master behaviour).
- Copy-guard: banned phrases absent from pregnancy module, Account card, EN strings, help, contract, Terms paragraph.
- Wiring: Account card is under More settings; HomePage / Today do not import it.
- `pregnancySafety.ts` does not import score, chat, rewards, outbox, or coach plan engine.
- Athlete Account options are only none / pregnant / postpartum. Card + EN option keys do not contain “Miscarriage recovery”.
- Stored `miscarriage_recovery` still parses and still selects the hold stop line.
- `check-build-label` → `.761` past origin/master `.760`.
- Falsify: a mutant adding “safe for pregnancy” or making the flag change Coach load must fail.

---

## Ship

- Bump `APP_BUILD_LABEL` to `2026.07-unified.761` (past origin/master `.760`).
- LOG heading `## YYYY-MM-DD — … (\`.761\`)`. Rewrite the entry to v1 (symptom line only) + unsigned label addendum.
- `## Now` `.761` bullet: counsel-hold, flag, symptom line only, unsigned fourth label — not Coach caps / CTA hide. Preview is not a review surface.
- Commit trailer: `Excellence-Override: pregnancy/miscarriage safety`
- Draft PR title may stay. PR body: **counsel-hold, draft, do not merge, do not promote, v1 = symptom line only**.
- This plan commit: `[skip vercel]`. Implement commit may touch Preview. Follow-ups `[skip vercel]`.
