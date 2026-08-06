# Form pack validation — movement standards

**Audience:** Anyone shipping or regenerating `public/form/{id}/side.webp`  
**Law:** Form Director hard rejects in [FORM_DIRECTOR.md](../FORM_DIRECTOR.md)  
**Product:** Prefer still-only over wrong-exercise or glitch video

---

## What “correct exercise” means

For id `overhead-press`, the still must read as a **two-hand barbell press** (or the implement that id uses in the catalog) — not a single-arm DB press, not a push-press jump, not a behind-neck path.

Wrong-exercise is an automatic FAIL even if framing is beautiful.

---

## Reference library (validation only — do not embed)

Use **public movement-standard demos** to check pose/ROM, then regenerate **MW-owned** assets.

| Source | Use | Forbidden |
|--------|-----|-----------|
| [CrossFit Movement Standards / library](https://www.crossfit.com/essentials) and CF YouTube movement demos | Eyes-on: side camera, full ROM, start/finish | Embeds, CF logos, CF IP, screenshots shipped as product art |
| NSCA / coach textbooks (fair-use study) | Joint angles, common faults | Copying figures into the repo |
| In-house PASS stills | I2V source only after still PASS | I2V from FAIL stills |

Pedagogy borrows **clinical side-view craft** (full body, full ROM, short silent loop) — not CrossFit brand. See [docs/MEDIA_SYSTEM.md](../../../docs/MEDIA_SYSTEM.md).

---

## QA checklist (per still)

Open the still next to a reference demo. Tick all:

1. **Id match** — would a coach name this the same exercise as the file id?  
2. **Implement match** — bar / KB / bodyweight / landmine as catalog expects  
3. **Side profile** — true side when labeled `side`  
4. **Full body** — ≥8% headroom, ≥5% foot room; head not cut; feet not cut at ankles  
5. **Phase** — setup, mid, or lockout is intentional and labeled in the director sheet  
6. **Physics** — implement outside body; no bar-through-torso; no extra limbs  
7. **Brand field** — paper-neutral ground; no text/logos  

Any NO → log in [FAIL.md](FAIL.md), **remove id from `FORM_PACK_SIDE_IDS`**, keep file only as regen reference.

---

## Known demotes (.498 eyes-on) — superseded by .540 re-QA

| Id | Issue | Action |
|----|--------|--------|
| `overhead-press` | Was single-arm wrong exercise | **Re-shipped `.540`** two-hand empty-bar lockout still-only |
| `pull-ups` | Was feet cropped | **Re-shipped `.540`** hang setup still-only (full feet) |

## Regen order (when founder unblocks image gen)

1. Optional athlete-a identity refresh for OHP/pull-ups if brand match needed  
2. Chin-over pull-up attempt (hang is already valid)  
3. Spot-check remaining pack against CF movement demos (reference only)  
4. I2V only from PASS stills — never wire OHP/pull-up video until video QA  

Do not bulk-wire VIDEO_IDS without video QA.
