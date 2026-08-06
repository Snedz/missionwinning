# Kalligator — Mission Winning brand mascot

**Audience:** Founder, agents, press, social.  
**Brand colors / voice:** [brand-guidelines.md](brand-guidelines.md) · **Media pipeline:** [MEDIA_SYSTEM.md](MEDIA_SYSTEM.md) · **Flow prompts:** [`media/FLOW_PROMPTS.md`](../media/FLOW_PROMPTS.md)  
**Assets:** `/brand/mascot/` · **Manifest:** [`media/manifest.json`](../media/manifest.json)

**Kalligator** is Mission Winning’s sticky companion character — **one silhouette, one job**. Kalligator is **not** the Mission Coach LLM and **does not** replace the MW monogram logo.

> **Renamed from Scout (falcon kit retired `.542`).** Do not ship Scout assets or “Duo” naming.

---

## Identity

| | |
|--|--|
| **Name** | **Kalligator** |
| **Silhouette** | Cute cartoon **crocodile / alligator** — bold snout, cream belly, red back spines |
| **Style** | Flat sticker shapes, thick ink outline; readable at 48px and 1080px |
| **Colors** | Teal body · cream belly · red back spines · ink outlines · paper field. Character teal/cream is an allowed **mascot exception** to UI chrome (product chrome stays paper/ink/one red). |
| **Job** | Mission briefing companion — invite to log, celebrate Victory, never shame |

### Personality (lock)

1. Clear, brief, respectful of time — mission briefing energy.  
2. Celebrates the log (“set locked”) more than it nags absence.  
3. Never shames missed days; max tone = “Mission still open when you’re ready.”  
4. “Crash-out” celebrate pose is **playful joy**, not rage-quit or streak guilt.

### Relationship to marks

| Mark | Role |
|------|------|
| `/brand/logo-icon.svg` (MW monogram) | Primary logo — press, favicon, wordmark |
| Kalligator | Character / companion — social, one empty state, Victory flourish |
| Form-guide stick figures | Teaching diagrams — **not** Kalligator |

Do **not** put Kalligator inside the MW monogram square as a logo replacement without founder sign-off.

---

## Visual rules

| Do | Don’t |
|----|--------|
| Fixed proportions; same snout / spines / belly every time | Photoreal crocs, soft 3D gym mascots |
| Cream belly + red spines + teal body | Purple, gold glitter, competitor owl clone |
| Calm → invite → celebrate pose language | Anger at the athlete, crying, “you failed” faces |
| Transparent or solid paper canvas | Busy photo backgrounds under the character |

**Expression set (v1) — from sheet `mascot-croco-sheet-34`:**

| File | Pose | Use |
|------|------|-----|
| `kalligator-idle.webp` | Calm / composed | Default companion still |
| `kalligator-invite.webp` | Escalating / ready (fist) | Empty History + social invite |
| `kalligator-celebrate.webp` | Crash-out joy (stars) | Victory flourish only |
| `kalligator-mark.svg` | Simple head mark | Optional small chrome |

---

## Voice samples

| Context | OK | Not OK |
|---------|----|--------|
| Empty History / first week | “No session yet. Start when ready.” | “You abandoned your mission.” |
| Victory | “Set locked. Win logged.” | Streak shame / guilt |
| Social invite | “Train anywhere. Free logger.” | Paywall guilt |
| Rest / quiet day | “Mission still open when you’re ready.” | “Don’t break the chain.” |

Kalligator copy is **product microcopy**, not Mission Coach chat.

---

## Placement matrix

| Phase | Where | Rule |
|-------|--------|------|
| **A** | Social creatives · [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) | Kalligator on invite / coach posts |
| **B** | **One** empty state (History — no workouts yet) | Single illustration + one CTA |
| **C** | Victory flourish | Honor moment only — not confetti spam |
| **Later** | Push / email (founder-owned) | Same anti-guilt lines |

**Never:** Active / Train logger density, every pillar empty, Coach chat avatar takeover, paywall shame.

---

## Generation

1. Prefer sheet continuity with `media/inbox/mascot-croco-sheet-34.jpg` as identity lock.  
2. New poses: drop `mascot-kalligator-{idle|invite|celebrate}-frame.png` into `media/inbox/`.  
3. `npm run media:optimize-inbox` → `public/brand/mascot/`.  
4. Update manifest; commit optimized WebP only.

Legacy `mascot-scout-*` inbox names still map to **kalligator-*** outputs in optimize-inbox (rename bridge).

---

## Checklist before shipping a new Kalligator asset

- [ ] Same croco silhouette as kit  
- [ ] Teal / cream / red spines / ink only  
- [ ] No text baked into the image (sheet labels stripped when cropping)  
- [ ] Manifest entry with `kind: mascot`  
- [ ] Placement allowed by matrix above  
