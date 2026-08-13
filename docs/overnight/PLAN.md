# Frozen: Pregnancy + miscarriage safety (educational, counsel-hold) (`.746`)

**Status:** FROZEN. Implement only this plan. Same legal posture as PT safety ([PR #519](https://github.com/Snedz/missionwinning/pull/519)): educational tools, not a clinician, not 911, not a medical device. Draft PR. Counsel reviews copy before production. Do not merge. Do not promote.

**Label:** `2026.07-unified.746` (occupied `.698`–`.745`). One Preview max.

**Excellence-Override:** pregnancy/miscarriage safety

---

## External source

https://x.com/de1lymoon/status/2087494435189723456 was **readable** (2026-08-12). Product/safety bits used here, not analogized in athlete copy:

1. **Stop always exists** — stopping is legal and shameless; there is never no way out.
2. **Output gate in code** — Coach must not ship a max-effort / field-test / load-jump prescription when a hold flag is on. A prompt or hope is not the gate.
3. **Hard cap** — hide max-effort CTAs when the flag is on (kill switch, not a wish).

If that link had been unreadable, this pregnancy work would still ship.

---

## Goal

Protect athletes and the company around pregnancy, miscarriage, and postpartum. We do **not** claim we prevent loss or complications. We do **not** sell “safe pregnancy PT.”

---

## Non-goals (hard bans)

- Do not flip `PRIVATE_MODE`.
- Do not mint `.698`–`.745`.
- Do not rewrite PR #519 (hard-session sheet) or #505 (field-test session). This PR must work on `master` even if those never merge. Export predicates so they can wrap later.
- Do not infer the flag from logs, sex, age, or cycle. Never required to log.
- Do not gate the free logger. Log set / rest never read the flag.
- Do not implement prenatal programming, miscarriage-prevention protocols, ECG, or PAR-Q as a logger gate.
- Do not rewrite the legal pack. No EIN. Texas LLC already present. Comment that counsel still reviews.
- Do not change `supportedRegions.ts` / geo-block.
- Do not add a new tab, pillar, locale, or America/PFT clone.
- Do not name victims. No USMC/ACFT branding. No “safe PT” sell.
- Do not put the control on Today or first paint (Account → More settings only).
- Do not sync the flag to cloud/outbox in this PR (device-local, athlete-owned).
- Coach chat / voice prompt rewrite is out of scope (plan engine is the prescribe path).

---

## Contract (`docs/PREGNANCY_SAFETY.md`)

Must state:

- Optional, athlete-owned flag: `none` | `pregnant` | `postpartum` | `miscarriage_recovery`. Never inferred. Never required to log. Unset parses as `none`.
- Stop is always legal and shameless.
- App is not prenatal care, not miscarriage prevention, not “safe pregnancy PT.” Never claim we prevent loss or complications.
- If bleeding, cramping, faint, chest pain, or can’t talk: stop and get help. The app is not 911.
- Coach must not prescribe max-effort, field test, or load jumps while any of those flags (other than `none`) is on. Logger still works. Coach may only say “this is not medical advice; ask your clinician.”
- No victim names. No USMC/ACFT branding. No sell “safe PT.”
- Counsel reviews copy before production. Hold like #519.

---

## Product

### Flag (device-local)

- Storage key `mw_pregnancy_flag` via `STORAGE_KEYS` + `safeStorage`.
- Pure module `src/lib/pregnancySafety.ts` — parse, hold predicate, CTA hide, load-jump cap, max-effort name marks. One definition. Invalid values → `none` (do not invent a hold).
- Quiet Account control inside **More settings** (not Account first paint, not Today). Native select. Clearing back to `none` is allowed.

### When hold is on (`pregnant` | `postpartum` | `miscarriage_recovery`)

1. **Coach plan engine (the gate):** `nextTargets` must not emit `coachWhyLoadUp` or a weight/`loadPct` rise vs the hold target. Why-line athlete copy is only: *This is not medical advice; ask your clinician.* (`coachWhyClinicianHold`). Selector passes the flag from `CoachContext`. `computeContextHash` includes the flag so a new generate is a different week. Planned (not done) sessions on an existing week are rematerialized through the same hold (`holdPrescriptionsInPlan` in `src/lib/coach/pregnancyHold.ts`).
2. **Hide max-effort CTAs:** PFT “Take the full/mini test” on Benchmarks; `/fitness-test` runner does not proceed to events (disclaimer instead); program **Load** for closed max-effort session names (`Peaking — 1RM Test`, `Week 3 — Session 4 (Test)`, Field test / Five-event field test, `1RM test` / `max test` / `max-effort` / `2-mile` titles). e1RM **estimate** charts/calculators stay. No new “test your max” CTA.
3. **One-line disclaimer** on Coach when hold is on, and on the fitness-test hold gate. Same sentence. Export so #519 can place it on a hard-session sheet later.

### Logger

Unchanged. `handleLogSet` / `logSet` must not import or call pregnancy helpers. Tests source-scan that.

---

## Copy bans (must fail CI if they ship in this feature’s athlete-facing strings)

`safe for pregnancy` · `safe pregnancy PT` · `prevents miscarriage` · `prevent miscarriage` · `prevents loss` · `prenatal care` as a product claim · `we keep you safe` · victim names · `USMC` · `ACFT` as product name.

Comments may name the ban. Extract user-facing strings.

Required positives: stop + get help for bleeding/cramping/faint/chest pain/can’t talk; not 911; not medical advice; ask your clinician.

---

## Help + legal (minimal)

- `docs/help/pregnancy-safety.md` — plain language. Pointer from `docs/help/INDEX.md`, `docs/INDEX.md`, `docs/README.md`.
- `docs/LEGAL_SAFETY.md` — one row pointing at the contract. Not a legal-pack rewrite.
- Root `INDEX.md` task routing row.
- **Terms EN only:** append one tight sentence to `infoTermsEducationalBody` — we do not provide medical advice; pregnancy / miscarriage / postpartum decisions are clinician-owned. HTML comment or source comment: counsel still reviews. Do not rewrite About, Privacy, counsel exports, or non-EN overlays. No EIN.

---

## Files (expected)

| Path | Role |
|------|------|
| `docs/PREGNANCY_SAFETY.md` | Contract |
| `docs/help/pregnancy-safety.md` | Help |
| `src/lib/pregnancySafety.ts` | Pure flag + hold + CTA + load-jump cap |
| `src/lib/pregnancySafety.test.ts` | Optional flag, parse, hide CTAs, logging independence |
| `src/lib/pregnancySafetyCopyGuard.test.ts` | Banned phrases cannot ship |
| `src/lib/coach/pregnancyHold.ts` | Rematerialize planned sessions when hold is on |
| `src/lib/coach/progression.ts` + `types.ts` + `selector.ts` + `contextBuilder.ts` + `planEngine.ts` | Pass flag; cap load jumps |
| `src/components/profile/ProfilePregnancyCard.tsx` | Quiet Account control |
| `src/components/coach/PregnancyHoldNote.tsx` | One-line disclaimer |
| `src/page-components/CoachPage.tsx` | Mount note when hold |
| `src/page-components/AccountPage.tsx` | Card under More settings |
| Fitness-test + program Load + PFT section | Hide/block max-effort starts |
| `src/i18n/notificationLocales.ts` + `coachLocales.ts` + `infoLocales.ts` | EN keys; other langs `...en` |
| `src/lib/storage/keys.ts` | `pregnancyFlag` |
| INDEX rows | lib, components, help, docs |
| `src/lib/buildInfo.ts` · `LOG.md` · `CONTEXT.md` `## Now` | Ship protocol `.746` |

---

## Tests

- Flag optional: unset / `none` / garbage → `none`; hold true only for the three named values.
- Logging works with no flag: Active `handleLogSet` / workout `logSet` do not import pregnancy helpers. `nextTargets` without hold still load-ups on all-easy (existing behaviour).
- Coach does not emit a load jump when pregnant (also postpartum, miscarriage_recovery): `nextTargets` + `generateWeek` have no `coachWhyLoadUp` and proposed weight/`loadPct` is not an increase vs hold.
- Copy-guard: banned phrases absent from pregnancy module, note, Account card, EN strings, help, contract, new Terms sentence.
- Wiring: Account card is under More settings; HomePage / Today do not import it. Coach mounts the note when hold. Fitness-test / PFT CTAs / program Load respect `shouldHideMaxEffortCtas`.
- `pregnancySafety.ts` does not import score, chat, or rewards.
- `check-build-label` → `.746` past master `.697`.
- Falsify: a mutant adding “safe for pregnancy” or skipping the load-jump cap must fail.

---

## Ship

- Bump `APP_BUILD_LABEL` to `2026.07-unified.746`.
- LOG heading `## YYYY-MM-DD — Pregnancy + miscarriage safety (educational, counsel-hold (\`.746\`)`. Rotate oldest LOG section to stay ≤15.
- `## Now`: add `.746` bullet; rotate oldest shipped version bullet (`.636`) to stay ≤25. Do not drop Status table / Excellence / Horizon W / PRIVATE_MODE facts.
- Commit trailer: `Excellence-Override: pregnancy/miscarriage safety`
- Draft PR title: `Pregnancy + miscarriage safety (educational, counsel-hold)`
- Plan commit: `[skip vercel]`. Implement commit may create the one Preview. Follow-ups `[skip vercel]`.
