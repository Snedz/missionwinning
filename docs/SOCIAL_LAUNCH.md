# Social & launch media kit

**Purpose:** Copy-paste posts, filming shot list, and channel rules for beta → public.  
**Visual assets:** Brand logos, colors, OG image → [/press](https://www.missionwinning.com/press) · [brand-guidelines.md](brand-guidelines.md)  
**Mascot:** Scout — [MASCOT.md](MASCOT.md) · `/brand/mascot/`  
**Social creatives:** `public/social/` · playbook [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · manifest [`media/manifest.json`](../media/manifest.json)  
**Rule:** Social gets people into I-Day → first workout. No paid ads until week-4 retention holds.  
**Capital:** [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md) · outreach help: [OUTREACH_VA_BRIEF.md](OUTREACH_VA_BRIEF.md)  
**Companion:** [STRATEGY.md](STRATEGY.md) · [BETA_INVITE.md](BETA_INVITE.md) · [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) · [YC_THESIS.md](YC_THESIS.md)

**Wedge line (use everywhere):** Free offline logger + adaptive Mission Coach from logs (no wearable). Six pillars stay below the fold / second sentence — not the hook.

### Creative stills (`public/social/`)

| File | Size | Use |
|------|------|-----|
| [/social/invite-square.webp](https://www.missionwinning.com/social/invite-square.webp) | 1080×1080 | Invite / beta DM share background — overlay copy in editor |
| [/social/coach-story.webp](https://www.missionwinning.com/social/coach-story.webp) | 1080×1920 | Stories / Reels canvas |
| [/brand/mascot/scout-invite.webp](https://www.missionwinning.com/brand/mascot/scout-invite.webp) | Scout invite | Overlay on invite posts — “Train anywhere. Free logger.” |
| [/brand/mascot/scout-celebrate.webp](https://www.missionwinning.com/brand/mascot/scout-celebrate.webp) | Scout celebrate | Victory / “set locked” posts |
| [/brand/mascot/scout-idle.webp](https://www.missionwinning.com/brand/mascot/scout-idle.webp) | Scout idle | Neutral companion still |

**HQ refresh:** spend Google Flow’s 50 free daily credits (Veo Lite) using [media/FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) (mascot queue first if refining Scout) → `media/inbox/` → `npm run media:optimize-inbox`. Never use Scout for guilt/streak-shame copy.

**Scout caption beats (anti-guilt):**

```
No session yet. Start when ready.
Train anywhere. Free logger.
Set locked. Win logged.
```

**Evidence angle (second wave only):** Structured exercise has strong trial support for mild–moderate mood symptoms; clinicians rarely get trained to prescribe it — so advice stays vague. MW’s product story is still the logger + Coach (the “dose”), never “we treat depression.” Full rules: [EXERCISE_AS_MEDICINE.md](EXERCISE_AS_MEDICINE.md). Always add: *Not medical advice — not a substitute for clinical care.*

---

## Phase A — Private beta (now)

### Channels

| Channel | Action |
|---------|--------|
| Warm DMs | Highest ROI — use [BETA_INVITE.md](BETA_INVITE.md) |
| 2 communities you already use | Value first, then builder-story beta ask |
| **One** vertical account | TikTok **or** Instagram Reels (same clips) — you the builder |
| Skip | LinkedIn company page, daily Twitter, YouTube long-form, Discord server, paid boosts |

Cadence: **≤1 public post/week** while recruiting. Prefer DMs.

### Bio (when you open the account)

```
Building Mission Winning — free offline logger + AI coach that adapts from your logs (no wearable).
Beta: link in bio → missionwinning.com (ask me for access)
```

### Film once (30–60s) — shot list

Record on phone, portrait, silent UI or soft click sounds. **YC demo variant:** same arc ending on Coach adapting the week.

| Seconds | Screen | Say / caption beat |
|---------|--------|--------------------|
| 0–5 | `/welcome` I-Day start | “Free logger. No account.” |
| 5–20 | Tap through I-Day → Today | “Three minutes to start.” |
| 20–40 | `/active` — Log one set | “Log a set. Offline works.” |
| 40–55 | `/coach` or Today Coach card | “Coach reshapes the week from logs — no wearable.” |
| 55–60 | End card | “missionwinning.com — building in public” |

**Do not** say “we’re live / public launch” while `PRIVATE_MODE=true`. Soft caption: “Building a free offline logger + adaptive coach from logs (no wearable) — looking for beta testers. DM me.”

### Soft post caption (optional, during beta)

```
Tired of paywalled trackers and wearable-only AI coaches. Building a free offline logger + Mission Coach that adapts from your logs alone.

Looking for honest beta testers. DM me.

#bodyweightfitness #homegym #buildinpublic
```

### Evidence / founder-story caption (optional second wave)

Primary hook remains free offline logger. Use this only when the audience already knows the product; never as the landing hero.

```
Exercise has strong trial support for mild–moderate mood symptoms — yet most mental health pros never trained to prescribe it, so advice stays “just go work out.”

Building Mission Winning: a clear, adaptive weekly training plan on any phone — free offline logger + Mission Coach. Not a medical product. Not medical advice.

Beta: DM me.
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

Post **after** `PRIVATE_MODE=false` and PWA smoke pass. Order:

1. Beta testers (DM/email)
2. Product Hunt
3. Show HN
4. The 2–3 communities from beta
5. TikTok / Reels / Shorts (same clip)
6. Waitlist email

### 1. Beta testers

```
Subject: We're public — thank you

Hey [Name] — Mission Winning is public now: https://www.missionwinning.com

If it helped you train, the best thank-you is sharing it with one person who trains at home/park.

Founders Super Bundle is live if you want the full path — free core stays free forever.
```

### 2. Product Hunt (tagline + first comment)

**Tagline (≤60 chars):**  
`Free offline logger + AI coach — no wearable needed`

**Description (short):**  
Mission Winning is a free PWA for people who train at home or in a park. Log sets without an account, works offline. Mission Coach builds weekly plans from your logs alone — no wearable. Super Bundle unlocks Coach depth + pillars — never gates the logger.

**First comment (builder):**  
I got tired of Strong/Hevy locking basics and wearable-first coaches assuming a $300 sensor. So I shipped a free core that works on any phone with spotty signal, plus a coach that adapts from workout logs. Try: open the site → Welcome (I-Day) → log one set → check Mission Coach. No email required for the first workout. Honest feedback welcome — especially where you got stuck.

### 3. Show HN

**Title:**  
`Show HN: Free offline workout logger + adaptive coach (no wearable)`

**Body:**

```
I built Mission Winning — a free PWA workout logger with Mission Coach (weekly plans from logs, no wearable required).

Why: most trackers paywall routines or need app-store installs; AI coaches assume wearables. I train at home / park and wanted something that works offline on a phone.

Try it: https://www.missionwinning.com
Path: Welcome → Today → log a set → Mission Coach adapts the week.

Stack: Next.js + Supabase. Free core forever; optional Super Bundle for Coach depth.

Looking for feedback from people who actually log workouts.
```

### 4. Community post (Reddit / Discord — check rules)

```
I got tired of paywalled trackers and wearable-only AI coaches — so I built a free offline logger + coach that adapts from your logs (PWA, no account to start).

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

Script dedupes by `lower(email)`, skips `unsubscribed_at` / `launch_email_sent_at`, and stamps sent rows. Body matches founders offer copy with per-recipient unsubscribe links.

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

| Do | Don’t |
|----|--------|
| One filming batch → 4–8 Shorts (logger demos + Learn tips) | Hire a social agency pre-retention |
| Reply to every comment month 1 | Fake testimonials |
| Bio → `/welcome` | Meta/TikTok ads until week-4 holds |
| SEO (`/guide`, `/exercises`) as compounding channel | Five platforms, ghost four |

**Owned list > algorithm:** keep capturing waitlist/leads; social is top-of-funnel only.
