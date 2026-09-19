# OVERNIGHT_GLM53 — BANGERS overnight playbook

**Audience:** a GLM‑5.3 (or compatible) overnight agent sitting on this repo  
**Seat:** Builder. A later Judge reviews. Do not self-LGTM.  
**Window:** one calendar night, one track, paper first.

This file is the runner. The product ideas live under `RESEARCH/BANGERS/NN-slug/`. Do not invent an eleventh track in the dark.

---

## Why this exists

Daytime agents open PRs. Nighttime agents drift: they merge tracks, mint checkout URLs, and start AVFoundation graphs before anyone asked to pay. This playbook is the stop-rule.

Customer zero for track **09** (`agent-job-bus`) is **this playbook**. If you need a queue, lease a row in `09` paper — do not stand up a hosted bus.

---

## Boot (every night)

1. Read [README.md](README.md) laws. Then this file. Then **one** track folder.
2. `node RESEARCH/BANGERS/scripts/verify-contract.mjs` — if red, fix honesty first. Do not add features on a red contract.
3. Pick the next **open** row in the table below. Skip a row whose dependency is still “sibling missing” unless the night’s ticket is paper that **names** the dependency.
4. Work only under `RESEARCH/BANGERS/` plus a routing row in root `INDEX.md` if the index is stale. No `src/`, `app/`, Android, Expo, `supabase/`, root `scripts/`.
5. Do not bump `APP_BUILD_LABEL`. Do not add a `CONTEXT.md` `## Now` bullet. This is not a Mission Winning ship.
6. Commit with `[skip vercel]` unless the founder asked for a Preview.
7. Draft PR. Do not merge. Builder ≠ Judge.

---

## Night queue (closed)

Run **one** row. If you finish early, stop. Empty harvest is allowed.

| Order | Track | Overnight job (paper) | Blocked when |
|-------|-------|------------------------|--------------|
| 1 | 04 receipt-ocr-shots | Tighten listing + three receipt layouts in SOURCES; no OCR binary | — |
| 2 | 06 ai-edit-auditor | Re-verify IPTC / DigitalSourceType wording against SOURCES; keep Spatial Reframe **locked** | — |
| 3 | 08 unlock-code-utils | Add one more legal scan pattern (Wi‑Fi QR field table). Refuse Screen Time PIN | — |
| 4 | 07 center-stage-coach | Device matrix: front UW + Center Stage capability query only | — |
| 5 | 10 screenshot-stack-pages | One more static-page template in BUILD_LATER, still no generator code | — |
| 6 | 09 agent-job-bus | Lease schema on paper; wire this playbook’s “pick next row” to 09 language | — |
| 7 | 05 tutor-repair-dualcam | Restate **depends on 01**. Expand sell copy. No multicam session | Sibling `01-dual-capture-plus` FRAMEWORK missing **and** you are tempted to invent the graph |
| 8 | 01 / 02 / 03 | Only if those folders exist on disk; fill gaps in **their** six files, do not rewrite 04–10 | Folder absent — leave a README note, do not stub 01–03 here |

---

## Sell-first bar (must stay green)

For the track you touched:

- `SELL_FIRST.md` still says **UNPUBLISHED DRAFT**
- No `https://` checkout. No `gumroad.com`, `lemonsqueezy`, `buy.stripe.com`, `paypal.me`
- Price is either an intended `priceLabel` (not a charge) or **UNKNOWN**
- Traction, TestFlight, and buyer email stay **UNKNOWN**
- Outreach drafts say **DO NOT SEND**

`paymentUrl` is a concept, not a field you fill. Leave it empty in prose: “no store URL.”

---

## Build-later bar (must stay red until sell)

Do **not** overnight:

- An Xcode target, a Vapor server, a Next.js route, or a Python OCR CLI that claims production
- A Spatial Reframe call (there is no public pipeline API — WWDC26 Camera lab)
- A Screen Time / Stolen Device Protection unlock
- A dual-cam session in 05 before 01 exists
- A hosted job-bus URL for 09

Allowed overnight code: the **verify script** in `RESEARCH/BANGERS/scripts/`, and HTML **proofs** that have no Buy button (same honesty as `fuel/` leftover packs).

---

## GLM‑5.3 operating notes

- Prefer expanding `SOURCES.md` with a URL you actually opened, plus one sentence of what it proves.
- If a source 404s, mark it **STALE** in SOURCES. Do not replace it with a guessed URL.
- Do not name consumer fitness rivals. Do not call ClearShot live.
- If you need spend routing, cite track 03. Do not paste API keys.
- One concern per commit. Title shape: `research(bangers): <track> <one fact> [skip vercel]`

---

## Done when (that night)

- Verify script exits 0
- Diff is only the track you named (plus this playbook if you fixed a queue row)
- Draft PR open, unmerged
- You wrote what you did **not** build

---

## Refuse

Invented payment URLs · fake sales · merging two slugs · MW wedge work · flipping `PRIVATE_MODE` · merging the PR · a second track “while I’m here”
