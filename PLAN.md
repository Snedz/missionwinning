# PLAN.md — Restore the tight `/private` lock (`.957`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the door freeze (same home as the `.942` four-scene plan
this ship reverses).
**Lane:** Engineering-Web · gated first paint · **Horizon:** 0
**Label:** `2026.07-unified.957` (master is `.955`. Do **not** steal `.956`
E-Victory close receipt.)
**Excellence-Override:** restore tight gated lock (no Today/Train restyle)

---

## 0. What this is

Founder verdict 2026-08-24: the four-scene gated www door on Preview `.955`
is refused. The live lock at https://www.missionwinning.com/private
(build `.696`) is the density they want: one hero, one notify form, one
access-code section, header badge. Tight. Not a marketing scroll.

`#778` (`.942`) turned `/private` into SET → ANYWHERE → WEEK → DOOR.
That layout is refused as first paint. Restore the old lock chrome.
Keep the `#776` copy lock. Do not bring old words back.

`PRIVATE_MODE` stays on. This is a gate restore, not a public flip.
Live www stays `.696`. Do not promote.

## 1. Investigate (done — hypothesis holds)

| Claim | Verified on `origin/master` `.955` (`2d9428a2`) |
|-------|-----------------------------------------------|
| First paint is the four-scene field | **Yes.** `GateTeaser` wraps `CinematicWww mode="gate"` and passes `PrivateTeaserClient` as `door`. Scenes `id="set"` → `anywhere` → `week` → `door`. SET mounts `CinematicLogger` (squat demo). |
| Cookie / gate-off `/` is `.696` | **Yes.** `app/page.tsx` cookie → `LandingPage`. Do not restore `CinematicWww` as `/`. |
| `#776` copy lock is still the pack | **Yes.** `gateEn.ts`: `Log a set.` / `Offline.` · `No account. No wearable.` · `Free` · `Get notified` · `Enter with code`. `gatedWwwHonesty.ts` still bans Win Daily / Alpha / Beta / invite-only / Free beta / Private Beta / Get an invite / We're live. |
| Pre-`.942` door was the tight lock | **Yes.** Parent of `82fcc739` (`GateTeaser` mounts `PrivateTeaserClient` only). Markup: `gate-shell` · MW mark + Mission Winning · `gate-h1` (`gateTitle1` / `gateTitle2`) · `gate-lede` (`gateSubtitle`) · `LaunchNotifyForm variant="gate"` · `<details>` Enter with code · legal footer. That is image 1 density with locked copy already in the pack. |
| `#778` leftovers that are not the scroll | **Keep.** F-039 `/today` `/train` 308 in `proxy.ts`. `/notify` Super Bundle form (`NotifyPage` + `app/notify/page.tsx`). `LaunchNotifyForm` still has `variant="gate"`. Session probe, territory refuse, invitee expand, `?next=` stay on the teaser. |

**Conclusion:** smallest revert is unmount `CinematicWww` from `GateTeaser` and
restore the pre-`.942` teaser chrome. Do not delete `CinematicWww` /
`CinematicLogger` / `cinematic.css` (concept + unused port). Do not remount
them on `/` or `/private`. Do not revert F-039 or `/notify`.

## 2. Lock (density + copy)

First paint of gated `/` and `/private`:

| Slot | Chrome | Copy (locked) |
|------|--------|----------------|
| Header | MW badge + Mission Winning · eyebrow right | **Free** (`gateEyebrow`) |
| Hero | `gate-h1` two lines · lede | **Log a set.** / **Offline.** · **No account. No wearable.** |
| Notify | one section, one red | **Get notified** · email · **Notify me** · no-spam foot |
| Code | `<details>` below a rule | **Enter with code** |
| Footer | tagline + legal | `gateFooterTagline` · existing `AppLegalFooter` |

Banned on the door (already enforced): Win Daily, Alpha, Beta, invite-only,
Free beta, Private Beta, Get an invite, We're live.

No squat demo. No Anywhere scene. No Coach Miss / Travel / Band. No
four-scene field. One screen, not SET → ANYWHERE → WEEK → DOOR.

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.

### 3.2 Live door = tight lock

`GateTeaser` mounts `PrivateTeaserClient` only. No `CinematicWww` wrap.

- Prod `/private` and Preview/local `/` (until cookie) show the same lock.
- Cookie / gate-off `/` stays `.696` `LandingPage`.
- Restore `PrivateTeaserClient` to the pre-`.942` `gate-shell` layout
  (header / h1 / notify / details / footer). Keep session probe under the
  poster (no early return). Keep territory refuse / notice. Keep invitee
  expanded code form. Keep `LaunchNotifyForm` `source="launch-waitlist"`
  `variant="gate"`.
- One red: **Notify me** (`gate-btn-primary`). Enter with code is
  secondary (`gate-btn-secondary`).

### 3.3 Keep later-safe `#778` bits (not first paint)

- F-039 `/today` `/train` 308 before the gate (`proxy.ts`).
- `/notify` Super Bundle form. Do not put Super Bundle on the door.
- Copy lock + honesty pack. Do not restore "Train anywhere. Win daily."
- `CinematicWww` stays in tree, unmounted from the door.

### 3.4 Tests

Door copy lock stays green (`gatedWwwHonesty.test.ts` pack + banned regex).

Rewrite first-paint assertions that require SET / ANYWHERE / WEEK on
`/private`:

| File | Change |
|------|--------|
| `gatedWwwCraft.test.ts` | Door is tight lock (`gate-shell` / `gate-h1` / no `CinematicWww` on `GateTeaser`). Mutant remounting the wrap dies. Homepage ban holds. Consent still after children. Alpha-on-the-door still banned. Drop scene-order / squat-demo / four-scene polish as *door* assertions. |
| `previewHomeTeaser.test.ts` | `GateTeaser` is the tight lock; homepage is not cinematic. |
| `gateTeaserHonesty.test.ts` | Notify title lives on the teaser again (`gateWaitlistTitle`). |
| `gatedWwwHonesty.test.ts` | Wedge teaser + support lede live on `PrivateTeaserClient` (`data-mw-wedge-teaser` / `gateSubtitle`). |
| `firstPaintFloor.test.ts` | Gate poster is the teaser h1, not `cineHeroHeadline`. Session probe still must not early-return. |
| `firstSetWhileGated.test.ts` | Notify stays on the door; form uses `gate` variant (primary notify), not cine ghost. |

Leave as concept-only (not first paint): `exquisiteComp.test.ts` (HTML
comp), `landingStatRow.test.ts` (component still exists, still not `/`).

`landingNotifyForm.test.ts` `/notify` + shared form stay. F-039
`proxyAliasRedirect.test.ts` stays.

Mutant that remounts `<CinematicWww` on `GateTeaser` dies.
Mutant that restores `Train anywhere. Win daily.` on the door dies
(existing honesty).

### 3.5 Docs that would lie if left on four-scene-as-door

- `app/INDEX.md` `/private` row
- `src/components/landing/INDEX.md` (`CinematicWww` is not the live door)
- `src/lib/INDEX.md` first-paint row

## 4. Refuse

- Promote live. Flip `PRIVATE_MODE`. Feed. Public identity. Counsel-hold.
- Super Bundle on the door.
- Today / Train / Coach product (`.954` one Start, `.955` Wednesday cite).
- Restore `CinematicWww` as `/`.
- Restore old words (Win Daily / Private Beta / Get notified at launch as
  the company line).
- Delete F-039 aliases or `/notify`.
- Touch `.956` E-Victory close receipt.
- Merge.

## 5. Ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.957`
- LOG heading `## 2026-08-24 — Restore the tight /private lock (\`.957\`)`
  + rotate oldest live entry (`.940`)
- If `.956` is still not on master at implement, declare `956` in
  `logBudget` `NEVER_SHIPPED` (reserved by the in-flight E-Victory close
  receipt). If that ship landed first, drop the gap and rebase.
- `CONTEXT.md` `## Now` one-line `.957`; rotate oldest shipped Now bullet
  (`.941`) so the block stays ≤25
- Plan commit `[skip vercel]`. Implement commit `[skip vercel]` (founder
  did not ask for a Preview). Screenshot the restored `/private` in the PR.
- Draft PR. Do not merge. Do not promote.

## 6. Done when

- This section was frozen before product code.
- First paint of gated `/` and `/private` is the tight lock with locked copy.
- No four-scene field on the door. Cookie `/` is still `LandingPage`.
- Label `.957`. Draft PR against master. Title:
  `Restore the tight /private lock (.957)`.
