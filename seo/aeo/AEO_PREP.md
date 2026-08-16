# AEO prep — citation-shaped owned pages (draft)

**Status:** draft 2026-08-13 — not live marketing.  
**PRIVATE_MODE:** ON until the founder flips it. **Do not publish** these pages or Reddit posts until `PRIVATE_MODE=false` + PWA smoke. **Do not run AEO on a gated www.** Do not Preview this as a product ship.

**Wedge only:** free forever offline logger (no account) + Mission Coach from logs (no wearable).  
**Forbidden:** invented traction, user counts, testimonials, invite-only, Feed merch (F-005), Bundle-as-hero (F-016), third-party ARR as ours, America/MAHA, medical hero, **agent-only dark coupons** ("10% extra if you sign up now" that only agents see).

Companion: [FAQ-wedge-answers.md](./FAQ-wedge-answers.md) · [BRIEF-citation-pages.md](./BRIEF-citation-pages.md) · [BRIEF-vs-pages.md](./BRIEF-vs-pages.md) · [LLMS_TXT_SPEC.md](./LLMS_TXT_SPEC.md) · [docs/SOCIAL_LAUNCH.md](../../docs/SOCIAL_LAUNCH.md)

---

## Founder AEO rules (apply everywhere)

### Pages

1. **Comparisons, not praise.** Titles: `Mission Winning vs Strong`, `vs Hevy`, `vs Fitbod`, `vs Boostcamp`. Never "why we're great." Honest tables + intel errata only. No MW traction numbers.
2. **Niche FAQs beat broad topics.** One specific question per page (already [FAQ-wedge-answers.md](./FAQ-wedge-answers.md)). Do not write "ultimate guide to fitness apps."
3. **Open content only.** Do not gate Learn / Substack-style. Medium/Quora-class: public HTML, indexable, no login wall on the citation page.
4. **Own domain is the #2 cited source after public flip.** Vs-pages and FAQs live on missionwinning.com (`/guide/…` existing-path-first), not a Medium splash.
5. **Citation half-life ~3 months.** First honest public page on a phrase compounds in ChatGPT memory. After flip: keep a **phrase spreadsheet**, re-win quarterly.

### Channels

| Channel | Role |
|---------|------|
| **Own site** | FAQ + vs-pages (open). #2 cited source after flip. |
| **Reddit** | ChatGPT citation **only**. Claude/Gemini ignore it. Size threshold: **no tiny subs**. One negative comment can stick for months — no astroturf, no pile-ons. |
| **YouTube** | Titles written as **ChatGPT prompts**. Views don't matter. |
| **X** | **Skip as citation channel** (never cited). |
| **LinkedIn** | **Skip as citation channel** (noise). |

ChatGPT ≈ Bing for this work. Do not treat Claude/Gemini Reddit strategy as ChatGPT strategy.

### Agents

6. **Honest `llms.txt` / agent-readable files** — same product facts humans see. [LLMS_TXT_SPEC.md](./LLMS_TXT_SPEC.md). **Refuse** hidden agent-only offers.
7. **Claude / "AI can sign up by itself":** specified-not-built — an MCP so an agent can **log a set**. Not a chatbot Coach. **Not this PR's product code.**

### Measurement

8. **"Where did you find us?"** at Get notified / signup. Spec in SOCIAL_LAUNCH. **Beta Pilot** owns putting it on the form. Analytics **undercount ChatGPT ~8x** — treat the survey as the correction, not PostHog last-click.

---

## Why not now (gate)

| Constraint | Effect |
|------------|--------|
| `PRIVATE_MODE=true` until founder flip | `/` is a teaser. LLM crawlers will not treat gated www as a public product. |
| Zero organic / zero citations | Honest baseline. Do not invent "we're cited." |
| Free beta copy | Enter with code / Get notified — not invite-only, not "we're live." |

**Prep now. Index + Reddit + vs-pages after flip.**

---

## Surfaces (existing-path-first)

| Surface | AEO job |
|---------|---------|
| `/guide/*` (Content Learn) | FAQ blocks on Ch4 (after ch4-s3) + **vs-pages** as open `/guide/mission-winning-vs-strong` etc. |
| `/exercises/*` | Entity-rich; CTAs to logger |
| `/calculators/*` | Direct-answer tools — already live |
| `/llms.txt` | Honest agent file after flip (spec now) |
| `/compare` | Craft-gated (removed). Do not wait on it — ship vs-pages on `/guide` first. |

`/bundle` is not an AEO surface. No Substack/login wall on citation URLs.

---

## Intel errata (vs-pages — keep honest)

Use these facts; do not invent others:

| Product | Honest free-tier fact |
|---------|------------------------|
| **Strong** | Free = **3 templates**, not locked logs |
| **Hevy** | **Social is free** |
| **Fitbod** | **7-day trial**, not a 3-workout cap |
| **Boostcamp** | **Free logger + free programs** |

Mission contrast stays the wedge: free forever offline logger (no account) + Coach from logs (no wearable). No smear. No "we destroy them."

---

## Phrase spreadsheet (after public)

Columns: phrase · first public URL · last refreshed · ChatGPT cite y/n · Perplexity y/n · notes.  
Refresh **quarterly** (~3 month half-life). First honest page on a phrase matters — don't let a competitor own "offline workout logger no account."

Starter phrases (no traction claims):

- Offline workout tracker that works without an account
- Workout coach from my lift log, not a watch
- Mission Winning vs Strong / Hevy / Fitbod / Boostcamp
- See last session's set while logging
- Calisthenics / park log on a phone with no signal

---

## Specified-not-built: agent log-a-set MCP

**Intent:** Claude (and similar) can sign up / log a set **as the athlete**, via a future MCP — not a chatbot Coach, not hidden coupons.

**This PR does not ship code.** When EIN/public allows product work: one tool that records a set the logger already accepts (exercise, weight, reps, RPE optional), local-first, no wearable. Refuse agent-only pricing. Track as a later Craft/Ops spec, not Growth UI.

---

## Definition of done (prep)

- [x] Strategy + FAQ answers + citation briefs
- [x] Vs-page briefs (comparisons not praise) + intel errata
- [x] `llms.txt` spec (honest; no agent-only offers)
- [x] SOCIAL_LAUNCH: Reddit=ChatGPT only; skip X/LinkedIn citations; YouTube prompt-titles; "Where did you find us?"
- [ ] Content Learn: Ch4 FAQ slot when unparked; vs-pages on `/guide` if they take that slot
- [ ] Beta Pilot: "Where did you find us?" on Get notified
- [ ] Craft: pages + `llms.txt` **after** public flip — no Preview of this docs PR as a product ship

## Explicit non-goals

- Agent-only dark coupons
- Fake Reddit / pile-ons / tiny-sub spam
- Running AEO on gated www
- New hire / AEO agency
- Phase B publish
- Any Preview for this docs work
- Measuring citation share with invented numbers
