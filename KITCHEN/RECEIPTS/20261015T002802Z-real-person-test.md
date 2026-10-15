# Mission Winning — real-person test, end to end

**Date:** 2026-10-14/15 EDT · **main tip tested:** `96d30f79` · **fixes landed:** `89a31886`

## The short version

**A real person can install this and complete a full workout today.** I did exactly
that on an Android emulator and logged every step. Zero crashes, zero ANRs.

Three blockers surfaced. Two are fixed and merged; one is documented and deliberately
not changed.

## What works end to end (all on-device, all observed)

| Step | Evidence |
|---|---|
| Install + launch | `adb install` Success; `MainActivity` focused, PID live |
| Onboarding | 3-page intro; "I already train — skip" works |
| Today screen | "Legs + hinge", STRENGTH / 40 MIN / 2 MOVES, Steady 46, tab bar |
| Start workout | Bodyweight squat, Set 1/3, Reps 12, KG 0, rest presets, RPE 6–10 |
| **Log 3 sets** | Complete set advanced 1/3 → 2/3 → 3/3; rest timer counted down; `Skip` worked; reps carried forward |
| **Rep counter** | `+` stepper: **12 → 15**, live |
| Finish-with-sets-left guard | "3 sets still open. Only completed sets will be saved offline." with `Finish anyway` / `Keep logging` |
| **Session saved** | **Session locked — 3 SETS, 1m 57s, #1**, "ON DEVICE · SYNC LATER" |
| **Coach reacts to the log** | Mission Coach at **REV 2**, week progress **1/3**, "Week updated from workouts you already logged" |
| **Coach answers a question** | `source: coach_llm`, real model text (after the fix below) |

## Blockers

### 1. `npm run verify` health step — false red (fixed, [#1046])
`FAIL health 60.3s … no response`, which reads like a broken build. It wasn't. Another
agent's process held `127.0.0.1:3917`, and the guard tested "is it taken" by *binding*
`0.0.0.0` — which macOS permits while loopback is held. Guard said free, `next start`
couldn't get the port, fetch burned 60 s. Now it **connects** to both loopback families.

Proof the tree is healthy: `VERIFY_PORT=4477 npm run verify` → `VERIFY: PASS`;
`npm test` → **4811 pass, 0 fail**.

### 2. The coach never answered (fixed, [#1047])
Device showed **"Trainer is offline."** Graceful, no crash — but the coach was dead and
the message blamed the network.

Root cause: `acceptModelText` returned `null` for **any reply over 420 characters**. A
verbose model always lost and `replyTrainer` silently fell back to the rules line. The
user saw "offline" while a good answer sat in the response body.

Measured, in order: seat resolution ✅ → the provider posts to `seat.url` **verbatim**, so
`COACH_LLM_API_URL` needs the *full* chat-completions URL (a base URL 404s) → model call
✅ `ok:true, 200, 211 tokens` → `acceptModelText` ❌ **null**.

Over-long text is now cut at the last sentence end that fits, skipping numbered list
markers so the reader isn't stranded mid-list. Empty replies, URLs and the refused-product
brand are still refused outright — length simply isn't one of them.

With **no provider key anywhere** and the lane served locally by Ollama:
```
Q: Should I add weight next session?   -> source: coach_llm | len: 420
Q: How many rest days do I need?        -> source: coach_llm | len: 404
```
Both returned `source: "rules"` before.

### 3. A debug build could not reach a local server at all (fixed, [#1051])
Not merely undocumented. `main/AndroidManifest.xml` sets
`android:usesCleartextTraffic="false"`, enforced on **every** build, so a debug build
pointed at `http://10.0.2.2:3000` had every request silently dropped. The give-away was
that the device request never appeared in the server access log at all. Fixed with a
`src/debug/`-only network security config plus one debug log line naming the effective
`API_BASE_URL`. Release unchanged.

**The coach now answers on the installed app**, not just to curl:

```
I MissionWinning: API_BASE_URL=http://10.0.2.2:3000 (override in ...)

(server access log)  POST /api/coach/trainer 200 in 5.2s
(server access log)  POST /api/coach/trainer 200 in 3.2s
(server access log)  POST /api/coach/trainer 200 in 9.8s

device screen:  "Trainer is offline."  ->  "Set 1 of 3. pushup. 10 x BW."
```

That last reply is the plan's set line rather than generated prose, because the LLM leg
has an 8 s budget and the local lane took 9.8 s on that call — the request succeeded and
the app is genuinely offline-proof now, but a slow local model will still fall back to
the set line. Worth a card.

## "Set a goal" — what Android actually offers

Checked twice, because the brief asked for it:
- **Source:** `grep -rli 'goal' apps/android --include='*.kt'` → **no matches**. The
  closest is `targetReps`, populated *from the plan*, not set by the user.
- **On device:** Account has Weight unit (KG/LB), Equipment, Cloud Sync, Sign in — no goal.

The user-facing goal concept lives in the **web** app (`FuelGoalWizard.tsx`). On Android
the only settable target is the per-set Reps / KG stepper, which was exercised (12 → 15).
A goal screen on Android would be a new feature, which this pass was told not to add.

## Setup traps that cost real time (kept in the receipt)

- Debug package is **`com.missionwinning.app.debug`** (`applicationIdSuffix`). Launching
  `com.missionwinning.app` fails with *"No activities found to run"* — which looks
  exactly like a broken manifest and is not.
- **`adb shell input tap` takes device pixels.** Screenshots are 1080×2400 but render at
  900×2000; tapping the displayed coordinate silently misses. Multiply by 1.2.
- `sdkmanager` needs `JAVA_HOME` set explicitly, or it reports no Java runtime.
- The AVD needed `disk.dataPartition.size` shrunk to boot on a ~6 GB-free disk.

## What still blocks a real user

1. **No provider key on any lane.** The coach only answers because Ollama serves it
   locally. Set one `GROQ_API_KEY` / `OPENROUTER_API_KEY` / `GEMINI_API_KEY` and the
   same route uses a stronger model with no code change.
2. **No local server story for debug.** Item 3 above — a developer must know to override
   `mw.apiBaseUrl`.
3. **`COACH_LLM_API_URL` needs the full path.** Passing the base URL 404s with no hint.
   A one-line docs fix would save the next person an hour.
4. **Sync is unproven.** The app says "ON DEVICE · SYNC LATER" and that is exactly as far
   as I verified — no authenticated account, so nothing was synced anywhere.

## Evidence on disk

| Artifact | What it is |
|---|---|
| `KITCHEN/RECEIPTS/artifacts/logcat-device-smoke.log` | 1,563-line logcat from the device session. 0 `FATAL EXCEPTION`, 0 ANR, 0 forced finishes. |
| `KITCHEN/RECEIPTS/artifacts/verify-final.log` | full `npm run verify` (build + health included) on merged main |

## Rails

No new features, no design work. No secrets in code. PRIVATE_MODE on, `paymentUrl`
untouched and empty. Nothing published — the AAB is a local artifact and no Play upload
was run. Two fixes, each its own PR, each verified: `npm test` 4811 pass / 0 fail.