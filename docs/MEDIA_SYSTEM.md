# Media system — Mission Winning

**Audience:** Agents and founder generating / shipping product imagery.  
**Brand colors & voice:** [brand-guidelines.md](brand-guidelines.md) · **UI tokens:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)  
**Manifest:** [`media/manifest.json`](../media/manifest.json) — check before regenerating.  
**Flow prompts (copy-paste):** [media/FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) · **Grok Imagine session pack:** [media/GROK_IMAGINE_PROMPTS.md](../media/GROK_IMAGINE_PROMPTS.md) · **Drop exports:** [`media/inbox/`](../media/inbox/)

Generation is **offline batch** → founder approve → commit static files. There is **no** runtime image-gen API in the product.

**Exercise Form Index (Train + library + public `/exercises`):** GrokFilm-style browse (pattern / equipment / muscle) → **clinical side poster or short loop** → **Train this free**. Pedagogy borrows CrossFit *movement-standards craft* (full body, full ROM, side camera, short silent loop) — **not** CrossFit IP, embeds, or brand. Host on Vercel static free tier (`public/form/`); **not** Supabase Storage (egress) and **not** YouTube as mid-set primary.

**Default form media:** `/form/{id}/side.webp` (+ optional `side.webm`). Legacy stick SVGs under `/form-guides/` remain as fallback only. Resolve order: form pack → legacy SVG → pattern SVG → text cues. Structured guide floor ≥80 — `src/lib/formGuideCoverage.test.ts`. Coverage: `npm run media:coverage` → `media/COVERAGE.md`.

**Primary HQ tool for Learn / social / motion:** [Google Flow](https://labs.google/fx/tools/flow) + [Grok Imagine](https://grok.com/imagine). Form stills: Imagine → `media/inbox/form-{id}-side-frame.png` → `npm run media:optimize-inbox`.

---

## Folders

| Folder | Role | Format | Naming |
|--------|------|--------|--------|
| `public/form/` | **Form Index** posters + short loops (Train default) | WebP + optional MP4 | `{exerciseId}/side.webp` · `side.mp4` · `front.webp` |
| `public/form-guides/` | Legacy stick SVG fallback | SVG | `{exerciseId}.svg` · `pattern-*.svg` |
| `public/art/` | Marketing decorative | AVIF + WebP pairs | `{name}.avif` / `{name}.webp` |
| `public/learn/` | Guidebook / Learn figures | WebP (+ AVIF when large) | `{chapterId}-hero.webp` or `{sectionId}.webp` |
| `public/social/` | Launch / invite creatives | PNG/WebP 1080² or 1080×1350; short WebM OK | `{campaign}-{variant}.webp` |
| `public/brand/` | Logos / OG default | SVG / PNG | unchanged — see brand kit |
| `public/brand/mascot/` | Scout character kit | WebP | `scout-{idle\|invite\|celebrate}.webp` |
| `media/inbox/` | Raw Flow / Imagine exports (gitignored binaries OK as drafts) | PNG / MP4 / WebM | `{kind}-{id}-raw.*` |

**Size budgets**

- Form SVGs: keep lean (typically &lt;8 KB); long-cached via `/form-guides/*`.
- Marketing art on `/`: ≤80 KB each, ≤250 KB total ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).
- Learn heroes: prefer ≤120 KB WebP.
- Social stills: ship optimized; do not commit multi‑MB drafts.
- Social motion: prefer ≤8s, ≤2 MB WebM when used.

---

## Manifest

[`media/manifest.json`](../media/manifest.json) lists each shipped or draft asset:

| Field | Values |
|-------|--------|
| `id` | Stable id (usually exerciseId, chapterId, or `scout-idle`) |
| `kind` | `form` \| `learn` \| `art` \| `social` \| `mascot` |
| `path` | Public URL path |
| `status` | `draft` \| `shipped` |
| `promptId` | Optional key into [FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) |
| `notes` | Short provenance / revision note |

**Rule:** If `status` is `shipped` and the file exists, do not regenerate unless the founder asks for a revision. Add a new manifest entry or bump notes when replacing.

---

## Form Index language (clinical poster + loop)

**Default for Train form** — clinical movement-standard demos (CrossFit-style craft, MW-owned assets). Not stick SVG. Not CrossFit.com embeds.

| Element | Spec |
|---------|------|
| Camera | Locked **side** tripod; knee–hip height for hinge/squat; full body head-to-feet |
| Action | 1–2 clean reps, full ROM (start → finish visible) |
| Duration | Still poster required; optional silent loop 6–8s WebM |
| Ground | Paper-neutral floor/wall `#f3f2f2` field |
| Athlete | Simple dark training clothes; face not hero |
| Accent | Optional single vermillion `#ec3013` joint/path mark — never neon |
| Forbidden | Text in frame, logos, music, Dutch tilt, film grain, gym-bro montage, third-party CF IP |
| Host | `public/form/{id}/` on Vercel — **not** Supabase free egress, **not** YT primary |
| A11y | Meaningful `alt` / video label; caption under media |

**Legacy SVG** (`public/form-guides/`): fallback only when no form pack. Stick language docs remain for regenerating those files if needed.

**Reference pack ids:** `src/lib/formMedia.ts` (`FORM_PACK_SIDE_IDS`).

---

## Brand AI prompt block (raster / video: Learn / art / social)

Paste or prepend in Google Flow (and Grok Imagine / Cursor GenerateImage):

```
Mission Winning brand imagery. Modernist poster: paper ground #f3f2f2, ink #201e1d,
and exactly one accent — vermillion red #ec3013, used sparingly. Flat printed
surfaces, hard geometric edges, square corners, generous negative space. No
gradients, no glow, no drop shadows, no dark backgrounds, no second accent hue.
Clinical athletic clarity — not gym-bro hype, not medical.
No logos invented; no competitor blue/violet identity; no cream/terracotta editorial look.
Atmosphere: mission briefing, train-anywhere athlete, calm competence.
Decorative / chapter-hero / social only when used without form ROM intent.
For **form packs**, use the Form Index block in [GROK_IMAGINE_PROMPTS.md](../media/GROK_IMAGINE_PROMPTS.md) instead.
No text in the image unless explicitly requested. No crisis or clinical depression framing.
No readable UI chrome, no fake app screenshots unless asked.
```

**Form packs** ship Imagine-generated clinical stills (and optional loops) to `public/form/`. Do **not** scrape CrossFit or random YouTube demos.

---

## Google Flow — daily 50 free credits (primary HQ path)

Studio: https://labs.google/fx/tools/flow  

**Important (free tier):** Daily free Flow credits apply to **Veo 3.1 Lite / Fast / Quality video** generations ([Google Flow Help](https://support.google.com/flow/answer/16526234)). Unused daily credits do **not** roll over. Quality costs **100** credits — skip on free 50/day.

### Credit budget (default day)

| Spend | Model | Credits | Count | Output use |
|-------|--------|---------|-------|------------|
| Primary | Veo 3.1 **Lite** (4–8s) | ~10 each | **up to 5**/day | Social motion + **still frames** for Learn heroes |
| Avoid | Veo 3.1 Quality | 100 | 0 on free day | Needs paid plan |
| Optional | Veo 3.1 Fast | ~20 each | 0–2 | Only if Lite looks weak |

**Stills from video:** After a good Lite clip, export / scrub the best frame → drop into `media/inbox/` as `{id}-frame.png` → run optimize script → ship WebP to `public/learn/` or `public/social/`. That is how free Flow credits produce high-quality Learn art without a separate still-image credit pool.

### Agent vs founder

| Who | Does what |
|-----|-----------|
| **Founder** | Opens Flow, pastes prompts from [FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md), spends ≤50 credits, downloads MP4/PNG into `media/inbox/` |
| **Agent** | Maintains prompts, runs `npm run media:optimize-inbox`, updates manifest, wires paths, commits approved assets |
| **Neither** | Puts Flow keys in Vercel / `NEXT_PUBLIC_*` — Flow is not an app API |

**Grok Imagine / SuperGrok:** Same offline rule — generate in product UI → export → `media/inbox/`. Prefer for stills when already in Grok or Flow free tier is video-only. **Start here:** [media/GROK_IMAGINE_PROMPTS.md](../media/GROK_IMAGINE_PROMPTS.md) (Sprint A paste sheet + filenames).

### Fallback tools (when Flow is spent or for quick drafts)

| Tool | Use |
|------|-----|
| Cursor `GenerateImage` | Fast still drafts (not primary HQ) |
| Higgsfield MCP | Image + video if authenticated |
| `.claude/skills/design/scripts/` | Gemini logo/CIP when `GEMINI_API_KEY` set |

---

## Inbox → ship workflow

1. Generate in Flow using [FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md).
2. Download into `media/inbox/` (name: `learn-{chapterId}-raw.mp4` or `social-{slug}-raw.png`).
3. Run:

```bash
npm run media:optimize-inbox
```

4. Review output under `public/learn/` or `public/social/` (script prints paths).
5. Update `media/manifest.json` (`status: shipped`, `notes: Google Flow Veo Lite …`).
6. Commit only approved optimized files — leave huge raws in inbox (gitignored).

---

## Content wiring

| Surface | How media attaches |
|---------|-------------------|
| Form Index | `FORM_PACK_SIDE_IDS` + `/form/{id}/side.webp` via `src/lib/formMedia.ts` → `formGuides.ts`; fallback SVG + pattern packs |
| Guidebook | Optional `figure` / `heroImage` on guidebook types → reader + PDF |
| Marketing | `ArtPicture` + `public/art/` |
| Social | Files under `public/social/`; paths listed in [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) |
| Android | Prefer same `/form-guides/{id}.svg` URLs (or packaged copies) — one art system |

---

## Wave status

| Wave | Scope | Status |
|------|--------|--------|
| **1** | Manifest + instructional form SVGs + Learn figure slots | Shipped (`.121`) |
| **2** | Social folder + Android form-guide reuse | Shipped (`.121`) |
| **3** | Google Flow primary HQ path + inbox optimize + prompt pack | Shipped |
| **4** | Scout mascot bible + kit + History empty + Victory flourish | Shipped |
| **5** | Form craft excellence — stick kit, uniqueness guards, T0 de-clone, coverage report, MASCOT modernist lock | Shipped (`.413`) |
| **6** | T1 SVGs — every structured form guide has a diagram (52 guides / 52 SVGs) | Shipped (`.414`) |
| **6b** | Learn section densify — paper/ink teaching figures (18/18 free sections) | Shipped (`.414`–`.415`) |
| **7** | Pattern packs (7) for long-tail + honest caption · social WebP | Shipped (`.415`) |
| **8** | Scout modernist re-ink · magazine PDF densify · PDF builder `load` settle | Shipped (`.416`) |

**Form Index craft loop:** inventory → Imagine clinical side still (`form-{id}-side-frame`) → `npm run media:optimize-inbox` → wire `FORM_PACK_SIDE_IDS` → library card poster + sheet. Optional later: image→video loop → WebM. Coverage: [`media/COVERAGE.md`](../media/COVERAGE.md).
