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

const BRAND_HEX = {
  navy: '#0a0c10',
  emerald: '#27b07d',
  brass: '#c7a860',
  danger: '#e85d5d',
};

const COLOR_CHECKS = [
  { label: 'Navy / background', webVar: '--background', androidKey: 'Navy', target: BRAND_HEX.navy },
  { label: 'Emerald / primary', webVar: '--primary', androidKey: 'Emerald', target: BRAND_HEX.emerald },
  { label: 'Brass', webVar: '--brass', androidKey: 'Brass', target: BRAND_HEX.brass },
  { label: 'Danger (destructive)', webVar: '--destructive', androidKey: 'Danger', target: BRAND_HEX.danger },
  { label: 'Danger (status)', webVar: '--status-danger', androidKey: 'Danger', target: BRAND_HEX.danger },
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
  const androidHex = androidColors[check.androidKey] ?? '(missing)';
  const target = check.target;

  const webOk = webHex !== '(missing)' && colorsWithinTolerance(webHex, target);
  const androidOk =
    androidHex !== '(missing)' && colorsWithinTolerance(androidHex, target);
  const crossOk =
    webHex !== '(missing)' &&
    androidHex !== '(missing)' &&
    colorsWithinTolerance(webHex, androidHex);
  const ok = webOk && androidOk && crossOk;
  if (!ok) drift = true;

  rows.push({
    token: check.label,
    web: webHex,
    android: androidHex,
    target,
    result: status(ok),
  });
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
process.exit(drift ? 1 : 0);
