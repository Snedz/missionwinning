#!/usr/bin/env bash
# Create a Play upload keystore + apps/android/keystore.properties (gitignored).
# Do not commit the .jks or keystore.properties.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEYSTORE_FILE="${KEYSTORE_FILE:-upload-keystore.jks}"
KEY_ALIAS="${KEY_ALIAS:-upload}"
VALIDITY_DAYS="${VALIDITY_DAYS:-10000}"
PROPS_FILE="$ROOT/keystore.properties"

if [[ -f "$KEYSTORE_FILE" ]]; then
  echo "Refusing to overwrite existing $KEYSTORE_FILE"
  exit 1
fi
if [[ -f "$PROPS_FILE" ]]; then
  echo "Refusing to overwrite existing keystore.properties"
  exit 1
fi

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found. Set JAVA_HOME to Android Studio JBR or a JDK 17+."
  exit 1
fi

echo "=== Mission Winning upload keystore ==="
echo "Output: $ROOT/$KEYSTORE_FILE"
echo "Alias:  $KEY_ALIAS"
echo

# Non-interactive defaults for CI docs (override via env):
#   STORE_PASSWORD KEY_PASSWORD DNAME
if [[ -n "${STORE_PASSWORD:-}" && -n "${KEY_PASSWORD:-}" ]]; then
  STORE_PASS="$STORE_PASSWORD"
  KEY_PASS="$KEY_PASSWORD"
  DNAME_VALUE="${DNAME:-CN=Mission Winning, OU=Android, O=Mission Winning LLC, L=Unknown, ST=Unknown, C=US}"
  echo "Using STORE_PASSWORD / KEY_PASSWORD from environment (non-interactive)."
else
  read -r -s -p "Keystore (store) password: " STORE_PASS
  echo
  read -r -s -p "Key password (same as store is fine): " KEY_PASS
  echo
  read -r -p "Distinguished name [CN=Mission Winning, OU=Android, O=Mission Winning LLC, L=Unknown, ST=Unknown, C=US]: " DNAME_INPUT
  DNAME_VALUE="${DNAME_INPUT:-CN=Mission Winning, OU=Android, O=Mission Winning LLC, L=Unknown, ST=Unknown, C=US}"
fi

if [[ -z "$STORE_PASS" || -z "$KEY_PASS" ]]; then
  echo "Passwords must not be empty."
  exit 1
fi

keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY_DAYS" \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "$DNAME_VALUE"

cat > "$PROPS_FILE" <<EOF
storeFile=$KEYSTORE_FILE
storePassword=$STORE_PASS
keyAlias=$KEY_ALIAS
keyPassword=$KEY_PASS
EOF

chmod 600 "$PROPS_FILE" "$KEYSTORE_FILE" 2>/dev/null || true

echo
echo "Created $KEYSTORE_FILE and keystore.properties"
echo "Next: ./gradlew :app:bundleRelease"
echo "Upload the .aab from app/build/outputs/bundle/release/ to Play Internal."
echo "Keep the keystore backed up offline — losing it blocks updates."
