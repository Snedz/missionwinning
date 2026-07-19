# REDTEAM — Mission Winning

**Purpose**: audit the assumptions this project stands on, not to judge the idea. Read before every quarterly plan. Companion: [STRATEGY.md](STRATEGY.md). Written 2026-07-02.

---

## 1. Assumptions audit

### LOAD-BEARING — if wrong, the plan fails

**A1. People will adopt a fitness tracker distributed as a PWA, without an app store.**
The entire zero-fee, works-anywhere thesis rests on this. App stores are where fitness users *look*; "install from browser" is an unfamiliar gesture for mainstream users, iOS support is second-class (no push until installed, Safari quirks), and PWA discovery has killed good products before.
*Falsifying evidence*: 1,000 landing visitors → <5% complete I-Day, or testers repeatedly ask "is there an app?" and drop when told no. **Watch: install rate + iOS drop-off in beta.** If falsified: TWA wrapper on Play Store (cheap) before native.

**A2. Enough free users convert to a bundle whose premium depth is mostly placeholders.**
Move/Mind/Track premium are unlock cards with nothing behind them; Train premium (AI Coach) doesn't exist yet. Freeletics converts because the Coach is *the product*. We are selling recipes + programs + a promise.
*Falsifying evidence*: waitlist→paid conversion <2% when checkout opens, or refund requests citing "premium is thin." **Watch: founders-offer conversion; refunds.** If falsified: ship AI Coach v1 + one real pillar depth before pushing paid again — and consider one-time program purchases instead of subscription.

**A3. A solo founder building with AI agents can sustain a six-pillar product's quality bar.**
36.5k lines, COPPA flows, i18n, payments — each pillar is a product a funded team maintains full-time elsewhere. The graveyard of solo "everything apps" is vast.
*Falsifying evidence*: bug backlog growth > fix rate for 4+ straight weeks; support >1h/day pre-revenue; founder dreads opening the repo. If falsified: cut to Train+Fuel and park the rest (flags exist now).

**A4. Week-4 retention will be strong enough that free growth compounds.**
Every fitness app's death: month-1 churn ~90%+. Free-forever means the funnel's economics are *only* retention.
*Falsifying evidence*: <10% of activated users logging in week 4 across two cohorts. If falsified: the problem is the product loop, not marketing — stop all acquisition, run 10 user interviews, fix or pivot the loop (likely: the Coach *is* the retention feature and must come earlier than planned).

**A5. The founder will actually get distribution unblocked (Vercel 2FA, beta recruiting, launch posts).**
Nothing in this plan works while the app is unreachable. The record so far: months of building, zero users — building is comfortable, distribution is scary.
*Falsifying evidence*: 14 days after this doc lands, still no deployed URL or no 10 beta users. If falsified: the constraint is founder behavior, not the product — see the runbook's Day-1 checklist; consider a hard rule of "no new features until N users."

### IMPORTANT — wrong ⇒ weakened but survivable

**A6. "Free forever" can coexist with sustainable revenue** (if conversion is ~1–3% at Freeletics-like scale it works; at small scale it means low revenue for years — survivable for a mission-driven solo founder, fatal for a salary).
**A7. The military-journey framing (I-Day, Commissioned, operators) motivates rather than alienates a global audience.** Duolingo-style structure suggests yes; some cultures/genders may bounce. Watch qualitative beta feedback; the framing is copy, not architecture — cheap to soften.
**A8. Win Score is meaningful without wearables.** Rule-derived scores from logs may read as arbitrary vs Whoop/Bevel's sensor data. Mitigation: present as "consistency score," never as physiology.
**A9. ISSA-derived Learn content is legally clean as "original wording".** Unverified. Before charging for /learn: document originality; if challenged, that pillar unpublishes without killing the app.
**A10. Stripe/LLC/banking will be straightforward for the founder's jurisdiction.** If not: Paddle/Lemon Squeezy as merchant-of-record is the fallback (webhook code adapts).

### MINOR — wrong ⇒ barely matters now

**A11.** i18n breadth pre-launch (nav in 14 languages) drives early growth — almost certainly premature; costs little now that it's paused.
**A12.** The leaderboard/Pacers mechanic matters to the wedge user at N<1,000 — probably not; it's now honest, so it can idle.
**A13.** The America/PFT track becomes a school-distribution channel — parked behind a flag; zero cost until reopened deliberately.
**A14.** Referral growth is net-positive without paid rewards. Wave 8 ships recognition-only invite codes (`MW-XXXXX`). If we ever attach monetary/premium rewards, expect multi-account fraud and support load — require device fingerprinting + manual review first. *Falsifying evidence for recognition-only: zero shares after 1k actives.*

---

## 2. Pre-mortem — it's January 2028 and Mission Winning failed

**Months 1–3 (Jul–Sep 2026) — the warnings we ignored.** The launch package merged, and it felt like progress — but the Vercel 2FA reset took five more weeks because it was nobody's deadline. Beta invites went to 6 friends, 4 finished I-Day, feedback was "nice!" and we read it as validation instead of politeness. Meanwhile two more Claude sessions added features to /learn "while we waited." The tell was already visible: **we treated building as progress and distribution as an errand.**

**Months 4–9 — the compounding mistakes.** Public launch finally happened with a quiet tweet and one Reddit post that got 40 upvotes and 200 visitors; 9 completed a workout; nobody came back week 4. Instead of running the ten interviews, we concluded "we need more features to stand out" and spent three months on AI Coach v1 + Move videos. Stripe went live to a waitlist of 31 emails; 2 lifetime sales ($298 total) — celebrated as "first revenue" instead of heard as "no demand signal." The retention number was never put on the wall.

**Months 10–15 — the point of no return.** Hevy shipped their free tier expansion; the "paywalled trackers" wedge dulled. The founder, demoralized by silence, went weeks without opening the repo, then returned with energy for a *redesign* (the third) rather than user calls. Supabase and domain renewals started feeling like a tax. The single strongest asset — 20 loyal beta users who DID stick — were never interviewed, never asked what kept them, never asked to invite friends.

**Months 16–18 — the quiet end.** No dramatic collapse: a Vercel bill unpaid, a domain lapsed, a "taking a break" note. Total: ~$450 revenue, ~40 real users, one more repo in the graveyard. Everyone who tried it said it was "actually pretty good."

**The root cause was: we optimized for the feeling of building instead of the discomfort of distribution and retention, so no failure signal ever arrived early enough to act on.**

---

## 3. Competitor attack plan — "$100M and I hate you"

*I run BigFit Inc. My mandate: make Mission Winning irrelevant in 90 days.*

**Days 1–30 — study and reposition.** I read your public repo docs (your whole strategy is committed to git), your vision.md, your pricing. I A/B your own words: "free forever, works offline, no account." My move: flip Hevy/Strong's free tier to *actually unlimited*, ship offline mode, and run "No paywall. No excuses." creative to your exact subreddits. Cost to me: rounding error. Cost to you: your wedge sentence now sounds like everyone's.

**Days 31–60 — out-ship the bundle.** I bundle my tracker with licensed Calm-style audio and a real adaptive coach (I have ML engineers), price at $4.99/mo with a permanent free tier, and launch in PT/ES/HI with local influencers — your "global south" story, executed with money. I ship a school program with real compliance lawyers, taking the America track off the table before you reopen it.

**Days 61–90 — starve the oxygen.** I flood Shorts/TikTok with "free offline workout tracker" content (you can't outspend me), sponsor the calisthenics YouTubers your users watch, and quietly recruit the two or three power users you have into my ambassador program. You're a solo founder: I don't need to beat you — I need 90 days of your stalled momentum, and your own graveyard instinct does the rest.

**What you're uniquely vulnerable to that you don't see**: your differentiation is a *policy* (free forever) plus *positioning* (offline/no-account) — both copyable in a quarter by anyone with engineers. Your only real defenses are speed, a genuine community that knows the founder, and trust accumulated by keeping the promise while staying alive.

**The weakness that lets me win is: you have no owned relationship with your users (no community, no email habit, no founder-brand) — so the moment my ad reaches them, there's nothing pulling them back.**

*(Counter, for our side: build the email list from day one — the waitlist capture shipped today is that; be visibly the human founder in every community; ship the Coach before a giant does the bundle-for-$4.99 move.)*

---

## 4. The 1-star review that goes viral

> ⭐ "Mission Winning" — more like Mission Loading.
> Downloaded this because a Reddit comment swore it was 'actually free.' Fine — the tracker IS free, credit where due. But the app kept saluting me? I finished one push-up workout and it told me I was 'commissioned.' Sir, I did eight push-ups. Then I tapped literally any interesting-looking button — Move? 'Unlock.' Mind? 'Unlock.' Track GPS? 'Unlock.' It's a six-room house where five rooms are wallpaper photos of rooms. The leaderboard had me ranked #47 against people named 'Night Vector' and 'Steel Horizon' who — plot twist — are BOTS (at least they admit it now, tiny 'Pacer' tag, lol). Asked the AI coach for a plan; got the same 'focus on recovery today, operator' fortune cookie two days running. I didn't pay a cent and I still feel like I owe someone a refund. 10/10 tracker, 2/10 everything-app, 1 star for the audacity. 🫡
>
> **RT @liftgirl_br**: "a six-room house where five rooms are wallpaper photos of rooms" is the most accurate app review ever written 💀 the tracker is genuinely good tho, been using it offline at the park for a month
> **RT @garage_gary**: the bots named NIGHT VECTOR sent me. imagine losing to a fake guy at push-ups. (still faster than Strong's paywall tbh)
> **RT @coachpriya**: this is what happens when you ship the org chart. six pillars, one product. pick a lane, win it, then expand. the lane (free offline tracking) is RIGHT THERE and it's good.
>
> **The single thing that made me feel cheated was: being sold an 'everything app' and finding one great room and five locked doors.**

*(Lesson already applied in this launch package: the landing page now leads with the tracker and marks premium honestly. Lesson still open: don't market pillars whose premium doesn't exist yet — the bundle page must under-promise until AI Coach and one deep pillar ship.)*

---

## 5. Standing review cadence

Quarterly (or before any big bet): re-read §1, check each LOAD-BEARING assumption against the falsifying evidence, update statuses, and add new assumptions any new plan smuggles in. An assumption without named falsifying evidence is faith, not analysis.
