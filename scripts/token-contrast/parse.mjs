/**
 * Parsing approach adapted from davila7/claude-code-templates (MIT) PR #1224; MIT notice retained.
 *
 * MIT License
 *
 * Copyright (c) davila7
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Run this module under `npx tsx` (tsx is a devDependency): it imports the
 * TypeScript contrast helper below instead of duplicating the WCAG formula.
 */

const { contrastRatio } = await import('../../src/lib/polishContrast.ts');

const FG_SUFFIXES = ['-fg', '-text'];
const UNSUPPORTED = 'unsupported';

function normalizeName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('--') ? trimmed : `--${trimmed}`;
}

function skipString(text, start) {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (text[i] === quote) return i + 1;
    i += 1;
  }
  return i;
}

function matchBrace(text, open) {
  let depth = 0;
  let i = open;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      i = skipString(text, i);
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

function splitTopLevel(text, separator) {
  const parts = [];
  let current = '';
  let parens = 0;
  let brackets = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === '\\' && i + 1 < text.length) {
        current += text[i + 1];
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(') parens += 1;
    if (ch === ')') parens = Math.max(0, parens - 1);
    if (ch === '[') brackets += 1;
    if (ch === ']') brackets = Math.max(0, brackets - 1);
    if (ch === separator && parens === 0 && brackets === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

function walkBlocks(text, onBlock) {
  let i = 0;
  let preludeStart = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      i = skipString(text, i);
      continue;
    }
    if (ch === '{') {
      const prelude = text.slice(preludeStart, i).trim();
      const close = matchBrace(text, i);
      if (close === -1) break;
      onBlock(prelude, text.slice(i + 1, close));
      i = close + 1;
      preludeStart = i;
      continue;
    }
    i += 1;
  }
}

function parseDeclarations(body) {
  const declarations = {};
  let buffer = '';
  let depth = 0;
  let parens = 0;
  let quote = null;

  const flush = () => {
    const segment = buffer.trim();
    buffer = '';
    if (!segment) return;
    const colon = segment.indexOf(':');
    if (colon === -1) return;
    const name = segment.slice(0, colon).trim();
    if (!name.startsWith('--color-')) return;
    const value = segment
      .slice(colon + 1)
      .trim()
      .replace(/\s*!important\s*$/i, '')
      .trim();
    if (value) declarations[name] = value;
  };

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (quote) {
      if (depth === 0) buffer += ch;
      if (ch === '\\' && i + 1 < body.length) {
        if (depth === 0) buffer += body[i + 1];
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      if (depth === 0) buffer += ch;
      continue;
    }
    if (ch === '(') {
      parens += 1;
      if (depth === 0) buffer += ch;
      continue;
    }
    if (ch === ')') {
      parens = Math.max(0, parens - 1);
      if (depth === 0) buffer += ch;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) buffer = '';
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (ch === ';' && depth === 0 && parens === 0) {
      flush();
      continue;
    }
    if (depth === 0) buffer += ch;
  }

  flush();
  return declarations;
}

/**
 * Read every --color-* custom property from :root (light) and from dark
 * blocks (`.dark`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`).
 * Dark inherits any value it does not override.
 */
export function parseTokens(cssText) {
  const light = {};
  const darkOverrides = {};
  const css = String(cssText ?? '').replace(/\/\*[\s\S]*?\*\//g, '');

  const ingest = (prelude, body, dark) => {
    if (prelude.startsWith('@')) {
      const isMedia = /^@media\b/i.test(prelude);
      const mediaDark = isMedia && /prefers-color-scheme\s*:\s*dark/i.test(prelude);
      const nextDark = dark || mediaDark;
      walkBlocks(body, (nestedPrelude, nestedBody) => ingest(nestedPrelude, nestedBody, nextDark));
      return;
    }

    for (const rawSelector of splitTopLevel(prelude, ',')) {
      const selector = rawSelector.trim();
      if (!selector) continue;
      const darkSelector =
        /\.dark\b/.test(selector) ||
        /\[data-theme\s*=\s*["']?dark["']?\]/i.test(selector);
      const rootSelector = selector.includes(':root');
      const targetIsDark = dark || darkSelector;
      if (!targetIsDark && !rootSelector) continue;
      Object.assign(targetIsDark ? darkOverrides : light, parseDeclarations(body));
    }
  };

  walkBlocks(css, (prelude, body) => ingest(prelude, body, false));

  return { light, dark: { ...light, ...darkOverrides } };
}

function clampByte(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function toHex(rgb) {
  return `#${rgb.map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('')}`;
}

function splitFunctionArgs(text) {
  if (text.includes(',')) {
    return text.split(',').map((part) => part.trim()).filter(Boolean);
  }
  const parts = text.replace(/\s*\/\s*/g, ' / ').split(/\s+/).filter(Boolean);
  const slash = parts.indexOf('/');
  return slash === -1 ? parts : parts.slice(0, slash);
}

function numberOrPercent(raw, scale) {
  if (typeof raw !== 'string') return Number.NaN;
  if (raw.endsWith('%')) return (Number.parseFloat(raw) / 100) * scale;
  return Number.parseFloat(raw);
}

function hueToDegrees(raw) {
  const match = String(raw).trim().match(/^(-?[\d.]+)(deg|grad|rad|turn)?$/i);
  if (!match) return Number.NaN;
  const value = Number.parseFloat(match[1]);
  const unit = (match[2] ?? 'deg').toLowerCase();
  if (unit === 'grad') return value * 0.9;
  if (unit === 'rad') return (value * 180) / Math.PI;
  if (unit === 'turn') return value * 360;
  return value;
}

function hslToRgb(hue, saturation, lightness) {
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
  return rgb.map((channel) => (channel + m) * 255);
}

function parseColorLiteral(value) {
  const text = value.trim();

  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3) {
      return `#${digits
        .split('')
        .map((digit) => digit + digit)
        .join('')}`.toLowerCase();
    }
    return `#${digits}`.toLowerCase();
  }

  const fn = text.match(/^(rgba?|hsla?)\(\s*([\s\S]*?)\s*\)$/i);
  if (!fn) return UNSUPPORTED;

  const kind = fn[1].toLowerCase();
  const args = splitFunctionArgs(fn[2]);

  if (kind.startsWith('rgb')) {
    if (args.length < 3) return UNSUPPORTED;
    const channels = args.slice(0, 3).map((part) => numberOrPercent(part, 255));
    if (channels.some((channel) => !Number.isFinite(channel))) return UNSUPPORTED;
    return toHex(channels);
  }

  if (args.length < 3) return UNSUPPORTED;
  const hue = hueToDegrees(args[0]);
  const saturation = numberOrPercent(args[1], 100);
  const lightness = numberOrPercent(args[2], 100);
  if (![hue, saturation, lightness].every(Number.isFinite)) return UNSUPPORTED;
  return toHex(hslToRgb(hue, saturation, lightness));
}

function topLevelComma(text) {
  let parens = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(') parens += 1;
    else if (ch === ')') parens = Math.max(0, parens - 1);
    else if (ch === ',' && parens === 0) return i;
  }
  return -1;
}

function resolveValue(value, tokens, seen) {
  if (typeof value !== 'string') return UNSUPPORTED;
  const text = value.trim().replace(/\s*!important\s*$/i, '').trim();
  if (!text) return UNSUPPORTED;

  if (!/^var\(/i.test(text)) {
    return parseColorLiteral(text);
  }

  if (!text.endsWith(')')) return UNSUPPORTED;
  const inner = text.slice(text.indexOf('(') + 1, -1);
  const comma = topLevelComma(inner);
  const reference = (comma === -1 ? inner : inner.slice(0, comma)).trim();
  const fallback = comma === -1 ? null : inner.slice(comma + 1).trim();

  const key = normalizeName(reference);
  if (key && Object.hasOwn(tokens, key) && !seen.has(key)) {
    seen.add(key);
    return resolveValue(tokens[key], tokens, seen);
  }

  if (fallback) return resolveValue(fallback, tokens, seen);
  return UNSUPPORTED;
}

function colorsFor(tokens) {
  if (tokens && typeof tokens === 'object' && tokens.light && tokens.dark) return tokens.light;
  return tokens;
}

/** Resolve a token name to #rrggbb, following var() chains, or 'unsupported'. */
export function resolveColor(name, tokens) {
  const palette = colorsFor(tokens);
  const key = normalizeName(name);
  if (!key || !palette || typeof palette !== 'object') return UNSUPPORTED;
  if (!Object.hasOwn(palette, key)) return UNSUPPORTED;
  return resolveValue(palette[key], palette, new Set([key]));
}

/** Pair text/foreground tokens with their background tokens by name. */
export function pairTokens(tokens) {
  const palette = colorsFor(tokens);
  if (!palette || typeof palette !== 'object') return [];
  const keys = Object.keys(palette);
  const has = (key) => Object.hasOwn(palette, key);
  const pairs = [];
  const seen = new Set();

  const add = (text, bg) => {
    if (!has(text) || !has(bg)) return;
    const id = `${text}|${bg}`;
    if (seen.has(id)) return;
    seen.add(id);
    pairs.push({ text, bg });
  };

  for (const key of keys) {
    if (key === '--color-foreground') {
      add(key, '--color-background');
      continue;
    }
    const suffix = FG_SUFFIXES.find((candidate) => key.endsWith(candidate));
    if (!suffix) continue;
    const base = key.slice(0, -suffix.length);
    const bg = [`${base}-bg`, base].find(has);
    if (bg) add(key, bg);
  }

  return pairs;
}

/**
 * Compute WCAG contrast for every paired token in both modes. The arithmetic
 * comes from src/lib/polishContrast.ts so there is only one formula.
 */
export function checkContrast(cssText, options = {}) {
  const min = typeof options.min === 'number' ? options.min : 4.5;
  const tokens = parseTokens(cssText);
  const pairs = pairTokens(tokens);
  const results = [];

  for (const mode of ['light', 'dark']) {
    const palette = tokens[mode];
    for (const { text, bg } of pairs) {
      if (!Object.hasOwn(palette, text) || !Object.hasOwn(palette, bg)) continue;
      const textColor = resolveColor(text, palette);
      const bgColor = resolveColor(bg, palette);
      if (textColor === UNSUPPORTED || bgColor === UNSUPPORTED) {
        results.push({
          mode,
          text,
          bg,
          ratio: null,
          status: UNSUPPORTED,
          pass: false,
        });
        continue;
      }
      const ratio = contrastRatio(textColor, bgColor);
      results.push({
        mode,
        text,
        bg,
        ratio,
        status: ratio >= min ? 'pass' : 'fail',
        pass: ratio >= min,
      });
    }
  }

  return results;
}
