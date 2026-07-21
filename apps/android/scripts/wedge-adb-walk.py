#!/usr/bin/env python3
"""
ADB UIAutomator walk matching apps/android/.maestro/wedge.yaml.

Flow: I-Day (skip) → Today → Active → Victory → Coach
Does NOT toggle airplane mode (offline core is Room-local; network kill skipped).

Usage:
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
  cd apps/android && ./gradlew :app:installDebug
  python3 scripts/wedge-adb-walk.py
  # Optional screenshots into store-assets/:
  python3 scripts/wedge-adb-walk.py --screenshots
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

APP_ID = "com.missionwinning.app.debug"
SCRIPT_DIR = Path(__file__).resolve().parent
ANDROID_ROOT = SCRIPT_DIR.parent
STORE_ASSETS = ANDROID_ROOT / "store-assets"

# Texts asserted / tapped in .maestro/wedge.yaml order.
# Alternate needles (tuple) try each until one matches — UI copy may vary slightly.
Step = tuple[str, str | tuple[str, ...]]
STEPS: list[Step] = [
    ("assert", "Mission Winning"),
    ("tap", "I already train — skip"),
    ("assert", "Today"),
    ("screenshot", "02-today.png"),
    ("tap", ("Start workout", "Start today's workout", "Start empty workout")),
    ("assert", "Complete set"),
    ("screenshot", "03-active.png"),
    ("tap", "Complete set"),
    ("assert", ("Finish workout", "Finish workout · lock session")),
    ("tap", ("Finish workout", "Finish workout · lock session")),
    ("assert", "Session locked"),
    ("screenshot", "05-victory.png"),
    ("tap", ("See Mission Coach", "Back to Today")),
    ("assert", ("Mission Coach", "Today")),
    ("screenshot", "04-coach.png"),
]

DUMP_REMOTE = "/sdcard/mw_ui_dump.xml"
BOUNDS_RE = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")


def adb(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["adb", *args],
        check=check,
        text=True,
        capture_output=True,
    )


def ensure_device() -> None:
    out = adb("devices").stdout.strip().splitlines()
    devices = [ln for ln in out[1:] if ln.strip() and "device" in ln.split()[-1:]]
    if not devices:
        print(
            "No adb device/emulator. Start an AVD (API 34+ system image) first.\n"
            "  export PATH=\"$PATH:$HOME/Library/Android/sdk/platform-tools\"",
            file=sys.stderr,
        )
        sys.exit(1)


def launch_app() -> None:
    # Fresh I-Day each run (matches Maestro cold start)
    adb("shell", "pm", "clear", APP_ID, check=False)
    time.sleep(0.8)
    adb(
        "shell",
        "am",
        "start",
        "-n",
        f"{APP_ID}/com.missionwinning.app.MainActivity",
        check=False,
    )
    time.sleep(2.0)


def dump_ui() -> ET.Element:
    adb("shell", "uiautomator", "dump", DUMP_REMOTE)
    with tempfile.NamedTemporaryFile(suffix=".xml", delete=False) as tmp:
        local = Path(tmp.name)
    try:
        adb("pull", DUMP_REMOTE, str(local))
        tree = ET.parse(local)
        return tree.getroot()
    finally:
        local.unlink(missing_ok=True)
        adb("shell", "rm", "-f", DUMP_REMOTE, check=False)


def iter_nodes(root: ET.Element):
    yield root
    for child in root:
        yield from iter_nodes(child)


def find_bounds(root: ET.Element, text: str) -> tuple[int, int, int, int] | None:
    needle = text.strip()
    for node in iter_nodes(root):
        for attr in ("text", "content-desc"):
            val = (node.attrib.get(attr) or "").strip()
            if val == needle or needle in val:
                bounds = node.attrib.get("bounds")
                if not bounds:
                    continue
                m = BOUNDS_RE.match(bounds)
                if m:
                    return tuple(int(x) for x in m.groups())  # type: ignore[return-value]
    return None


def wait_for_text(
    text: str | tuple[str, ...],
    timeout_s: float = 20.0,
) -> tuple[int, int, int, int]:
    needles = (text,) if isinstance(text, str) else text
    deadline = time.time() + timeout_s
    last_err = ""
    while time.time() < deadline:
        try:
            root = dump_ui()
            for needle in needles:
                bounds = find_bounds(root, needle)
                if bounds:
                    return bounds
            last_err = f"none of {needles!r} in hierarchy"
        except Exception as exc:  # noqa: BLE001
            last_err = str(exc)
        time.sleep(0.6)
    raise AssertionError(f"Timeout waiting for {needles!r}: {last_err}")


def tap_bounds(bounds: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = bounds
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    adb("shell", "input", "tap", str(cx), str(cy))
    time.sleep(1.0)


def capture_screenshot(filename: str) -> None:
    STORE_ASSETS.mkdir(parents=True, exist_ok=True)
    dest = STORE_ASSETS / filename
    # Slight settle so animations finish
    time.sleep(0.4)
    with dest.open("wb") as f:
        proc = subprocess.run(
            ["adb", "exec-out", "screencap", "-p"],
            check=True,
            capture_output=True,
        )
        f.write(proc.stdout)
    print(f"    screenshot → {dest.relative_to(ANDROID_ROOT)}")


def capture_iday_if_needed(screenshots: bool) -> None:
    """I-Day is first screen after clear; grab before skip if requested."""
    if not screenshots:
        return
    try:
        wait_for_text("Mission Winning", timeout_s=8.0)
        capture_screenshot("01-iday.png")
    except AssertionError:
        print("    skip 01-iday.png (not on I-Day)")


def main() -> int:
    parser = argparse.ArgumentParser(description="ADB wedge walk for Mission Winning")
    parser.add_argument(
        "--screenshots",
        action="store_true",
        help=f"Write PNGs into {STORE_ASSETS.name}/ (local only; do not commit large binaries)",
    )
    args = parser.parse_args()

    print("wedge-adb-walk: matching .maestro/wedge.yaml (no airplane mode)")
    ensure_device()
    launch_app()
    capture_iday_if_needed(args.screenshots)

    for action, text in STEPS:
        if action == "screenshot":
            if args.screenshots:
                print(f"  screenshot: {text!r}")
                capture_screenshot(text)
            continue
        print(f"  {action}: {text!r}")
        bounds = wait_for_text(text)
        if action == "assert":
            print(f"    ok visible bounds={bounds}")
        elif action == "tap":
            tap_bounds(bounds)
            print("    tapped")
        else:
            raise ValueError(action)

    print("PASS: I-Day → Today → Active → Victory → Coach")
    if args.screenshots:
        print(f"Screenshots under {STORE_ASSETS} (gitignored binaries preferred)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as e:
        print(f"FAIL: {e}", file=sys.stderr)
        raise SystemExit(1)
    except subprocess.CalledProcessError as e:
        print(e.stderr or e.stdout or str(e), file=sys.stderr)
        raise SystemExit(e.returncode or 1)
    except FileNotFoundError:
        print(
            "adb not found. Add platform-tools to PATH:\n"
            '  export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"',
            file=sys.stderr,
        )
        raise SystemExit(127)
