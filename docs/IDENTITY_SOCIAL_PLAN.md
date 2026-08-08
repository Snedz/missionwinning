# IDENTITY_SOCIAL_PLAN.md — the page that is unmistakably yours

**Lane:** Product (plan) · **Horizon:** W for this document; every build phase gated individually below · **Status:** **plan only** — no code, no migrations, no schedules ship with this doc
**Owns:** the `You` surface, athlete identity, the social boundary, and the contracts that keep the two apart
**Does not own:** points, tiers, collectible economy, boards, arcade — those are [CLUB_PLAN.md](CLUB_PLAN.md). Read that first; this document never restates its numbers
**Entry docs:** [CONTEXT.md](../CONTEXT.md) · [ORCHESTRATION.md](../ORCHESTRATION.md) · [vision.md](../vision.md) · [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) · research: [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) Wave 9

---

## 1. The ask, and what the reference set actually says

The founder's brief is *"make it like MySpace — the You section"*, alongside nine reference screenshots and a request to fold social, rewards, gaming and profile into the long-term plan.

Read literally, that collides with four standing rulings: *"never social feeds"* ([DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) north star), *"Share OUT, never an in-app feed"* ([CLUB_PLAN.md](CLUB_PLAN.md)), *"community as a pillar refused"* (D8), and *"community onboarding steps refused"* (D10).

Read accurately, it does not collide with any of them.

**MySpace's magic was never the feed. MySpace did not really have one.** What it had was a profile you *authored* — layout, colours, music, an interests table, a background you chose — and the result was that no two pages looked alike. Facebook won by standardising the profile and putting a ranked feed at the centre; the customisation went, and the sense of a place that was yours went with it. That is the loss the two brand revivals in the reference set are selling nostalgia for. Neither the Wendy's page nor the Pizza Hut page is showing off a feed. Both are showing off **an authored page**.

So the instruction resolves cleanly:

> **Take MySpace's profile. Refuse MySpace's feed and MySpace's Top 8.**

That is not a watered-down version of the ask. It is the accurate reading of what made MySpace loved, and it happens to be exactly what the existing rulings already permit — [CLUB_PLAN.md](CLUB_PLAN.md) already sanctions an Athlete Card as a **share artifact**. This plan grows that card into a page.

**Top 8 is the one mechanic refused by name.** Publicly ranking your friends is documented as a status and drama device (Wave 9 §9.3). It is the same shape as the missed-day red ✕ this repo has now refused in D7, D8 and D11 — a surface that makes another person's standing legible in order to create pressure. Refused on the same grounds, permanently.

## 2. Why the boundary is architectural and not editorial

The one-line version, from Wave 9 §9.1:

> **In Strava a logged run is a post. In Mission Winning a logged set is the Coach's input.**

Kolnes et al. 2026 found that club runners who perceived their pace as slow **deleted their own training sessions**, and that this behaviour tracked with other-avoidance goals. On Strava that costs a user some vanity. Here, [`src/lib/coach/`](../src/lib/coach/INDEX.md) plans the week **from logs alone** — no wearable, nothing to cross-check against. A session withheld because it looked bad is a lie told to the planner, and the planner will then prescribe for an athlete who does not exist. Deloads will not fire. Progression will run on a fictional record.

**Social comparison is an input-integrity attack on the core algorithm.** That is why the rest of this document reads like an interface spec rather than a tone guide: a tone guide cannot fail a build.

### The two clock domains

[FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) already models the site as a chip — two dies, power domains, buses, a critical path. This plan adds the thing that floorplan has never needed: **a second clock domain, and the crossing rules between them.**

```text
        LOG DOMAIN  (authoritative, private, always-on)
        /log  /active  /coach  /history  · workout_logs · rewards engine
                          │
                          │  ONE-WAY CROSSING — derived projection only
                          ▼
        SOCIAL DOMAIN  (derived, optional, parkable)
        /profile page · Athlete Card · squad · boards
                          ╳
              NO PATH BACK. Not one edge.
```

| Property | Log domain | Social domain |
|---|---|---|
| Authority | Source of truth | Always derived; never authored here |
| Availability | Offline-first, never gated | Optional, parkable via `Surface` |
| Failure mode if breached | Athlete under-logs or edits history → Coach plans on fiction | A board is empty or stale — harmless |
| Who may import whom | May not import social | May import log |

In silicon a signal crossing between domains goes through a synchroniser or you get metastability. The metastable state here is **an athlete who half-logs because someone might see it.** The mitigation has the same shape: one declared crossing, one direction, verified by a check rather than by intention.

## 3. The You surface — an Athlete Page

Today `/profile` ([`ProfilePage.tsx`](../src/page-components/ProfilePage.tsx), 413 lines) is a settings screen: email, units, goals, reminders, push cadence, day-review hour, billing. It is *account admin wearing the name of a person*. Nothing on it is yours in any sense you would show anyone.

The proposal splits that in two — **Account** (everything above, unchanged, still reachable) and **You**, an authored page. The page is built from parts that already exist:

| Block | What it shows | Already exists |
|---|---|---|
| **Identity** | Call sign / number (00–99), `operatorName` (24 chars), tier chip, joined date | `operatorName` exists; tier from [CLUB_PLAN.md](CLUB_PLAN.md) |
| **The line** | Career totals in tabular nums — sessions, tonnage, distinct exercises, best week, days trained | derivable from `workoutHistory` |
| **The shelf** | Badge medallions with provenance, grouped by collection | `public/rewards/badges/*.svg` + [`src/lib/rewards/`](../src/lib/rewards/INDEX.md) — **shipped, and already rendered on Profile** |
| **The table** | The MySpace interests table, retrained: Training style · Home gym · Go-to lift · Currently working on · Anthem | new; picks-from-sets |
| **Page kit** | Which of N authored poster layouts this page wears | new; see §4 |
| **Share** | Render page → 1080×1350 card, out to any app | [`share/shareCard.ts`](../src/lib/share/shareCard.ts) — **shipped** |

Most of this is assembly, not invention. The genuinely new parts are the table, the page kit, and the public projection.

**"The table" is the MySpace move.** MySpace's interests table is why those profiles read as people rather than records — General / Music / Movies, answered in your own voice. The training equivalent is a small set of authored rows that say who you are as an athlete in a way a stat line cannot. It is also the cheapest expressive surface in the whole plan: no new data, no new sync, no moderation risk if the values are picks.

## 4. Expression without a stylesheet

MySpace let users write raw CSS. The result was expressive and frequently unreadable — the Pizza Hut revival in the reference set is a loving reproduction of that, tiled background and all. This product has `radius: 0`, one typeface, three reds, and a gate step that fails the build on a raw hex ([`check-design-system`](../scripts/check-design-system.mjs)). Arbitrary CSS is not available, and should not be wished for.

**The translation is curated variation, not free authorship.** A *page kit* is a named, designed composition — a poster layout — selected from a manifest. Every kit is drawn by the design lane inside the Modernist system, so every kit passes the design gate by construction, and every page still looks like Mission Winning while no two look alike.

That gives up the long tail of genuinely weird pages. It buys: no moderation surface, no XSS surface, no broken layouts, no accessibility regressions, and a system where adding expressiveness later is adding kits to a manifest rather than loosening a guard. It is also how the platforms that survived profile customisation actually do it now — console profile cards, Discord profile themes, Duolingo avatars are all pick-from-set.

**The unlock loop is already specified.** [CLUB_PLAN.md](CLUB_PLAN.md)'s collection→customisation model (badges unlock card options) extends unchanged: badges unlock **kits**. The shelf and the page are the same economy.

## 5. Contracts

Written as testable interface contracts, in the register [CLAUDE.md](../CLAUDE.md) §6 requires — **discover rather than enumerate**, assert a parsed shape where one exists, and falsify each guard with a mutant before claiming it works. C1–C4 and C7 are enforceable **now**, against the code that exists today, and should ship before any social phase rather than with it. A contract written after the mechanic it governs has never once been the thing that caught the mechanic.

### The correction that shipping them found

The first draft of C1 forbade the Log domain from importing Social **at all**, and it
was wrong the day it was written: [`workoutStore.ts`](../src/store/workoutStore.ts)
imports `applyWorkoutRewards` and calls it when a workout finishes. That is an
**emit** — Log telling Social something happened — which is the permitted direction
in this document's own diagram. A contract that contradicts its diagram gets an
exemption bolted on within a week, and an exemption is how a boundary stops being one.

The hazard is direction of **data**, not direction of **import**:

| Crossing | Example | Verdict |
|---|---|---|
| Log **emits** to Social | `workoutStore.ts` → `applyWorkoutRewards(…)`, result discarded | **Permitted**, one-way |
| Log **reads** from Social | a planner importing `summarizeRewards`, rank, board position | **Forbidden** — the attack in §2 |

Two more distinctions came out of enforcement, and both are statements about where a
rule *ends* rather than exemptions from it:

- **The door is a symbol, not a module.** [`leaderboardSync.ts`](../src/lib/leaderboardSync.ts)
  exports `scheduleLeaderboardPush` (an emit the logger calls) *and*
  `fetchCloudLeaderboardSnapshots` (a read `LeaderboardPage` calls). Declaring the
  module a door would have quietly licensed the read; declaring it Social outright
  would have broken a legitimate emit.
- **Terminals.** `WorkoutVictorySheet` and `CommissioningCeremony` sit *after* the
  moment each contract protects — the session is over, or the journey is
  commissioned at phase 3, which is exactly where [CLUB_PLAN.md](CLUB_PLAN.md)
  unlocks club surfaces. Showing standing there is the reward, not the pressure.

### The contracts

| # | Contract | Enforcement | Status |
|---|---|---|---|
| **C1** | **Planner blindness.** No module under `src/lib/coach/` or `packages/mw-core/src/` may reach `src/lib/rewards/`, `src/lib/leaderboard/`, `src/components/rewards/`, `src/components/leaderboard/` or a future `src/lib/social/` — transitively, by static *or* dynamic import, **including type imports**. No terminals, no doors | [`domainBoundary.test.ts`](../src/lib/domainBoundary.test.ts) walks the import graph from every planner file and prints the offending chain | **Enforced** |
| **C2** | **The logger emits, never reads.** The logging path may reach a door module and nothing else in Social; may use only that door's **emit symbols**; and every emit call must **discard its result** | Same guard, three tests. Scoped to the Log domain's real transitive closure, so a reader smuggled in three hops away still fails | **Enforced** |
| **C3** | **No other athlete's number one tap away.** No social route may be a primary tab | Same guard, parsing `MOBILE_TAB_HREFS` from [`primaryNav.ts`](../src/lib/primaryNav.ts) | **Enforced** |
| **C4** | **Standing never travels in the return channel.** No xp, rank, tier, leaderboard, badge or squad copy in any nudge, email or push | New `club-identity` axis in [`reentryTone.ts`](../src/lib/reentryTone.ts); every channel inherits it. [CLUB_PLAN.md](CLUB_PLAN.md) invariant 6, widened from points to the whole domain | **Enforced** |
| **C5** | **Free text never reaches another screen.** Local-only is permitted; the public projection and share card carry only picks-from-sets and derived numbers | Type-level: the public DTO declares no free-text field, and a test asserts the projection's output key set. Moderation-safe by construction | On S4 |
| **C6** | **Page kits are manifest entries, not stylesheets.** No user-authored CSS, HTML, colour or font, ever | Extend `check-design-system` with a rule asserting kit manifest values are token references — the scanner has no notion of a manifest today | On S3 |
| **C7** | **Identity is never asked for.** No profile, call sign or club step in I-Day, Basic, or any first-run checklist | Same guard, walking `WelcomePage` and `src/components/journey/` | **Enforced** |
| **C8** | **Boards obey eligibility and youth exclusion** — account age, session minimums, youth excluded outright, report flow ships *with* the first public board | [CLUB_PLAN.md](CLUB_PLAN.md) Integrity — not restated here | On S5 |
| **C9** | **Monotonic.** No decay, no relegation, no revoked tier. **The T4 season-start boost is struck** — WClub's compensation for a seasonal reset MW does not have (Wave 9 §9.5) | [CLUB_PLAN.md](CLUB_PLAN.md) invariant 3, plus the correction | Doc decision |

**C1 is the load-bearing one.** Everything else is recoverable; a planner that can
read rank is the failure this whole plan exists to prevent, and it is the one that
would never announce itself — the plans would simply get subtly worse for the
athletes who care most about their standing.

**There is no exemption mechanism, deliberately.** All five enforced contracts hold
at zero violations, so `{ why, fixWhen }` scaffolding would be building the escape
hatch before the wall. A future crossing that is genuinely legitimate adds the
mechanism in its own PR and argues for it in review, where someone can disagree.

## 6. Phases

Numbered to interleave with [CLUB_PLAN.md](CLUB_PLAN.md)'s C-phases, which own the economy. Every phase is **refused by default** until a founder line exists, per the horizon rule.

| Phase | Scope | Entry gate | Kill criterion |
|---|---|---|---|
| **S0** | This document + [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) Wave 9 + INDEX rows | W — docs only, no gate spent | — |
| ~~**S1**~~ | **Shipped `.605`.** C1–C4 and C7 as executable guards against today's code — `domainBoundary.ts` + `domainBoundary.test.ts`, and the `club-identity` tone axis. No feature, no route, no string | W craft window | 12 mutants killed |
| **S2** | **Account / You split.** `/profile` settings move to Account; You becomes a page with Identity + The line + the existing shelf. Local only, no server, no sharing beyond the shipped card | W craft window — founder go line; genuine refine of a 413-line settings screen | Kill if the page has nothing on it for a 3-session athlete — that is the D8 void rule, and it applies to the newest screen first |
| **S3** | **The table + page kits v1** (3–5 kits, picks-from-sets, local) | After S2 lands and C6 exists | Kill if <25% of weekly actives ever change a default |
| **S4** | **Public projection + Athlete Page share** — C5 enforced, still no boards, no graph | [CLUB_PLAN.md](CLUB_PLAN.md) C2 shipped (ledger + card) | Kill on any moderation incident the projection was supposed to make impossible |
| **S5** | **Squad** — invite by code/link, squad-only board | [CLUB_PLAN.md](CLUB_PLAN.md) C3 gate, unchanged: moderation basics + eligibility + cohorts live | CLUB_PLAN C3 criteria; plus **any measurable drop in sessions logged per weekly active** — the Wave 9 §9.1 failure, instrumented |
| **S6+** | Leagues, locality, arcade | [CLUB_PLAN.md](CLUB_PLAN.md) C4–C7 gates | Theirs |

**S5 carries an instrument the other phases do not.** Under-logging is invisible in every ordinary retention metric — an athlete who logs 3 of 4 sessions still looks retained. The measure is sessions logged per weekly active, tracked against the pre-squad cohort. If it moves down, the squad board comes out, regardless of what engagement does.

## 7. Where this leaves the long-term plan

| Founder theme | Home | This plan's contribution |
|---|---|---|
| **Rewards** | [CLUB_PLAN.md](CLUB_PLAN.md) — shipped engine at [`src/lib/rewards/`](../src/lib/rewards/INDEX.md) | Calibration: durable effect is **g=0.15**, so rewards support the loop and are never the retention thesis. Strike the T4 boost |
| **Profile** | **Here** | Athlete Page, page kits, the table, Account split |
| **Social** | **Here** | Two domains, one-way crossing, C1–C9. Squad before boards; never a feed |
| **Gaming / arcade** | [CLUB_PLAN.md](CLUB_PLAN.md) C7 | Unchanged — still needs a vision.md amendment before any code |
| **Bundle story** | [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) Wave 9 | Freeletics sells 7 apps and 7 logins; MW's pillars share one score and one log. That is the comparison to make |

## 8. Refused

A feed · comments · DMs · **Top 8 or any friend ranking** · follower counts · likes on a session · public free text · user CSS/HTML · profile completeness meters · anything that puts another human's number on the logging path · points, rank or tier in nudges · streak-loss or absence copy · profile as an onboarding step · purchasable identity · the T4 season-start boost.

## 9. Decisions

**Ratified 2026-08-08** — these govern S2 onward and are not to be re-litigated:

1. **Routing.** `/profile` becomes the Athlete Page; account settings move to a new
   `/account`. The nav label "You" has always pointed at `/profile`; this makes that
   true. Cost, measured: one row in `ROUTE_TITLES` (type-enforced), one `MORE_NAV`
   entry, one `a11y.spec.ts` route, and one `RED_ACTION_CAP` entry in
   `zero-state.spec.ts` whose count must be pinned exactly — that ratchet fails in
   **both** directions.
2. **Free text.** Permitted local-only; stripped from every public projection and
   share card (C5). Discord's Profile Widgets allow an optional description; this is
   that, minus the exposure.
3. **Design dependency.** Structure is built with shipped primitives; page kits land
   as a manifest once proposal 3 delivers compositions.

**Still open:**

4. **S2 go/no-go** — split Account from You.
5. **Strike the T4 season-start boost** from [CLUB_PLAN.md](CLUB_PLAN.md)? Recommended yes (Wave 9 §9.5).
6. **Re-cut positioning angle 1** — "free forever" is now Bevel's line too, in writing. Recommended replacement: **free, on Android, from your logs alone, offline, no watch, no account.**
7. **Naming** — Athlete Page / call sign / page kit are internal names, consistent with [CLUB_PLAN.md](CLUB_PLAN.md)'s brand-agnostic invariant 10. Display names remain a founder branding call.

## 10. Why this is inside the horizon gate

This PR builds nothing — docs plus INDEX rows, no `src|app|scripts|supabase` path, no build label, no LOG entry ([CLAUDE.md](../CLAUDE.md) §7 skip). The full-launch override of 2026-08-05 already sanctions rewards and surface honesty; [CLUB_PLAN.md](CLUB_PLAN.md) already sanctions the Athlete Card and phased boards. What this document adds is the boundary that makes those safe to build, and one correction to a plan that had imported a mechanic without its precondition.
