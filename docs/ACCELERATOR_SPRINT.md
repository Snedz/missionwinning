# Accelerator application sprint — Jul 20 – Aug 2, 2026 (Get Selected)

**Audience:** Founder (submits forms, flips public, films demo) · Agents (docs + evidence UX only)  
**Narrative:** [YC_THESIS.md](YC_THESIS.md) · **Paste answers:** [applications/INDEX.md](applications/INDEX.md)  
**Rules:** Honest traction only. **Agents never** flip `PRIVATE_MODE` or invent metrics. **Skip** Draper × Cardano.

---

## What reviewers reward (research → our angle)

| Program | Reviewers reward | Our angle |
|---------|-----------------|-----------|
| **YC** | One-sentence clarity; launched + users; founder velocity; insight; authentic video | Wedge one-liner; honest N users/workouts; solo velocity receipts; anti-wearable insight vs HYBRD-class |
| **CDL** (AI) | Massively scalable; upward trajectory; plain language; honest challenges; 8-week objectives | Phone-not-wearable TAM; launch-week curve; honest moat; week-4 retention objectives |
| **SPC** | Exceptional people; **solo builders who prototype**; traction not required; ambition | Lead with what one founder shipped; frontier vision OK here |
| **Elbow Grease** | Affordability + economic mobility; technical founder | Free core forever; phone + park; no money barrier |
| **Residency** | Full-time obsessed builders, in-person | Velocity + relocate willingness |
| **Draper Cardano** | Cardano / Web3 | **Skip** |

**Market honesty:** Hevy-scale loggers can be large and bootstrapped — logger alone is not the venture case. Venture case = adaptive Coach + free-core trust for train-anywhere users wearables underserve.

---

## Ranked programs

| Rank | Program | Deadline | Deal | Verdict |
|------|---------|----------|------|---------|
| 1 | [CDL](https://creativedestructionlab.com/application-triage/) | **Jul 24** ET | No equity | **Apply** — [CDL_ANSWERS.md](applications/CDL_ANSWERS.md) |
| 2 | [YC F26](https://www.ycombinator.com/apply) | **Jul 27** 8pm PT | Standard YC | **Apply** — [YC_ANSWERS.md](applications/YC_ANSWERS.md) |
| 3 | [Elbow Grease](https://elbowgrease.cc/) | **Jul 31** | $300K/9% | **Apply if NYC OK** — [ELBOW_GREASE_ANSWERS.md](applications/ELBOW_GREASE_ANSWERS.md) |
| 4 | [SPC F26](https://www.southparkcommons.com/news/f26-founder-fellowship/) | **Aug 2** PT | $400K/7% + $600K | **Apply** — [SPC_ANSWERS.md](applications/SPC_ANSWERS.md) |
| 5 | [The Residency](https://livetheresidency.com/) | Rolling | Housing | **If full-time OK** — [RESIDENCY_ANSWERS.md](applications/RESIDENCY_ANSWERS.md) |
| 6 | Draper × Cardano | — | — | **Skip** |

**If multiple funded offers:** pick one check. CDL can stack.

---

## Founder calendar (Get Selected)

| When | Action |
|------|--------|
| Jul 20–21 | Beta blitz ≥20 [BETA_INVITE.md](../BETA_INVITE.md); phone hero QA; film 60s demo (seed below); open forms |
| Jul 22–23 | Watch BetaAdminPanel; **CDL submit** (may note public launch date) |
| Jul 24–25 | **Founder** `PRIVATE_MODE=false` after Wave A + gates; `SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify`; soft posts |
| Jul 25–27 | Capture honest N; **YC + video** |
| Jul 28–31 | **Elbow Grease** |
| Aug 1–2 | **SPC**; Residency parallel |
| Ongoing | Distribution > features ([ORCHESTRATION.md](../ORCHESTRATION.md)) |

---

## 60s demo + coach adapt seed

| Seconds | Screen | Beat |
|---------|--------|------|
| 0–5 | `/welcome` | Free logger. No account. |
| 5–20 | I-Day → Today | Three minutes to start. |
| 20–40 | `/active` — log a set | Offline works. |
| 40–55 | `/coach` | **Adaptation banner** visible |
| 55–60 | End | missionwinning.com |

**Seed adaptation UI (browser localStorage, no prod mutation):**

```bash
npm run seed-coach-adapt-demo
# Copy the printed snippet into DevTools on missionwinning.com (or localhost), then open /coach
```

Or paste the JSON from the script output into `localStorage` key `mw_coach_plan`. Do **not** flip `PRIVATE_MODE` just to film — use access code if still private.

---

## Pre-flip Wave A checklist (founder sets Vercel; agents don’t)

Full capital + ops tiers: [PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md). Before `PRIVATE_MODE=false`, close thin production layers ([PRODUCTION_STACK.md](PRODUCTION_STACK.md)):

| Check | How |
|-------|-----|
| Upstash rate limits | Production `UPSTASH_REDIS_REST_URL` + `TOKEN`; `SMOKE_BASE_URL=… npm run rate-limit-smoke` sees 429 |
| Sentry | Production `NEXT_PUBLIC_SENTRY_DSN`; one intentional error visible |
| Backup drill | Run [BACKUP_RESTORE.md](BACKUP_RESTORE.md) once |
| Support inbox | `support@` live; knows `/refunds` |
| Launch verify (after flip) | `SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify` |
| Soft launch | [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) · [archive/SOFT_LAUNCH_DAY.md](archive/SOFT_LAUNCH_DAY.md) |

**Spend:** LLC / trademark / counsel / outreach VA — not paid ads ([PRELAUNCH_CAPITAL.md](PRELAUNCH_CAPITAL.md) · [OUTREACH_VA_BRIEF.md](OUTREACH_VA_BRIEF.md)).

Agents: same-day hero-bug fixes only. No feature waves this sprint.

---

## Evidence surfaces (shipped for applications)

| Surface | Use |
|---------|-----|
| Profile → BetaAdminPanel | Screenshot + **Copy proof stats** (real metrics only) |
| `/coach` + Today Coach card | `CoachAdaptBanner` |
| Landing hero | YC one-liner first sentence |
| Answer files | [applications/](applications/) |

---

## Success by Aug 2

1. Public + PWA verify green (founder)  
2. Honest ≥10 activated + launch-week numbers in screenshots  
3. CDL → YC → Elbow Grease → SPC (+ Residency) submitted from answer files  
4. Every claim verifiable — no invented numbers  

Last updated: 2026-07-20
