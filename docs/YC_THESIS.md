# YC thesis — Mission Winning wedge

**Audience:** Founder (application + partner conversations) · Agents (copy/positioning)  
**Constitution (unchanged):** [vision.md](../vision.md) — long-term everything-app path  
**Business plan:** [STRATEGY.md](../STRATEGY.md) · **Gates:** [ORCHESTRATION.md](../ORCHESTRATION.md)  
**Rule:** Pitch the **Train + Mission Coach wedge**. Pillars expand *after* week-4 retention — they are not the company one-liner.

---

## One-liner (YC form)

> We build an adaptive AI training coach for people who train at home or in a park — free offline workout logging with no account, and weekly plans that adapt from logs alone (no wearable required).

**Two-sentence product:** Free forever PWA logger (no account, offline, bodyweight-first). Mission Coach turns weekly logs into a fatigue-aware plan that adapts when life happens. Super Bundle unlocks Coach depth and other pillars — never gates logging.

**Product loop:** After finishing a workout, victory CTA prefers Mission Coach for the first 3 completed sessions (or when no coach plan) — see `pickVictoryNextAction` in `src/lib/workout/workoutVictory.ts`. Coach page shows an **adaptation banner** (missed / swapped / revision) for demo videos — see [ACCELERATOR_SPRINT.md](ACCELERATOR_SPRINT.md).

**Accelerator sprint (Jul 20 – Aug 2):** [ACCELERATOR_SPRINT.md](ACCELERATOR_SPRINT.md) · paste answers in [applications/INDEX.md](applications/INDEX.md) — CDL → YC → Elbow Grease → SPC; skip Draper Cardano; honest traction only.

---

## Problem

Serious training tools are paywalled, app-store-gated, or wearable-first. People who train at home / park / garage have a phone — not a WHOOP, not a gym membership, and not budget for another $15–60/mo stack. Static PDFs and notes apps don’t progress or adapt.

## Solution

| Layer | Role |
|-------|------|
| **Wedge** | Free forever logger — no account, offline, bodyweight-first |
| **Product** | Mission Coach — weekly plan from workout history (no wearable) |
| **Revenue** | Super Bundle (Coach + depth) — free core stays free |
| **Expansion** | Fuel → Move / Mind / Learn after retention (not the pitch) |

## Why now

LLMs + a shipped coach engine make adaptive plans cheap; smartphones are ubiquitous where gyms and wearables are not; subscription fatigue makes “actually free core” a trust wedge Hevy-class apps can’t match without nuking ARPU.

## What we understand that others don’t

**Adaptive coaching demand is global; sensor ownership is not.** Wearable-first AI coaches optimize for people who already buy $300 sensors. Most people who need coaching have a phone and a park.

---

## Named competition

| Competitor | They win | You win |
|------------|----------|---------|
| Hevy / Strong | Logger UX, social | Free core forever; no paywall on basics; PWA offline |
| Freeletics | Brand + Coach | No app-store tax; free logger without Coach lock-in for basics |
| HYBRD / Imperfect | Wearable-native AI | Works **without** wearables; train-anywhere / bodyweight first |
| Notes / spreadsheet | Zero cost | Progression, Coach, Win Score, installable PWA |

**Unfair advantage (honest):** shipping velocity + free-core trust + Mission Coach already live — **not** “no competitors.”

---

## Traction bar before applying

YC rejects “strong interest.” Hit these **before** submitting:

| Gate | Target | Why |
|------|--------|-----|
| Real users | ≥100 completed ≥1 workout | Beyond friends |
| Week-4 retained weekly loggers | ≥10% of activated cohort | [STRATEGY.md](../STRATEGY.md) #1 metric |
| Paid signal | ≥10 Super Bundle or lifetime | Willingness to pay |
| Demo | 60s: I-Day → log → Coach adapts week | Application video |
| Founder interviews | 20 written notes of “why I almost quit” | Insight receipts |

**Sequence (non-negotiable):** private beta (≥10) → public flip → retention wall → apply only when numbers are rising.  
See [ORCHESTRATION.md](../ORCHESTRATION.md) · [POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md) · [SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md).

**Agents must not** flip `PRIVATE_MODE` or fabricate traction.

---

## Ideal cofounder (YC cares)

Solo + six-pillar story is a double penalty. Competitive batches expect a **technical or growth cofounder**, or extreme velocity + domain receipts.

| Profile | Owns |
|---------|------|
| **Growth / athlete distribution** | Beachhead communities, creator intros, retention experiments |
| **Full-stack product** | Coach depth, instrumentation, week-4 experiment loop |

Document conversations; do not pretend solo is optional for a strong YC shot.

---

## Explicit non-pitch

Do **not** lead the application (or landing hero) with:

- “#1 health everything app” as the company
- America / PFT / school as the beachhead
- Military salutes / commission language as the brand (journey structure can stay; soften if beta confirms alienation — [REDTEAM.md](../REDTEAM.md) A7)
- Genomics / “AI personalized medicine” without clinical data
- Native iOS/Android before week-4 proof ([TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) only if A1 falsifies)

[vision.md](../vision.md) remains the long-term constitution. This file is the **YC / go-to-market wedge**.

---

## Application skeleton (once traction exists)

1. **Company:** Mission Winning  
2. **One-liner:** as above  
3. **Product:** Free PWA logger + Mission Coach (adaptive weekly plans from workout history)  
4. **Traction:** WAU, week-4 %, revenue, growth week-over-week  
5. **Market:** Global train-anywhere / bodyweight; beachhead English Reddit → expand LATAM/SEA via PWA  
6. **Business model:** Free core forever; Super Bundle ~$59/yr founders  
7. **Secret:** Coaching without sensors + distribution without app stores  
8. **Ask:** Batch + intros to athletes/creators in train-anywhere niches; capital for Coach depth + distribution — not for a rewrite  

---

## Founder path (execute in order)

```text
private beta (≥10, I-Day/BT gates)
  → public (PRIVATE_MODE=false)
  → week-4 retention + paid signal
  → YC application (only if numbers rising)
```

Copy kits: [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) · [BETA_INVITE.md](../BETA_INVITE.md).

---

Last updated: 2026-07-20
