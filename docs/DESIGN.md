# DESIGN.md — modernist tokens, Patreon layout

**Stamp:** `.1049` · **Lane:** Design / Brand · **Horizon:** W (craft window)  
**Not a token rewrite.** Tokens stay [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). This file freezes the *layout* pass: unsigned Patreon structure on Mission Winning paper/ink.

Companions: [brand-guidelines.md](brand-guidelines.md) · [DESIGN_PROPOSAL_WWW.md](DESIGN_PROPOSAL_WWW.md) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) · runtime [`src/index.css`](../src/index.css) · generated [`sites/www/src/styles/tokens.css`](../sites/www/src/styles/tokens.css)

---

## 1. What is settled (do not move)

| Layer | Lock |
|---|---|
| Paper | `--background` `#f3f2f2` |
| Ink | `--foreground` `#201e1d` |
| Surface | `--card` `#eae9e9` |
| Poster red (≤1 field/page) | `--accent-poster` `#ec3013` |
| Button fill | `--primary-fill` `#dd2b0f` |
| Small red text | `--primary` `#ae1800` |
| Tint | `--accent-tint` `#fff2ef` |
| Rules | 2px solid `--border` only |
| Radius | `--radius` `0rem` |
| Type | **Archivo only** — display 800 sentence-case flush left; body 400 (17/28 marketing, 15/24 app); eyebrow 600 caps 13px / 0.08em / `tnum` |
| www rhythm | section 96/128px (pair 256); statement 192/416 (pair 544). Hero `.display-hero-www` `clamp(2.75rem, 6.6vw, 6rem)` |
| Light-only | Navy / emerald / brass retired. No shadows, glows, gradients. Do not bevel the logo. |

**Ban:** purple gradients, emoji icons, Inter, stock photos, centred-everything, rounded SaaS cards, coral/cream Anthropic clone, second chromatic, fake traction / stats / testimonials.

---

## 2. What this pass may move

**Layout only.** Clone unsigned Patreon *structure* — sticky wordmark nav, editorial shelves, product-as-hero — on our tokens. Do not invent a third brand. Do not remount `CinematicWww` as first paint.

www argument order stays log → adapt → anywhere → free → start ([DESIGN_PROPOSAL_WWW.md](DESIGN_PROPOSAL_WWW.md) §2). Rhythm numbers stay. Copy on the gated door stays [`src/i18n/gateEn.ts`](../src/i18n/gateEn.ts). www lines stay [`sites/www/src/lib/homeContent.ts`](../sites/www/src/lib/homeContent.ts).

---

## 3. Page map

| Surface | File | Job |
|---|---|---|
| Live gated door (prod `/` → 307) | `app/private/*` | Tight lock: Free · Log a set. / Offline. · No account. No wearable. · Get notified · Enter with code. Left-cluster nav over a full-bleed ink hero + one-idea bands. Forms stay on this page. |
| Astro marketing www | `sites/www/src/pages/index.astro` | Same tokens; 9-section composition stops reading as a wireframe. Shared `WwwNav` / ink footer. |
| Cookie / gate-off `/` | `LandingPage.tsx` | Stays `.696`. Not this pass. |
| App chrome | `AppLayout` · `AppHeader` · `Sidebar` · `MobileNav` | 64px paper header. Rail and tabs keep working. Today still one Start. |
| Settings | `/account` (`AccountPage`) | Studio groups (account · units · export · privacy). Not a `/settings` route. |
| Public SEO chrome | `MarketingNav` · `PublicSiteFooter` | Train / Coach / History / About. Real hrefs. |

---

## 4. Patreon analog (structure, not brand)

**Nav (sticky, 64px, over the hero, then paper):**

- Left cluster: Train · Coach · History · About
- Center wordmark: Mission Winning
- Right: secondary text + one primary CTA (Enter with code / Get notified). Radius 0, 2px rule — not a pill. The page’s one red stays the notify submit or the poster close.

**Bands (full-bleed, one idea + one verb each):**

1. Hero — full-bleed ink field, enormous flush-left “Log a set. / Offline.” + product credit. Photography only if it is already in the repo (none on the door — `public/photo/` is still a slot).
2. Train — paper, 50/50 copy + set-log table as a phone mockup
3. History — surface, a month you own (calendar/file), not a feed
4. Today — ink, exactly one Start → `/active`
5. Coach — paper, weekly plan from logs, no wearable pitch
6. Door / close — Get notified + Enter with code (gated) or the existing red poster close (www)
7. Ink footer — Product / Company / Legal columns we already have. Line: free core forever.

Pacing: ink → paper → surface → ink → paper → surface → ink footer. Do not repeat the same surface twice in a row. Poster red ≤1 field (www close). No feature-card trio. No creator carousel.

---

## 5. Fail list

- Do not promote production. Live www stays `.696`. `[skip vercel]`.
- Do not flip `PRIVATE_MODE`.
- Do not ship Inter, cream `#faf9f5`, coral `#cc785c`, or radius 8.
- Today stays exactly one Start. No Feed, no share, no public creator URL.
- First set stays ungated. Guest path stays. `/active` stays public while gated.
- Door copy: no invite-only, private beta, get an invite, open alpha, Win Daily.
- No fake users, member counts, or testimonials.
- 44px taps. Honest empty states. Speech never owns first paint.
- Do not add a parallel unused landing HTML.

---

## 6. Done

Preview (or local) shows paper + Archivo + Patreon nav/shelves. The set table is the product hero. Menus and `/account` work. Tokens unchanged. No production promote.
