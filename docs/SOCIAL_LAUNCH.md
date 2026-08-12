# Social & launch media kit

**Purpose:** Copy-paste posts, filming shot list, and channel rules for **private beta (invite-only)** → public flip.  
**Visual assets:** Brand logos, colors, OG image → [/press](https://www.missionwinning.com/press) · [brand-guidelines.md](brand-guidelines.md)  
**Mascot:** Kalligator — [MASCOT.md](MASCOT.md) · `/brand/mascot/`  
**Social creatives:** `public/social/` · playbook [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · manifest [`media/manifest.json`](../media/manifest.json)  
**Rule:** External channels get people into I-Day → first workout. No paid ads until week-4 retention holds.  
**Capital:** [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md) · outreach help: [OUTREACH_VA_BRIEF.md](OUTREACH_VA_BRIEF.md)  
**Companion:** [STRATEGY.md](STRATEGY.md) · [BETA_INVITE.md](BETA_INVITE.md) · [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) · [YC_THESIS.md](YC_THESIS.md)  
**Phase B paste kits (preferred):** [seo/launch/PHASE_B_DRAFT_KIT.md](../seo/launch/PHASE_B_DRAFT_KIT.md) — DO NOT PUBLISH until flip.

**Wedge line (use everywhere):** Free forever offline logger + adaptive Mission Coach from logs (no wearable). Six pillars stay below the fold / second sentence — not the hook.

**MatrAIx gates (beta path):**

- **F-005:** Pitch Train+Coach / free forever offline logger only. Do **not** merchandise in-app social Feed, community, or everything-app framing.
- **F-016:** Do **not** lead with Super Bundle / checkout. Free forever offline logger is the wedge; Super Bundle never gates the logger (mention Bundle only deep secondary, after free core, if at all).
- **F-008 / PRIVATE_MODE:** While `PRIVATE_MODE=true`, use **invite-only / private beta** framing only. No "we're live," "we're public," open-beta, or "building in public" as product-status claims.

### Creative stills (`public/social/`)

| File | Size | Use |
|------|------|-----|
| [/social/invite-square.webp](https://www.missionwinning.com/social/invite-square.webp) | 1080×1080 | Invite / beta DM share background — overlay copy in editor |
| [/social/coach-story.webp](https://www.missionwinning.com/social/coach-story.webp) | 1080×1920 | Stories / Reels canvas |
| [/brand/mascot/kalligator-invite.webp](https://www.missionwinning.com/brand/mascot/kalligator-invite.webp) | Kalligator invite | Overlay on invite posts — "Train anywhere. Free logger." |
| [/brand/mascot/kalligator-celebrate.webp](https://www.missionwinning.com/brand/mascot/kalligator-celebrate.webp) | Kalligator celebrate | Victory / "set locked" posts |
| [/brand/mascot/kalligator-idle.webp](https://www.missionwinning.com/brand/mascot/kalligator-idle.webp) | Kalligator idle | Neutral companion still |

**HQ refresh:** spend Google Flow's 50 free daily credits (Veo Lite) using [media/FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) (mascot queue first if refining Kalligator) → `media/inbox/` → `npm run media:optimize-inbox`. Never use Kalligator for guilt/streak-shame copy.

**Kalligator caption beats (anti-guilt):**

```
No session yet. Start when ready.
Train anywhere. Free logger.
Set locked. Win logged.
```

**Evidence angle (second wave only):** Structured exercise has strong trial support for mild–moderate mood symptoms; clinicians rarely get trained to prescribe it — so advice stays vague. MW's product story is still the logger + Coach (the "dose"), never "we treat depression." Full rules: [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md). Always add: *Not medical advice — not a substitute for clinical care.*

---

## Phase A — Private beta (now)

### Channels

| Channel | Action |
|---------|--------|
| Warm DMs | Highest ROI — use [BETA_INVITE.md](BETA_INVITE.md) |
| 2 communities you already use | Value first, then builder-story **private beta** ask (product pitch stays Train+Coach — not Feed/community features) |
| **One** vertical account | TikTok **or** Instagram Reels (same clips) — you the builder |
| Skip | LinkedIn company page, daily Twitter, YouTube long-form, Discord server, paid boosts |

Cadence: **≤1 public post/week** while recruiting. Prefer DMs. Framing: **invite-only private beta**, not open/public launch.

### Bio (when you open the account)

```
Building Mission Winning — free forever offline logger + AI coach that adapts from your logs (no wearable).
Private beta (invite-only): DM me for access → missionwinning.com
```

### Film once (30–60s) — shot list

Record on phone, portrait, silent UI or soft click sounds. **YC demo variant:** same arc ending on Coach adapting the week.

| Seconds | Screen | Say / caption beat |
|---------|--------|--------------------|
| 0–5 | `/welcome` I-Day start | "Free logger. No account." |
| 5–20 | Tap through I-Day → Today | "Three minutes to start." |
| 20–40 | `/active` — Log one set | "Log a set. Offline works." |
| 40–55 | `/coach` or Today Coach card | "Coach reshapes the week from logs — no wearable." |
| 55–60 | End card | "missionwinning.com — private beta, DM for invite" |

**Do not** say "we're live / public launch / open beta / building in public" while `PRIVATE_MODE=true`. Soft caption: "Building a free forever offline logger + adaptive coach from logs (no wearable) — private beta, invite-only. DM me."

### Soft post caption (optional, during beta)

```
Tired of subscription trackers and wearable-only AI coaches. Building a free forever offline logger + Mission Coach that adapts from your logs alone.

Private beta (invite-only). Looking for honest testers. DM me.

#bodyweightfitness #homegym #calisthenics
```

### Evidence / founder-story caption (optional second wave)

Primary hook remains free forever offline logger. Use this only when the audience already knows the product; never as the landing hero.

```
Exercise has strong trial support for mild–moderate mood symptoms — yet most mental health pros never trained to prescribe it, so advice stays "just go work out."

Building Mission Winning: a clear, adaptive weekly training plan on any phone — free forever offline logger + Mission Coach. Not a medical product. Not medical advice.

Private beta: DM me for an invite.
```

### Magazine angle (optional caption beat)

```
The booklet that used to come with the game — for training.

Beyond the Basics is free to read (and download as a PDF): what adaptation is, how lifts work, how to tune volume, fuel, and recovery.

App = experience it. Magazine = read it.
missionwinning.com/guide
```

---

## Phase B — Day of public flip

Post **after** `PRIVATE_MODE=false` and PWA smoke pass. Prefer kits in [seo/launch/PHASE_B_DRAFT_KIT.md](../seo/launch/PHASE_B_DRAFT_KIT.md). Order:

1. Beta testers (DM/email)
2. Product Hunt
3. Show HN
4. The 2–3 communities from beta
5. TikTok / Reels / Shorts (same clip)
6. Waitlist email

### 1. Beta testers

```
Subject: Thank you — Mission is open

Hey [Name] — Mission Winning is publicly reachable now: https://www.missionwinning.com

The free forever offline logger is the product. If it helped you train, the best thank-you is sharing it with one person who trains at home/park.

(Optional, deep secondary only — never the lead:) Super Bundle is available for Coach depth; it never gates the logger.
```

### 2. Product Hunt (tagline + first comment)

**Tagline (≤60 chars):**  
`Free offline logger + AI coach — no wearable needed`

**Description (short):**  
Mission Winning is a free forever PWA for people who train at home or in a park. Log sets without an account, works offline. Mission Coach builds weekly plans from your logs alone — no wearable. Super Bundle (optional) never gates the logger.

**First comment (builder):**  
I got tired of Strong/Hevy locking basics and wearable-first coaches assuming a $300 sensor. So I shipped a free core that works on any phone with spotty signal, plus a coach that adapts from workout logs. Try: open the site → Welcome (I-Day) → log one set → check Mission Coach. No email required for the first workout. Honest feedback welcome — especially where you got stuck.

### 3. Show HN

**Title:**  
`Show HN: Free offline workout logger + adaptive coach (no wearable)`

**Body:**

```
I built Mission Winning — a free forever PWA workout logger with Mission Coach (weekly plans from logs, no wearable required).

Why: most trackers gate routines behind subscriptions or need app-store installs; AI coaches assume wearables. I train at home / park and wanted something that works offline on a phone.

Try it: https://www.missionwinning.com
Path: Welcome → Today → log a set → Mission Coach adapts the week.

Stack: Next.js + Supabase. Free core forever; optional Super Bundle never gates the logger.

Looking for feedback from people who actually log workouts.
```

### 4. Community post (Reddit / Discord — check rules)

```
I got tired of subscription trackers and wearable-only AI coaches — so I built a free forever offline logger + coach that adapts from your logs (PWA, no account to start).

https://www.missionwinning.com

Looking for honest feedback — especially: where did you get confused in the first 3 minutes?
```

### 5. Shorts / TikTok / Reels caption (launch)

```
Free workout tracker. No account. Works offline.

I-Day → log a set → Mission Score.

Link in bio → missionwinning.com

#fitness #bodyweight #homegym #pwa
```

### 6. Waitlist email (launch broadcast script)

Sources land in `leads.package_interest` (e.g. `landing-updates`, `launch-waitlist`, `waitlist-*`).

**Dry-run (default):**

```bash
node --env-file=.env.local scripts/send-launch-broadcast.mjs
# or: npm run launch-broadcast
```

**Live smoke (one recipient, redirect):**

```bash
npm run launch-broadcast -- --send --limit 1 --to you@example.com
```

**Full send (after Resend DNS + migration applied):**

```bash
npm run launch-broadcast -- --send --limit 500
```

Script dedupes by `lower(email)`, skips `unsubscribed_at` / `launch_email_sent_at`, and stamps sent rows. Body matches founders offer copy with per-recipient unsubscribe links. **Lead with free forever logger + Coach from logs; do not lead with Bundle/checkout.**

Manual SQL check (correct column is `package_interest`, not `source`):

```sql
select email, package_interest, created_at, unsubscribed_at, launch_email_sent_at
from leads
where package_interest like 'waitlist%'
   or package_interest in ('landing-updates', 'launch-waitlist')
order by created_at desc
limit 50;
```

---

## Phase C — First 90 days

| Do | Don't |
|----|--------|
| One filming batch → 4–8 Shorts (logger demos + Learn tips) | Hire a social agency pre-retention |
| Reply to every comment month 1 | Fake testimonials |
| Bio → `/welcome` (Train+Coach wedge) | Meta/TikTok ads until week-4 holds |
| SEO (`/guide`, `/exercises`, `/calculators`) as compounding channel | Five platforms, ghost four |
| Pitch free forever logger + Coach from logs | Merchandise in-app Feed / community / everything-app / Bundle-as-hero |

**Owned list > algorithm:** keep capturing waitlist/leads; external social is top-of-funnel only — not a product Feed pitch.
