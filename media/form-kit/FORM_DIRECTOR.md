# Form Director — Mission Winning Form Index

**Audience:** Agents generating form stills / loops.  
**Status:** Source of truth for form media gen (`.467` quality reset).  
**Inspired by:** [Higgsfield Seedance 4K breakdown](https://higgsfield.ai/blog/seedance4k-breakdown) + [Seedance prompting guide](https://higgsfield.ai/blog/seedance-prompting-guide) — **structure and discipline**, not cinema genre.

Form teaches mid-set. **Still-only is a valid ship.** Broken video is not.

---

## How Higgsfield / Seedance works (and what we steal)

Their film pipeline is **asset-first**:

1. Build **character**, **props**, **location** as reference sheets.  
2. Write a **labeled director prompt** (SCENE, OPTICS, CAMERA, PHYSICS, POSITIVE LOCKS…).  
3. Generate video from locked assets — better input still → better motion.  
4. State **shot structure first** (duration, shot count, aspect).  
5. Say what the camera is **not** doing (no zoom, no cut) as hard as what it is.

We do **not** copy dutch handheld, multi-shot montages, or VFX. We copy **director rigor**.

Grok Imagine has no Elements library: paste full director sheets; attach approved stills for I2V.

---

## Pipeline (non-negotiable)

```
KIT refs (once) → STILL director prompt → eyes-on QA → ship still
                              ↓ pass only
                    LOOP director prompt → I2V from still → video QA
                              ↓ fail
                         still-only (delete wiring, keep still)
```

**Never** I2V from a failing still. **Never** bulk-parallel form gens without vision QA.

---

## Hard reject (still)

FAIL and do not ship if any:

- Head missing, cropped, melted, or neck fused to wall  
- Feet cut at ankles (except clear floor contact with sole visible)  
- Wrong exercise for the id  
- Equipment through torso / limbs  
- Extra limbs, fused joints, melted hands  
- Hyper-tight crop (subject without ≥8% headroom / ≥5% foot room)  
- Text, logos, second accent, neon, CrossFit branding  
- Not true side profile when labeled side  

## Hard reject (video)

- Equipment through body  
- Morph to different exercise  
- Camera pan / zoom / Dutch / reframe  
- Head disappears mid-loop  
- Invented people or implements not in still  

Log rejects in [qa/FAIL.md](qa/FAIL.md).

---

## Still director template

Copy whole block. Fill `{…}` only.

```
FORMAT
1 shot · still · 1:1 · instructional Form Index · Mission Winning

SCENE CONTEXT
Clinical movement standard photograph of {EXERCISE NAME} for mid-set teaching.
Empty paper-neutral studio — seamless floor and wall #f3f2f2. Single athlete only.

ACTIVE REFERENCES
@athlete-a — identity and wardrobe lock if reference image attached.
@prop-{name} — equipment geometry lock if attached.
Location: paper cyclorama only — no chrome commercial gym wall.

SUBJECT
One adult athlete, complete anatomy: head with neck fully inside frame,
two arms, two legs, plausible hands. Matte dark training clothes
(long sleeve + shorts or leggings). Face calm and secondary — NOT cropped,
NOT headless, NOT melted.

POSE / EXERCISE LOCK
{3–6 concrete joint bullets for this exact lift at the chosen phase}

EQUIPMENT PHYSICS
{Where implement contacts body. What it must NOT do.}
Contact shadows under feet/implements. Nothing floats. No intersecting geometry.

OPTICS
~47–50° normal lens · camera 4–5 m back · zero distortion · deep focus head-to-feet ·
subject fills 55–65% of frame.

CAMERA LOCK
True side profile · tripod locked · eye-level OR knee–hip height for hinge/squat ·
static · no Dutch · no zoom · no pan.

MARGINS (hard)
≥8% headroom above crown · ≥5% foot room below soles ·
hands and implements not cut by frame edge.

LIGHTING
Even soft studio key ~5500K, soft fill, gentle contact shadow.
No noir, no neon, no second accent hue.

STYLE
Photoreal clinical athletic instruction — paper/ink brand world.
Not gym-bro, not fashion, not film still. No text, logos, watermarks, UI.

POSITIVE LOCKS
- Correct exercise: {name}
- Full body head-to-feet with margins
- Equipment outside body
- Single subject
- Side view

NEGATIVES
Cropped head, headless, extra limbs, fused joints, bar through torso,
hyper-tight crop, text, logos, Dutch, film grain stacks, neon, wrong exercise,
side-plank-as-isolation, curl-as-core, multi-person, sports-brand logos.
```

### Loop director template (only after still PASS)

```
FORMAT
6s · 1 continuous shot · 1:1 · silent · loopable · Mission Winning Form Index

ACTIVE REFERENCES
Input still is the ONLY visual source. Animate that exact person, clothes, props, framing.
100% identity match. Do not invent new bars, people, or rooms.

CAMERA LOCK
Tripod locked. Zero pan, zero tilt, zero zoom, zero reframe, zero cut, zero Dutch.
What the camera is NOT doing: moving, drifting, handheld, orbit, push-in.

ACTION TIMING
0.0–1.0s: hold setup from still
1.0–3.5s: {eccentric or concentric path}
3.5–5.5s: {return / lockout}
5.5–6.0s: settle for seamless loop

PHYSICS
Equipment stays outside body for entire clip. No morph to a different exercise.

AUDIO
Silent.

POSITIVE LOCKS
One clean rep · same exercise as still · head always in frame · loopable

NEGATIVES
Bar through body, head crop, camera move, second person, text, logos, drama speed-ramps.
```

---

## Barbell geometry (hard — Form Index)

Models invent **broken collars**: multi-prong hubs, three spring arms, star locks stacked into a trident. From a side camera that reads as “three clips.”

**Default for teaching stills:** **empty Olympic bar** — no plates, no collars, no spring clips. Clean cylindrical sleeves with only the real sleeve stop rings. Same empty-bar look as thruster technique stills.

**If plates are required** (rare): solid circular plates flush on the sleeve **with no collar hardware at all**. Never invent spring clips, prongs, clamps, or multi-arm hubs.

**Hard reject:** extra prongs / three-clip hubs · asymmetric collar only on one end · logo text on plates · bar through body · head buried in plates.

## Per-lift equipment locks (required)

| Id / family | Equipment rule |
|-------------|----------------|
| glute-bridge | Bodyweight **or** bar resting **across hip crease** on pad — never through abdomen |
| bench-press | Bar above chest; arms support bar; never through torso |
| deadlift / RDL | Bar **in front of** legs (never through thighs or on back) · left–right axis like conventional DL · **prefer empty bar** · RDL = mid-hinge not lockout |
| pull-ups | Full head visible; bar above head |
| thruster / OHP / front-squat / barbell-row | **Empty bar default** · path outside body · head clear |
| kettlebell-swing | KB outside hips; hinge + hip snap |
| isolation pattern | Standing DB curl only — never side plank |
| core pattern | Forearm plank only — never curl |
| burpee | Full body; head in frame; readable plank or stand-to-floor |
| box-jump | Full head + box + feet; generous headroom |
| landmine family | One bar; far end on floor as pivot; free end only — no extra prongs |

---

## Kit refs (`media/form-kit/refs/`)

| File | Role |
|------|------|
| `athlete-a-side.webp` | Primary identity — full body side, margins |
| `athlete-a-front.webp` | Optional front |
| `prop-barbell-sheet.webp` | Multi-view bar |
| `prop-kb-sheet.webp` | KB |
| `prop-box-sheet.webp` | Plyo box |
| `prop-bench-sheet.webp` | Flat bench |
| `location-paper-studio.webp` | Empty paper studio |

Generate kit once; reuse via image_edit / I2V reference.

---

## Wiring

- Still PASS → `FORM_PACK_SIDE_IDS` + `public/form/{id}/side.webp`  
- Loop PASS → `FORM_PACK_VIDEO_IDS` + `side.mp4`  
- Pattern PASS → `FORM_PATTERN_RASTER_IDS`  
- Demoted broken media stays on disk until replaced; **must not** be wired.

Optimize: `form-{id}-side-frame.png` → `npm run media:optimize-inbox`.
