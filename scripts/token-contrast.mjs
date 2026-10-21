#!/usr/bin/env node
/**
 * Report-only WCAG contrast sweep over the CSS colour tokens.
 *
 * Run under tsx (parse.mjs imports src/lib/polishContrast.ts):
 *   npm run contrast:tokens
 *   npm run contrast:tokens -- --file src/index.css --min 4.5 --strict
 *
 * Default: always exit 0 so the report can land before the palette is fixed.
 * --strict: exit 1 when any pair fails or is unsupported.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkContrast, parseTokens, resolveColor } from './token-contrast/parse.mjs';
import { contrastRatio } from '../src/lib/polishContrast.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const DEFAULT_FILE = 'src/index.css';
const DEFAULT_MIN = 4.5;
const STEP = 1;

const USAGE = `Usage: tsx scripts/token-contrast.mjs [options]

Options:
  --file <path>   CSS file to read (default: ${DEFAULT_FILE})
  --min <ratio>   Minimum contrast ratio (default: ${DEFAULT_MIN})
  --strict        Exit 1 when any pair fails or is unsupported
  -h, --help      Show this help
`;

function parseArgs(argv) {
  const options = { file: DEFAULT_FILE, min: DEFAULT_MIN, strict: false, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--strict') {
      options.strict = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (arg === '--file') {
      const value = argv[i + 1];
      if (!value) throw new Error('--file needs a path');
      options.file = value;
      i += 1;
      continue;
    }
    if (arg.startsWith('--file=')) {
      options.file = arg.slice('--file='.length);
      if (!options.file) throw new Error('--file needs a path');
      continue;
    }
    if (arg === '--min') {
      const value = argv[i + 1];
      if (!value) throw new Error('--min needs a ratio');
      options.min = Number.parseFloat(value);
      i += 1;
      continue;
    }
    if (arg.startsWith('--min=')) {
      options.min = Number.parseFloat(arg.slice('--min='.length));
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(options.min) || options.min <= 0) {
    throw new Error('--min must be a positive number');
  }

  return options;
}

function clampByte(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function hexToRgb(hex) {
  const digits = hex.slice(1);
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHsl([r, g, b]) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: lightness * 100 };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  return {
    h: ((hue * 60) % 360 + 360) % 360,
    s: saturation * 100,
    l: lightness * 100,
  };
}

function hslToHex(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360;
  const s = Math.min(100, Math.max(0, saturation)) / 100;
  const l = Math.min(100, Math.max(0, lightness)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return `#${rgb
    .map((channel) => clampByte((channel + m) * 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function searchLightness(textHex, bgHex, min, direction) {
  const { h, s, l } = rgbToHsl(hexToRgb(textHex));
  const limit = direction < 0 ? 0 : 100;
  let lightness = l;
  let steps = 0;

  while (direction < 0 ? lightness > 0 : lightness < 100) {
    steps += 1;
    lightness = direction < 0 ? Math.max(0, lightness - STEP) : Math.min(100, lightness + STEP);
    const hex = hslToHex(h, s, lightness);
    const ratio = contrastRatio(hex, bgHex);
    if (ratio >= min) return { hex, lightness, steps, ratio };
    if (lightness === limit) break;
  }

  return null;
}

/**
 * Nearest passing lightness on the text colour: keep hue and saturation, walk
 * toward black and toward white in 1% steps, take the direction that gets there
 * in fewer steps.
 */
function suggestTextColor(textHex, bgHex, min) {
  const candidates = [searchLightness(textHex, bgHex, min, -1), searchLightness(textHex, bgHex, min, 1)]
    .filter(Boolean)
    .sort((a, b) => a.steps - b.steps || b.ratio - a.ratio);
  return candidates[0] ?? null;
}

function formatRatio(ratio) {
  return typeof ratio === 'number' ? `${ratio.toFixed(2)}:1` : 'n/a';
}

function report(results, palette, fileLabel, min) {
  const lines = [`token contrast — ${fileLabel}`, `min ratio: ${min}`, ''];

  for (const mode of ['light', 'dark']) {
    lines.push(mode);
    const modeResults = results.filter((entry) => entry.mode === mode);
    if (modeResults.length === 0) {
      lines.push('  (no pairs found)');
      lines.push('');
      continue;
    }

    for (const entry of modeResults) {
      const label = `${entry.text} on ${entry.bg}`;
      if (entry.status === 'pass') {
        lines.push(`  pass  ${label}  ${formatRatio(entry.ratio)}`);
        continue;
      }

      if (entry.status === 'fail') {
        lines.push(`  fail  ${label}  ${formatRatio(entry.ratio)}`);
        const textHex = resolveColor(entry.text, palette[mode]);
        const bgHex = resolveColor(entry.bg, palette[mode]);
        if (textHex !== 'unsupported' && bgHex !== 'unsupported') {
          const suggestion = suggestTextColor(textHex, bgHex, min);
          if (suggestion) {
            lines.push(
              `        suggest ${entry.text} ${suggestion.hex} ` +
                `(lightness ${suggestion.lightness.toFixed(1)}%, ${formatRatio(suggestion.ratio)})`,
            );
          } else {
            lines.push(`        suggest ${entry.text}: no lightness change reaches ${min}:1`);
          }
        }
        continue;
      }

      lines.push(`  n/a   ${label}  unsupported`);
    }
    lines.push('');
  }

  const pass = results.filter((entry) => entry.status === 'pass').length;
  const fail = results.filter((entry) => entry.status === 'fail').length;
  const unsupported = results.filter((entry) => entry.status === 'unsupported').length;
  lines.push(
    `summary: ${results.length} pairs · ${pass} pass · ${fail} fail · ${unsupported} unsupported`,
  );

  return lines.join('\n');
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${USAGE}`);
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    process.stdout.write(USAGE);
    return;
  }

  const filePath = path.resolve(root, options.file);
  const fileLabel = path.relative(process.cwd(), filePath) || options.file;

  let css;
  try {
    css = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    process.stderr.write(`Cannot read ${filePath}: ${error.message}\n`);
    process.exitCode = 2;
    return;
  }

  const results = checkContrast(css, { min: options.min });
  const tokens = parseTokens(css);
  process.stdout.write(`${report(results, tokens, fileLabel, options.min)}\n`);

  const failing = results.some((entry) => !entry.pass);
  if (options.strict && failing) process.exitCode = 1;
}

main();
