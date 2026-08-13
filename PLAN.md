# PLAN.md — Athlete Page authored identity (0.1 / L2-quiet)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). Product law: [docs/IDENTITY_SOCIAL_PLAN.md](docs/IDENTITY_SOCIAL_PLAN.md).
**Lane:** Engineering-Web · **Horizon:** W craft window · **Override:** `Excellence-Override: Athlete Page authored identity (no Top 8)`
**Label:** `2026.07-unified.698` after code ships (this freeze commit is docs-only).

---

## 1. What this is

`/profile` already exists (S2–S4a). It is **not** a missing page. It is a **settings stack wearing a person's name**: eight always-open editors, a live card that quotes rank/tier, and a shelf titled “Badges & rank” that prints Level · rank · XP plus weekly challenges. That is a scoreboard. IDENTITY_SOCIAL_PLAN §3 asked for an **authored page** (MySpace profile, not MySpace feed). This overnight makes that true.

**L2-quiet:** reachable, not promoted. `/profile` stays off `MOBILE_TAB_HREFS` (C3). No new first-paint tab. More sheet You · desktop rail Toolkit · header chip remain the doors.

## 2. What already shipped (do not rebuild)

| Piece | Home | Status |
|---|---|---|
| Account split | `/account` | `.606` |
| Call sign + 00–99 + signature | `AthleteIdentityCard` | S2.5 — edit already in `<details>` |
| Career line | `CareerLineCard` | S2 — counts only |
| Table picks | `AthleteTableCard` | S3a — still a form |
| Kits C6 | `pageKits.ts` + CSS | S3b — default kit only until unlocked |
| Card cosmetics | `ProfileAthleteCard` | `.610` — preview is a rank stub |
| Share-out PNG | `AthletePageShareCard` | S4a — no public URL |
| Private note | `AthletePrivateNoteCard` | C5 local free text |
| Contracts C1–C4, C6, C7 | `domainBoundary.test.ts` | Enforced |

## 3. Defect this PR closes

The first viewport is a **form farm**, not a person. Rank/XP/challenges sit on You as if standing were the point of the page. Two share buttons compete. Editors are always open. The table never looks authored.

## 4. Ship (only this)

### 4.1 Authored first viewport

Order on `/profile`:

1. **Identity** — call sign · number · career signature (unchanged hero; edit stays in `<details>`).
2. **The card** — live preview as a visual artifact (frame/backdrop token classes). Body is career signature / table picks — **never rank, XP, or level**.
3. **The table** — answered rows as a definition list. Picks editor in `<details>`. Empty: honest invitation, not a void (D8).
4. **The line** — career counts (unchanged).
5. **The shelf** — owned badge medallions only. Strip Level / rank / XP / weekly challenges from `ProfileRewardsCard`. Title becomes badges, not “Badges & rank”. Today’s rewards card is unchanged.
6. **Tools, collapsed** — kit picker, card cosmetics (frame/backdrop/badge slots), private note: `<details>`. Outline Save. **0 red actions**.
7. **Share page** — one quiet outline action for the C5 page PNG. Card PNG share stays inside the card cosmetics disclosure (two artifacts, one not competing in the fold).
8. **Account link** — quiet text, not a ninth settings card.

Shell: eyebrow stays “You”. Title is the call sign when set, else “You” — stop duplicating “Your record” on the shell and the line.

### 4.2 Card preview (token composition, not a canvas)

Add closed CSS classes in `src/index.css` (paper/ink/primary/border only): frame hairline / rule / double-rule / poster; backdrop paper / grid / rule-field / poster-block. `ProfileAthleteCard` applies them from clamped cosmetics. No hex, no user CSS, no second typeface (C6 spirit). Grid uses token-coloured rules, not a decorative gradient language.

### 4.3 Share PNG is not a scoreboard

`buildAthletePageShareData`: drop **Rank** and **Tier** from `stats`. Keep Sessions / Days when positive, kit pick if not default, table/badge provenance line. DTO may still carry `rankTitle` for S4b; this surface must not print it.

### 4.4 Sign-in is Account, not You

`HeaderAuthChip` “Sign in” → `/account`. You is authored identity; dumping sign-in onto it re-makes `/profile` into settings. Do not restyle Train. Do not add `/profile` to the tab bar.

### 4.5 Guards (discover, then falsify)

New `src/lib/identity/athletePageAuthored.test.ts`:

- Discover Athlete Page surface files (page + `Athlete*` + `ProfileAthleteCard` + `ProfileRewardsCard` + `CareerLineCard`). Fail on Top 8 / friend rank / DM / feed / follower-count copy.
- `ProfileRewardsCard` source must not render `xpTotal`, `challengesComplete`, or `rewardProfileRank`.
- `ProfileAthleteCard` preview must not interpolate rank/XP into the visible body.
- Share builder: no `label: 'Rank'` / `'Tier'` stats.
- `MOBILE_TAB_HREFS` still excludes `/profile` (already C3; this test names the quiet-path rule so a tab promotion fails here too).

Rewrite `profileChallengesLine.test.ts`: challenges line stays on **Today** (`TodayRewardsCard`), not on You.

Expand `athleteLocales.test.ts` SOURCES to the Athlete Page components this catalogue actually serves (table, kit, share, note, card) — the current list is four files and cannot see a new key.

### 4.6 Docs / i18n / ship protocol

- Keys in `src/i18n/athleteLocales.ts` (+ card/shelf strings already in `rewardsLocales.ts`). `defaultValue` matches EN. Beachhead es/fr/pt for new lines; others inherit EN.
- Help: getting-started sign-in points at Account, not Profile.
- `src/lib/identity/INDEX.md` + `src/i18n/INDEX.md` (athleteLocales row).
- Hard rule 5 on the **implementation** commit: `APP_BUILD_LABEL` `.698`, `LOG.md` (rotate oldest `.669` — live log is already 15), `CONTEXT.md` `## Now` (rotate oldest ship bullet to stay ≤25).
- Commit trailer: `Excellence-Override: Athlete Page authored identity (no Top 8)`.
- Draft PR. At most one preview.

## 5. Refused (named so they cannot sneak in)

- Top 8 / any friend ranking
- Feed, comments, likes on a session, DMs, follower counts
- Public URL / S4b projection host
- Squad / S5
- User CSS/HTML, free text on share or public DTO (C5)
- Profile / call sign step in I-Day (C7)
- New first-paint tab / promoting You onto `MOBILE_TAB_HREFS`
- N1 restyle of Train / `/active`
- `PRIVATE_MODE` flip
- Invented traction
- Planner or logger reading standing (C1/C2)
- XP / rank / challenges as the Athlete Page’s job (Today and `/leaderboard` keep theirs)
- Purchasable identity, completeness meters, streak-loss copy

## 6. Done looks like

An athlete opens **More → You** and sees a page that is **theirs**: name, number, a card that looks like a card, a table of answers, honest counts, badges they earned. Editors are there when wanted. Nothing ranks anyone else. Nothing on Train changed. No new tab.
