# Play Store screenshots

Capture on an emulator or device (phone portrait, 1080×1920+):

| File | Screen |
|------|--------|
| `01-iday.png` | I-Day |
| `02-today.png` | Today with emerald CTA |
| `02b-account.png` | Account hub tab (Preferences / Continue offline) |
| `03-active.png` | Active logger (immersive — no bottom hub) |
| `04-coach.png` | Coach with sessions |
| `05-victory.png` | Session locked |

## Automated walk + capture

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
cd apps/android
./gradlew :app:installDebug
# Start AVD first (e.g. MW_Phone_API36)
python3 scripts/wedge-adb-walk.py --screenshots
```

Wedge only (no PNGs):

```bash
python3 scripts/wedge-adb-walk.py
# or: maestro test .maestro/wedge.yaml
```

Prefer AVD `MW_Phone_API36` on 8GB hosts; `Pixel_10_Pro` needs more RAM.

Do **not** commit large PNG binaries unless founder asks — keep this folder for local capture / Play Console upload. `01-iday.png` may already exist from an earlier capture; re-run `--screenshots` to refresh the set (includes Account `02b-account.png`).
