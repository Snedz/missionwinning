# Unified UI Plan — Mission Winning

**Date:** 2026-06-29  
**Status:** Phase 2 largely complete; Phase 3 started  
**Authority:** Extends [JOURNEY.md](JOURNEY.md) + [vision.md](vision.md)

---

## Problem statement

Users report the UI “still looks the same” because:

1. **Simple vs Pro mode** hid the dashboard, More tools, and metrics behind a Profile toggle most people never find.
2. **Two gating axes** (journey phase × app mode) conflicted — commissioned users in Simple mode still saw a stripped Today page.
3. **Mobile had no More entry** unless Pro was enabled — contradicting JOURNEY.md (“5 tabs + More drawer for everyone”).
4. **~90% of copy is English** — language switch only changes nav chrome, so the app feels unchanged after switching language.
5. **Deploy lag** — features on `master` only appear after Vercel redeploy + hard refresh / PWA cache clear.

**Decision:** Remove layout modes. One UI. Journey phase controls progressive disclosure.

---

## Competitive research synthesis

### Bevel (Health & Performance)

| Pattern | What they do well | Mission Winning adoption |
|---------|---------------------|---------------------------|
| **Metric-first home** | Strain, Recovery, Sleep rings at a glance | Readiness / Strain / Recovery row + Mission Score hero |
| **Customizable cards** | User edits home dashboard cards | Journey-driven sections (collapsed accordion → expand as user progresses) |
| **FAB quick actions** | Rotate + menu for log food, workout, etc. | Floating **More** button (pillars + leaderboard) on mobile |
| **Liquid glass chrome** | Frosted nav, depth, polish | Keep `glass-nav`; add subtle gradient metric cards |
| **Multiple log paths** | Photo, barcode, text for nutrition | Keep Fuel tab primary; More → advanced tools |
| **Guided first day** | Blank slate risk on day 1 | Journey hero + I-Day (already shipped) |
| **Strength Builder** | Rest timers, progression, live activities | Active workout logger (existing); progression in History |

### Freeletics ecosystem (Coach + Nutrition + Super Bundle partners)

| App / pillar | UX lesson | MW equivalent |
|--------------|-----------|---------------|
| **Freeletics Coach** | One personalized “next workout”; long onboarding → credible plan | Journey hero CTA = single next step |
| **Nutrition app** | Recipe search by ingredients + cook time | Fuel tab + recipe logging |
| **Calm / Waking Up** | Mind as separate app but bundled | Mind in More |
| **Pliability / Skill Yoga** | Mobility on rest days | Move in More |
| **MapMyFitness** | Cross-activity tracking | Track tab |
| **Super Bundle** | One subscription, email unlocks partner apps | Super Bundle in More; free core always on |
| **2025 visual refresh** | Unified typography, spacing, scanability | Design token pass in `index.css` |

### One app, six pillars (target)

```
┌─────────────────────────────────────────────────────────────┐
│  TODAY (command center)                                      │
│  Journey strip → Hero CTA → Mission Score + 3 rings         │
│  Quick links (Rankings) → Accordion details (when ready)     │
├─────────────────────────────────────────────────────────────┤
│  PRIMARY TABS: Today · Train · Fuel · Track · You           │
│  MORE (all users): Move · Mind · Learn · Builder · Library  │
│                    History · Leaderboard · Readiness · …     │
└─────────────────────────────────────────────────────────────┘
```

Not seven separate apps — **one shell**, Freeletics-bundle **depth** behind More + premium.

---

## Design principles (unified)

1. **One boss screen** — `/log` answers “What do I do right now?”
2. **One primary green CTA** per screen (Journey hero).
3. **Progressive disclosure by journey phase**, not hidden settings.
4. **Metrics when earned** — rings appear at Readiness+, not day 0.
5. **More for everyone** after I-Day — leaderboard, Move, Mind, Learn.
6. **Plain language** — “Start workout”, not “Initialize session”.
7. **44px tap targets**, glass chrome, solid content cards (Apple HIG).

---

## Journey → UI mapping (replaces Simple/Pro)

| Phase | Today shows | More access |
|-------|-------------|-------------|
| **I-Day** | `/welcome` flow only | N/A |
| **Basic** | Strip + hero + encouragement | FAB / sidebar More (discover pillars) |
| **Readiness** | + Mission Score + metric rings + collapsed accordion | Full |
| **Commissioned** | + quick links + expanded dashboard defaults | Full |

---

## Phase roadmap

### Phase 1 — Unify (this PR) ✅ target

- [x] Remove Simple/Pro layout gating
- [x] Global More (FAB mobile + sidebar for all)
- [x] Bevel-style `TodayDashboardHeader` (score + rings)
- [x] Journey-only accordion gating
- [x] Visual token refresh (`index.css`)
- [x] Deprecate Profile app-mode toggle
- [x] Build label `2025.06-unified.1`

### Phase 2 — Polish (in progress)

- [x] Header dropdown navigation (replaces More FAB / More tools sheet)
- [x] Slim sidebar — primary tabs only
- [x] Extract `TodayPageHeader`, `TodayHealthSection`
- [x] Welcome page uses design tokens
- [x] Remove duplicate Profile first-time setup form (→ I-Day)
- [x] Unified SignInPanel + SignInPrompt (Google/email; Apple opt-in via env)
- [x] Commander's Intent on commissioned Today
- [x] Legal footer (Terms / Privacy / About) on Profile, Welcome, private gate
- [x] Page enter animations on hero + private gate
- [x] i18n: Welcome strings (`welcomeLocales.ts` — en, zh, id, th, es)
- [x] i18n: Today accordion + section chrome (`todayLocales.ts` — en, es, zh, id, th)
- [x] HomePage refactor: `starterPrograms.ts`, `TodayWeekSection`, `TodayProgressSection`
- [x] Page enter transition on route change (AppLayout)
- [ ] i18n: Weekly challenge titles, wins badges (dynamic copy)
- [ ] Animated hero transitions (staggered blocks)

### Phase 3 — Holistic depth

- Nutrition photo log stub (Bevel-style entry points)
- Commander’s intent line on commissioned Today
- Customizable dashboard card order
- Arabic RTL + zh full body copy

---

## Files changed (Phase 1)

| Area | Files |
|------|--------|
| Plan | `UX_UNIFIED_PLAN.md` |
| More global | `src/contexts/MoreNavContext.tsx`, `MoreFab.tsx`, `AppLayout.tsx`, `Sidebar.tsx` |
| Today layout | `useTodayLayout.ts`, `TodayDashboardHeader.tsx`, `HomePage.tsx` |
| Mode removal | `ProfilePage.tsx`, `AppLayout.tsx` |
| Theme | `src/index.css`, `buildInfo.ts` |
| Docs | `JOURNEY.md` (note), `BETA_INVITE.md` |

---

## Success metrics

- Testers reach Leaderboard without changing a setting
- Profile no longer mentions Simple/Pro
- Commissioned users see Mission Score + rings on Today by default
- “Build 2025.06-unified.1” visible on Profile after deploy

---

## References

- [Bevel UI breakdown](https://screensdesign.com/showcase/bevel-health-performance)
- [Freeletics UI breakdown](https://screensdesign.com/showcase/freeletics-workouts-fitness)
- [Freeletics Super Bundle](https://www.freeletics.com/en/blog/posts/freeletics-super-bundle/)
- [Freeletics visual refresh (2025)](https://contra.com/p/moPkqMFg-freeletics-app-visual-refresh)
