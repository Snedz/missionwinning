#!/usr/bin/env python3
"""
Pre-flight release readiness verification script for Mission Winning Android app.

Usage:
    export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    python3 scripts/check-release-readiness.py [--skip-build]
"""

import os
import re
import sys
import subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ANDROID_ROOT = SCRIPT_DIR.parent

GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

def print_status(message: str, status: str) -> None:
    if status == "PASS":
        print(f"[{GREEN}PASS{RESET}] {message}")
    elif status == "WARN":
        print(f"[{YELLOW}WARN{RESET}] {message}")
    else:
        print(f"[{RED}FAIL{RESET}] {message}")

def check_environment() -> bool:
    java_home = os.environ.get("JAVA_HOME")
    if not java_home:
        # Fallback check standard macOS Studio location
        default_studio_jbr = Path("/Applications/Android Studio.app/Contents/jbr/Contents/Home")
        if default_studio_jbr.exists():
            os.environ["JAVA_HOME"] = str(default_studio_jbr)
            print_status(f"JAVA_HOME auto-set to: {default_studio_jbr}", "PASS")
            return True
        else:
            print_status("JAVA_HOME environment variable is not set.", "FAIL")
            return False
    
    if not Path(java_home).exists():
        print_status(f"JAVA_HOME path does not exist: {java_home}", "FAIL")
        return False

    print_status(f"JAVA_HOME configured: {java_home}", "PASS")
    return True

def check_keystore() -> bool:
    keystore_props = ANDROID_ROOT / "keystore.properties"
    if keystore_props.exists():
        print_status("keystore.properties present for Play upload signing.", "PASS")
        return True
    else:
        print_status("keystore.properties missing (release will be debug-signed; founder-only for Play upload).", "WARN")
        return False

def check_target_sdk() -> bool:
    build_gradle = ANDROID_ROOT / "app" / "build.gradle.kts"
    if not build_gradle.exists():
        print_status("app/build.gradle.kts not found", "FAIL")
        return False
    content = build_gradle.read_text(encoding="utf-8")
    if "targetSdk = 36" in content:
        print_status("targetSdk = 36 configured (Play Store 2026 requirement)", "PASS")
        return True
    else:
        print_status("targetSdk is not configured as 36", "WARN")
        return False


# Play listing needs ≥5 phone screenshots (I-Day + hub + logger loop).
REQUIRED_SCREENSHOTS = (
    "01-iday.png",
    "02-today.png",
    "03-active.png",
    "04-coach.png",
    "05-victory.png",
)
OPTIONAL_SCREENSHOTS = ("02b-account.png",)
# Empty placeholder PNGs fail Play upload and confuse capture scripts.
MIN_SCREENSHOT_BYTES = 8_000


def check_store_assets() -> bool:
    """Warn (not hard-fail) when listing screenshots are missing or empty."""
    assets = ANDROID_ROOT / "store-assets"
    readme = assets / "README.md"
    if not readme.exists():
        print_status("store-assets/README.md missing", "FAIL")
        return False
    print_status("store-assets/README.md present", "PASS")

    ok = True
    present = 0
    for name in REQUIRED_SCREENSHOTS:
        path = assets / name
        if not path.exists():
            print_status(f"store-assets/{name} missing — run wedge-adb-walk.py --screenshots", "WARN")
            ok = False
            continue
        size = path.stat().st_size
        if size < MIN_SCREENSHOT_BYTES:
            print_status(
                f"store-assets/{name} is too small ({size} bytes) — delete placeholder and re-capture",
                "WARN",
            )
            ok = False
        else:
            print_status(f"store-assets/{name} ({size // 1024} KiB)", "PASS")
            present += 1

    for name in OPTIONAL_SCREENSHOTS:
        path = assets / name
        if path.exists() and path.stat().st_size >= MIN_SCREENSHOT_BYTES:
            print_status(f"store-assets/{name} optional present", "PASS")
        elif path.exists():
            print_status(f"store-assets/{name} present but empty/small — re-capture", "WARN")

    if present >= 5:
        print_status(f"Play screenshot set complete ({present}/5 required)", "PASS")
    else:
        print_status(
            f"Play screenshot set incomplete ({present}/5) — blocks listing (P0.2), not assembleRelease",
            "WARN",
        )
    # Do not fail overall readiness on missing PNGs (founder/agent capture step).
    return True


def check_sentry_wiring() -> bool:
    """Confirm release can receive SENTRY_DSN from local.properties (P0.4)."""
    build_gradle = ANDROID_ROOT / "app" / "build.gradle.kts"
    content = build_gradle.read_text(encoding="utf-8") if build_gradle.exists() else ""
    if 'buildConfigField("String", "SENTRY_DSN"' in content or "SENTRY_DSN" in content:
        print_status("app BuildConfig.SENTRY_DSN wired from mw.sentryDsn", "PASS")
    else:
        print_status("SENTRY_DSN BuildConfig wiring not found in app/build.gradle.kts", "FAIL")
        return False

    local_props = ANDROID_ROOT / "local.properties"
    if local_props.exists():
        props = local_props.read_text(encoding="utf-8", errors="replace")
        if "mw.sentryDsn=" in props and not re.search(
            r"^mw\.sentryDsn=\s*$", props, flags=re.MULTILINE
        ):
            # Value present but do not print DSN
            print_status("local.properties has mw.sentryDsn set (value not shown)", "PASS")
        else:
            print_status(
                "mw.sentryDsn empty/unset in local.properties — release crash reporting off until founder sets it",
                "WARN",
            )
    else:
        print_status("local.properties missing (CI/local secrets elsewhere)", "WARN")
    return True


def run_gradle_task(task_name: str) -> bool:
    gradlew = ANDROID_ROOT / "gradlew"
    if not gradlew.exists():
        print_status(f"gradlew wrapper not found at {gradlew}", "FAIL")
        return False

    print(f"\n---> Running Gradle task: {task_name}...")
    cmd = [str(gradlew), task_name]
    res = subprocess.run(cmd, cwd=ANDROID_ROOT)
    
    if res.returncode == 0:
        print_status(f"Gradle task {task_name} completed successfully.", "PASS")
        return True
    else:
        print_status(f"Gradle task {task_name} failed with code {res.returncode}.", "FAIL")
        return False

def main() -> int:
    print(f"\n=======================================================")
    print(f" Mission Winning Android Release Readiness Pre-flight")
    print(f"=======================================================\n")
    
    skip_build = "--skip-build" in sys.argv
    all_passed = True

    if not check_environment():
        all_passed = False

    check_keystore()
    if not check_target_sdk():
        all_passed = False

    check_store_assets()
    if not check_sentry_wiring():
        all_passed = False

    if not skip_build:
        if not run_gradle_task("testDebugUnitTest"):
            all_passed = False
        
        if not run_gradle_task(":app:assembleDebug"):
            all_passed = False

        # Debug-signed release packaging (same as scripts/release-smoke.sh)
        if not run_gradle_task(":app:assembleRelease"):
            all_passed = False
        if not run_gradle_task(":app:bundleRelease"):
            all_passed = False
    else:
        print_status("Skipped Gradle builds (--skip-build). Run ./scripts/release-smoke.sh before Internal.", "WARN")

    print(f"\n=======================================================")
    if all_passed:
        print(f" {GREEN}OVERALL STATUS: READY FOR QA / RELEASE{RESET}")
        print(f"=======================================================\n")
        return 0
    else:
        print(f" {RED}OVERALL STATUS: CHECKS FAILED{RESET}")
        print(f"=======================================================\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
