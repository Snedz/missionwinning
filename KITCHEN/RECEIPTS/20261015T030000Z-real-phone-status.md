# Real-phone run — status at 2026-10-14 23:00 ET

**Goal:** a real Android phone runs a full workout with everything working.
**Status: steps 2, 3 and 4 are NOT done. There is no phone attached.**

This receipt records what was actually verified and what is blocked, so the next person
does not have to rediscover either.

## Two things in the brief did not match reality

**The tip `7d158c02` does not exist** in this repository. `git cat-file -t 7d158c02` →
`fatal: Not a valid object name`. The master tip at the time of this pass was `cb4e0050`
(`Receipts: close the evidence gaps…`), which already carried the earlier work.

**`deep03` does not exist** anywhere in the repo. Searched `scripts/`, `package.json`
and the full tree for `deep03`, `deep-03` and `bench`:

```
$ ls scripts/ | grep -iE 'deep03|deep-03|bench'      -> (nothing)
$ grep -rl 'deep03' . --include='*.ts' --include='*.js' --include='*.md'   -> (nothing)
$ package.json scripts matching bench|deep|e2e       -> ['e2e','e2e:critical','e2e:gate','e2e:visual']
```

I was asked where it lives and did not get a path before this receipt was written, so
**step 4 was not attempted.** I am not going to invent a benchmark and report its numbers
as if it were the real `deep03`.

## What IS done and verified

### Step 1 — `npm run verify`, full run on master `cb4e0050`

```
PASS  build-label 0.3s
PASS  typecheck   24.7s
PASS  lint       13.3s
PASS  test       54.1s
PASS  build      49.3s
PASS  health      1.3s
VERIFY: PASS
```

All six steps, **including `build` and `health`** — not `--no-build`, which is a
documented non-gate and skips exactly the two steps most likely to fail. Log persisted at
`KITCHEN/RECEIPTS/artifacts/verify-7d158c02.log`.

### Step 5 (build half) — code 55, signed, not published

| Check | Result |
|---|---|
| Build | `BUILD SUCCESSFUL in 18m 27s` |
| Size | 9,480,765 bytes (9.0 MB) |
| Signature | `META-INF/UPLOAD.RSA` present |
| Cert | `CN=Mission Winning, OU=Android, O=Mission Winning LLC` |
| Algorithm | `SHA256withRSA`, self-signed, matches the upload keystore |
| Bundle | `com.missionwinning.app` / **1.25.0** |

Merged as **#1053**. No fastlane, no Play upload, no deploy.

## What is blocked, and on what

### Steps 2, 3 — no device

```
$ adb devices -l
List of devices attached
                                     <- empty

$ system_profiler SPUSBDataType | grep -icE 'android|google|samsung|pixel'
0
```

Not at the adb layer and not at the USB layer. Both questionnaire answers arrived via
**automatic timeout**, not direct confirmation — the phone had not been plugged in when I
checked, repeatedly, over roughly 40 minutes.

Step 2 (install 1.24.2/code 54 over USB, run a workout, check the progression why-line,
rep counter, goal progress, one coach reply) and step 3 (Health Connect toggle, accept the
permission, confirm the session appears with the right type and times, then deny it and
confirm the log still saves) are **entirely device work**. None of it was done.

### Step 4 — no benchmark to run
See above. Not attempted.

## Health Connect: the code exists and looks sound, but is unverified on hardware

Worth recording so the next person does not go hunting for it:

- `apps/android/app/src/main/java/com/missionwinning/app/health/HealthConnectWriter.kt` (134 lines)
- `apps/android/feature/today/.../HealthConnectStepsBridge.kt`
- Manifest permissions: `health.WRITE_EXERCISE`, `health.WRITE_ACTIVE_CALORIES_BURNED`,
  `health.READ_STEPS`, and a `<queries>` package for `com.google.android.apps.healthdata`

One thing I checked because it looked like a defect and **was not**:
`writeExerciseSession` calls `client.insertRecords(session)` unguarded while the
following calories insert is wrapped in `runCatching`. That looks like a revoked-permission
throw escaping — exactly what step 3's "deny the permission and confirm the log still
saves" would hit. But `HealthConnectExportBridge.write()` wraps the whole call in
`runCatching { … }.getOrDefault(false)`, so the throw is caught and becomes `false`.
**Not a blocker, and I am not reporting it as one.** It does mean the "denied" path is
currently untested on hardware.

## To finish this

1. Plug the phone in, enable USB debugging, confirm with `adb devices -l`.
2. `adb install -r app-release.aab` (or `bundleRelease` → `bundletool build-apks`); the
   code 54 build the brief named is superseded by code 55 (#1053).
3. Re-run steps 2 and 3 against it.
4. Tell me where `deep03` lives and I will run it for step 4.

## Rails

No new features, no design work, no secrets in code, PRIVATE_MODE on, `paymentUrl` empty.
Nothing published. Keystore gitignored and uncommitted.