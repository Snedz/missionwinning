# Grok Imagine — the www photography pack

**Surface:** `design_handoff_www_static` · **Spec:** [DESIGN_PROPOSAL_WWW.md](../DESIGN_PROPOSAL_WWW.md) · **Why these sizes:** [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) §11.2–11.5

Twelve slots. Run them on **grok.com** (SuperGrok, Grok Imagine → **Quality Mode**), download, drop the files at the paths below, and `npm run www:build`.

This is a **thread script, not a list.** Run it top to bottom in one chat. The order is load-bearing — see *How consistency actually works* below.

---

## Why this is a handoff and not a script that runs itself

Grok Imagine Image 2.0 shipped 2026-08-07 and **xAI has no public API for it yet**. Third-party routers (Replicate, OpenRouter, fal, Atlas, Runware) do list it, but that is moot here: `api.x.ai`, `api.replicate.com`, `replicate.delivery`, `openrouter.ai`, `fal.media` and `queue.fal.run` are all `CONNECT_FAIL` through this environment's egress proxy, verified. **No agent in this repo can fetch a generated image.** The files have to come down through a browser and be added.

## How consistency actually works here

**Image 2.0 has no seed parameter.** Nothing locks a look between runs. Two things do:

1. **Multi-reference.** Upload 2–5 approved frames as visual anchors. Reported consistency is roughly 92% with references against 28% for text-only prompts.
2. **Thread continuity.** Keep one chat open and refer back to what it already made. A fresh thread per shot is how a set ends up looking like twelve different photographers.

So: **shot 01 sets the grade.** Generate it, pick the frame, and from shot 02 onward attach 01 (and later 02–03) as references with the line *"match the film grade, contrast and grain of the attached frames exactly."* If 01 comes out wrong, regenerate 01 — do not proceed and hope the set converges.

## Settings for every shot

| | |
|---|---|
| Mode | **Quality** |
| Resolution | **2K** (2048px long edge) |
| Format | **WebP** (PNG is fine; convert on the way in) |
| Variants | 4 per prompt, then pick one |
| Aspect ratio | **per slot below** — Image 2.0 supports 1:1 · 16:9 · 9:16 · 4:3 · 3:4 · 3:2 · 2:3 · 2:1 · 1:2 · 19.5:9 · 9:19.5 · 20:9 · 9:20 · auto |

## The house style block

Paste this at the end of **every** prompt, unchanged. Camera language, not adjectives — that is what the model responds to.

> Shot on Ilford HP5 Plus pushed to 1600, 35mm, f/4, black and white, heavy visible grain, rich tonal range with true blacks and clean blown highlights, strong directional natural light sculpting deep shadows, documentary reportage, unposed and candid, no text, no lettering, no logos, no branding, no watermark, gritty and real, not glossy commercial stock photography.

## Three rules the prompts must not break

- **No physique display.** No shirtless torsos, no abs, no before/after, no mirror poses. Body-composition proof is a positioning this product has explicitly refused ([brand-guidelines](../brand-guidelines.md) § Voice), and Wave 10 §10.6 lists Freeletics' transformation grid under *Avoid*. Shoot hands, gear, environment, motion — not bodies as evidence.
- **No branded equipment and no readable text.** A legible logo is a trademark problem and a legible word is usually a garbled one.
- **Train-anywhere, not gym-glamour.** Garage, hallway, hotel room, driveway, stairwell, balcony, park. If it looks like a commercial gym with racked lighting, it is the wrong picture.

---

## The twelve slots

Destination is `sites/www/public/photo/<name>.webp`. Anything missing renders an honest captioned empty frame — never a stock stand-in, the same call `GrayscalePhoto` makes in the app.

### Tier 1 — the three that are wrong today

The current page uses three 900×1125 **portrait** photographs, two of them cropped into 1440-wide landscape bands where they are upscaled and soft. These three fix that and are the whole reason this pack is urgent.

**01 · `hero-rack` · 20:9 · the homepage hero ground**
*Generate first. This frame sets the grade for the other eleven.*

> A single athlete mid-squat under a loaded barbell in a bare concrete garage, seen from a low camera angle, a hard shaft of daylight from a half-open roller door cutting across the frame with dust suspended in the beam, everything outside the light falling into deep shadow, wide empty space on the left of the frame. [house style block]

*Composition note: the headline sits over the left half, so keep the left third quiet.*

**02 · `statement-grip` · 2:1 · the statement band**

> Extreme close-up of a bare forearm and hand gripping a knurled steel barbell, no watch and no wristband on the bare wrist, chalk on the skin, raised veins and tendons, hard directional light from the left, the background falling away into black. [house style block]

**03 · `close-doorway` · 2:1 · reserved for the red close / future statement**

> Hands lacing a worn training shoe, seated in an open doorway at dawn, tiled hallway floor, bright threshold light spilling in from outside and blowing out the background to pure white. [house style block]

### Tier 2 — the three-panel band (`#anywhere`)

All three are **3:4**, full-height panels with a caption slab over the lower edge — so keep the bottom quarter of each frame simple.

**04 · `panel-offline` · 3:4 · "Offline first"**

> A phone lying face-up on a worn vinyl gym bench between sets, sweat marks on the vinyl, chalk dust along the edge, shallow depth of field, hard raking light from one side, the room behind in darkness. [house style block]

**05 · `panel-gear` · 3:4 · "Your gear, not a gym"**

> A loaded barbell resting on a cracked concrete driveway at dawn, long raking shadows stretching across the ground, the corner of a suburban house and a wheelie bin at the frame edge, empty street beyond. [house style block]

**06 · `panel-nowearable` · 3:4 · "No wearable"**

> A bare wrist and forearm reaching up to chalk-dusted fingers on a pull-up bar, no watch and no band of any kind on the wrist, seen from below against a bright overcast sky. [house style block]

### Tier 3 — `/start` and the rooms the copy already claims

**07 · `start-hotel` · 9:16 · the `/start` landing page ground (compact-first)**

> A person holding a push-up position on the carpet of a small hotel room at night, seen from the side at floor level, an open suitcase and an unmade bed behind them, a single warm lamp as the only light source, deep shadow filling the upper half of the frame. [house style block]

**08 · `start-hotel-wide` · 16:9 · the same room, for `/start` at desktop**

> Same hotel room and same lamp, wider framing from the corner of the room, the figure small in the frame and the empty carpet dominant. [house style block] Match the film grade, contrast and grain of the attached frames exactly.

**09 · `room-stairwell` · 3:2**

> A bare concrete stairwell shot from below, a runner taking the steps two at a time with visible motion blur in the legs, harsh overhead strip lighting, painted handrail, institutional emptiness. [house style block]

**10 · `room-balcony` · 3:4**

> A single kettlebell standing on the concrete floor of a narrow apartment balcony, rain beading on the metal railing, wet city rooftops and television aerials beyond, flat overcast sky. [house style block]

### Tier 4 — the two the copy needs and no photograph covers

**11 · `missed-day` · 4:3 · the "a missed day is not a failed plan" section**

> An unmade bed in flat grey morning light, a pair of training shoes on the floor beside it untouched, curtains half drawn, an ordinary room on a day that did not happen. [house style block]

**12 · `after-session` · 4:3 · the free-core / close area**

> A kitchen table after training: a phone face down, a half-drunk glass of water, a crumpled towel, hard slatted morning light from a venetian blind striping across the surface. [house style block]

---

## Picking a frame

Reject on sight, and regenerate rather than settle — a bad frame in a set of twelve costs more than the extra run:

- Any legible text or logo anywhere in the frame.
- Six-fingered or fused hands. Slots 02, 04, 06 and 03 are close-ups of hands and are where this shows.
- A watch, band or tracker on a wrist in 02 or 06. Those two frames *are* the "no wearable" claim; a watch in them makes the page lie.
- Anything that reads as a commercial gym: racked machines, branded plates, even lighting.
- A visible torso used as a physique shot.
- A grade that drifts from 01 — flatter blacks, softer grain, warmer cast. If two frames in a row drift, re-anchor by attaching 01 again.

## Landing them

```bash
# from the repo root, once the files are in sites/www/public/photo/
npm run www:build
npm --prefix sites/www run check    # composition floors, rhythm, links, budget
```

`www-composition.mjs` will tell you what the page measures at — fold and page image coverage against the Wave 11 floors. Adding these should push page coverage well past the 35% floor and let the current double-use of three photographs stop.

**Also update when they land:** the honest note in `StagePhoto.astro` about upscaled portrait sources, and the `.641` entry's "known" line in [LOG.md](../../LOG.md). A caveat that outlives its cause is how a doc stops being true.
