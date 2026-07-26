#!/usr/bin/env node
/**
 * Cross-platform brand token drift check — web CSS ↔ Android MwColors/MwMotion.
 * Run: npm run check-token-sync
 * Exit 0 = OK, 1 = drift detected.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const CSS_PATH = path.join(root, 'src/index.css');
const COLORS_PATH = path.join(
  root,
  'apps/android/core/designsystem/src/main/java/com/missionwinning/core/designsystem/MwColors.kt',
);
const MOTION_PATH = path.join(
  root,
  'apps/android/core/designsystem/src/main/java/com/missionwinning/core/designsystem/MwMotion.kt',
);

/**
 * Modernist rebrand (DESIGN_ORCHESTRATION.md wave D5, founder override
 * 2026-07-25): web tokens are paper/ink/red. The Android cross-check is PAUSED
 * for the duration of the program — Android deliberately keeps navy/emerald and
 * gets its own rebrand after web, so web↔Android color parity is not a ship
 * gate right now. Web values are still pinned below so drift within the web
 * token block fails the gate. Motion checks remain fully enforced.
 */
const ANDROID_COLOR_CHECK_PAUSED = true;

const BRAND_HEX = {
  paper: '#f3f2f2',
  ink: '#201e1d',
  red700: '#ae1800',
  red600: '#dd2b0f',
  poster: '#ec3013',
};

const COLOR_CHECKS = [
  { label: 'Paper / background', webVar: '--background', androidKey: 'Navy', target: BRAND_HEX.paper },
  { label: 'Ink / foreground', webVar: '--foreground', androidKey: null, target: BRAND_HEX.ink },
  { label: 'Red 700 / primary', webVar: '--primary', androidKey: 'Emerald', target: BRAND_HEX.red700 },
  { label: 'Red 600 / fill', webVar: '--primary-fill', androidKey: null, target: BRAND_HEX.red600 },
  { label: 'Poster red', webVar: '--accent-poster', androidKey: null, target: BRAND_HEX.poster },
  { label: 'Danger (destructive)', webVar: '--destructive', androidKey: 'Danger', target: BRAND_HEX.red700 },
  { label: 'Danger (status)', webVar: '--status-danger', androidKey: 'Danger', target: BRAND_HEX.red700 },
];

const MOTION_CHECKS = [
  { key: 'HubTabMs', min: 200, max: 250 },
  { key: 'PulseMs', min: 150, max: 200 },
  { key: 'EnterFadeMs', min: 300, max: 450 },
  { key: 'VictoryLockMs', min: 300, max: 450 },
];

function parseCssRootVars(cssText) {
  const rootBlock = cssText.match(/:root\s*\{([^}]+)\}/s);
  if (!rootBlock) throw new Error('No :root block in src/index.css');
  const vars = {};
  for (const line of rootBlock[1].split('\n')) {
    const m = line.match(/^\s*(--[\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
    if (m) vars[m[1]] = { h: Number(m[2]), s: Number(m[3]), l: Number(m[4]) };
  }
  return vars;
}

function hslToHex(h, s, l) {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to255 = (n) => Math.round((n + m) * 255);
  return `#${[to255(r), to255(g), to255(b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '').toLowerCase();
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function colorsWithinTolerance(a, b, tolerance = 1) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

function parseAndroidColors(text) {
  const colors = {};
  const re = /val\s+(\w+)\s*=\s*Color\(0x([0-9A-Fa-f]{8})\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    colors[m[1]] = `#${m[2].slice(-6).toLowerCase()}`;
  }
  return colors;
}

function parseAndroidMotion(text) {
  const motion = {};
  const re = /const val (\w+) = (\d+)/g;
  let m;
  while ((m = re.exec(text)) !== null) motion[m[1]] = Number(m[2]);
  return motion;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function status(ok) {
  return ok ? 'OK' : 'DRIFT';
}

const cssVars = parseCssRootVars(fs.readFileSync(CSS_PATH, 'utf8'));
const androidColors = parseAndroidColors(fs.readFileSync(COLORS_PATH, 'utf8'));
const androidMotion = parseAndroidMotion(fs.readFileSync(MOTION_PATH, 'utf8'));

let drift = false;
const rows = [];

console.log('\nMission Winning — token sync (web CSS ↔ Android Mw*)\n');

for (const check of COLOR_CHECKS) {
  const hsl = cssVars[check.webVar];
  const webHex = hsl ? hslToHex(hsl.h, hsl.s, hsl.l) : '(missing)';
  const androidHex = check.androidKey ? (androidColors[check.androidKey] ?? '(missing)') : '—';
  const target = check.target;

  const webOk = webHex !== '(missing)' && colorsWithinTolerance(webHex, target);
  // Android parity is paused for the Modernist rebrand (see header) — the
  // Android column stays informational so re-enabling is a one-flag change.
  const androidOk =
    ANDROID_COLOR_CHECK_PAUSED ||
    !check.androidKey ||
    (androidHex !== '(missing)' && colorsWithinTolerance(androidHex, target));
  const ok = webOk && androidOk;
  if (!ok) drift = true;

  rows.push({
    token: check.label,
    web: webHex,
    android: androidHex,
    target,
    result: status(ok),
  });
}

if (ANDROID_COLOR_CHECK_PAUSED) {
  console.log(
    'NOTE: Android color parity paused for the Modernist rebrand (wave D5, founder override 2026-07-25).\n',
  );
}

const col = { token: 22, web: 9, android: 9, target: 9, result: 6 };
console.log(
  `${pad('Token', col.token)} ${pad('Web', col.web)} ${pad('Android', col.android)} ${pad('Target', col.target)} ${pad('Status', col.result)}`,
);
console.log('-'.repeat(col.token + col.web + col.android + col.target + col.result + 4));

for (const row of rows) {
  console.log(
    `${pad(row.token, col.token)} ${pad(row.web, col.web)} ${pad(row.android, col.android)} ${pad(row.target, col.target)} ${pad(row.result, col.result)}`,
  );
}

console.log('\nMotion (Android MwMotion.kt)\n');

const mcol = { key: 16, value: 6, range: 11, result: 6 };
console.log(
  `${pad('Constant', mcol.key)} ${pad('Value', mcol.value)} ${pad('Range (ms)', mcol.range)} ${pad('Status', mcol.result)}`,
);
console.log('-'.repeat(mcol.key + mcol.value + mcol.range + mcol.result + 3));

for (const check of MOTION_CHECKS) {
  const value = androidMotion[check.key];
  const inRange = value !== undefined && value >= check.min && value <= check.max;
  if (!inRange) drift = true;
  console.log(
    `${pad(check.key, mcol.key)} ${pad(value ?? '(missing)', mcol.value)} ${pad(`${check.min}–${check.max}`, mcol.range)} ${pad(status(inRange), mcol.result)}`,
  );
}

console.log(drift ? '\n✗ Token or motion drift detected.\n' : '\n✓ All brand tokens and motion constants in sync.\n');
// process.exitCode, not process.exit(): on Node 24.7/macOS a hard exit here
// intermittently segfaults (exit 139) during teardown, failing the gate on a
// green result. Letting the event loop drain exits cleanly with the same code.
process.exitCode = drift ? 1 : 0;
