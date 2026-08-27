# PLAN — Patreon costume on our skeleton (`.1051`)

**Freeze.** Founder GO 2026-08-27. Stamp `.1051`. Do not rewrite this mid-build to invent surfaces.

Modernist paper/ink/Archivo (`docs/DESIGN_SYSTEM.md`) is the **wireframe costume**. It stays on disk. The live public www + signed-in chrome clone unsigned / creator-studio Patreon visually and hang **our** routes and copy on it.

Tokens: [DESIGN_PATREON.md](DESIGN_PATREON.md). Wireframe snapshot: [archive/www-wireframe-1050/](archive/www-wireframe-1050/).

---

## Surfaces (in, out)

| Surface | Costume | Holds |
|---------|---------|--------|
| `sites/www` homepage + about/vision/compare/week/start | Unsigned Patreon: sticky chrome, photo hero, editorial shelves, black/white pills | Copy from `homeContent.ts` (and sibling content modules). No fake stats. No stock we do not have. |
| Next cookie `/` `LandingPage` | **Stays `.696`** | Do not restyle the Next landing body. |
| `/private`, `gate.css`, `PrivateTeaserClient`, `GatePendingChrome`, `src/i18n/gateEn.ts` | Tight lock | **Zero diff vs `.1050`.** Do not import Patreon tokens here. |
| Public login/signup chrome (`MarketingNav`, `PublicPageShell`, `SignInPanel`, `/welcome` chrome) | Pills | Not the gate. |
| Signed-in `AppLayout` / `AppHeader` / `Sidebar` / `MobileNav` | Dual rail: 72px icon + ~264px studio | Map: Today, Train (`/active`), Coach, History, Library, Account. No DMs, no comments, no workout feed. |
| `HomeTodayDashboard` / Today | Creator-studio **main column** | **Exactly one Start.** Not a posts feed. Not recommended creators. |
| `/account` | Two-column settings | Profile / Account / Privacy / units / export. Existing cards stay; chrome only. |
| Train logger, History edit, Coach engine | Unchanged product | First set ungated. Guest path stays. |
| Android / Expo | Out of this ship | Token-sync still pins modernist `src/index.css`. |

---

## Hard holds (do not bargain)

1. Never change `app/private/**`, `gate.css`, `PrivateTeaserClient`, `GatePendingChrome`, `src/i18n/gateEn.ts`.
2. Do not merge leftover PR #876 / `cursor/modernist-patreon-layout-ef8c`.
3. Today stays exactly one Start. No Feed, no share, no public creator URL, no Discord.
4. First set ungated. Guest path stays. Cookie `/` LandingPage stays `.696`.
5. No fake traction, testimonials, or member counts.
6. No USMC/ACFT-official, no medical-device claims.
7. Do not overwrite `docs/DESIGN_SYSTEM.md`.
8. Do not flip `PRIVATE_MODE`. Do not promote. Do not touch live `.696` deploy. `[skip vercel]`.
9. Do not invent extra colors. Closed set is in DESIGN_PATREON.md.
10. Do not rewrite history. Do not force-push.

---

## Shared tokens (hypothesis)

**Verified in this ship:** one CSS module, `src/styles/patreonTokens.css`, is imported by www (`sites/www/src/styles/global.css`) and by signed-in / public chrome (`AppLayout`, `MarketingNav`). Scoped under `.ptn` so `/private` and the modernist `:root` never pick it up.

`sites/www/src/styles/tokens.css` stays **generated** from `src/index.css` (token-sync). Patreon values do not replace that file.

---

## Build order

1. This plan + DESIGN_PATREON.md + token CSS + allowlist.
2. Snapshot `sites/www` → `docs/archive/www-wireframe-1050/`.
3. Public www (unsigned Patreon).
4. Public login/signup pills (not `/private`).
5. Signed-in dual-rail + Today Start shelf + account columns.
6. Imagine prompts. Stamp `.1051`.
