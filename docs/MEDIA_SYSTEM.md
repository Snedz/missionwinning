# Media system — Mission Winning

**Audience:** Agents and founder generating / shipping product imagery.  
**Brand colors & voice:** [brand-guidelines.md](brand-guidelines.md) · **UI tokens:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)  
**Manifest:** [`media/manifest.json`](../media/manifest.json) — check before regenerating.

Generation is **offline batch** (Cursor GenerateImage, Higgsfield, Gemini design scripts) → founder approve → commit static files. There is **no** runtime image-gen API in the product.

---

## Folders

| Folder | Role | Format | Naming |
|--------|------|--------|--------|
| `public/form-guides/` | In-app + public exercise teaching | SVG (optional short WebM later) | `{exerciseId}.svg` |
| `public/art/` | Marketing decorative | AVIF + WebP pairs | `{name}.avif` / `{name}.webp` |
| `public/learn/` | Guidebook / Learn figures | WebP (+ AVIF when large) | `{chapterId}-hero.webp` or `{sectionId}.webp` |
| `public/social/` | Launch / invite creatives | PNG/WebP 1080² or 1080×1350 | `{campaign}-{variant}.webp` |
| `public/brand/` | Logos / OG default | SVG / PNG | unchanged — see brand kit |

**Size budgets**

- Form SVGs: keep lean (typically &lt;8 KB); long-cached via `/form-guides/*`.
- Marketing art on `/`: ≤80 KB each, ≤250 KB total ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).
- Learn heroes: prefer ≤120 KB WebP.
- Social: ship optimized; do not commit multi‑MB drafts.

---

## Manifest

[`media/manifest.json`](../media/manifest.json) lists each shipped or draft asset:

| Field | Values |
|-------|--------|
| `id` | Stable id (usually exerciseId or chapterId) |
| `kind` | `form` \| `learn` \| `art` \| `social` |
| `path` | Public URL path |
| `status` | `draft` \| `shipped` |
| `promptId` | Optional key into prompt pack below |
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

## Brand AI prompt block (raster: Learn / art / social)

Paste or prepend when generating marketing or Learn heroes:

```
Mission Winning brand imagery. Dark navy canvas #0a0c10, emerald accent #27b07d,
brass honor #c7a860. Clinical athletic clarity — not gym-bro hype, not medical.
No logos invented; no competitor blue/violet identity; no cream/terracotta editorial look.
Atmosphere: mission briefing, train-anywhere athlete, calm competence.
Decorative or chapter-hero only — not instructional form diagrams (those are SVG stick figures).
No text in the image unless explicitly requested. No crisis or clinical depression framing.
```

Instructional form **concepts** may use AI as a pose reference only; **ship** hand-tuned SVG matching the form language above.

---

## Daily credit playbook (~50/day)

1. **Form refs** — pose references for next SVG batch (or skip if hand-drawing from cues).
2. **Learn heroes** — chapter/section figures into `public/learn/`.
3. **Social** — invite / Train Anywhere / Coach posts into `public/social/`.
4. Update `media/manifest.json` + commit approved files only.

**Tools (agent environment)**

| Tool | Use |
|------|-----|
| Cursor `GenerateImage` | One-off concepts / Learn heroes |
| Higgsfield MCP | Image + short video (auth + credits) |
| `.claude/skills/design/scripts/` | Gemini logo/CIP scripts when `GEMINI_API_KEY` set |

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
| **1** | This doc + manifest + instructional form SVGs + Learn figure slots | Shipped (`.121`) |
| **2** | Social folder creatives, Android form-guide reuse, cache headers for `/learn` + `/social` | Shipped (`.121`); optional WebM loops still later |
