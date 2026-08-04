# Grok Imagine — assemble session pack

**Studio:** [grok.com/imagine](https://grok.com/imagine) (or Grok app → Imagine)  
**Playbook:** [docs/MEDIA_SYSTEM.md](../docs/MEDIA_SYSTEM.md) · **Flow twin pack:** [FLOW_PROMPTS.md](FLOW_PROMPTS.md)  
**Ship path:** export → `media/inbox/` (names below) → `npm run media:optimize-inbox` → QA → PR

This file is the **founder paste sheet**. Do not invent a second media system.  
**Form guides stay SVG** — see Sprint C only for pose *refs*, never ship photoreal as Train form.

---

## Brand block (prepend every prompt)

Copy this first, then the job body:

```
Mission Winning brand imagery. Modernist poster: paper ground #f3f2f2, ink #201e1d,
and exactly one accent — vermillion red #ec3013, used sparingly. Flat printed
surfaces, hard geometric edges, square corners, generous negative space. No
gradients, no glow, no drop shadows, no dark backgrounds, no second accent hue.
Clinical athletic clarity — not gym-bro hype, not medical.
No logos invented; no competitor blue/violet identity; no cream/terracotta editorial look.
Atmosphere: mission briefing, train-anywhere athlete, calm competence.
Decorative or marketing only — not instructional form diagrams (those are SVG stick figures).
No text in the image unless explicitly requested. No crisis or clinical depression framing.
No readable UI chrome, no fake app screenshots unless asked.
```

### Global negatives (append if the model drifts)

```
No purple, teal, navy gradient skies, neon, gold glitter, photoreal sweaty gym-bros,
readable watermarks, stock “fitness influencer” faces, medical cross icons, blood.
```

---

## Founder session checklist (30 min)

1. Open [grok.com/imagine](https://grok.com/imagine).
2. Run **Sprint A** jobs in order (or stop after 5 gens).
3. For each: paste **brand block + job body** · set aspect · generate 2–4 variants · pick winner.
4. Export PNG (or MP4 for Sprint B) into `media/inbox/` with the **exact filename** listed.
5. Tell agent / run:

```bash
npm run media:optimize-inbox
```

6. Visual QA on paper UI · update `media/manifest.json` notes: `Grok Imagine YYYY-MM-DD` · PR winners only.

---

## Sprint A — stills (do these first)

| # | Job | Aspect | Inbox filename | Ships to |
|---|-----|--------|----------------|----------|
| 1 | Social invite | **1:1** | `social-invite-frame.png` | `public/social/invite.webp` (or keep slug `invite` after optimize) |
| 2 | Social coach | **1:1** | `social-coach-frame.png` | `public/social/coach.webp` |
| 3 | Scout idle | **1:1** | `mascot-scout-idle-frame.png` | `public/brand/mascot/scout-idle.webp` |
| 4 | Scout invite | **1:1** | `mascot-scout-invite-frame.png` | `public/brand/mascot/scout-invite.webp` |
| 5 | Scout celebrate | **1:1** | `mascot-scout-celebrate-frame.png` | `public/brand/mascot/scout-celebrate.webp` |

> **optimize-inbox** maps `social-{id}-frame` → `public/social/{id}.webp`.  
> Use ids `invite` and `coach` if you want paths `invite.webp` / `coach.webp`.  
> Current product files include `invite-square.webp` and `coach-story.webp` — either  
> (a) export as `social-invite-square-frame.png` / `social-coach-story-frame.png` to replace in place, or  
> (b) ship new ids and wire paths in a follow-up PR.

**Recommended replace-in-place names (match existing product files):**

| Job | Inbox name | Overwrites |
|-----|------------|------------|
| Invite still | `social-invite-square-frame.png` | `public/social/invite-square.webp` |
| Coach still | `social-coach-story-frame.png` | `public/social/coach-story.webp` |

### A1 — Social invite (`promptId: grok-social-invite`)

**Aspect:** 1:1 (or 9:16 if Stories-first)

```
[BRAND BLOCK]

Empty outdoor training spot at soft dawn on paper-colored ground. Chalk marks on
asphalt, one kettlebell silhouette, thin vermillion red rim light #ec3013, mid-grey
dust #6f6b69. Train-anywhere mood, calm competence. No people faces, no logos,
no text, no purple glow. Square composition for invite / beta DM.
```

**Export:** `media/inbox/social-invite-square-frame.png`

### A2 — Social coach (`promptId: grok-social-coach`)

**Aspect:** 1:1

```
[BRAND BLOCK]

Abstract mission-briefing field on paper ground: faint weekly-plan grid, soft
vermillion red arcs suggesting progressive load, mid-grey detail marks. Clinical
telemetry mood — not gamification fireworks. No readable text, no logos, no faces,
no gym-bro, no medical charts. Square composition for Coach / plan story.
```

**Export:** `media/inbox/social-coach-story-frame.png`

### A3 — Scout idle (`promptId: grok-mascot-idle`)

**Aspect:** 1:1 · see [docs/MASCOT.md](../docs/MASCOT.md)

```
[BRAND BLOCK]

Mission Winning brand mascot Scout. Small geometric falcon/kestrel character,
flat 2D shapes, paper body #f3f2f2, ink edge lines #201e1d, the one red accent
#ec3013, mid-grey chest chevron #6f6b69. Neutral attention pose, calm competence,
mission briefing companion. Centered on solid paper ground. No text, no logos,
no photoreal feathers, no purple, no cute crying face. Readable silhouette for
app empty states. Three-quarter front view.
```

**Export:** `media/inbox/mascot-scout-idle-frame.png`

### A4 — Scout invite (`promptId: grok-mascot-invite`)

**Aspect:** 1:1

```
[BRAND BLOCK]

Mission Winning brand mascot Scout. Same geometric falcon/kestrel as idle —
identical proportions. Invite pose: one wing slightly open as a beckon, calm
friendly attention, vermillion red #ec3013, mid grey chevron #6f6b69. Paper
canvas #f3f2f2. Not desperate, not guilt-tripping. No text, no logos, no photoreal.
```

**Export:** `media/inbox/mascot-scout-invite-frame.png`

### A5 — Scout celebrate (`promptId: grok-mascot-celebrate`)

**Aspect:** 1:1

```
[BRAND BLOCK]

Mission Winning brand mascot Scout. Same geometric falcon/kestrel — identical
proportions. Celebrate pose: subtle lift, mid-grey detail flash #6f6b69, vermillion
red rim #ec3013, victory without fireworks spam. Paper canvas #f3f2f2. “Set locked”
energy. No text, no logos, no photoreal, no streak-shame expression.
```

**Export:** `media/inbox/mascot-scout-celebrate-frame.png`

---

## Sprint B — short video (after stills approved)

| # | Job | Aspect | Length | Inbox |
|---|-----|--------|--------|-------|
| 1 | Scout loop | 1:1 or 9:16 | 6s | `social-scout-loop-raw.mp4` + optional `-frame.png` |
| 2 | Invite motion | 9:16 | 6s | `social-invite-raw.mp4` + `social-invite-frame.png` |
| 3 | Coach motion | 1:1 | 6s | `social-coach-raw.mp4` + `social-coach-story-frame.png` |

**Ship policy:** Prefer **best frame still** first. Do not commit multi-MB raw MP4s. WebM product wiring is optional follow-up.

### B1 — Scout loop (`promptId: grok-social-scout-loop`)

```
[BRAND BLOCK]

Mission Winning brand mascot Scout. Geometric falcon/kestrel, flat paper / vermillion
red / mid grey, subtle nod and mid-grey chevron flash on paper field. Loopable
micro-motion, clinical calm. No text, no logos, no photoreal. 6 second loop.
```

### B2 / B3

Reuse A1 / A2 bodies with: `Slow subtle camera drift only. 6 second loopable motion.`

---

## Sprint C — Form Index (Form Director system)

**Do not use two-line soft prompts.** Soft prompts shipped head crops, wrong patterns, and bar-through-body loops.

**Source of truth:** [media/form-kit/FORM_DIRECTOR.md](form-kit/FORM_DIRECTOR.md)  
Seedance/Higgsfield-class labeled director sheets: SCENE · OPTICS · CAMERA LOCK · PHYSICS · MARGINS · POSITIVE LOCKS · NEGATIVES.

| Path | Role |
|------|------|
| `media/form-kit/FORM_DIRECTOR.md` | System bible + templates |
| `media/form-kit/prompts/still-*.md` | Per-exercise still sheets |
| `media/form-kit/prompts/loop-*.md` | Per-exercise loop sheets (after still PASS) |
| `media/form-kit/qa/FAIL.md` | Reject log |
| `media/form-kit/refs/` | Athlete / prop / location kit |

### Rules (quality reset `.467`)

1. **Still PASS** (vision QA) before any I2V.  
2. **Still-only is valid** — empty `FORM_PACK_VIDEO_IDS` until loops pass physics.  
3. **One exercise per gen**; map by content, not batch order.  
4. Hard reject: cropped/missing head, wrong exercise, equipment through body, hyper-crop.  
5. Export: `form-{id}-side-frame.png` → `npm run media:optimize-inbox` → wire ids only after PASS.

### Soft form block (retired)

The short “full body / face not hero” block is **retired**. It caused headless crops and wrong patterns. Use Form Director templates only.

---

## Explicit do-not-generate list

| Asset | Why |
|-------|-----|
| `public/photo/*` | Documentary grayscale photography only |
| Learn heroes as dark cinematic stills | Failed palette QA (`.258`/`.268`); paper diagrams ship |
| CrossFit.com / CF YouTube embeds as form | IP + offline fail |
| Purple / teal / navy AI “premium” looks | Off brand |
| Dutch / noir / kaiju as form default | Social only — not mid-set teaching |

---

## After export (agent)

```bash
# 1. Confirm names
ls -la media/inbox/*frame* media/inbox/*raw* 2>/dev/null

# 2. Optimize stills
npm run media:optimize-inbox

# 3. Eyes on output
# public/social/*.webp · public/brand/mascot/scout-*.webp

# 4. Manifest notes example
# "notes": "Grok Imagine 2026-08-04 · promptId grok-social-invite"

# 5. PR: optimized public/ + manifest only — not raw multi-MB files
```

### Visual QA (pass before ship)

- [ ] Paper ground reads next to Archivo / ink UI  
- [ ] One red only; no second accent  
- [ ] No fake text / logos  
- [ ] Scout: geometric bird, chest chevron, calm eye  
- [ ] Works at ~390px width  
- [ ] Founder OK → `status: shipped`  

---

## Optional deep links

Build a URL by URL-encoding **brand block + job body** (no line-break loss):

```
https://grok.com/imagine?prompt=<encodeURIComponent(fullPrompt)>
```

Agent helper (optional later): `node scripts/print-grok-prompt.mjs grok-social-invite`

---

## Relation to Google Flow

| Need | Prefer |
|------|--------|
| Stills while in Grok already | **Grok Imagine** (this file) |
| Free daily video credits | Google Flow Veo Lite ([FLOW_PROMPTS.md](FLOW_PROMPTS.md)) |
| Scout character lock | Flow Characters tab + MASCOT.md, or Imagine with strict paste |

Same inbox, same optimize, same manifest.
