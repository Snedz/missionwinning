# Social & launch media kit

**Purpose:** Copy-paste posts, filming shot list, and channel rules for beta → public.  
**Rule:** Social gets people into I-Day → first workout. No paid ads until week-4 retention holds.  
**Companion:** [STRATEGY.md](../STRATEGY.md) · [BETA_INVITE.md](../BETA_INVITE.md) · [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md)

---

## Phase A — Private beta (now)

### Channels

| Channel | Action |
|---------|--------|
| Warm DMs | Highest ROI — use [BETA_INVITE.md](../BETA_INVITE.md) |
| 2 communities you already use | Value first, then builder-story beta ask |
| **One** vertical account | TikTok **or** Instagram Reels (same clips) — you the builder |
| Skip | LinkedIn company page, daily Twitter, YouTube long-form, Discord server, paid boosts |

Cadence: **≤1 public post/week** while recruiting. Prefer DMs.

### Bio (when you open the account)

```
Building Mission Winning — free workout tracker, works offline, no account.
Beta: link in bio → missionwinning.com (ask me for access)
```

### Film once (30–60s) — shot list

Record on phone, portrait, silent UI or soft click sounds.

| Seconds | Screen | Say / caption beat |
|---------|--------|--------------------|
| 0–5 | `/welcome` I-Day start | “Free tracker. No account.” |
| 5–20 | Tap through I-Day → Today | “Three minutes to start.” |
| 20–40 | `/active` — Log one set | “Log a set. Offline works.” |
| 40–55 | Victory / Today Mission Score | “Win Score updates. That’s the loop.” |
| 55–60 | End card | “missionwinning.com — building in public” |

**Do not** say “we’re live / public launch” while `PRIVATE_MODE=true`. Soft caption: “Building a free offline workout tracker — looking for beta testers. DM me.”

### Soft post caption (optional, during beta)

```
Tired of paywalled trackers. Building a free one that works offline — no account, no app store.

Looking for honest beta testers. DM me.

#bodyweightfitness #homegym #buildinpublic
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
`Free offline workout tracker — no account, no paywall`

**Description (short):**  
Mission Winning is a free PWA fitness tracker for people who train anywhere. Log sets without an account, works offline, install from the browser. Premium Super Bundle unlocks Coach + depth — never gates the logger.

**First comment (builder):**  
I got tired of Strong/Hevy locking basics. So I shipped a free core that works on any phone with spotty signal. Try: open the site → Welcome (I-Day) → log one set → see Mission Score. No email required for the first workout. Honest feedback welcome — especially where you got stuck.

### 3. Show HN

**Title:**  
`Show HN: Free offline workout tracker (PWA, no account required)`

**Body:**

```
I built Mission Winning — a free workout logger that works as a PWA without an account.

Why: most trackers paywall routines or need app-store installs. I train at home / park and wanted something that works offline.

Try it: https://www.missionwinning.com
Path: Welcome → Today → log a set → Mission Score updates.

Stack: Next.js + Supabase. Free core forever; optional Super Bundle for Coach/depth.

Looking for feedback from people who actually log workouts.
```

### 4. Community post (Reddit / Discord — check rules)

```
I got tired of paywalled trackers so I built a free offline one (PWA, no account to start).

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

### 6. Waitlist email (Resend / export `leads`)

Sources: `launch-waitlist`, `waitlist-*`

```
Subject: Mission Winning is live — founders offer

You're on the list — we're public.

Start free (no account needed): https://www.missionwinning.com/welcome

Super Bundle founders pricing is open for early supporters (12-month + lifetime). Free core stays free forever.

If this isn't useful, just ignore — no spam cadence promised beyond this launch note.

— [Your name], Mission Winning
```

Export hint (Supabase SQL Editor):

```sql
select email, source, created_at
from leads
where source like 'waitlist%' or source = 'launch-waitlist'
order by created_at desc;
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
