#!/usr/bin/env node
/**
 * Photographic treatments for the design-variant board.
 *
 * There are exactly three photographs in this repo, and for a comparison board
 * that is a feature rather than a shortage: the same three frames under eight
 * grades isolates art direction and nothing else. What changes between variants
 * is the treatment, so the treatment has to be real rather than implied.
 *
 * Most grades are CSS `filter` on the page (cheap, and re-tunable without a
 * rebuild). Four cannot be: a **duotone** needs per-pixel channel mapping, and
 * a **halftone** needs resampling to a dot grid. Those are baked here with PIL.
 *
 * Everything is downscaled to 760px wide first. The board is judged at
 * thumbnail and full-page scale, never at 1:1, and eight self-contained pages
 * each embedding three full-resolution photographs as base64 would put ~3 MB of
 * duplicated pixels in the repo. This is the same trade `www-spec-sheet.html`
 * already makes for its font.
 *
 * Output goes to `.cache/design-variants/` (gitignored), not into `docs/`.
 * These frames are a deterministic intermediate — derived from three committed
 * photographs by a committed script — and `docs/design/` is documented as
 * rendered output only. Committing them would have put 315 KB of regenerable
 * bytes in a folder whose rule says otherwise.
 *
 * Run: node scripts/design-variants/prepare-assets.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'sites/www/public/photo');
const OUT = path.join(ROOT, '.cache/design-variants');

const PHOTOS = ['home-rack', 'bare-wrist', 'phone-bench'];

/*
 * Treatment → (from, to) colour pair for a duotone, or a named non-duotone
 * process. Shadows map to `from`, highlights to `to`, everything between is
 * interpolated on luminance — which is what makes a duotone read as one ink on
 * one paper rather than as a tinted photograph.
 */
const TREATMENTS = {
  /*
   * Highlight inks are deliberately DARK. The first pass mapped highlights to
   * the full brand red / full amber / full sand, and every one of those frames
   * came back as a flat wall of colour with the photograph gone and the white
   * headline unreadable on top — a duotone whose light end is a saturated hue
   * has no highlights left to read a picture by. The ink is the *midtone*; the
   * page's own accent colour supplies the saturation.
   */
  // B1 sport editorial: brand red as the midtone, not the highlight.
  duotone_red: { kind: 'duotone', from: [12, 9, 9], to: [150, 38, 22] },
  // B3 free identity: the control that removes red entirely — blue, not amber.
  // Amber stays a UI accent; putting it in the photograph turned the page gold.
  duotone_blue: { kind: 'duotone', from: [8, 13, 26], to: [108, 138, 178] },
  // C1 mission dossier: olive on a stock that is not white.
  duotone_olive: { kind: 'duotone', from: [16, 18, 11], to: [122, 118, 82] },
  // C4 zine: 1-bit halftone, the photocopier look.
  halftone: { kind: 'halftone' },
};

const PY = `
import sys, math
from PIL import Image, ImageOps, ImageFilter

src, out, kind = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('L')
w = 760
im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
im = ImageOps.autocontrast(im, cutoff=1)

if kind == 'duotone':
    fr = tuple(int(x) for x in sys.argv[4].split(','))
    to = tuple(int(x) for x in sys.argv[5].split(','))
    # Per-channel LUT: 256 stops interpolated between the two inks. Done on the
    # luminance channel so the mapping is monotonic — a duotone built by tinting
    # RGB separately banks the midtones and reads as a colour cast.
    lut = []
    for c in range(3):
        lut += [round(fr[c] + (to[c] - fr[c]) * (i / 255)) for i in range(256)]
    im = im.convert('RGB').point(lut)

elif kind == 'halftone':
    # Ordered-dither to 1 bit at a coarse cell, then scaled back up with NEAREST
    # so the dots stay hard. A Floyd-Steinberg dither would look like noise at
    # this size; the point is a visible, countable dot.
    # cell 2, not 3, and the contrast pulled DOWN before dithering. The first
    # pass used a coarse cell on an autocontrasted source and produced noise
    # rather than a photograph — at 760px a 3px dot on a full-range image blows
    # every midtone to solid black or solid white.
    cell = 2
    small = im.resize((im.width // cell, im.height // cell), Image.LANCZOS)
    small = small.point(lambda v: 60 + v * 0.62)
    bw = small.convert('1')  # ordered dither
    # 1-bit PNG, not WebP. Hard dots defeat a lossy codec — the same three
    # frames came out 589 KB as WebP against 124 KB for the untreated base,
    # because every dot edge is high-frequency detail the encoder must keep.
    # PNG run-length codes a bilevel image instead, and the dots stay crisp.
    bw.resize((im.width, im.height), Image.NEAREST).save(out.replace('.webp', '.png'), 'PNG', optimize=True)
    print(out.split('/')[-1].replace('.webp', '.png'), im.size)
    sys.exit(0)

else:
    im = im.convert('RGB')

im.save(out, 'WEBP', quality=76, method=6)
print(out.split('/')[-1], im.size)
`;

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  for (const photo of PHOTOS) {
    const src = path.join(SRC, `${photo}.webp`);
    if (!fs.existsSync(src)) throw new Error(`prepare-assets: missing ${src}`);

    // The untreated, downscaled base every CSS-filter variant uses.
    execFileSync('python3', ['-c', PY, src, path.join(OUT, `${photo}--base.webp`), 'plain'], {
      stdio: 'inherit',
    });

    for (const [name, t] of Object.entries(TREATMENTS)) {
      const args = ['-c', PY, src, path.join(OUT, `${photo}--${name}.webp`), t.kind];
      if (t.kind === 'duotone') args.push(t.from.join(','), t.to.join(','));
      execFileSync('python3', args, { stdio: 'inherit' });
    }
  }

  const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.webp'));
  const bytes = files.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`\n✓ ${files.length} treated frames, ${(bytes / 1024).toFixed(0)} KB total\n`);
}

main();
