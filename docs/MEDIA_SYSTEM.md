# Media system — Mission Winning

**Audience:** Agents and founder generating / shipping product imagery.  
**Brand colors & voice:** [brand-guidelines.md](brand-guidelines.md) · **UI tokens:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)  
**Manifest:** [`media/manifest.json`](../media/manifest.json) — check before regenerating.  
**Flow prompts (copy-paste):** [media/FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) · **Drop exports:** [`media/inbox/`](../media/inbox/)

Generation is **offline batch** → founder approve → commit static files. There is **no** runtime image-gen API in the product.

**Primary HQ tool for Learn / social / motion:** [Google Flow](https://labs.google/fx/tools/flow) (50 free credits/day on non‑AI plans).  
**Form guides stay SVG** — do not replace with Flow video or photoreal people.

---

## Folders

| Folder | Role | Format | Naming |
|--------|------|--------|--------|
| `public/form-guides/` | In-app + public exercise teaching | SVG (optional short WebM later) | `{exerciseId}.svg` |
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

## Form diagram language (instructional SVG)

**Default for Train form guides** — line/stick figures, not photoreal people.

| Element | Spec |
|---------|------|
| Canvas | `viewBox="0 0 320 200"` (or 360×220 for multi-phase) |
| Background | Navy `#0a0c10` (or transparent on dark card) |
| Figure stroke | Near-white `#e8eaed`, `stroke-width="2.5"`, round caps/joins |
| Motion arrows | Emerald `#27b07d` |
| Joint / cue marks | Brass `#c7a860` dots + short labels |
| Phase layout | 2–3 poses left→right: **setup → mid → lockout** (or hold) |
| A11y | `role="img"`, `aria-label`, `<title>` with exercise name |
| Animation | Optional SMIL/`animate` on 3–5 heroes only; loop, muted, few KB |

**Reference asset:** `public/form-guides/push-ups.svg`

Do **not** use gym-bro aesthetics, neon glow stacks, or medical claim overlays on form art.

---

## Brand AI prompt block (raster / video: Learn / art / social)

Paste or prepend in Google Flow (and Grok Imagine / Cursor GenerateImage):

```
Mission Winning brand imagery. Dark navy canvas #0a0c10, emerald accent #27b07d,
brass honor #c7a860. Clinical athletic clarity — not gym-bro hype, not medical.
No logos invented; no competitor blue/violet identity; no cream/terracotta editorial look.
Atmosphere: mission briefing, train-anywhere athlete, calm competence.
Decorative or chapter-hero only — not instructional form diagrams (those are SVG stick figures).
No text in the image unless explicitly requested. No crisis or clinical depression framing.
No readable UI chrome, no fake app screenshots unless asked.
```

Instructional form **concepts** may use AI as a pose reference only; **ship** hand-tuned SVG matching the form language above.

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

**Grok Imagine / SuperGrok:** Same offline rule — generate in product UI → export → `media/inbox/`. Prefer for still portraits / atmosphere when Flow free tier is video-only.

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
| Form guides | `FORM_MEDIA_IDS` + `/form-guides/{id}.svg` in `src/lib/formGuides.ts` |
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
