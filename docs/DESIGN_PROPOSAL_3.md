# DESIGN_PROPOSAL_3.md — brief for the final design proposal

**Lane:** Design / Brand · **Horizon:** W (craft window) · **Status:** brief — nothing here is approved design
**Governs:** what the third proposal must contain, how it will be judged, and which stage of the flow it sits at
**Companions:** [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) (waves + lock table) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) + [brand-guidelines.md](brand-guidelines.md) (tokens — **the** source of truth) · [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) (floorplan) · [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) (the new surface) · [UX_PLAYBOOK.md](UX_PLAYBOOK.md) §5 (wireframe + component-state standard)

> **Numbering collision — confirm before commissioning.** [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) already records **three handoffs**, and warns in bold that they are *three surfaces, not three revisions of one product*: `design_handoff_modernist_rebrand` (marketing), `design_handoff_missionwinning_modernist` (desktop app), `design_handoff_mobile_app` (mobile app). "Proposal 3" in the founder's numbering is therefore **not** handoff 3 in the repo's. This brief is for the **next and final** proposal; it is written to be surface-explicit so the `.159` failure — one handoff applied at every width, silently overwriting another — cannot recur.

---

## 1. The premise: the shipped product is the wireframe

The founder's framing is that the website is a wireframe. Taken precisely, that is a statement about **which layer is settled and which is open**, and it is worth stating exactly, because "it's a wireframe" is otherwise an invitation to redraw things that cost real money to get right.

| Layer | State | Open to proposal 3? |
|---|---|---|
| **Information architecture** — dies, tabs, buses, critical path | **Settled.** [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md), 20+ shipped flow fixes (Flow-0…K11) | **No.** Changing it re-opens closed defects |
| **Route inventory + naming** | **Settled.** Trap terms are load-bearing (Today=`/log`, Train=`/active`, Coach≠Coaching) | **No** |
| **Design tokens** — paper/ink, three reds, Archivo, radius 0 | **Settled and gate-enforced** (`check-design-system`, `check-token-sync`) | **No.** A raw hex fails the build |
| **State rules** — no void, ≤1 red action, 44px targets, tabular nums | **Settled and measured** ([`redActions.ts`](../tests/e2e/helpers/redActions.ts), [`thumbSweep.ts`](../tests/e2e/helpers/thumbSweep.ts), `zero-state.spec.ts`) | **No** |
| **Composition** — hierarchy, rhythm, density, what the eye hits first | **Wireframe.** Correct structure, unfinished expression | **Yes — this is the job** |
| **The `You` surface** | **Wireframe with the wrong content in it** — a 413-line settings screen named after a person | **Yes — this is the second job** |
| **Emotional register per screen** | Declared in prose, uneven in pixels | **Yes** |

**So proposal 3 is a skin-and-composition pass over a settled floorplan, plus one genuinely new surface.** That is a much smaller and much more valuable brief than "redesign the site", and it is the only version that can ship inside the horizon gate.

## 2. The design flow, as a chip flow

[FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) borrowed the *floorplan*. The founder's ask — *"make sure our design flow is right, like chip design"* — asks for the other half: a **staged flow where each stage has a signoff artifact and a check that can fail.** Silicon's discipline is not the diagram; it is that you cannot proceed to the next stage with an unsigned one.

| # | Chip stage | Mission Winning equivalent | Check that can fail | Signoff artifact |
|---|---|---|---|---|
| 1 | Spec / architecture | [vision.md](../vision.md), horizon gate | horizon rule | founder override line |
| 2 | Micro-architecture | This brief + [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) | — | founder approval of the brief |
| 3 | RTL | `src/page-components/`, `src/components/` | — | PR |
| 4 | Lint | eslint + `check-design-system` | gate 3, 11 | green gate |
| 5 | Functional verification | unit + route contract + e2e | gate 5, 6, 17 | green gate |
| 6 | **CDC — clock-domain crossing** | **Log domain ↔ Social domain** | C1–C4, C7 — [`domainBoundary.test.ts`](../src/lib/domainBoundary.test.ts) + the `club-identity` tone axis | green gate (`.605`) |
| 7 | Floorplan / place-and-route | dies, tabs, rail, More tiers | route contract tests | [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) |
| 8 | DRC — design rule check | `check-design-system`, `check-token-sync`, `check-display-type`, `check-locale-split` | gate 11–14 | green gate |
| 9 | LVS — layout vs schematic | **docs match the built thing** | `gateDocParity`, `contextBudget`, `migrationLedger` | green gate |
| 10 | Timing closure | bundle budget, Lighthouse | gate 16 | ratchet down only |
| 11 | Signoff review | [DESIGN_REVIEW.md](DESIGN_REVIEW.md) hero pass | quality bars 1–8 | logged review |
| 12 | Tapeout | ship protocol, hard rule 5 | `check-build-label` | LOG + `## Now` + label |

**Two things fell out of writing it down.**

**Stage 6 was empty, and now is not.** There had never been a second clock domain, so there had never been a crossing check. Identity and social introduce one. That was the substantive gap this programme found, and it is why the contracts shipped in `.605` **before** the feature they govern rather than alongside it — writing them first is also what caught the fact that the contract as first drafted contradicted its own architecture diagram ([IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) §5).

**Stage 9 is the one this repo keeps re-learning.** LVS asks whether the thing you drew is the thing you built. `.596` found a documented 16-step gate that ran 18 steps and omitted a ratchet that had been breached since `.544` — a map that could not see a step, so the step stopped being run. Proposal 3 must not create new prose that nothing checks. **Every claim it makes about a state should map to an existing helper or come with the guard that would enforce it.**

**Stage 11 is not eyeballing.** Quality bar 2 — one red action above the fold — is *measured* by reading computed backgrounds, not judged. A proposal that hands over comps without declaring which control is the red one is not reviewable against the bar it will be held to.

## 3. Deliverables

### 3.1 Composition pass — existing surfaces

Not a redraw. For each surface: the **first-viewport composition**, the **type ramp actually used**, and the **one red control**, at compact (390×844) and desktop (1440×900) as **separate** compositions.

| Surface | The question proposal 3 must answer |
|---|---|
| `/log` Today | What does the eye hit first, in the first 300ms, for a returning athlete on session 12? |
| `/active` Train | How does density read under load — and what is on screen that is not the set row? |
| Victory | What makes the lock feel earned without confetti, brass, or a badge parade? |
| `/coach` | How does an adapt beat *look* like an explanation rather than a notification? |
| Landing `/` | Could this belong to another brand with the nav removed? (acceptance 5, already written) |

### 3.2 The `You` surface — new

Per [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) §3–4. Required:

1. **Athlete Page** — Identity · The line · The shelf · The table, composed. Compact and desktop.
2. **Page kits** — **3 to 5** authored poster layouts, each inside the Modernist system, each visibly different from the others at a glance. This is the MySpace deliverable: prove that expression is achievable without a stylesheet.
3. **The table** — the interests-table analogue, with the row set proposed and the picks enumerated.
4. **Account** — where the current settings live after the split, drawn as the plain utility screen it should have been.
5. **Share card** — the page rendered to 1080×1350, consistent with the shipped [`shareCard.ts`](../src/lib/share/shareCard.ts) geometry.

### 3.3 States, for every screen delivered

[UX_PLAYBOOK.md](UX_PLAYBOOK.md) §5 already sets this standard; it is repeated here because it is the most common omission in a proposal:

**empty · loading · partial · full · error · offline.** The empty state is not optional and is not a void — it is reason + one action (D8). A proposal that ships only the full state has designed the least common screen in the product.

## 4. Acceptance

Judged against the existing bars, not new ones. A proposal is accepted when every delivered surface passes:

1. One composition — the first viewport has one job
2. **One red action** above the fold — declared explicitly by the designer, measurable by [`redActions.ts`](../tests/e2e/helpers/redActions.ts)
3. Honor only if earned — no decorative `accent-800`
4. Tabular nums on all metrics; no layout shift
5. Empty = invite + CTA
6. Offline / free honesty visible where relevant
7. Emotion beat named: composure · focus · honor · clarity
8. 44px thumb targets
9. **Zero raw hex, zero non-zero radius, zero second typeface, zero glow/shadow** outside dialogs and the one `card-boss` — otherwise gate step 11 fails on delivery
10. **Surface declared** — compact, desktop, or both, per handoff row. Undeclared means rejected

## 5. Out of scope, and refused

**Out of scope:** IA changes · route renames · token changes · new pillars · Android (its rebrand is a separate programme; token sync is paused by founder decision) · anything requiring `PRIVATE_MODE` to flip.

**Refused, on sight:** a feed · Top 8 or friend ranking · follower counts · streak flames, XP loot or confetti as retention · red ✕ on missed days (refused in D7, D8 and D11 — do not bring it a fourth time) · sale countdowns · invented statistics · user-authored CSS · profile completeness meters · navy, emerald or brass.

## 6. The package to hand over

1. This brief
2. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) + [brand-guidelines.md](brand-guidelines.md) — tokens, non-negotiable
3. [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) — what You is and why the boundary exists
4. [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) Wave 9 — the reference screenshots decoded, and the sources
5. [UX_PLAYBOOK.md](UX_PLAYBOOK.md) §5 + §8 — state and interaction standards
6. The nine founder reference screenshots, **with §9.3's verdict column attached** — they are references, not targets, and two of them (Top 8, the WClub season reset) are references to things being deliberately refused

## 7. Open decisions before commissioning

1. **Numbering** — confirm "proposal 3" maps to a fourth repo handoff, and name its surface.
2. **Surface** — compact only, desktop only, or both? `.159` was caused by leaving this implicit.
3. **Page-kit count** — 3 or 5. More kits is more design cost and more `check-design-system` surface, with no user evidence either way at 0 users.
4. **Does `You` ship before or after the contracts?** [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) recommends contracts first (S1 before S2).
