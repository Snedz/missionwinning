/**
 * The media system must specify the palette the product actually renders.
 *
 * `.239` — `.131` re-inked the app to paper / ink / one red, and the media
 * system was never told. `docs/MEDIA_SYSTEM.md` and `media/FLOW_PROMPTS.md`
 * carried **66 references to navy / emerald / brass and 37 hardcoded hex** from
 * the retired palette, including the line every prompt inherits:
 *
 *   Always prepend the brand block from MEDIA_SYSTEM
 *   (navy `#0a0c10`, emerald `#27b07d`, brass `#c7a860`).
 *
 * So the six off-palette guidebook heroes `.238` measured were not an
 * oversight in one pass. They were the **correct output of the documented
 * system**, and anyone following it — founder or agent — would have produced
 * more of them.
 *
 * The sharpest evidence that the doc had gone stale rather than merely vague:
 * the 30 form-guide SVGs it claims are "navy ground, emerald arrows, brass
 * dots" have been `#f3f2f2` / `#ec3013` / `#201e1d` for eleven builds. The
 * assets were re-inked and their specification was not, so the doc actively
 * contradicted the files it describes.
 *
 * `.178`, one layer up from code: the brand's colour had two homes —
 * `src/index.css` and the media docs — and only one of them is what ships.
 * This makes `src/index.css` the single source and checks the rest against it,
 * which is the same relationship `check-token-sync` already enforces between
 * the web tokens and the Android Kotlin ones.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Files that tell a person or an agent what colour to make something. */
const SPEC_FILES = ['docs/MEDIA_SYSTEM.md', 'media/FLOW_PROMPTS.md', 'media/manifest.json'];

/**
 * The palette `.131` retired, named so it cannot come back by copy-paste.
 *
 * Hex *and* the colour words, because the words are how it actually spread —
 * `FLOW_PROMPTS.md` said "navy ground, emerald arrows, brass dots" far more
 * often than it said `#0a0c10`, and a prompt is read by a generator that does
 * not care which form it is written in.
 */
const RETIRED = {
  hex: ['#0a0c10', '#27b07d', '#c7a860'],
  words: ['navy', 'emerald', 'brass'],
};

/**
 * Shipped asset ids that contain a retired colour word, and are not prose.
 *
 * `public/art/topo-brass.webp` and `bundle-brass.webp` exist on disk and are
 * referenced by path. Renaming them is a real change — new files, updated
 * references, and a redirect for anything already linking them — not a
 * find-and-replace, so they are named here rather than quietly matched. If the
 * art is re-inked, rename then and delete these.
 */
const LEGACY_ASSET_IDS = ['topo-brass', 'bundle-brass'];

/** Text with shipped asset ids removed, so the word check reads prose only. */
function prose(src: string): string {
  return LEGACY_ASSET_IDS.reduce((acc, id) => acc.split(id).join(''), src.toLowerCase());
}

/** `--name: H S% L%` in `src/index.css`, resolved to lowercase hex. */
function tokenHexes(): Map<string, string> {
  const css = read('src/index.css');
  const out = new Map<string, string>();
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    const [h, s, l] = [Number(m[2]), Number(m[3]) / 100, Number(m[4]) / 100];
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const mm = l - c / 2;
    const seg = Math.floor(h / 60) % 6;
    const rgb = [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x],
    ][seg].map((v) => Math.round((v + mm) * 255));
    out.set(m[1], `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
  }
  return out;
}

/**
 * Neutrals used in shipped assets that are not themselves tokens, each with a
 * reason. Deliberately short: every entry is a colour the design system does
 * not name, so the list growing is a signal in itself.
 */
const UNTOKENISED = [
  {
    hex: '#6f6b69',
    why: 'Secondary stroke in the 30 form-guide SVGs — a mid grey sitting between --muted-foreground (#484747) and --border (#9f9d9d). On-palette neutral rather than a hue, and restyling 30 shipped diagrams to force it onto a token is not worth the churn. Promote it to a token if a third surface needs it.',
  },
];

test('the token reader actually resolves src/index.css', () => {
  /*
   * Everything below compares against this map, so a parser that returns
   * nothing would turn the whole file green — the defect this repo keeps
   * paying for, and a poor one to ship in a guard about stale specifications.
   */
  const tokens = tokenHexes();
  assert.ok(tokens.size >= 10, `resolved only ${tokens.size} tokens — the parser broke`);
  assert.equal(tokens.get('background'), '#f3f2f2');
  assert.equal(tokens.get('foreground'), '#201e1d');
  assert.equal(tokens.get('accent-poster'), '#ec3013');
});

test('the retired palette appears nowhere in the media system', () => {
  const problems: string[] = [];

  for (const file of SPEC_FILES) {
    const src = prose(read(file));
    for (const hex of RETIRED.hex) {
      const n = [...src.matchAll(new RegExp(hex, 'g'))].length;
      if (n) problems.push(`${file}: ${n}× ${hex}`);
    }
    for (const word of RETIRED.words) {
      const n = [...src.matchAll(new RegExp(`\\b${word}\\b`, 'g'))].length;
      if (n) problems.push(`${file}: ${n}× "${word}"`);
    }
  }

  assert.deepEqual(
    problems,
    [],
    'the media system still specifies the palette `.131` retired, so the next asset generated ' +
      'from it will be off-brand exactly like the six guidebook heroes:\n  ' + problems.join('\n  ')
  );
});

test('every colour the media system names is a real token', () => {
  const tokens = new Set(tokenHexes().values());
  const allowed = new Set(UNTOKENISED.map((u) => u.hex));

  const problems: string[] = [];
  for (const file of SPEC_FILES) {
    const hexes = [...read(file).matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
    for (const hex of new Set(hexes)) {
      if (!tokens.has(hex) && !allowed.has(hex)) {
        problems.push(`${file}: ${hex} is not a token in src/index.css`);
      }
    }
  }

  assert.deepEqual(
    problems,
    [],
    'these are invented colours — a spec that names a hex the product does not define is how ' +
      'the two drift apart:\n  ' + problems.join('\n  ')
  );
});

test('the form-guide SVGs use only approved colour', () => {
  /*
   * The reason this check is possible at all, and worth stating: an SVG is
   * source. `.238` could not check the guidebook heroes this way because a
   * palette baked into a `.webp` is invisible to static analysis — it needed a
   * pixel histogram and a narrowly justified threshold. Here the colours are
   * literally in the file, so the rule can be exact.
   */
  const dir = 'public/form-guides';
  const files = readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.svg'));
  assert.ok(files.length >= 20, `found only ${files.length} form guides — the walker broke`);

  const tokens = new Set(tokenHexes().values());
  const allowed = new Set(UNTOKENISED.map((u) => u.hex));

  const problems: string[] = [];
  for (const f of files) {
    const hexes = [...read(`${dir}/${f}`).matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) =>
      m[0].toLowerCase()
    );
    for (const hex of new Set(hexes)) {
      if (!tokens.has(hex) && !allowed.has(hex)) problems.push(`${dir}/${f}: ${hex}`);
    }
  }

  assert.deepEqual(problems, [], 'off-palette colour in form guides:\n  ' + problems.join('\n  '));
});

test('every untokenised colour states why it is allowed', () => {
  for (const u of UNTOKENISED) {
    assert.match(u.hex, /^#[0-9a-f]{6}$/, `${u.hex} is not lowercase hex`);
    assert.ok(u.why.trim().length > 60, `${u.hex}: "${u.why}" is not a reason`);
  }
});

test('no untokenised entry is stale', () => {
  /*
   * `.220`'s direction. An entry for a colour nothing uses any more makes the
   * list look considered and quietly re-permits it the day someone reaches for
   * that hex again.
   */
  const haystack = [...SPEC_FILES, 'public/form-guides']
    .flatMap((p) =>
      p.endsWith('form-guides')
        ? readdirSync(path.join(root, p))
            .filter((f) => f.endsWith('.svg'))
            .map((f) => read(`${p}/${f}`))
        : [read(p)]
    )
    .join('\n')
    .toLowerCase();

  const stale = UNTOKENISED.filter((u) => !haystack.includes(u.hex)).map((u) => u.hex);
  assert.deepEqual(stale, [], 'nothing uses these any more — remove their entries');
});

test('no legacy asset id is stale', () => {
  /*
   * The same rule as every other exemption list here: an id for a file that no
   * longer exists makes the list look considered, and re-permits the word the
   * day someone writes it in prose.
   */
  const stale = LEGACY_ASSET_IDS.filter(
    (id) => !existsSync(path.join(root, 'public/art', `${id}.webp`))
  );
  assert.deepEqual(stale, [], 'these assets are gone — remove their ids and the word ban applies again');
});
