#!/usr/bin/env node
/**
 * Subset the OFL faces already in the Android design system down to Latin +
 * numerals, as woff2, into `.cache/concept-fonts/`.
 *
 * Bytes on disk are safe to share across concepts; structure is not. This
 * file only produces those bytes. `assets.mjs` embeds them.
 *
 * Run: node scripts/design-concepts/fonts.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'apps/android/core/designsystem/src/main/res/font');
const OUT = path.join(ROOT, '.cache/concept-fonts');

const FACES = [
  ['barlow_condensed_bold.ttf', 'barlow-cond-700'],
  ['barlow_condensed_extrabold.ttf', 'barlow-cond-800'],
  ['ibm_plex_mono_regular.ttf', 'plex-mono-400'],
  ['ibm_plex_mono_medium.ttf', 'plex-mono-500'],
  ['inter_regular.ttf', 'inter-400'],
  ['inter_semibold.ttf', 'inter-600'],
  ['inter_bold.ttf', 'inter-700'],
];

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr || r.stdout}`);
  }
  return r;
}

function ensureFonttools() {
  const probe = spawnSync('python3', ['-c', 'import fontTools, brotli'], { encoding: 'utf8' });
  if (probe.status === 0) return;
  run('python3', ['-m', 'pip', 'install', '--quiet', 'fonttools', 'brotli']);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  ensureFonttools();
  for (const [srcName, outName] of FACES) {
    const src = path.join(SRC, srcName);
    const dest = path.join(OUT, `${outName}.woff2`);
    if (!fs.existsSync(src)) throw new Error(`fonts: missing ${src}`);
    run('python3', [
      '-m',
      'fontTools.subset',
      src,
      `--output-file=${dest}`,
      '--flavor=woff2',
      '--unicodes=U+0020-007E,U+00A0-00FF',
      '--no-hinting',
      '--desubroutinize',
    ]);
    console.log(`  ${outName.padEnd(18)} ${(fs.statSync(dest).size / 1024).toFixed(1)} KB`);
  }
}

main();
