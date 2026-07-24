# Scout — Mission Winning brand mascot

**Audience:** Founder, agents, press, social.  
**Brand colors / voice:** [brand-guidelines.md](brand-guidelines.md) · **Media pipeline:** [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · **Flow prompts:** [`media/FLOW_PROMPTS.md`](../media/FLOW_PROMPTS.md)  
**Assets:** `/brand/mascot/` · **Manifest:** [`media/manifest.json`](../media/manifest.json)

Scout is Mission Winning’s Duolingo-style sticky character — **one silhouette, one job** — adapted to MW voice. Scout is **not** the Mission Coach LLM and **does not** replace the MW monogram logo.

---

## Identity

| | |
|--|--|
| **Name** | Scout (working title; do not ship as “Duo”) |
| **Silhouette** | Small geometric **falcon/kestrel** — mission / scout energy |
| **Style** | Flat shapes, few polygons; readable at 24px and 1080px |
| **Colors** | Navy body `#0a0c10` / near-white `#e8eaed` · emerald accents `#27b07d` · brass honor `#c7a860` |
| **Job** | Mission briefing companion — invite to log, celebrate Victory, never shame |

### Personality (lock)

1. Clear, brief, respectful of time — speaks like a mission briefing.  
2. Celebrates the log (“set locked”) more than it nags absence.  
3. Never shames missed days; max tone = “Mission still open when you’re ready.”

### Relationship to marks

| Mark | Role |
|------|------|
| `/brand/logo-icon.svg` (MW monogram) | Primary logo — press, favicon, wordmark |
| Scout | Character / companion — social, one empty state, Victory flourish |
| Form-guide stick figures | Teaching diagrams — **not** Scout; keep instructional SVG language |

Do **not** put Scout inside the emerald MW square as a logo replacement without founder sign-off.

---

## Visual rules

| Do | Don’t |
|----|--------|
| Fixed proportions; same beak / wing chevron every time | Photoreal birds, soft 3D gym mascots |
| Brass chevron or eye highlight as honor mark | Purple, violet, cream/terracotta |
| Calm pose language (idle / invite / celebrate) | Anger, crying, “you failed” faces |
| Navy / emerald / brass only | Competitor green-owl clone, gym-bro cartoon |
| Transparent or navy canvas | Busy photo backgrounds under the character |

**Expression set (v1):**

| File | Pose | Use |
|------|------|-----|
| `scout-idle.webp` | Neutral attention | Default / chrome |
| `scout-invite.webp` | Open wing / beckon | Empty state + social invite |
| `scout-celebrate.webp` | Brass flash / lift | Victory / PR |

---

## Voice samples

| Context | OK | Not OK |
|---------|----|--------|
| Empty History / first week | “No session yet. Start when ready.” | “You abandoned your mission.” |
| Victory | “Set locked. Win logged.” | Streak shame / guilt |
| Social invite | “Train anywhere. Free logger.” | Paywall guilt, competitor dunks |
| Rest / quiet day | “Mission still open when you’re ready.” | “Don’t break the chain.” |

Scout copy is **product microcopy**, not Mission Coach chat. Keep Coach LLM voice separate.

---

## Placement matrix

| Phase | Where | Rule |
|-------|--------|------|
| **A** | Social creatives · [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) | Scout on invite / coach posts |
| **B** | **One** empty state (History — no workouts yet) | Single illustration + one CTA |
| **C** | Victory flourish | Brass honor moment only |
| **Later** | Push / email (founder-owned) | Same anti-guilt lines |

**Never:** Active / Train logger density, every pillar empty, Coach chat avatar takeover, paywall shame.

---

## Generation (Google Flow)

**Characters tab (preferred):** create reusable `@Scout` with the full creation prompt in [FLOW_PROMPTS.md](../media/FLOW_PROMPTS.md) § “Google Flow — Create Character”. Project: [Flow Characters](https://labs.google/fx/tools/flow/project/a40c42fd-16e2-49e5-8de5-a8dceb717c7e/characters).

1. Paste Character creation prompt + Character info.  
2. Optional: upload `public/brand/mascot/scout-idle.webp` as reference.  
3. Generate scenes with `@Scout` + action lines (idle / invite / celebrate / loop).  
4. Drop frames as `mascot-scout-{idle\|invite\|celebrate}-frame.png` into `media/inbox/`.  
5. `npm run media:optimize-inbox` → `public/brand/mascot/`.  
6. Update manifest; commit optimized WebP only.

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
- [ ] Brand colors only  
- [ ] No text baked into the image  
- [ ] Manifest entry with `kind: mascot`  
- [ ] Placement allowed by matrix above  
