# Play Store screenshots

Capture on an emulator or device (phone portrait, **1080×1920+**). PNGs are **gitignored** — keep them local for Play Console upload; do not commit large binaries unless founder asks.

| File | Screen | Required |
|------|--------|----------|
| `01-iday.png` | I-Day (first open) | Yes |
| `02-today.png` | Today with emerald Start CTA | Yes |
| `02b-account.png` | Account hub (Preferences / Continue offline) | Optional |
| `03-active.png` | Active logger (immersive — no bottom hub) | Yes |
| `04-coach.png` | Mission Coach | Yes |
| `05-victory.png` | Session locked (Victory) | Yes |

Play Console needs **≥5** phone screenshots for listing. Empty or 0-byte placeholders are **invalid** — delete them and re-capture.

## Automated walk + capture

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator"
cd apps/android

# Prefer AVD MW_Phone_API36 on 8GB hosts; Pixel_10_Pro needs more RAM.
emulator -avd MW_Phone_API36 -no-snapshot -no-audio &
adb wait-for-device
# Wait until boot completes (not just "device")
until [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; do sleep 2; done

./gradlew :app:installDebug
python3 scripts/wedge-adb-walk.py --screenshots
```

Wedge only (no PNGs):

```bash
python3 scripts/wedge-adb-walk.py
# or: maestro test .maestro/wedge.yaml
```

`--screenshots` refuses write if PNG is empty/truncated (avoids the old 0-byte `01-iday.png` trap).

## Checklist before Internal listing upload

- [ ] All five required PNGs present and **>8 KiB** each
- [ ] I-Day shows brand + skip path
- [ ] Today shows emerald Start (one primary CTA)
- [ ] Active has **no** bottom hub tabs
- [ ] Victory shows “Session locked”
- [ ] Coach shows Mission Coach chrome
- [ ] Founder visual QA (no debug chrome, no PII)

## Status (agent 2026-07-23)

- Empty `01-iday.png` placeholder **removed**.
- **Screenshot set not captured this session:** `MW_Phone_API36` reached adb briefly then died (qemu `mprotect` Permission denied / crashpad). Re-run the automated walk when AVD stays up, or capture on a physical device.
- Preflight: `python3 scripts/check-release-readiness.py --skip-build` warns on missing/small PNGs (does not block assemble).
