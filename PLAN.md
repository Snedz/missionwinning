# PLAN.md — Brand copy lock (`.933`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). Brand law: [docs/brand-guidelines.md](docs/brand-guidelines.md).
**Lane:** Engineering-Web · copy only · **Horizon:** 0 / W craft window
**Label:** `2026.07-unified.933` (master is `.930`. `.931` is in-flight F-008 honesty #775. `.932` is reserved why-this-session #774.)
**Excellence-Override:** Brand copy lock (no Today/Train restyle)

---

## 0. What this is

The product **name** “Mission Winning” is untouchable. Everything else in the consumer voice pack may change. CoS locked the pack below. This PR implements it.

**Hypothesis (confirmed):** the collision is copy keys + teaser + www kicker, not design tokens. Paper / ink / poster red / Archivo / radius 0 stay. No new palette. Kalligator is not the logo.

## 1. Locked pack (do not invent)

| Slot | String |
|------|--------|
| **Name** | Mission Winning (never shorten to MW in athlete-facing sentences except the monogram) |
| **Mark** | Ink square / paper MW monogram |
| **Public line** (hero / kicker) | Log a set. Offline. |
| **Support line** | No account. No wearable. |
| **Door pack** | **Free** · **Enter with code** · **Get notified** |
| **Coach product** | Mission Coach |
| **Future SKU** | Super Bundle |

**Kill from consumer chrome**

- “Train Anywhere. Win Daily.” as the *company* tagline
- “Free beta” · “open alpha” · “invite-only” · “private beta” · “we’re live” · “get an invite”

**Keep**

- “Train anywhere” / “Anywhere” as a *scene* line only (SET is not that scene)
- Alpha 0.1.0 / `APP_PUBLIC_*` on Profile / legal / status bar only — **not** the gated door
- Civilization / Team Humanity / everything-app **never** on fold 1 or the teaser
- Visual system unchanged. Today / Train pixels unchanged. No feed. No medical claims.

## 2. Overlap with `.931` honesty (#775)

#775 (draft) puts **Free beta** on `/private` and the cinematic HUD. This pack kills “Free beta” from consumer chrome and sets the door word to **Free**.

**This PR is the source of the new strings.** Do not merge #775’s “Free beta” kicker. Do not fight #775 on layout, forms, or honesty machinery — only the words. If both land, ours win on:

- `gateEyebrow`
- `gateTitle1` / `gateTitle2`
- `gateSubtitle`
- `cinePublicLine` / `cineHeroLead`
- door HUD ghosts in `05-exquisite.html` + `CinematicWww`

#775 may still land Enter with code / Get notified / locale invite-scrub. Those already match this pack.

## 3. Defect this PR closes

Cold visitors see the retired company line as the first sentence of the website:

- `/private` H1 is still “Train anywhere. / Win daily.”
- Cinematic kicker + brand guidelines + SEO titles still sell “Train Anywhere. Win Daily.”
- The door stamps Alpha 0.1.0 in the header/footer (that stamp belongs on Profile / legal / status bar)
- WWW_NIGHT and `05-exquisite.html` still lead the cover with the retired line
- Tests *assert* the retired line, so a later agent cannot change it without going red for the wrong reason

## 4. Ship (only this)

### 4.1 PLAN + brand law

- This file.
- [docs/brand-guidelines.md](docs/brand-guidelines.md) **Name & tagline** + **Voice**:
  - Tagline → **Log a set. Offline.**
  - Support → **No account. No wearable.**
  - Door pack named.
  - Voice: drop “while private beta is on”; ban the kill-list; keep Train anywhere as a scene line, not the company line.
  - Consumer hook line under medical claims: logger + Mission Coach, not Train Anywhere / Win Daily.

### 4.2 Gated door (`/private`)

EN first paint is `src/i18n/gateEn.ts` (the only words SSR can show).

| Key | From | To |
|-----|------|----|
| `gateEyebrow` | Alpha | **Free** |
| `gateTitle1` | Train anywhere. | **Log a set.** |
| `gateTitle2` | Win daily. | **Offline.** |
| `gateSubtitle` | long Train+Coach sentence | **No account. No wearable.** |
| `cinePublicLine` | Train Anywhere. Win Daily. | **Log a set. Offline.** |
| `cineHeroHeadline` | Log a set. Offline. | *unchanged* |
| `cineHeroLead` | Mission Coach plans the week from the log. No wearable. | **No account. No wearable.** |

`PrivateTeaserClient`: remove `APP_PUBLIC_VERSION` / `APP_PUBLIC_PRODUCT_VERSION` from the door header and footer. Keep the MW monogram + “Mission Winning”. Footer may keep `gateFooterTagline` (“free core forever”) without the Alpha stamp.

`gatedWwwHonesty.ts`: `gateEyebrow` → **Free**. `gateSubtitle` → support line. Comments must not say the door wording is Alpha 0.1.0.

Locale overlays that restore “Free beta” / invite-only / get-an-invite on door keys (`gateEyebrow`, waitlist ask-for-invite) inherit EN or say **Free** / **Get notified**. Packs `th/ko/ja/vi` already overlay `gateEyebrow: "Free beta"` — those four keys change.

### 4.3 Landing / cinematic / www kickers

- `CinematicWww.tsx` defaults match §4.2. HUD ghost uses `gateEyebrow` → **Free**. Anywhere kicker stays **Anywhere**.
- EN `landingHeroTitle1` / `landingHeroTitle2` (leftover company H1, not rendered on today’s LandingPage) → **Log a set.** / **Offline.** Same for `firstClassLocales` EN only.
- `sites/www` `META.title` drops Win Daily as the company line.
- SEO chrome that *is* the company title: `app/layout.tsx`, `app/page.tsx`, `app/manifest.ts`, `app/opengraph-image.tsx`, `src/lib/seoMetadata.ts`, `src/lib/routeMetadata.ts` `landing` → **Log a set. Offline.** (with “Mission Winning —” where a document title needs the name).
- `/press` tagline copy button matches brand-guidelines.
- `README.md` company line (not the constitution sentence) → public line.
- `CONTEXT.md` “What this is” kicker → public line.
- Email footers that print the company line (`launch-day`, `beta-invite`, `waitlist-confirm`) → public line.
- `docs/SOCIAL_LAUNCH.md`: it already bans invite-only / Free beta. Add the locked public + support lines so the kit cannot drift back to Win Daily as the company line.

### 4.4 WWW_NIGHT + 05-exquisite

- Public line / narrative / SET cover kicker: **Log a set. Offline.** SET `<h1>` stays **Log a set. Offline.**
- Support / SET lede: **No account. No wearable.**
- Copy pack / HUD ghosts / door kicker: **Free** (not Alpha, not Free beta).
- Scene 2 kicker stays **Anywhere**. WEEK kicker stays **Mission Coach**.
- Notes / constitution table: do not lead with Train Anywhere. Win Daily. as the company line.
- Door lede must not say “when the beta opens”.

### 4.5 Tests (write / run before claiming done)

Extend existing honesty tests — do not invent a parallel denylist.

1. **Door pack:** EN `gateEyebrow === 'Free'`, waitlist **Get notified**, access **Enter with code**.
2. **Public + support:** `cinePublicLine` and `cineHeroHeadline` are **Log a set. Offline.** `cineHeroLead` / `gateSubtitle` are **No account. No wearable.**
3. **Banned on door / cinematic / teaser / exquisite / brand Name & tagline:** `invite-only` · `get an invite` · `private beta` · `we're live` · `Free beta` · `Train Anywhere. Win Daily.`
4. **05-exquisite:** HUD / door kicker **Free**; SET h1 still **Log a set. Offline.**; no Win Daily-as-tagline; Anywhere kicker still present.
5. Falsify: a mutant that puts “Train Anywhere. Win Daily.” back on `cinePublicLine` or “Free beta” on `gateEyebrow` must go red.

Discover files rather than hoping the list is closed: keep the existing `SURFACE_FILES` list and add any file this PR touches that can paint the door or the company line (`gateEn.ts`, `gatedWwwHonesty.ts`, `brand-guidelines.md` Name & tagline). A comment that *names* a banned phrase in order to forbid it may stay.

Do **not** ban “Train anywhere” on the Anywhere scene. Do **not** ban “Alpha” / `APP_PUBLIC_*` on Profile, legal, or `PublicStatusBar`.

## 5. Non-goals (refuse)

- Restyle Today or Train. New feed. New palette. New typeface. New radius.
- Rename Mission Winning. Invent a third brand. Make Kalligator the logo.
- Flip `PRIVATE_MODE`. Flip Public GitHub. Promote. Preview (`[skip vercel]`).
- Medical claims. Civilization / Team Humanity / everything-app on fold 1 or the teaser.
- Fight #775 on structure. Steal #774 why-line.
- Locale-body farms beyond the door keys that would restore banned English.
- Android / Expo.

## 6. Ship protocol

Same commit as the words: `APP_BUILD_LABEL` → `2026.07-unified.933` · `LOG.md` heading ending `(.933)` · `CONTEXT.md` `## Now` names the full label. Rotate LOG (`.916`) and the oldest *shipped* Now bullet (`.917`) so budgets hold. `[skip vercel]` on every commit.
