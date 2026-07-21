# Play Store screenshots

Capture on an emulator or device (phone portrait, 1080×1920+):

1. I-Day (`01-iday.png`)
2. Today with emerald CTA (`02-today.png`)
3. Active logger (`03-active.png`)
4. Coach with adapt banner (`04-coach.png`)

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd apps/android
./gradlew :app:installDebug
python3 scripts/wedge-adb-walk.py   # or walk manually
adb exec-out screencap -p > store-assets/01-iday.png
```

Prefer AVD `MW_Phone_API36` on 8GB hosts; `Pixel_10_Pro` needs more RAM.

Do not commit large PNG binaries unless founder asks — keep this folder for local capture / Play Console upload.
