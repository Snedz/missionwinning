## 2026-08-03 — Victory honesty after coach-prescribed sessions (`.281`)

Completed logs keep `prescribed`; Victory progression insight uses
`sessionIsCoachPrescribed` so coached sessions do not get freestyle double-
progression copy. Cloud normalize preserves the stamp.

## 2026-08-03 — Coach session predicate for Active chrome (`.280`)

`sessionIsCoachPrescribed` pure helper — Active eyebrow and future apply-targets
call sites share one definition of "this is a Mission Coach load".

## 2026-08-03 — Shared Just Go hero meta builder (`.279`)

Lean + full Today shells now build train-CTA meta through pure
`buildJustGoHeroMeta` (one coach/freestyle rule, unit-tested). No product
behavior change beyond locking the `.278` honesty contract in one place.

## 2026-08-03 — Just Go honesty + deploy discipline (`.278`)

Today primary CTA no longer says **Just Go** when Mission Coach has a live
session for today — label/title load the planned session (`coachStartSession` /
session name); freestyle still says Just Go. Pure `resolveJustGoHeroCopy` +
`peekCoachToday` (sync). **Also:** coach path from Today now sets
`prescribed: true` (parity with `planSessionToTemplates`) so the logger does not
re-guess loads; Active chrome eyebrow **Mission Coach session** when prescribed.
Docs: Vercel free-tier **100 deploys/day** batching
([VERCEL_DEPLOY_CHECKLIST](docs/VERCEL_DEPLOY_CHECKLIST.md) §1.6); beta invite
checklist unblocks postal → migrations → invites first. i18n ratchet **702→698**.

## 2026-08-03 — Form/Today chrome + safe Dependabot (`.277`)

Form guide media, fuel photo dropzone, Today muscle readiness tiles, week
recap pillar stats, mind locked preview, sidebar, PFT runner/school panel —
solid 2px paper/ink. Deps: zustand 5.0.14, stripe 22.4.0 (apiVersion `2026-07-29.dahlia`),
radix-select 2.3.7, typescript-eslint 8.65. CodeQL action **v3 → v4**. Skipped
`@types/node` 26 (major) and Actions v7 majors.

## 2026-08-03 — Landing hero + Actions v5 (`.276`)

Public first impression: `LogToPlanHero` / fallback and coach adapt demo use
solid 2px paper/ink. Today reentry card, history pillar wins, sign-in prompt,
unlock waitlist field, live HR strip, Coach today card border. CI workflows:
`actions/checkout`, `setup-node`, `upload-artifact` **v4 → v5** (Node-20
deprecation path; Dependabot still open for v7 majors).

## 2026-08-03 — Leaderboard + public index hubs (`.275`)

Leaderboard board picker, scope tabs, table, call-sign/squad inputs — solid
2px paper/ink; “you” row uses a primary side rule instead of glow rings.
Board header dropped corrupted gradient utility stubs. Public `/exercises`
and `/paths` index/hub lists match the same chrome.

## 2026-08-03 — Compare, Press, forms chrome (`.274`)

Public marketing and lead forms still on soft tiles/focus rings: Compare story
rows + proof/verdict, Press kit downloads/palette/boilerplate, Programs
curriculum modules, Coaching interest + Feedback textareas — solid 2px
paper/ink, focus via border (not ring glow). Coaching errors use brand primary
text, not off-palette red.

## 2026-08-03 — Public SEO + Train/Mind/Move chrome (`.273`)

Solid 2px paper/ink on high-traffic public and in-app surfaces still on soft
borders: exercise pages (form media, safety, alt/related chips, free CTA),
learn path teaser + I-Day CTA, beta start list rules, Train readiness/volume
strip, Mind and Move premium preview toggles.

## 2026-08-03 — Victory + guide chrome (`.272`)

Habit-loop close and public guide polish: Victory sheet volume/sets, feel
scale, body-delta strip, and next-action card use solid 2px paper/ink (feel
scale is a ruled five-cell strip like session check-in — no soft muted
tiles). Live session header is a 2px bottom rule. Public `/guide` related
exercises section + chips match the same system. Actions major Dependabot
(checkout/upload-artifact/codeql v7) left open — higher CI risk.

## 2026-08-03 — Today/Coach anti-slop + Dependabot (`.271`)

Modernist pass on Today + Coach surfaces that still used soft borders,
shadows, and leftover gradient utility stubs: Coach today-session card is a
2px primary top rule (no `shadow-md`); trend tiles, customize panel, week
recap icons, and chat bubbles use solid 2px paper/ink rules. Bumped
`@radix-ui/react-tabs` 1.1.13→1.1.21 and `globals` 15→17.8 (Dependabot #112,
#111) on master so those PRs can close.

## 2026-08-03 — Fuel estimate honesty + better NL match (`.270`)

Horizon W Fuel accuracy: Describe→Custom now shows **matched/rough** +
confidence chips and a detected-foods line (or a clear rough placeholder note)
before Log — estimates no longer land on Custom looking finished. NL parser
gains scoops / oz / tbsp quantities, multi-word oils only (bare “oil” is rough),
and more gym foods. Photo heuristic: color-only guesses are named
“(color guess)” and never high confidence. i18n coverage 707→702.

## 2026-08-03 — Magazine PDF + logger swap sheet (`.269`)

`.268` re-inked chapter heroes on the web; the magazine PDF still shipped the
dark set. Rebuilt `public/magazine/beyond-the-basics.pdf` from `/guide/print`
(~27pp, v1.4.2). Logger **swap exercise** moves into `AdaptiveOverlay` (same
treatment as add-exercise) so the catalog no longer fights the set list for
height. Session note field squared to 2px border. Move premium loading label
named.

## 2026-08-03 — Guidebook heroes re-inked; Bundle/offline craft (`.268`)

`.258` measured six chapter heroes at 84–97% near-black with ~0% brand red on
paper `/guide` pages, and declared them debt because the image CDN was blocked.
`.268` does not wait on the CDN: the heroes are paper/ink/one-red diagrams
(same system as form-guides), regenerated by
`scripts/generate-guidebook-heroes.mjs`, checked by
`check-guidebook-heroes.mjs`. `KNOWN_OFF_PALETTE` is empty — the ratchet
tightened. Bundle compare/tabs use 2px rules and token borders (no raw accent
HSL). Offline queue relative times use i18n keys instead of hard-coded English.

## 2026-08-03 — Return loop honest when push is dark (`.267`)

The anonymous return channel was already built (migration, subscribe route,
device_id, cron candidates). What remained was a **void**: signed-out You
rendered nothing about reminders when VAPID/SW are dark. Profile now shows
an honest card pointing at Today re-entry. Docs: RETURN_LOOP_PLAN status
corrected to code-shipped / founder-ops inert.

# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md).

---
