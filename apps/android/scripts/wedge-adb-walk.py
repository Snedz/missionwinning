#!/usr/bin/env python3
"""
ADB UIAutomator walk matching apps/android/.maestro/wedge.yaml.

Flow: I-Day → Today → Active → Victory → Coach
Does NOT toggle airplane mode (offline core is Room-local; network kill skipped).

Usage:
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  cd apps/android && ./gradlew :app:installDebug
  python3 scripts/wedge-adb-walk.py
"""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

APP_ID = "com.missionwinning.app.debug"

# Texts asserted / tapped in .maestro/wedge.yaml order
STEPS: list[tuple[str, str]] = [
    ("assert", "Mission Winning"),
    ("tap", "Start mission"),
    ("assert", "Today"),
    ("tap", "Start workout"),
    ("assert", "Finish workout"),
    ("tap", "Finish workout"),
    ("assert", "Session locked"),
    ("tap", "See Mission Coach"),
    ("assert", "Mission Coach"),
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
        print("No adb device/emulator. Start an AVD (API 34+ system image) first.", file=sys.stderr)
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


def wait_for_text(text: str, timeout_s: float = 20.0) -> tuple[int, int, int, int]:
    deadline = time.time() + timeout_s
    last_err = ""
    while time.time() < deadline:
        try:
            root = dump_ui()
            bounds = find_bounds(root, text)
            if bounds:
                return bounds
            last_err = f"text not in hierarchy: {text!r}"
        except Exception as exc:  # noqa: BLE001
            last_err = str(exc)
        time.sleep(0.6)
    raise AssertionError(f"Timeout waiting for {text!r}: {last_err}")


def tap_bounds(bounds: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = bounds
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    adb("shell", "input", "tap", str(cx), str(cy))
    time.sleep(1.0)


def main() -> int:
    print("wedge-adb-walk: matching .maestro/wedge.yaml (no airplane mode)")
    ensure_device()
    launch_app()

    for action, text in STEPS:
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
