/**
 * Shared *assets* for the concept documents — fonts and photographs only.
 *
 * Note what is NOT here: no DOM, no stylesheet, no content module, no layout
 * helpers. The last exploration board shared all of those and the result was
 * eight paint jobs on one wireframe — the sharing WAS the failure. Bytes on
 * disk are safe to share; structure is not.
 *
 * Fonts are subsetted from the families already in this repo. `scripts/
 * design-concepts/fonts.mjs` does the subsetting; this only embeds the result.
 * Every one is OFL: Barlow Condensed and Inter (Google Fonts), IBM Plex Mono
 * (IBM), Archivo (Omnibus-Type). They ship inside `apps/android/core/
 * designsystem/src/main/res/font/` for the native app and are reused here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const FONTS = path.join(ROOT, '.cache/concept-fonts');
const PHOTOS = path.join(ROOT, 'sites/www/public/photo');

function b64(file) {
  return fs.readFileSync(file).toString('base64');
}

/** @param {string[]} faces subset names, e.g. ['inter-400','plex-mono-500'] */
export function fontFaces(faces) {
  const SPEC = {
    'barlow-cond-700': ["'BarlowCond'", 700, 'normal'],
    'barlow-cond-800': ["'BarlowCond'", 800, 'normal'],
    'plex-mono-400': ["'PlexMono'", 400, 'normal'],
    'plex-mono-500': ["'PlexMono'", 500, 'normal'],
    'inter-400': ["'Inter'", 400, 'normal'],
    'inter-600': ["'Inter'", 600, 'normal'],
    'inter-700': ["'Inter'", 700, 'normal'],
  };
  return faces
    .map((f) => {
      const [family, weight, style] = SPEC[f];
      const file = path.join(FONTS, `${f}.woff2`);
      if (!fs.existsSync(file)) throw new Error(`assets: missing subset ${f} — run fonts.mjs`);
      return `@font-face{font-family:${family};src:url(data:font/woff2;base64,${b64(file)}) format('woff2');font-weight:${weight};font-style:${style};font-display:block}`;
    })
    .join('\n');
}

/** The three documentary photographs. There are no others in the repo. */
export function photo(name) {
  const file = path.join(PHOTOS, `${name}.webp`);
  if (!fs.existsSync(file)) throw new Error(`assets: no photograph ${name}`);
  return `data:image/webp;base64,${b64(file)}`;
}

export const PHOTO_NAMES = ['home-rack', 'bare-wrist', 'phone-bench'];
