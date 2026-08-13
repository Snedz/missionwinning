# WWW_NIGHT — the overnight website

**Date:** 2026-08-13 · **Label:** `2026.07-unified.701` · **Status:** draft direction, not founder-signed  
**Surface:** public marketing / gated door only. Signed-in Today / Train / Coach are untouched.  
**Comp:** [`concepts/05-exquisite.html`](concepts/05-exquisite.html) (open the file; no build)  
**Live port:** gated `/private` (what visitors actually see) + post-unlock `/` (`LandingPage`)

---

## 1. What the history actually said

Read in order, not from chat.

| Layer | What it settled | What it left open |
|---|---|---|
| Tokens / type / radius | Paper `#f3f2f2` · ink `#201e1d` · three reds · Archivo · radius 0 · 2px rules · light-only | Expression |
| Live `/` | `PRIVATE_MODE` on. `app/page.tsx` redirects cold visitors to `/private`. The waitlist wireframe **is** the website. | Whether the door may look like a company |
| LandingPage | Product loop in copy (log → adapt → anywhere → free → start). Hero is a **boxed specimen** of `LogToPlanHero` beside a headline. Stats grid, 3-up photo slots (empty), FAQ, poster close. | Composition. It is a correct argument wearing a template |
| A1 `sites/www` (PR #440, closed) | Wave 10 type/rhythm measured. Wave 11 found the page still a wireframe: **~4% image, ~0% at the fold**. Composition rebuild put photographs under type, one ink field, red close. Nine sections. Dead CTAs caught and fixed. | It is still a **homepage of bands**. Photography was upscaled portraits. Compare rail, FAQ, stat grid remained |
| Wave 10 | Display size was already in-band. The gap was **vertical rhythm** (section gaps ~half the bar) and **CTA discipline** (one shape, repeated). All four refs are near-black; MW’s paper ground is the differentiator. Take La Huella’s rhythm; **refuse its JS-only body**. | Imagery unmeasured |
| Wave 11 | Fold is the target (≥60% image in first 900px). Type sits **on** the image. Ground changes 0–6 per page, never per section. Dedicated pages are marked by **two CTAs, one string repeated** — not by stripping length. Auth/checkout are the nav-less surfaces. | Floors cannot tell a good photograph from twelve bad ones |
| Comp B (founder lock, tonight) | Product-as-hero: the **LOG SET still** at cinematic scale. Mark is the real `/brand/logo-icon.svg`, stacked. | Not a cage. Inputs. |
| 04-combined (PR #482) | Anywhere pin → Week instrument → Field Manual. Ground plan followed §11.3. | Three architectures glued. Field Manual is a spec dump. Second typeface (Barlow / Plex / Inter) against the Archivo law. Too many scenes. |
| SpaceX.com (structure only) | Each section is a 100vh *scene*. Photography/video is the page. One type voice, flush left, almost no chrome. One repeated CTA, ghost or singular. | Palette, D-DIN, all-caps, black ground — **costume if cloned** |

The recurring defect is the same one Wave 11 named: **a page that matches every measured number and still reads as a wireframe**, because the missing axis was composition, and then the missing axis after composition was *ambition*. Nine correct bands are still a template.

---

## 2. Steal / refuse

**Steal (structure, not skin)**

- SpaceX: scene = viewport. UI disappears. Type on the scene. One CTA shape, repeated. No card wallpaper.
- Freeletics Nutrition (Wave 11 §11.4): CTA discipline, not shortness. One string, every ~800–1000px.
- TrainHeroic: a reassurance line under the action (*no account / nothing to install*), not buried in a paragraph.
- CoD: type on full-bleed; the fold is an image.
- La Huella: statement gap. One sentence, a lot of air. Delivery refused.
- Comp B: the product performing is our rocket footage. Stacked real MW mark.
- Wave 11 ground budget: paper dominant, **one** inverted field, red spent once.

**Refuse**

- SpaceX black + D-DIN. Navy/emerald/brass. Gradient blobs. Inter-on-cream. Card grids. Feature icons. Testimonials. Traction numbers. Evidence thesis in the hero. Invite-only / get-an-invite / we’re-live / start-free on the gated surface.
- A1’s nine-section homepage (stats, compare rail, FAQ-as-band).
- 04’s Field Manual spec tables and second typeface.
- Alternating paper/ink/photo/red per section (Wave 11 killed this).
- AI body-composition photography; physique as proof (brand-guidelines § Voice).
- JS-only body (La Huella). The page must read with script off.
- Restyling Today / Train / Coach in this PR.

---

## 3. Chosen direction — four scenes, one page

The two-surface hypothesis (cinematic gated `/` + A1 as the deeper homepage) is **discarded**. A1 is the wireframe the founder already rejected. A second page of bands would be homework. One exquisite page is stronger.

**The website is the door.** Cold visitors never see `LandingPage` today. Replacing `/private` is the only way the work is visible before `PRIVATE_MODE` flips. `/` keeps its invite-preserving redirect (`/?invite=` → `/private?invite=` — `.690` / the gated-redirect tests). Post-unlock `/` gets the same four scenes so flip day is not a downgrade.

| Scene | Ground | What it is | CTA |
|---|---|---|---|
| **1 · SET** | Paper. The logger *is* the photography — full-viewport field, not a split widget. | Stacked real MW. Public line **Train Anywhere. Win Daily.** Headline **Log a set. Offline.** Set table at cinematic scale. **LOG SET** is the page’s one red. | Ghost **Free beta** in the HUD, repeats, always → `/private#door` |
| **2 · ANYWHERE** | **The one inverted field** — documentary photograph, grayscale, type in an ink slab on the image (no gradient overlay; those are gate-banned). | One sentence. Not a 3-up card row. | Ghost Free beta |
| **3 · WEEK** | Paper returns (ground change 2 of 2). | **Mission Coach** kicker. The week instrument answers the log. Same engine numbers: 3×12 @ 80 kg → 8 × 82.5 kg. | Ghost Free beta |
| **4 · DOOR** | Paper. | Stacked mark. Free beta. Get notified + Enter with code. Ghost submit so the page still spends **one red** (LOG SET). | Real `action="/private"` |

Ground changes: **2** (paper → photograph → paper). In the 0–6 band. Red: one control, scene 1.

JS-off: every scene is HTML. The logger shows set 1 active and the reason line. The week shows the rewritten Wednesday. Forms post to `/private`. Fonts are progressive (Archivo from Google with grotesque fallback); the page does not wait on them.

**Not in the page:** stats row, FAQ, compare rail, testimonials, six-pillar pitch, evidence thesis, traction, WeChat / mini-programs / money, a fifth 100vh scene.

**Nested mission (do not collapse).** Three layers stay distinct:

| Layer | What it is | Where it lives on this page |
|---|---|---|
| **North star** | Mission Winning as an everything ecosystem (habit → Athlete Page → money → mini-programs). After health PMF + cash. | Thesis only. Not fold 1. |
| **Narrative** | Train Anywhere. Win Daily. | Hero kicker. Locked public line. |
| **Wedge (L1)** | Mission Winning Health: free offline logger + Mission Coach from logs. | Headline `Log a set. Offline.` + WEEK kicker `Mission Coach`. |
| **L2 later** | An athlete page you author. Not a feed. | One quiet line after `</main>`. Never the first viewport. |

Fold 1 is Train + Coach. Quiet later is not a six-pillar dump and does not say WeChat, MySpace, or mini-programs.

---

## 4. How this differs from A1 and from Comp B

| | A1 `sites/www` | Comp B lock | 05 |
|---|---|---|---|
| Length | ~9 sections | Hero still | **4 scenes** |
| Hero | Photo ground + boxed demo overlapping it | Product-as-hero, postage risk | Product-as-hero at **viewport scale** |
| Mark | CSS “MW” square | Real `/brand/logo-icon.svg` stacked | Same, stacked, not a horizontal lockup |
| Photography | Three upscaled portraits, reused | Optional | One full-bleed (scene 2 · Anywhere). SET and WEEK refuse a photo so the logger/week can be the image |
| CTA | “Get an invite” (later fixed) | — | **Free beta · Enter with code · Get notified**. Never invite-only |
| Type | Archivo | Archivo | Archivo. Sentence case. Flush left |
| Second face | No | — | No (04 used Barlow/Plex/Inter — refused) |

---

## 5. Ship path

1. **First cut (draft PR).** Comp + thesis + gated `/private` port + post-unlock `LandingPage` port. PR stays **draft**. Do not burn Hobby Preview until ~Thu 14:30 ET. Do not merge. Do not flip `PRIVATE_MODE`.
2. **Iterate (this pass).** Nested copy: public line on fold 1, WEEK kicker = Mission Coach, quiet L2 after the door. Founder-lockable landing by Friday evening. Still website only — do not recut Today / Train / Coach.
3. **Founder eyes.** 1440×900 and 390×844, JS on and off. The question is: does scene 1 feel like SpaceX-scale product, or like a widget on paper?
4. **Photography.** Scene 2 in the HTML uses a generated grayscale still as a *comp frame*. The live Next port uses an honest slot (`GrayscalePhoto` / ink field) until a real HP5 frame from [`GROK_IMAGE_PACK.md`](GROK_IMAGE_PACK.md) (on the A1 branch) lands. Generated art must not ship as the live photograph — `GrayscalePhoto` already states this.
5. **Post-flip.** Same four scenes. Ghost **Free beta** becomes **Start free** → `/welcome`. Door scene drops waitlist. One red remains LOG SET, or moves to Start free — founder call. Do not invent a fifth band.
6. **A1 `sites/www`.** Do not recover as the product. Keep the branch as research (rhythm guards, composition floors, token generation). If the Astro surface is ever the public www, it should be *this* four-scene page, not the nine-band rebuild.
7. **What would later port to the signed-in app** (not this PR): cinematic scale of the set row; stacked mark in chrome; statement-gap empty states; killing card wallpaper on Today. Train’s Log set already owns the one red — keep that.

---

## 6. Compact notes (390×844)

- Nav is a HUD: `position: fixed`, transparent, no background, no border. Mix-blend difference so it reads on paper and on the ink Anywhere field. Small mark left, ghost Free beta right. No wordmark mass.
- SET is a single field filling `100svh`. Cover chrome (stacked mark + kicker + h1) on the field; the logger occupies the rest. Not type-left / widget-right.
- Week becomes a list, not seven columns.
- Door form is full width. Enter with code is a `<details>`, never a second red.

---

## 7. Copy law (gated surface)

Allowed: **Free beta** · **Enter with code** · **Get notified**.  
Forbidden as product-status: invite-only, get an invite, private beta, we’re live, start free, checking sign-in, publicly available.  
Invitee-with-code copy may say they have a code. That is a fact about the URL, not a positioning.

**Public line (locked):** Train Anywhere. Win Daily. — hero kicker, not a subtitle dump.  
**Headline stays Train:** Log a set. Offline.  
**Coach beat:** WEEK kicker is Mission Coach. Lede names Coach from the log.  
**Quiet L2:** Mission Winning Health. Later: an athlete page you author. Not a feed. After `</main>`, not a scene.  
**Never on this page:** six-pillar list, Fuel · Move · Mind as a pitch, WeChat, mini-programs, money, a feed.

Door always `/private`. Homepage `/`. No `href="#"`.
