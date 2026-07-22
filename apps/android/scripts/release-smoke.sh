#!/usr/bin/env bash
# Debug-signed release APK + AAB smoke (no upload keystore required).
# Exit nonzero on any Gradle failure. Founder Play upload still needs keystore.properties.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${JAVA_HOME:-}" ]]; then
  STUDIO_JBR="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  if [[ -d "$STUDIO_JBR" ]]; then
    export JAVA_HOME="$STUDIO_JBR"
  else
    echo "JAVA_HOME is not set and Android Studio JBR was not found." >&2
    exit 1
  fi
fi

export PATH="$JAVA_HOME/bin:${PATH:-}"

echo "release-smoke: JAVA_HOME=$JAVA_HOME"
echo "release-smoke: :app:assembleRelease :app:bundleRelease"
./gradlew :app:assembleRelease :app:bundleRelease --stacktrace

APK="$ROOT/app/build/outputs/apk/release/app-release.apk"
AAB="$ROOT/app/build/outputs/bundle/release/app-release.aab"
test -f "$APK" || { echo "Missing $APK" >&2; exit 1; }
test -f "$AAB" || { echo "Missing $AAB" >&2; exit 1; }

echo "PASS: release-smoke"
echo "  APK: $APK"
echo "  AAB: $AAB"
echo "Note: without keystore.properties this is debug-signed (local/CI only; Play rejects)."
