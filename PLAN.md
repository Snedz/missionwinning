# PLAN.md — Gated www craft (`.935`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). Thesis: [docs/design/WWW_NIGHT.md](docs/design/WWW_NIGHT.md). Comp: [docs/design/concepts/05-exquisite.html](docs/design/concepts/05-exquisite.html).
**Lane:** Engineering-Web · gated first paint · **Horizon:** 0 / W craft window
**Label:** `2026.07-unified.935` (master is `.933`. `.931` honesty #775 is still open. `.934` unused — founder named `.935`.)
**Excellence-Override:** gated www craft (no Today/Train restyle)

---

## 0. What this is

`.933` locked the **words**. Cold visitors still do not see the **page**.

`PRIVATE_MODE` stays on. This is a gated-www craft pass, not a public flip.

## 1. Investigate (done — hypothesis was half-right)

Founder hypothesis: *the words are locked; the gap is motion, type scale, and door hierarchy.*

| Claim | Verified on master `.933` |
|-------|---------------------------|
| Words locked | **Yes.** EN `gateEyebrow` is Free. Public line / support / door pack live in `gateEn.ts` + `gatedWwwHonesty.ts`. Tests already ban invite-only / Free beta / Win Daily-as-tagline. |
| Motion / type / hierarchy | **Yes, and they are not the whole gap.** |
| Visitors see 05-exquisite | **No.** |

**What a cold visitor actually gets**

- Prod `/` 307s to `/private`.
- `/private` is `GateTeaser` → `PrivateTeaserClient`: one paper column (MW wordmark · H1 · lede · email row · access `<details>`). That is a **signup sheet**.
- `CinematicWww` already ports N1 (SET / ANYWHERE / WEEK / DOOR) and is **dead to visitors**. `LandingPage` must not mount it (GRAPH_LOOP / `.696`). `previewHomeTeaser.test.ts` currently forbids it on `GateTeaser` — that test is protecting the *homepage*, and it accidentally kept the *door* as the old sheet.

**Leftovers that survived `.933` (door chrome, not Profile)**

- `gateAccessSummary`: “Have an Alpha access code?”
- `gateWaitlistFoot` / `gateWaitlistDoneFoot`: “when Alpha access is ready”
- Locale overlays still sell the retired company line on `gateTitle1` / `gateTitle2` (hydration-only; SSR floors EN)

**Already true — do not “fix” again**

- Consent is **not** `fixed bottom-0`. AppLayout host sits between `#screen-dock` and `MobileNav` (`.765` / ops #19). Marketing fallback is in-flow after children.
- `LaunchNotifyForm` already mounts on `/private` (`source: 'launch-waitlist'`).
- `#775` F-008 is open and dirty. **Do not fight its copy.** Brand pack on master wins the words. This PR owns craft + leftover Alpha-on-the-door.

**Conclusion:** mount the four-scene field on the live door. Then raise type scale, door hierarchy, and a reduced-motion-safe rise so first paint matches 05-exquisite — field manual, not SaaS signup.

## 2. Scene lock (do not invent a fifth)

| Scene | Ground | What it is |
|-------|--------|------------|
| **1 · SET** | Paper. Logger *is* the photography. | Stacked MW. Public line **Log a set. Offline.** Support **No account. No wearable.** TARGET / set table. **LOG SET** is the one poster control. |
| **2 · ANYWHERE** | One inverted field. Honest ink slot (no generated photo as live cover). | Type on the field, lower-left, max ~520px. Kicker **Anywhere**. |
| **3 · WEEK** | Paper. | **Mission Coach.** Authored Miss / Travel / Band. Title **The week does not fail.** |
| **4 · DOOR** | Poster `#ec3013`. | Kicker **Free.** Display **Get notified.** Form on a **paper strip**. Enter with code is `<details>`, never a second poster control. |

HUD: fixed, transparent, mix-blend difference, mark left, ghost **Free** → `#door`. No wordmark mass. No Kalligator. No photo-first cover. Civilization / everything-app stay off fold 1.

## 3. Ship (only this)

### 3.1 PLAN (this file)

Replace the `.933` freeze. Implement commit follows.

### 3.2 Live door = four scenes

`GateTeaser` wraps `CinematicWww mode="gate"` and passes `PrivateTeaserClient` as `door`.

- Prod `/private` and Preview/local `/` (until cookie) show the same field.
- Cookie / gate-off `/` stays `.696` `LandingPage`. **Do not restore `CinematicWww` as `/`.**
- Update `previewHomeTeaser.test.ts`: the door *is* cinematic; the homepage is not.

### 3.3 Door slot is forms only

`PrivateTeaserClient` drops the second header / H1 / lede (those are scene 1). It keeps:

- `LaunchNotifyForm` (`launch-waitlist`) — required while `/private` is the door
- Access-code `<details>` (invitee: form expanded, not a second poster button)
- Territory refuse / notice
- Session probe **under** the poster, never an early return
- Legal footer on the paper strip

Door hierarchy matches 05-exquisite: stacked mark (from `CinematicWww`) · **Free** · **Get notified.** · paper strip · Enter with code as summary.

Floor every `t()` default from `gateEnFloor` so SSR and hydrate cannot disagree.

### 3.4 Craft — type, motion, hierarchy

Scoped to `.www-cine` / `cinematic.css`. No new palette. No second face. Radius 0.

- SET / WEEK display sizes match the comp clamps (`h1` 2.625–4.75rem, `h2` 2.25–4.25rem). Do not add `text-*` on `.display-*`.
- One reduced-motion-safe rise on cover / logger / week / door (opacity + 12px). `prefers-reduced-motion: reduce` kills it.
- LOG SET remains the only `.primary-action` / poster control on paper. Door submit stays ghost on the strip.
- Week title in `gateEn.ts` → **The week does not fail.** (pack currently disagrees with the component default — that is first-paint drift the moment this page is live.)

### 3.5 Kill leftover Alpha-on-the-door

EN (and overlays that restore the defect):

| Key | From | To |
|-----|------|----|
| `gateAccessSummary` | Have an Alpha access code? | **Enter with code** |
| `gateWaitlistFoot` | …when Alpha access is ready. | **No spam — one email when access is ready.** |
| `gateWaitlistDoneFoot` | We'll email you when Alpha access is ready. | **We'll email you when access is ready.** |

Do **not** strip Alpha 0.1.0 from Profile / legal / `PublicStatusBar`.

Invite-only / Free beta / Win Daily-as-tagline stay banned. Discover surfaces; do not invent a second denylist.

### 3.6 Consent (P0, already docked — re-assert)

Do not put the banner `fixed bottom-0`. Do not cover Today's Start. Do not cover SET's LOG SET with a fixed overlay. `/private` has no AppLayout host — in-flow after children is correct.

## 4. Tests (write / run before claiming done)

Extend existing honesty / teaser / consent tests. Falsify each new claim.

1. **Door is cinematic:** `GateTeaser` mounts `CinematicWww`. Scene ids `set` → `anywhere` → `week` → `door`. Mutant deleting the wrap dies.
2. **Homepage ban holds:** `LandingPage` / cookie `/` still has no `CinematicWww`.
3. **Banned strings stay gone** on door / cine / teaser / 05-exquisite: invite-only · Free beta · Win Daily-as-tagline · Alpha-on-the-door keys above. Mutant restoring “Have an Alpha access code?” dies.
4. **Notify form:** `LaunchNotifyForm` + `launch-waitlist` still on the door. No checkout URL. No traction numerals.
5. **Consent:** banner never `fixed bottom-0` / `z-[60]`. Host still between dock and `MobileNav`.
6. **Probe does not withhold the page:** no `if (sessionUnlocking) return` before the four scenes.
7. **First-paint floor:** `CinematicWww` + door `t()` defaults match `gateEn.ts`.

## 5. Non-goals (refuse)

- Flip `PRIVATE_MODE`. Public GitHub. Promote. Preview (`[skip vercel]`).
- Restyle Today or Train. New feed. New palette. New typeface. New radius.
- Photo-first cover. Ship a generated still as the live photograph.
- Restore `CinematicWww` as the `.696` homepage.
- Fight #775 F-008 copy. Steal #774 why-line.
- Medical claims. Civilization / Team Humanity / everything-app on fold 1.
- Locale-body farms beyond door keys that would restore banned English / Alpha-on-the-door.
- Android / Expo.

## 6. Ship protocol

Same implement commit: `APP_BUILD_LABEL` → `2026.07-unified.935` · `LOG.md` heading ending `(.935)` · `CONTEXT.md` `## Now` names the full label. Rotate LOG oldest live entry and the oldest *shipped* Now bullet so budgets hold. `[skip vercel]` on every commit.

Draft PR. Screenshots of `/private` desktop (1440×900) + phone (390×844). Local tests green.
