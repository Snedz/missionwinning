# Google Flow / Imagine prompt pack — Mission Winning

**Studio:** [Google Flow](https://labs.google/fx/tools/flow) · **Playbook:** [docs/MEDIA_SYSTEM.md](../docs/MEDIA_SYSTEM.md)  
**Spend:** Free tier ≈ **50 credits/day** → prefer **Veo 3.1 Lite (~10 credits)** = up to **5 clips**. Skip Quality (100).  
**Ship:** Download → `media/inbox/` → `npm run media:optimize-inbox`.

Always prepend the **brand block** from [MEDIA_SYSTEM](../docs/MEDIA_SYSTEM.md#brand-ai-prompt-block-raster--video-learn--art--social) — paper `#f3f2f2`, ink `#201e1d`, one accent `#ec3013`.

> **`.259`** — this file used to name the pre-`.131` palette (dark ground + cool accents), and every
> prompt inherited it. The six off-palette guidebook heroes `.258` measured were this file working as
> written. **`.268`** re-inked those heroes as paper/ink diagrams
> (`scripts/generate-guidebook-heroes.mjs`) — do not regenerate them as dark AI stills. Colour values
> live in `src/index.css`; `src/lib/mediaPaletteTruth.test.ts` and `guidebookHeroPalette.test.ts`
> enforce the rule.

---

## Today’s priority queue (spend order)

**Mascot day (prefer when Scout kit is thin):**

1. `mascot-scout-idle` — turnaround / default  
2. `mascot-scout-invite` — empty + social invite  
3. `mascot-scout-celebrate` — Victory  
4. `social-scout-loop` — 4–6s Lite motion (optional)  

**Learn / social day (when mascot kit is shipped):**

1. `social-invite` — invite / beta DM motion or still frame  
2. `social-coach` — Coach / plan atmosphere  
3. `learn-human-performance` — Ch1 hero frame  
4. `learn-movement-mechanics` — Ch2 hero frame  
5. `learn-programming-tuning` — Ch3 hero frame  

Stop at 5 Lite gens or when credits run out. Unused credits do not roll over.

---

## Google Flow — Create Character (Characters tab)

**Project:** [Flow Characters](https://labs.google/fx/tools/flow/project/a40c42fd-16e2-49e5-8de5-a8dceb717c7e/characters)  
**Bible:** [docs/MASCOT.md](../docs/MASCOT.md)

### Setup steps

1. Open Characters → **New Character**.  
2. **Name:** `Scout` (exact — you will `@Scout` in later prompts).  
3. Paste **Character creation prompt** below (appearance lock).  
4. Optional but strong: upload `/brand/mascot/scout-idle.webp` (or inbox frame) as a reference ingredient — plain paper background, subject only.  
5. Generate second angle when Flow offers body/outfit fields — paste **Secondary angle** block.  
6. Fill **Character info** (personality) with the block below — guides Agent / mannerisms.  
7. Voice (optional): calm, medium pitch, steady briefing pace — “clear, unhurried, respectful; no shouty coach energy.”  
8. Save. Later scenes: `@Scout` + a short action prompt from § Scene prompts.

### Character creation prompt (paste into New Character)

```
Create a reusable brand mascot character named Scout for Mission Winning.

SPECIES / SILHOUETTE
- Small stylized geometric falcon / kestrel (mission-scout energy).
- NOT an owl. NOT Duolingo green. NOT a photoreal bird. NOT a human in a costume.
- Compact body, readable at tiny UI sizes: big head-to-body ratio like a product icon, but still clearly a bird of prey.
- Clean silhouette: pointed beak, short hooked tip, alert round head, folded wings that form a chevron shape when idle.

STYLE (LOCK HARD)
- Flat 2D vector / geometric product-mascot art.
- Few hard-edged shapes, subtle facet planes — like a premium app icon character, not Pixar soft 3D, not watercolor, not anime chibi with huge watery eyes.
- Crisp near-white edge lines (#201e1d) on dark forms.
- Consistent line weight; no sketchy strokes; no texture noise; no fur/feather photoreal detail.

COLOR PALETTE (ONLY THESE)
- Body / primary fill: paper #f3f2f2 and slightly lifted paper #ebeaea for facets.
- Edge / secondary: near-white #201e1d.
- Action accent: vermillion red #ec3013 (eye highlight, thin wing trim, soft rim).
- Honor mark: mid grey #6f6b69 — a small chevron on the chest (always present) and optional beak tip tint.
- Forbidden: purple, violet, neon cyan, cream, terracotta, pure cartoon green, gold glitter spam.

SIGNATURE DETAILS (MUST APPEAR EVERY TIME)
1. Mid grey chest chevron (two short strokes forming a V / rank mark).
2. Single vermillion red eye highlight (calm, focused — never angry or crying).
3. Short pointed beak with subtle mid grey tip.
4. Wing leading edge that can read as a folded chevron when arms/wings are down.

DEFAULT POSE FOR REFERENCE SHEET
- Three-quarter front view, centered, standing / perched upright.
- Neutral “mission briefing” attention — calm competence, slight forward lean of curiosity.
- Wings mostly folded; one tip slightly lifted is OK for life, not a frantic wave.
- Solid paper #f3f2f2 background, no props, no ground plane clutter, no text, no logos, no MW letters.

PERSONALITY EXPRESSION (FACE / BODY LANGUAGE ONLY — NO TEXT)
- Calm, brief, respectful. Celebrates quietly. Never shame, never guilt, never sad-puppy eyes.
- Mouth/beak: closed or tiny confident set — not shouting.

NEGATIVE CONSTRAINTS
- No readable text, letters, watermarks, UI chrome, or logos.
- No photoreal feathers, no taxidermy look, no blood, no weapons.
- No gym-bro anthropomorphic muscle bird, no tears, no angry eyebrows.
- No second character in frame. No busy environment behind Scout for the reference sheet.
```

### Character info (personality field)

```
Scout is Mission Winning’s mission-briefing companion. Speaks and moves with calm competence:
clear, brief, respectful of time. Celebrates completed work (“set locked”) more than it nags
absence. Never shames missed days; maximum softness is “mission still open when you’re ready.”
Dry wit allowed; guilt, streak harassment, and paywall shame are forbidden. Scout is not the
AI Coach — Scout is a silent/visual companion for invites, empty states, and victory moments.
```

### Secondary angle / body lock (when Flow asks)

```
Same Scout character: geometric falcon/kestrel, identical proportions and colors
(paper #f3f2f2, vermillion red #ec3013, mid grey chest chevron #6f6b69). Full-body / profile
turn: left profile and slight back-¾ so wing chevron and chest mark stay visible.
Flat 2D product-mascot style. Solid paper background. No text, no logos, no outfit
changes — Scout has no clothing; markings are the “uniform.”
```

### Scene prompts (after character is saved — use `@Scout`)

**Idle / turnaround still**

```
@Scout centered on solid paper #f3f2f2, neutral briefing pose, mid grey chest chevron visible,
vermillion red eye highlight, flat geometric style. No text, no logos.
```

**Invite**

```
@Scout on paper #f3f2f2, calm invite: one wing slightly open as a beckon, friendly but not
desperate, mid grey chevron + the one red accents. No text, no logos, no guilt expression.
```

**Celebrate (Victory)**

```
@Scout on paper #f3f2f2, quiet victory: subtle lift, mid grey chevron gleams, vermillion red rim light.
Celebrate “set locked” energy without fireworks spam. No text, no logos.
```

**Social loop (Veo Lite 4–6s)**

```
@Scout on paper field, subtle nod and mid grey chevron flash, loopable micro-motion,
clinical calm. Flat geometric mascot style. No text, no logos, no photoreal.
```

**Export naming:** `mascot-scout-idle-frame.png` · `mascot-scout-invite-frame.png` · `mascot-scout-celebrate-frame.png` → `npm run media:optimize-inbox`

---

## Mascot queue — Scout (short prompts if character already exists)

If `@Scout` is saved, prefer the Scene prompts above. Legacy one-shot prompts (no Characters tab):

### Prompt: mascot-scout-idle (`promptId: flow-mascot-idle`)

**Still preferred** (Imagine / GenerateImage 1:1) or Lite 4s → best frame.

```
Mission Winning brand mascot Scout. Small geometric falcon/kestrel character,
flat 2D shapes, paper body #f3f2f2, near-white edge lines #201e1d, the one red accent
#ec3013, mid-grey detail chevron #6f6b69 on chest or eye. Neutral attention pose,
calm competence, mission briefing companion. Centered on paper ground.
No text, no logos, no photoreal feathers, no purple, no cute crying face.
Readable silhouette for app empty states.
```

**Export:** `media/inbox/mascot-scout-idle-frame.png` → `public/brand/mascot/scout-idle.webp`

### Prompt: mascot-scout-invite (`promptId: flow-mascot-invite`)

```
Mission Winning brand mascot Scout. Same geometric falcon/kestrel as idle —
identical proportions. Invite pose: one wing slightly open as a beckon, calm
friendly attention, the one red accent #ec3013, mid grey chevron #6f6b69. Paper canvas
#f3f2f2. Not desperate, not guilt-tripping. No text, no logos, no photoreal.
```

**Export:** `media/inbox/mascot-scout-invite-frame.png` → `public/brand/mascot/scout-invite.webp`

### Prompt: mascot-scout-celebrate (`promptId: flow-mascot-celebrate`)

```
Mission Winning brand mascot Scout. Same geometric falcon/kestrel — identical
proportions. Celebrate pose: subtle lift / mid-grey detail flash #6f6b69, vermillion red
rim #ec3013, victory without fireworks spam. Paper canvas #f3f2f2. “Set locked”
energy. No text, no logos, no photoreal, no streak-shame expression.
```

**Export:** `media/inbox/mascot-scout-celebrate-frame.png` → `public/brand/mascot/scout-celebrate.webp`

### Prompt: social-scout-loop (`promptId: flow-social-scout-loop`)

**Model:** Veo 3.1 Lite · 4–6s · 1:1 or 9:16

```
Mission Winning brand mascot Scout. Geometric falcon/kestrel, flat paper/vermillion red/mid grey,
subtle nod and mid grey chevron flash on paper field. Loopable micro-motion,
clinical calm. No text, no logos, no photoreal.
```

**Export:** `media/inbox/social-scout-loop-raw.mp4` (+ optional `social-scout-loop-frame.png`)

---

## Prompt: social-invite (`promptId: flow-social-invite`)

**Aspect:** vertical 9:16 (Stories) or square 1:1 — generate vertical; crop later if needed.  
**Model:** Veo 3.1 Lite · 4–6s · no dialogue

```
Mission Winning brand imagery. Paper ground #f3f2f2, the one red accent #ec3013,
mid-grey detail #6f6b69. Clinical athletic clarity — not gym-bro hype, not medical.
Slow cinematic push into an empty park at dawn: chalk lines on asphalt, a single
kettlebell silhouette, soft vermillion red rim light, mid grey dust motes. Train-anywhere
mood, calm competence. No people faces, no logos, no text, no purple glow,
no cream terracotta look. Subtle camera drift only.
```

**Export:** `media/inbox/social-invite-raw.mp4` + best frame `social-invite-frame.png`

---

## Prompt: social-coach (`promptId: flow-social-coach`)

**Model:** Veo 3.1 Lite · 4–6s

```
Mission Winning brand imagery. Paper ground #f3f2f2, vermillion red #ec3013, mid grey #6f6b69.
Abstract mission-briefing atmosphere: faint grid like a weekly plan, soft vermillion red
arcs suggesting progressive load, mid-grey detail marks. Clinical telemetry mood —
not gamification fireworks. No readable text, no logos, no faces, no gym-bro,
no medical charts. Slow orbit of light across the field.
```

**Export:** `media/inbox/social-coach-raw.mp4` + `social-coach-frame.png`

---

## Prompt: learn-human-performance (`promptId: flow-learn-ch1`)

**Model:** Veo 3.1 Lite · 4s · pick best still for chapter hero

```
Mission Winning brand imagery. Paper ground #f3f2f2, vermillion red #ec3013, mid grey #6f6b69.
Abstract human performance / adaptation: soft topographic energy field, faint
athlete silhouette dissolving into geometric muscle-fiber suggestions, clinical
and calm. Chapter opener for performance science — not medical, not depression.
No text, no logos, no purple.
```

**Export:** `media/inbox/learn-human-performance-frame.png` → ships as `public/learn/human-performance-hero.webp`

---

## Prompt: learn-movement-mechanics (`promptId: flow-learn-ch2`)

```
Mission Winning brand imagery. Paper ground #f3f2f2, vermillion red #ec3013, mid grey #6f6b69.
Abstract movement mechanics: elegant line-figure geometry implying squat and hinge
patterns, vermillion red motion arcs, mid grey joint points. Clinical briefing mood.
No photoreal gym, no faces, no text, no logos.
```

**Export:** `media/inbox/learn-movement-mechanics-frame.png`

---

## Prompt: learn-programming-tuning (`promptId: flow-learn-ch3`)

```
Mission Winning brand imagery. Paper ground #f3f2f2, vermillion red #ec3013, mid grey #6f6b69.
Abstract progressive overload: ascending waveform or stepped light bars in vermillion red,
mid grey markers for deload. Periodization atmosphere without charts or numbers.
No text, no logos, no purple.
```

**Export:** `media/inbox/learn-programming-tuning-frame.png`

---

## Backup stills (Grok Imagine / Cursor GenerateImage)

If you need a still without burning video credits, paste the same body text into Grok Imagine or Cursor GenerateImage at **16:9** (Learn) or **1:1** / **9:16** (social). Drop PNG into `media/inbox/` with the same naming.

---

## After export checklist

- [ ] Files in `media/inbox/` named as above  
- [ ] `npm run media:optimize-inbox`  
- [ ] Visual QA on paper UI  
- [ ] Manifest `notes` mention `Google Flow Veo Lite` (or Imagine)  
- [ ] Commit optimized `public/` only — not raw multi‑MB MP4s  
