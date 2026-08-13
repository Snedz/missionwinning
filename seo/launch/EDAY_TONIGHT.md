# ⛔ E-DAY TONIGHT — CHECKLIST (NOT A FLIP)

```
████████████████████████████████████████████████████████████████
█  DRAFT OPS — AGENTS DO NOT FLIP PRIVATE_MODE                 █
█  DRAFT COPY — DO NOT POST until founder go after prod gate   █
█  E-Day: Thu 13 Aug 2026, day's end Eastern Time — not Friday █
█  No production deploy from this docs PR. No Xbox / console IP█
████████████████████████████████████████████████████████████████
```

**When:** Thursday **13 August 2026**, day's end **ET** (America/New_York). Not Friday.  
**What this file is:** founder-facing sequence for tonight.  
**What this file is not:** a `PRIVATE_MODE` change, a production ship, or permission to post.

Social drafts for review: [SOCIAL_DRAFTS.md](./SOCIAL_DRAFTS.md).  
Broader paste kits (PH / HN / waitlist): [PHASE_B_DRAFT_KIT.md](./PHASE_B_DRAFT_KIT.md) — still **do not publish** from this PR.  
Flip mechanics (founder-owned): [docs/LAUNCH_RUNBOOK.md](../../docs/LAUNCH_RUNBOOK.md) §5.

---

## Sequence analog (internal — not a tweet)

Studios often open a **multiplayer beta so people actually play**, then they launch. Same beat tonight:

1. **Preview review** — real use of the candidate (playtest).
2. **Founder last changes** — what the playtest showed.
3. **Production `PRIVATE_MODE` off** — launch, founder only.

Do **not** name, quote, or depict any console, publisher, or game franchise in this checklist’s public posts or assets. The analog is the *sequence*, not a licensed title.

---

## Honesty for tonight

| True | Not true / not yet |
|------|-------------------|
| Logger is **free forever**. No account to start. | Invite-only / get-an-invite / private beta |
| Train + Mission Coach from **logs** (no wearable) | “We’re live” as a finished, paid product |
| After the gate is off: **open beta** (anyone can start) | Invented users, ranks, “trending,” testimonials |
| Super Bundle: **Get notified** until Stripe checkout is actually open | Bundle / checkout as the hero; MAGA / America / MAHA hero |
| Civilization / consciousness / stars | **About page**, not the tweet |

F-008 banned “open beta” **while `/` still sends people to `/private`**. After production `PRIVATE_MODE=false`, [FREE_BETA.md](../../docs/FREE_BETA.md)’s frame is the honest line: open beta, full tools free while we grow; logger stays free forever. **Do not post the drafts while the teaser gate is still the homepage.**

Agents **never** flip `PRIVATE_MODE`, never post, never send the waitlist blast, never invent traction, never tick founder boxes.

---

## 1) Preview review (playtest)

Candidate = Vercel **Preview** of what you intend to ship (or local `npm run dev` if Preview is skipped). Walk it on a phone.

- [ ] I-Day → Today → **log one set** on Train (`/active`) → Victory or Today still makes sense
- [ ] Mission Coach path from **logs** (generate / week view) — no wearable required in copy or UI
- [ ] Free logger is not behind an account wall to start
- [ ] Super Bundle / checkout is muted or **Get notified** — not a paywall on the logger (free-first until Stripe)
- [ ] No invite-only voice on the surfaces you will screenshot
- [ ] Note the **#1 friction** (one line). Last changes target that — not a new pillar.

Still gated on production until step 3: `/` → `/private` is expected **on www** until you flip. Preview may differ; say which URL you reviewed.

---

## 2) Founder last changes

- [ ] Fix or accept the #1 friction from Preview
- [ ] Re-read [SOCIAL_DRAFTS.md](./SOCIAL_DRAFTS.md) — edit in-file or paste a rewrite; **do not post yet**
- [ ] Civilization / stars / Team Humanity stays **off** the tweets (About only)
- [ ] No MAGA, no America/MAHA hero, no medical-cure claims
- [ ] Waitlist **email** stays blocked until `MAIL_POSTAL_ADDRESS` is set ([LAUNCH_RUNBOOK](../../docs/LAUNCH_RUNBOOK.md) §2) — tonight’s X/IG drafts do not depend on mail
- [ ] Agents do not promote this docs branch to production and do not touch Vercel Production env

---

## 3) Production `PRIVATE_MODE` off (founder only)

Do this **after** Preview + last changes. Not this PR. Not an agent.

1. Vercel → Production env → `PRIVATE_MODE=false` → **redeploy** (runbook §5).
2. Confirm the public site is the product, not the teaser:

```bash
curl -sI https://www.missionwinning.com/ | grep -i location
# After flip: should NOT 307 the whole app to /private
```

3. Install PWA from **www** → airplane mode → log a set. Coach still reachable from logs.
4. **Then** (and only then) review [SOCIAL_DRAFTS.md](./SOCIAL_DRAFTS.md) and post if you still want to.

Post-flip smoke (optional, same night): [LAUNCH_RUNBOOK](../../docs/LAUNCH_RUNBOOK.md) §5 `SMOKE_ALLOW_PUBLIC=true` / `SMOKE_EXPECT_PWA=true`.

- [ ] Founder flipped Production `PRIVATE_MODE` (not an agent)
- [ ] www is the logger, not `/private` as the only door
- [ ] PWA install + offline log checked on a real phone
- [ ] Social: posted **or** held — founder decision; drafts are not a schedule

---

## Out of scope for tonight unless you expand it

| Item | Home |
|------|------|
| Product Hunt / Show HN / Reddit kits | [PHASE_B_DRAFT_KIT.md](./PHASE_B_DRAFT_KIT.md) |
| Waitlist broadcast | SOCIAL_LAUNCH Phase B — **dry-run only** until you send; needs postal address |
| EIN / live Stripe / Bundle checkout | [FREE_BETA.md](../../docs/FREE_BETA.md) · runbook §4 — **Get notified** until then |
| GitHub Public / `PRIVATE_MODE` in git | Founder; this PR does not |

---

## After-send (if you post)

- Record real timestamps in founder ops (not in this SEO folder).
- Do not backfill invented impressions, followers, or “launch day numbers” into docs.
- Organic baseline after the flip is a measurement problem — not a claim in the caption.
