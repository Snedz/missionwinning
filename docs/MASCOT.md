# Mission Winning brand mascot (croco)

**Audience:** Founder, agents, press, social.  
**Brand colors / voice:** [brand-guidelines.md](brand-guidelines.md) · **Media pipeline:** [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · **Flow prompts:** [`media/FLOW_PROMPTS.md`](../media/FLOW_PROMPTS.md)  
**Assets:** `/brand/mascot/` · **Manifest:** [`media/manifest.json`](../media/manifest.json)

**Scout (geometric falcon) is retired.** The live craft mascot is a **blue croco** kit (Totodile-*inspired* original MW character — do **not** ship the word “Totodile” in product copy). Working name TBD; assets use `croco-*` until named.

The mascot is **not** the Mission Coach LLM and **does not** replace the MW monogram logo.

---

## Identity

| | |
|--|--|
| **Name** | TBD (internal: croco kit; never “Duo”; never “Totodile” in UI) |
| **Silhouette** | Small cartoon **crocodile** — cream belly, red dorsal spikes, bold eyes (X-eye calm set or open-eye turnaround) |
| **Style** | Flat sticker/cartoon, readable at 24px and 1080px |
| **Colors** | Blue body · cream belly · red spikes · black outlines · paper ground `#f3f2f2`. One red accent for spikes/emotion — MW vermillion family, not a second brand hue |
| **Job** | Mission briefing companion — invite to log, celebrate Victory, never shame |
| **Identity anchor** | **JPEG 34** — three-panel sheet (calm / escalating / crash-out). Calm panel = default. Kit: `media/form-kit/refs/mascot-croco-sheet-34.jpg` · idle extract `public/brand/mascot/croco-idle.webp` · turnaround `mascot-croco-turnaround-35.jpg` |
| **Personality craft** | Totodile energy + Tom-the-lizard (Hoppers) vibe — clear, brief, can escalate; never guilt-trips |

### Personality (lock)

1. Clear, brief, respectful of time — speaks like a mission briefing.  
2. Celebrates the log (“set locked”) more than it nags absence.  
3. Never shames missed days; max tone = “Mission still open when you’re ready.”

### Relationship to marks

| Mark | Role |
|------|------|
| `/brand/logo-icon.svg` (MW monogram) | Primary logo — press, favicon, wordmark |
| Croco mascot | Character / companion — social, empty state, Victory, optional exercise pilots |
| Form-guide stick figures | Teaching diagrams — **not** the mascot; clinical Form Index stays separate |

Do **not** put the mascot inside the MW monogram square as a logo replacement without founder sign-off.

---

## Visual rules

| Do | Don’t |
|----|--------|
| Fixed proportions; same snout / red spikes every time | Photoreal crocs, soft 3D gym mascots, literal Pokémon product art |
| Blue + cream + red spikes; black outline | Purple, violet, second brand palette |
| Calm / invite / celebrate (see JPEG 34 ladder) | Guilt, “you failed,” streak shame |
| Paper canvas `#f3f2f2` | Busy photo backgrounds under the character |

**Expression set (craft v1 — croco):**

| File | Pose | Use |
|------|------|-----|
| `croco-idle.webp` | Calm (from JPEG 34 left panel) | Default / identity lock |
| `exercises/*-still.webp` + `*.mp4` | Exercise pilots | Social / Victory fun — **not** Form Index |
| `scout-*.webp` | **Retired** falcon kit | Do not use for new work |

**Always re-anchor pose gens to JPEG 34 calm extract** (`croco-idle.webp` / `mascot-croco-idle-from-34.jpg`).

---

## Voice samples

| Context | OK | Not OK |
|---------|----|--------|
| Empty History / first week | “No session yet. Start when ready.” | “You abandoned your mission.” |
| Victory | “Set locked. Win logged.” | Streak shame / guilt |
| Social invite | “Train anywhere. Free logger.” | Paywall guilt, competitor dunks |
| Rest / quiet day | “Mission still open when you’re ready.” | “Don’t break the chain.” |

Mascot copy is **product microcopy**, not Mission Coach chat. Keep Coach LLM voice separate.

---

## Placement matrix

| Phase | Where | Rule |
|-------|--------|------|
| **A** | Social creatives · [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) | Croco on invite / coach posts |
| **B** | **One** empty state (History — no workouts yet) | Single illustration + one CTA |
| **C** | Victory flourish | Honor moment only (not confetti spam) |
| **Pilot** | Exercise loops under `mascot/exercises/` | Fun demos — never replace `/form/{id}/` clinical packs |
| **Later** | Push / email (founder-owned) | Same anti-guilt lines |

**Never:** Active / Train logger density, every pillar empty, Coach chat avatar takeover, paywall shame.

---

## Generation (Google Flow / Grok Imagine)

**Characters tab (preferred):** create reusable `@Scout` with the full creation prompt in [FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) § “Google Flow — Create Character”. Project: [Flow Characters](https://labs.google.com/fx/tools/flow/project/a40c42fd-16e2-49e5-8de5-a8dceb717c7e/characters).

1. Paste Character creation prompt + Character info.  
2. Optional: upload `public/brand/mascot/scout-idle.webp` as reference.  
3. Generate scenes with `@Scout` + action lines (idle / invite / celebrate / loop).  
4. Drop frames as `mascot-scout-{idle|invite|celebrate}-frame.png` into `media/inbox/`.  
5. `npm run media:optimize-inbox` → `public/brand/mascot/`.  
6. Update manifest; commit optimized WebP only.

Grok Imagine / Cursor image gen is valid for still pose variants — same palette lock, offline → inbox → optimize. Do not put generation keys in Vercel.

---

## Duolingo pattern → MW

| Duo | MW |
|-----|-----|
| One sticky owl | One sticky Scout |
| Guilt / streak harassment | Celebrate logs; invite without shame |
| Everywhere | Social → one empty → Victory only |
| Meme personality | Calm competence + dry wit |

---

## Checklist before shipping a new Scout asset

- [ ] Same silhouette as prior kit  
- [ ] Modernist palette only (paper / ink / mid-grey / one red)  
- [ ] No text baked into the image  
- [ ] Manifest entry with `kind: mascot`  
- [ ] Placement allowed by matrix above  
