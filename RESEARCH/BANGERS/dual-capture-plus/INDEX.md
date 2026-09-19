# Dual Capture+ — BANGERS track 01

Paid iOS multi-cam recorder that sells the **gaps** in Apple’s free Dual Capture (iPhone 17 / 17 Pro / 17 Pro Max / iPhone Air, stock Camera app). Paper pack. No binary in this repo.

**Status:** research + sell pack only. Checkout is the literal placeholder `PAYMENT_URL`. Spike is forbidden until [SELL_FIRST.md](SELL_FIRST.md) is PASS.

## Read order

| # | File | Owns |
|---|------|------|
| 1 | [FRAMEWORK.md](FRAMEWORK.md) | What it is, vs Apple Dual Capture, vs incumbents, A12+ / `AVCaptureMultiCamSession` law |
| 2 | [SELL_FIRST.md](SELL_FIRST.md) | Prices, cold-pay definition, **&lt;5 / 14 days** kill bar, PASS/KILL |
| 3 | [LANDER_DRAFT.md](LANDER_DRAFT.md) | Paste-ready lander. Founder swaps `PAYMENT_URL` |
| 4 | [HOW_IT_GETS_DONE.md](HOW_IT_GETS_DONE.md) | Sequence: lander → clock → kill/pass → spike → TestFlight. Roles |
| 5 | [CURSOR_TODO.md](CURSOR_TODO.md) | Checkbox work. Agents stop at the sell wall |
| 6 | [SOURCES.md](SOURCES.md) | Real Apple docs, Support, App Store, WWDC, press |
| 7 | [BUILD_LATER.md](BUILD_LATER.md) | MVP **after** PASS. Not a ticket today |
| 8 | [SPIKE_PLAN.md](SPIKE_PLAN.md) | ≤1 day on `AVMultiCamPiP` **after** PASS |

## Hard walls

- Do not add an Xcode project, Swift package, or camera capability to this monorepo.
- Do not invent a checkout, App Store, or TestFlight URL.
- Do not treat Apple Dual Capture as “the same product.” Device list, one-file flatten, and fixed PiP are the wedge ([FRAMEWORK.md](FRAMEWORK.md) §3).
- Do not start the MW iOS lane to “reuse” this. [docs/IOS_PLAYBOOK.md](../../../docs/IOS_PLAYBOOK.md) stays deferred until Android Accept B.

## Parent

[BANGERS/INDEX.md](../INDEX.md) · [RESEARCH/INDEX.md](../../INDEX.md)
