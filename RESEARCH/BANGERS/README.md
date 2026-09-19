# Program 67 — Bangers (cash experiments)

**Status:** research pack only. **No product is for sale.** No checkout URL exists. No revenue has been counted.

These ten ideas sit **beside** Mission Winning. They do not replace the Train + Mission Coach wedge, they do not flip `PRIVATE_MODE`, and they do not gate the free logger. ClearShot is already a reserved MW mini stub (`utility.clearshot`) with **no UI and no billing** — that paper is not a shipped cleaner.

**Kill metric for every row:** **5 cold pays in 14 days.**

**Overnight:** [OVERNIGHT_GLM53.md](OVERNIGHT_GLM53.md) — GLM 5.3 parallel lanes (A Dual Capture+ · B ClearShot · C token-router · D ideas 04–10). **6-file contract** per slug.

| Term | Means here |
|------|------------|
| **Cold pay** | Money moved (Stripe / App Store / invoice) from someone who is not family, not a friend, and not a MW tester the founder already knows. A waitlist email is **not** a pay. |
| **14 days** | Calendar days from the first public offer (lander, post, or DM blast with a real ask). |
| **UNKNOWN** | We did not find a primary source. Do not invent a number to fill the cell. |
| **HYPOTHESIS** | A price or channel guess. Treat as untested. |

---

## Rules (non-negotiable)

1. **Sell first.** A lander + honest ask before Xcode, Next.js, or a Play listing.
2. **No fake checkout.** Do not invent Stripe Payment Links, Gumroad URLs, App Store SKUs, or a button that pretends to charge. If EIN / Stripe individual is not live, collect **written “I will pay $X when checkout exists”** commitments — and **do not count those as pays**.
3. **No invented traction.** No MRR, download counts, or “buyers” unless a primary source is in that idea’s `SOURCES.md`.
4. **No tip-promote.** Do not ask buyers to tip, boost, or socially promote the offer as part of the sale. The ask is money for a specified deliverable.
5. **Do not steal MW checkout language.** Super Bundle stays muted until EIN. These SKUs are separate entities on paper until the founder says otherwise.
6. **Name fitness rivals only in `ops/intel/`.** This pack may name Apple, camera apps, screenshot tools, and LLM gateways. It must not dump consumer fitness product names into the public tree.
7. **ToS is a kill switch.** Unofficial FreeBuff / Codebuff API scrapes are **out**. Ad-supported consumer CLIs are landscape, not a provider we proxy.

---

## Portfolio (ranked by “5 cold pays / 14 days”)

Rank is **how likely a cold stranger pays in two weeks**, not overnight lane number and not long-term TAM. **Idea #** (01–10) is the overnight fill order in [OVERNIGHT_GLM53.md](OVERNIGHT_GLM53.md). Do not mix the two.

| Rank | Idea # | Slug | One-line offer | 14-day bar | Why this rank | Structure |
|------|--------|------|----------------|------------|---------------|-----------|
| 1 | 02 | [clearshot-ios](clearshot-ios/) | On-device screenshot cleaner: redact, blur, share-sheet. | Easier | People already pay $20–50 lifetime in this category. Share-sheet mental model is cheap to explain. | 6-file |
| 2 | 10 | [screenshot-stack-pages](screenshot-stack-pages/) | Store-ready screenshot stacks / templates for one app. | Medium | Indie iOS/Android devs already buy $19–49/mo or one-time kits. A template pack can sell before a generator. | 6-file |
| 3 | 04 | [receipt-ocr-shots](receipt-ocr-shots/) | Photo or screenshot of a receipt → CSV. Not an expense suite. | Medium | Receipt OCR is a proven paid category; the suite incumbents are heavy. “Shots not suite” is the wedge. Buyer density **UNKNOWN**. | 6-file |
| 4 | 08 | [unlock-code-utils](unlock-code-utils/) | Pull Wi-Fi / gift / backup codes from a screenshot and format them. | Medium-hard | Impulse utility. App Store / security review is a real kill risk. | 6-file |
| 5 | 05 | [tutor-repair-dualcam](tutor-repair-dualcam/) | Dual-cam presets for tutors and bench repair. | Medium-hard | Narrow ICP is DM-able. Still fights free dual-cam apps. | 6-file |
| 6 | 01 | [dual-capture-plus](dual-capture-plus/) | Dual Capture on A12+ with layouts Apple does not ship, plus separate stems. | Hard | Apple’s Dual Capture is **free on iPhone 17 only**. FiLMiC DoubleTake and RØDE Capture are already **free** on older A12+ phones. Paid wedge must be layouts / stems / vertical presets — or the bar fails. | 6-file |
| 7 | 03 | [token-router-pipeline](token-router-pipeline/) | Local disk router: meter usage, fail free → BYOK paid. Not a new OpenRouter. | Hard | B2B / indie-dev cycle. OpenRouter already sells “one key, many models.” Differentiator is **on-disk meter + free-first failover you own**. | 6-file |
| 8 | 06 | [ai-edit-auditor](ai-edit-auditor/) | Prove an AI edit matched the brief (diff + checklist). | Hard | Category is unproven. Agencies might pay; **UNKNOWN**. | 6-file |
| 9 | 07 | [center-stage-coach](center-stage-coach/) | Framing marks for Apple Center Stage (device-gated). | Hard | Hardware-gated (iPhone 17 / supported iPad). Name collision with Mission Coach. | 6-file |
| 10 | 09 | [agent-job-bus](agent-job-bus/) | Cheap durable job bus for indie agents. | Hardest | Inngest / Trigger.dev / Temporal already exist. Longest sales cycle. | 6-file |

**Do not reorder this table because an idea is more fun to build.** Reorder only after a 14-day test writes a result into that folder’s `SELL_FIRST.md`.

---

## How a row is run

```
lander (no fake pay) → 14-day ask → count cold pays
  → <5: kill or rewrite the offer (do not build)
  → ≥5: BUILD_LATER.md becomes allowed
```

Each slug has the same **six** files (overnight contract — [OVERNIGHT_GLM53.md](OVERNIGHT_GLM53.md)):

| File | Owns |
|------|------|
| `FRAMEWORK.md` | Claim, buyer, wedge, incumbent table, risks, MW relationship |
| `SELL_FIRST.md` | Lander blurbs, ask, kill bar, payment honesty |
| `BUILD_LATER.md` | What is forbidden until the bar passes |
| `CURSOR_TODO.md` | Next agent checklist |
| `SOURCES.md` | Real URLs. UNKNOWN rows stay UNKNOWN |
| `GLM53.md` | Tonight’s GLM 5.3 work order + night log |

Overlapping ideas (camera, screenshots, LLM infra) **link** instead of copying. Complementary docs win over a rewrite.

---

## MW relationship (keep this small)

| Idea | Touches MW? |
|------|-------------|
| clearshot-ios | Same *name family* as reserved `utility.clearshot`. Standalone App Store experiment first. Do not mount a mini or open `billing.read`. |
| dual-capture-plus / tutor-repair-dualcam / center-stage-coach | Camera utilities. Not Train. Not Mission Coach. |
| token-router-pipeline / agent-job-bus | Infra. May later serve MW LLM spend caps (`LLM_DAILY_USD_CENTS`) — **not a reason to build now**. |
| Everything else | Adjacent cash. Keep git and checkout separate until the founder merges them on purpose. |

Horizon 0 still governs the **product repo**: no new MW pillars, no America/F5, no logger gate. This pack is paper. Building any of these *into* `src/` or `apps/android` needs an explicit founder override.

---

## Evidence date

Sources in this pack were checked **2026-09-19**. Prices and App Store IAPs move. Re-open the URL in `SOURCES.md` before quoting a number in a lander.
