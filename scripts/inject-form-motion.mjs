#!/usr/bin/env node
/**
 * Inject CSS-in-SVG mid-phase motion on hero form guides.
 *
 * Works with <img src="…svg"> (animation lives inside the SVG).
 * Respects prefers-reduced-motion via a media query in the SVG <style>.
 *
 * Run: node scripts/inject-form-motion.mjs
 * After: node scripts/generate-form-guides-all.mjs (regen strips motion — re-run this)
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public', 'form-guides');

/** Heroes get example motion first (~GrokFilm 10% reel density). */
export const HERO_MOTION_IDS = [
  'push-ups',
  'air-squat',
  'squats',
  'deadlift',
  'pull-ups',
  'plank',
  'thruster',
  'overhead-press',
  'barbell-row',
  'lunges',
  'kettlebell-swing',
  'burpees',
  'hip-thrust',
  'bench-press',
  'romanian-deadlift',
  'inverted-row',
];

const STYLE_BLOCK = `  <style>
    /* Hero form motion — only when the athlete allows motion. */
    @media (prefers-reduced-motion: no-preference) {
      .form-phase-mid {
        animation: form-mid-bob 2s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center bottom;
      }
      .form-cue-pulse {
        animation: form-cue-pulse 2s ease-in-out infinite;
      }
    }
    @keyframes form-mid-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(5px); }
    }
    @keyframes form-cue-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  </style>`;

const MOTION_MARK = 'form-phase-mid';

/**
 * @param {string} svg
 * @returns {string}
 */
export function injectFormMotion(svg) {
  let out = svg;

  // Idempotent: strip prior motion style + classes (always re-inject clean)
  out = out.replace(/\s*<style>[\s\S]*?<\/style>/g, (block) =>
    block.includes('form-mid-bob') ? '' : block
  );
  out = out.replace(/\s*class="form-phase-mid"/g, '');
  out = out.replace(/\s*class="form-cue-pulse"/g, '');

  // Insert style after opening <svg …>
  out = out.replace(/(<svg[^>]*>)/, `$1\n${STYLE_BLOCK}`);

  // Second stick figure group = mid phase (setup / mid / lockout).
  // Stick groups open with: <g stroke="#201e1d" stroke-width="2.5" …
  let stickIdx = 0;
  out = out.replace(
    /<g stroke="#201e1d" stroke-width="2\.5" stroke-linecap="round" stroke-linejoin="round" fill="none">/g,
    (match) => {
      stickIdx += 1;
      if (stickIdx === 2) {
        return `<g class="${MOTION_MARK}" stroke="#201e1d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">`;
      }
      return match;
    }
  );

  // Pulse red cue dots and arrows (fill or stroke #ec3013)
  out = out.replace(/<(circle|path|polygon)\b([^>]*?)>/g, (full, tag, attrs) => {
    if (!/#ec3013/.test(attrs)) return full;
    if (/\bclass=/.test(attrs)) return full;
    return `<${tag} class="form-cue-pulse"${attrs}>`;
  });

  return out;
}

function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const ids = only.length ? only : HERO_MOTION_IDS;
  let n = 0;
  for (const id of ids) {
    const file = path.join(dir, `${id}.svg`);
    try {
      const prev = readFileSync(file, 'utf8');
      const next = injectFormMotion(prev);
      if (next === prev) {
        process.stdout.write(`= ${id} `);
        continue;
      }
      writeFileSync(file, next);
      n += 1;
      process.stdout.write(`${id} `);
    } catch (e) {
      console.error(`\nskip ${id}:`, e.message);
    }
  }
  console.log(`\nInjected motion into ${n} hero form guide(s).`);

  // Sanity: every hero on disk still has mid class after inject
  const missing = [];
  for (const id of HERO_MOTION_IDS) {
    const file = path.join(dir, `${id}.svg`);
    try {
      const s = readFileSync(file, 'utf8');
      if (!s.includes(MOTION_MARK) || !s.includes('form-mid-bob')) missing.push(id);
    } catch {
      missing.push(id);
    }
  }
  if (missing.length) {
    console.error('Missing motion mark:', missing.join(', '));
    process.exit(1);
  }
}

// Allow unit import without running
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
