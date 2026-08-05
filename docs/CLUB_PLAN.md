# CLUB_PLAN.md — a durable earned record, without gamification theater

**Lane:** Product (plan) · **Horizon:** W for this document; build phases individually gated below (W-arguable → 3) · **Status:** **plan only** — no code, no migrations, no schedules ship with this doc
**Entry docs:** [CONTEXT.md](../CONTEXT.md) · [ORCHESTRATION.md](../ORCHESTRATION.md) · [vision.md](../vision.md) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) · [REDTEAM.md](REDTEAM.md)

---

## The problem in one line

Effort produces no durable record: Mission Score is a weekly grade that resets, the Today
"Wins & Streaks" card is hardcoded JSX, and the eight weekly challenges in
[`src/lib/challenges.ts`](../src/lib/challenges.ts) are computed and never rendered anywhere.
[DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md):337 already named the gap — a badge
"would be the app's first durable earned record, which is a system decision rather than a
checklist garnish." **This document is that system decision**, extended to where the founder
wants it to go: a club with points, tiers, collectible gear, boards, and eventually an arcade.

## Reference research (what we're adapting, in one screen)

| Source | What we take | What we leave |
|--------|-------------|---------------|
| **Williams F1 WClub** | 4-tier ladder (Grid 50–299 · Podium 300–699 · Champion 700–1499 · Legend 1500+); dashboard = tier card + progress bar ("240 pts to Podium Tier") + short "Next ways to earn" list with `+N` chips; Driver Card (helmet style · backdrop · race number · tier chip · edit/share); badges collected per event **unlock more card customization**; double-points event weeks; arcade of small domain-tied games (predictions ≈ 5 pts, "Tyre or Lower" quiz) | Purchase-based earning (+0.5/£1), sweepstakes/prize draws, crypto partner branding |
| **Duolingo leagues** | ~30-person cohorts matched by activity level — winnable at any user count, no geography needed | Relegation + demotion-threat pushes (violates our tone contract) |
| **Gran Turismo** | Country/region identity as something you *contribute to* (Nations Cup); rating separate from participation points | Skill rating as public hierarchy |
| **Zwift** | Dual progression: levels auto-unlock cosmetics; effort-earned currency is optional and cosmetic-only | Spendable-currency shop (deferred; maybe never) |
| **Sweatcoin** | Server-side plausibility validation, per-source caps, quarantine-then-review | Steps as money |
| **Motivation research** | Extrinsic rewards lift short-term engagement but can crowd out intrinsic motivation — points must celebrate logged work, never bribe attention; personal non-competitive metrics stay primary | Points-for-opening-the-app engagement theater |

## Two axes, ten invariants

**Mission Score stays the grade** (weekly quality signal, unchanged, still not stored).
**Points are an odometer, not a grade** — a cumulative count of logged work, like a logbook
total. An odometer is a clinical metric; that is what reconciles this plan with
"clinical metrics, not gamification" ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).

1. **Points reward logged work, never attention.** No points for opening the app, viewing
   screens, tapping notifications, or watching content.
2. **Binary events only.** No magnitude scaling — a bodyweight athlete in a Lagos park earns
   exactly what a barbell athlete earns for the same consistency. Effort is counted in
   sessions, not kilograms. (Also the anti-forgery choice: magnitudes are self-reported.)
3. **Monotonic.** Points never decay; tiers are never revoked; thresholds may only ever be
   *lowered* after launch, never raised. No loss mechanics anywhere.
4. **No client grant API.** A client that can insert its own ledger rows can forge its own
   rank. The server derives points from already-synced data; clients never say "give me points."
5. **Local is exact for you; server is authoritative for everyone else.** Every earning input
   is local-first data, so the device computes your number exactly and offline. The server
   ledger exists for public surfaces and abuse control. Divergence is an abuse signal.
6. **No points, rank, or tier in the return channel. Ever.** Nudges and notifications never
   mention them — the [RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md) tone contract and
   `nudgeCopy.test.ts` gate extend to the club unchanged. No "you're about to be passed."
7. **Virtual-only, earned-only.** Nothing purchasable, nothing redeemable for money or
   premium. This is structural (see Integrity), not a phase-1 economy choice.
8. **Free-core forever.** [vision.md](../vision.md):91–92 lists "streaks, challenges, and
   habit tools" and "Community elements and progress visibility" as free-forever. Points,
   tiers, boards, and base collectibles are free. Premium never buys rank.
9. **The free logger is never gated.** Points hang *off* logging; logging never hangs off
   points ([CONTEXT.md](../CONTEXT.md) hard rule 2).
10. **Brand-agnostic build.** Display names (club, points, tiers) live only in i18n packs and
    one manifest; a possible Kalligator rebrand (domain currently unregistered) must be a
    string change, not a refactor. Internal names: `club`, `points`, `Athlete Card`, `T1–T4`.

## Standing rulings — keep or evolve

Merging this doc ratifies the **Evolve** rows only; every **Keep** row remains enforced.

| Ruling (source) | Verdict | What the club does |
|---|---|---|
| "Clinical metrics, not gamification" ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) | **Keep** | Odometer framing; tabular nums; lucide icons; no emoji spam |
| "Confetti, streak theater, XP loot **as retention**" refused ([DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md)) | **Evolve** | A durable earned record is permitted (D10 pre-acknowledged it); theater, loss-aversion loops, and attention-bait stay banned |
| "Avoid: streak flames, XP, loot" ([DESIGN_RESEARCH.md](DESIGN_RESEARCH.md)) | **Evolve** | Same as above — quiet honor register (`Badge variant="honor"`, "rare, not decorative"), not flames |
| Community **as a pillar** refused (D8) | **Keep, clarified** | The club is not a pillar and never enters primary nav as one; boards are vision-blessed "community elements and progress visibility" |
| Community onboarding steps refused (D10) | **Keep** | Nothing club-related in I-Day/Basic; club surfaces unlock at journey phase 3 ([JOURNEY.md](JOURNEY.md)) |
| Streak-loss / absence language banned ([RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md), `nudgeCopy.test.ts`) | **Keep** | Extended: no points/rank/tier in any nudge (invariant 6) |
| "No score out of 100" in day review (`src/lib/dayReview.ts`) | **Keep** | Points are a count, not a 0–100 judgment; day review stays points-free |
| Share OUT, never an in-app feed (`src/lib/share/shareCard.ts`) | **Keep** | Athlete Card is a share artifact; no feed, no comments, no DMs |
| Scout mascot placements locked ([MASCOT.md](MASCOT.md)) | **Keep** | Avatar gear is *user* identity, not Scout; Scout placements unchanged |
| Referral rewards recognition-only ([PROTECTION.md](PROTECTION.md) Wave 8) | **Keep** | No referral points until [REDTEAM.md](REDTEAM.md) A14 tooling exists (fingerprinting + review) |
| Leaderboard idles at N<1,000 (REDTEAM A12) | **Evolve** | Boards get build phases — each behind an explicit N precondition, so A12 stays true until the numbers say otherwise |
| Wearables never the primary score (ORCHESTRATION Do-not-build) | **Keep** | Steps earn capped points (an input); Mission Score remains log-derived |

> **Founder override (ratified by merging this PR, dated by the merge):** the two **Evolve**
> rows above — a cumulative earned-record system (points, tiers, collectibles) is now
> sanctioned product direction, and leaderboards may be *built* in phases C3–C5 behind their
> entry gates. Risk accepted: extrinsic-reward crowding (mitigated by invariants 1–3, 6) and
> board-driven abuse (mitigated by Integrity below). Everything else in this table stays law.

## Earning model

### v1 earn table (all values provisional — 0 users; recalibrate at first cohort)

| Event | Pts | Cap | Idempotency key | Source of truth |
|---|---|---|---|---|
| Workout session completed (≥1 completed set) | 10 | 2/day | `workout:<client_id>` | `workout_logs` (synced) |
| Coach-plan session done (planned → done) | +5 | 1/day | `coach:<week>:<sessionId>` | coach plan state |
| Weekly challenge completed (each of the 8 in [`challenges.ts`](../src/lib/challenges.ts)) | 15 | 8/week | `challenge:<id>:<iso-week>` | challenge progress |
| Journey milestone (each; commissioning) | 20 / 50 | once ever | `journey:<milestone>` | `journey_events` |
| Personal record (canonical detector: [`coach/progress.ts`](../src/lib/coach/progress.ts) `personalRecordsFor`, `previous ≠ null`) | 5 | 3/day | `pr:<exerciseId>:<kind>:<date>` | workout history |
| Streak milestone 7 / 30 / 100 / 365 (positive-only) | 25 / 50 / 100 / 250 | once per level | `streak:<level>` | streak state |

A 3–4×/week athlete who completes a few challenges lands ~60–90 pts/week. Daily-goal
bonuses ride the challenge rows (that *is* the daily-goal system); a "perfect week" is
simply more challenge completions, not a separate multiplier.

**Not in v1:** volume/magnitude bonuses (invariant 2) · referral points (A14) · steps
(phase C6) · arcade participation (phase C7) · purchase-based earning (no shop; refused).

### Server design

- **Rolling-window recompute, not on-sync increments.** A weekly cron (plus on-demand
  recompute) re-derives the last ~14 days of ledger rows from source tables using the
  deterministic keys above — upsert/delete-diff inside the window, rows older than the
  window frozen. Workout edits, revisions, and tombstones self-heal; idempotency is free.
  No ledger writes on the sync hot path.
- **Shared rules in [`packages/mw-core`](../packages/mw-core/INDEX.md)** (earn table, tier
  math): web client, server, and Expo import the same module; the Kotlin app gets a
  `check-token-sync`-style parity script in its phase — Compose can never import TS, so
  parity is a *test*, not an import.
- Client-side, the same module computes the exact private number from local data (invariant 5)
  — which is why phases C1a–C1b need zero server work.

### Integrity (authority ≠ verification)

`workout_logs` are client-authored assertions; unlike Zwift or GT there is no telemetry to
validate against. Boards are therefore a **low-stakes honor system** — which is precisely
why rewards are virtual-only (invariant 7): the moment anything monetary attaches, REDTEAM
A14's fraud prediction fires with no counter available.

Defenses, all server-side: per-source caps (table above) · plausibility checks
(sessions/day, duration vs. set count) · **shadow quarantine** (flagged accounts keep seeing
their own points, silently excluded from boards — no-shame register, tolerant of false
positives) · **board eligibility minimums** (account ≥14 days old AND ≥8 synced sessions
across ≥6 distinct days before appearing on any public board — backdated bulk history can
inflate a private number but cannot insta-mint a ranked account).

## Tiers and collectibles

Four tiers, cumulative-lifetime, monotonic (invariant 3). Provisional thresholds sized so a
consistent 3×/week athlete reaches T2 in ~6–8 weeks, T3 in ~4–5 months, T4 in about a year:

| Tier | Threshold | Unlocks (deterministic, Zwift-style) |
|---|---|---|
| T1 | 0 | Starter helmet set (3 styles), Athlete Card |
| T2 | 300 | +helmet styles, backdrops, card finish |
| T3 | 900 | +gear accents, backdrop set, honor badge on card |
| T4 | 2,000 | Reserve set (rare by earned scarcity, not purchase), card flourish |

- **Collection → customization loop** (WClub model): monthly/campaign badges unlock
  additional Athlete Card options over time; the collection *is* the customization economy.
  **No spendable currency in v1** — unlocks are deterministic; a Drops-style shop is a
  possible later phase and may never be needed.
- **Athlete Card** (Driver Card analog): avatar gear + backdrop + call-sign number (00–99) +
  `operatorName` (existing, 24 chars) + tier chip + join date; edit and share actions. Built
  as an extension of [`share/shareCard.ts`](../src/lib/share/shareCard.ts) (1080×1350 canvas,
  `BRAND_HEX` cross-check stays). Share out only.
- **Avatar art direction:** helmet-first is the working direction (fits Train Anywhere kit
  culture); final taxonomy and all display naming are a **founder branding decision**
  (Kalligator open). Mechanics are taxonomy-independent. v1 = curated static sets shipped as
  `public/art/*.{avif,webp}` pairs (exempt from the design scan; brand-coherent poster
  style, paper/ink + the three reds — no glossy 3D). v2 = layered 2D config (shell / visor /
  finish / decal as jsonb picks). 3D only if/when games need it.
- **Picks-from-sets only** — no free text, no uploads, on the card's visual layer;
  moderation-safe by construction. Customization never displaces the MW monogram and never
  touches Scout ([MASCOT.md](MASCOT.md)).
- **Club dashboard UX** (from the founder's WClub screenshots): tier card with progress bar
  ("240 pts to T3") + a short **"Next ways to earn"** list — at most 3 rows, driven by the
  athlete's *incomplete weekly challenges*, each with a quiet `+N` chip. One screen, no feed.
- Later live-ops (C4+, tone-checked): positive-only **double-points weeks** (boost presence,
  never punish absence) and a T4 **season-start boost** (positive-sum carryover).

## Boards — phased, each with an N precondition

Scopes reuse the parked domain ([`src/lib/leaderboard/`](../src/lib/leaderboard/INDEX.md))
and its `leaderboard` surface; the club adds a **points-this-week** board and, later, league
cohorts. Weekly-window boards (not lifetime) keep newcomers competitive.

| Stage | Board | Precondition | Notes |
|---|---|---|---|
| v1 (C2) | none public | — | Points/tier are private-to-self |
| v2 (C3) | Friends / squad | any N | Existing 8-char squad codes; opt-in by joining a squad |
| v3 (C4) | **Promotion-only leagues** | ≥~300 weekly-active loggers | ~30-person cohorts matched by recent activity; top slice promotes; **no relegation** — an inactive week means unranked, never demoted. Differentiator, and the only league design compatible with the tone contract |
| v4 (C5) | Locality / country + divisions | ≥~5,000 users; k≥5 per cell | Self-declared coarse geo only (country/region picker on profile — `regions.ts` locale-inference is not real geo); GT-style **country-aggregate** board ("your country's total this week") works at lower N than individual locality boards |

**Public-board preconditions (all of v2+):** display-name moderation + reserved-word list +
report flow (none exists today — must ship *with* the first public board) · eligibility
minimums (Integrity above) · **youth accounts excluded from all public boards outright**
(the school surface has its own consented, teacher-scoped boards — [help/fitness-test-and-school.md](help/fitness-test-and-school.md); class boards stay in that lane and out of this plan) ·
**divisions are presence-as-opt-in** — joining a division board is the opt-in; no
division/gender column ever appears on the general public row (sensitive data stays off
public reads). Gender divisions are self-ID with an **open division always available**;
division × locality k-math makes that pairing honestly a ≥10k-user feature. · **No Pacers on
points boards** — a pacer on a cumulative-earnings board requires a fabricated ledger;
league cohorting is the empty-board answer.

## Data model sketch (phase C2+; one migration per phase, runbook-logged)

- `club_ledger` — `(user_id, event_key unique, source, points, occurred_on, created_at)`.
  RLS: **select-own; no insert/update policies** — service-role writes only, with the
  [`llm_usage`](../supabase/migrations/20260731_llm_usage.sql) comment convention ("a client
  that can insert its own ledger rows can forge its own rank").
- `profiles.club_points` / `profiles.club_tier` — server-maintained aggregates behind a
  `BEFORE UPDATE` protect trigger (copy `profiles_protect_invite_cols` from
  [`20260720_referrals.sql`](../supabase/migrations/20260720_referrals.sql)).
- Later phases add league cohort tables and extend `leaderboard_snapshots` with a points
  column. Seasons are **query windows over the dated ledger** — no season columns in v1.
- Every migration lands in [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2 with real prose
  (`migrationLedger.test.ts` gate), and every server phase ships **inert until founder ops**
  ([RETURN_LOOP_PLAN.md](RETURN_LOOP_PLAN.md) pattern — 9 migrations are already queued).
- Optional cleanup ride-along: retire the [`pillarLog.ts`](../src/lib/pillarLog.ts)
  non-food-rows-in-`nutrition_entries` hack once pillar wins have a real home.

## Phases — entry gates and kill criteria

Every phase is **refused by default** until its founder line is written. Kill criteria are
phrased against [POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md) observables; measurement
capability is itself an entry precondition from C3 on.

| Phase | Scope | Horizon / entry gate | Kill / guard |
|---|---|---|---|
| **C0** | This document + INDEX routing | W — docs-only, no gate spent | — |
| **C1a** | **Wins card refit**: replace the hardcoded checklist in [`TodayProgressSection.tsx`](../src/components/today/TodayProgressSection.tsx) with a data-driven achievements module rendering [`challenges.ts`](../src/lib/challenges.ts) progress (computation + `challengeI18n.ts` already exist) | W craft window — genuine refine (deletes ~150 lines of hardcoded JSX); **founder go line required** | Pure refactor; no new mechanic, no DB, no nav change |
| **C1b** | Local points + tier, private display (mw-core rules module; club card on `/profile`) | **New mechanic** — separate founder go, even local-only | Ship dark behind `club` surface; no cloud writes |
| **C2** | Cloud ledger + cron rollup + Athlete Card + T1–T4 collectible unlocks | Horizon 1–2: post-launch, migration queue drained, one new migration applied | Inert until founder applies migration + cron secret; kill if <30% of weekly actives ever open the club surface in 4 weeks |
| **C3** | Friends/squad points board | **Horizon 2 product-bet row** + moderation basics + eligibility minimums + PostHog cohorts live | Kill if board opt-in <20% of weekly actives across two cohorts, or any measurable week-4 retention *drop* |
| **C4** | Promotion-only leagues (+ double-points weeks) | ≥~300 weekly-active loggers | Kill if league participants show no directional week-4 retention difference across two cohorts |
| **C5** | Locality/nations boards + opt-in divisions + avatar customization v2 | ≥~5,000 users; k≥5 per cell; youth exclusion + report flow shipped | Same kill shape as C4; divisions ship presence-as-opt-in only |
| **C6** | Steps→points (Android Health Connect via existing `HealthConnectStepsBridge.kt` + parked wearables ingest) + Android club parity | **Triple gate:** wearables surface unpark decision + ORCHESTRATION "Wearables as primary score" row satisfied (steps are an *input*, capped ≤25% of a day's session base — never the score) + [ANDROID_NATIVE.md](ANDROID_NATIVE.md) Phase E timing (post Accept B + week-4) | Dominance cap enforced in mw-core rules; kill steps earning if fraud flags exceed review capacity |
| **C7** | Arcade (below) | **vision.md amendment required (founder-only) before any code** — new pillar per [ORCHESTRATION.md](../ORCHESTRATION.md) Do-not-build ("New pillars → Vision amendment") | Non-normative until amended |

## Arcade — non-normative sketch (C7)

WClub's arcade is small **domain-tied** games, not generic minigames — and club membership
framing ("Access to Games" as a listed benefit) makes the arcade a club feature, not a pillar
peer. The MW adaptation, when its time comes:

- Parked `arcade` surface; games as isolated lazy routes; a small Game SDK contract.
- **Real training earns bounded energy; games consume energy** (Pokémon GO Adventure Sync
  shape). Game *skill* never outearns logged training: arcade participation may grant small
  capped points like any pillar activity, but the dominant earn source is always real sessions.
- Server-validated scores; per-game weekly boards reuse the leaderboard domain.
- Cheapest v1 archetype: **"Training IQ"** — quiz runs built from the existing guidebook
  ([`src/data/guidebook/`](../src/data/INDEX.md)) — the Learn pillar, gamified (WClub's
  "Williams IQ" / "Tyre or Lower" analog). Weekly self-prediction games are noted with a
  sandbagging caveat (predicting your own adherence invites under-planning). Step-runner /
  rep-rhythm games only after avatars v2/3D.

## Refused

Pay-to-win · purchasable points or tier skips · cash-out, gift cards, or prize draws ·
crypto/NFT anything · purchase-based earning (+N per currency spent) · loss/relegation
mechanics · streak-loss or absence copy · social feed, comments, DMs · photos or free text on
boards · points/rank/tier in nudges or notifications · attention/engagement points ·
magnitude-scaled points · Pacers on points boards · referral points before A14 tooling ·
youth on public boards · physical prizes (revisit post-PMF with real T&Cs only).

## Out of scope (this plan)

Display naming and branding (club name, points name, tier names — Kalligator decision
pending; kalligator.com is currently unregistered) · cosmetic pricing / premium cosmetics ·
school/class boards (own lane) · iOS · wearables strategy beyond the C6 gate ·
any code, migration, or schedule in this PR.

## Done when (this document)

1. Founder has read the plan and ratified or struck each **Evolve** row (merge = ratify).
2. Founder decisions below are answered (in-PR comments, a follow-up commit, or `## Now`).
3. Build phases proceed only by their own entry gates above — each with its own done-when,
   LOG entry, and build label per hard rule 5.

## Founder decisions required

1. **Display names** — club, points, tiers, card. Three directions sketched (final call
   yours, strings land in i18n only): *(a)* MW-native: "The Club · Mission Points · tiers
   Rookie/Contender/Elite/Legend"; *(b)* rank-flavored: "The Unit · Stripes ·
   Recruit/Operator/Veteran/Legend"; *(c)* Kalligator-era naming decided at rebrand.
2. **C1a go/no-go** — the Wins-card refit inside the current craft window.
3. **C1b go/no-go** — local points + tier as a new mechanic (can wait for C2's horizon).
4. **Threshold sign-off** — the provisional earn values + tier thresholds above.
5. **Division policy** — confirm opt-in self-ID + open division + youth exclusion.
6. **Premium stance** — recommendation: points/tiers/boards free forever; premium never
   touches earn rates; cosmetic-only premium extras remain a post-PMF pricing question.
7. **Arcade vision amendment** — whether/when to amend [vision.md](../vision.md) for C7.
8. **Ready-to-paste ORCHESTRATION rows** (when a phase activates, founder adds to the
   Do-not-build / bets tables):
   `| Club boards (C3+) | Horizon 2 bet — entry gates in docs/CLUB_PLAN.md; kill: opt-in <20% or week-4 drop |`
   `| Arcade (C7) | Vision amendment |`

## Why this is inside the horizon gate

This PR builds nothing: docs plus two INDEX rows, no `src|app|scripts|supabase` path, no
build label, no LOG entry ([CLAUDE.md](../CLAUDE.md) §7 skip). The system it plans is the
one [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md):337 already acknowledged as pending
("a system decision rather than a checklist garnish"), scoped inside what
[vision.md](../vision.md):91–92 already promises free ("streaks, challenges … community
elements and progress visibility"). Every build phase is refused by default behind an
explicit founder line, an N precondition, and a kill criterion — the horizon rule
([ORCHESTRATION.md](../ORCHESTRATION.md)) keeps deciding *when*; this document only decides
*what and how*.
