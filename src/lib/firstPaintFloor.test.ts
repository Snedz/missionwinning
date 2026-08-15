/**
 * What the first byte says.
 *
 * `PRIVATE_MODE` is on, so `/` redirects to `/private` and that page *is* the
 * website. Read off live www on 2026-08-13, the entire visible text of its
 * server-rendered body was:
 *
 *     Checking sign-in…
 *
 * and `/welcome` — the other public entry, and the one the guidebook and the
 * `/compare` redirect both point at — rendered no visible text at all, because
 * `useSearchParams()` made the page a Suspense child and the fallback was an
 * `aria-hidden` skeleton. Both defects were invisible to the whole suite: every
 * existing check reads the hydrated DOM or the source, and hydration is exactly
 * the step a slow phone, a crawler, or a failed chunk never reaches.
 *
 * Three properties, each discovered rather than enumerated, because the two
 * defects above were both *new files behaving normally* — no list of known
 * pages would have contained them.
 *
 * 1. **No `t()` call can paint its own key.** i18next returns the key when a
 *    string is missing, and `BOOTSTRAP_EN` (the only catalogue in the first-paint
 *    bundle) holds ~90 of ~2,500 keys. So a call site without `defaultValue`
 *    prints `guidebookTitle` at visitors until the async catalogues land. `.653`
 *    fixed this for legal pages after it shipped; this is the general rule.
 * 2. **First paint may not contradict hydrated paint.** A hand-typed
 *    `defaultValue` that disagrees with its own English pack value means the page
 *    states one thing and then, seconds later, another. The gate promised *"Private
 *    beta in progress"* then *"Invite-only open beta"*; *"Get notified at launch"*
 *    then *"Get an invite"*. Ratcheted, not zero: 200-odd sites drifted when this
 *    was written and a binary red would just be disabled.
 * 3. **A public route's Suspense fallback must say something.** Resolved one
 *    level into the fallback component (`.253`'s rule, for the same reason:
 *    `<RouteLoading label="Account" />` does render text and a shape-only check
 *    cannot see that).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { BOOTSTRAP_EN } from '@/i18n/bootstrapResources';
import { LOCALE_EXPORTS } from '@/lib/exportLocales';
import { PRIVATE_GATE_PUBLIC_PATHS } from '@/lib/publicRoutes';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Comments discuss defects using the same spellings the guard looks for. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function walk(dir: string, keep: (p: string) => boolean, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(path.join(root, dir));
  } catch {
    return out;
  }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    if (statSync(path.join(root, rel)).isDirectory()) walk(rel, keep, out);
    else if (keep(rel)) out.push(rel);
  }
  return out;
}

const SOURCE_ROOTS = [
  'app',
  'src/components',
  'src/page-components',
  'src/hooks',
  'src/lib',
  'src/store',
];

function sourceFiles(): string[] {
  const out: string[] = [];
  for (const r of SOURCE_ROOTS) {
    walk(
      r,
      (p) => /\.tsx?$/.test(p) && !/\.(test|routetest)\.tsx?$/.test(p),
      out
    );
  }
  return out;
}

type Call = { file: string; key: string | null; args: string; literal: boolean };

/**
 * Every `t(...)` call with its full argument text.
 *
 * Balanced-paren scan rather than a regex window: the first draft of this used
 * `src.slice(end, end + 200)` and missed a `defaultValue` that sat past a
 * two-line comment, which would have reported a clean call site as a defect —
 * `.220`'s "the check stopped seeing its input" in the opposite direction.
 */
function translationCalls(file: string, src: string): Call[] {
  const calls: Call[] = [];
  const re = /(?<![A-Za-z0-9_$.])t\(/g;
  for (const m of src.matchAll(re)) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    let end = -1;
    let inStr: string | null = null;
    for (let i = open; i < src.length; i++) {
      const ch = src[i];
      if (inStr) {
        if (ch === '\\') i++;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') inStr = ch;
      else if (ch === '(' || ch === '{' || ch === '[') depth++;
      else if (ch === ')' || ch === '}' || ch === ']') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;
    const args = src.slice(open + 1, end);
    /*
     * Both quote styles. The first draft read `'…'` only, and `BundlePage.tsx`
     * writes `t("bundleHeadline")` — twenty-five literal keys with no
     * `defaultValue`, all of which this guard reported as unknowable "computed"
     * keys rather than as the defect they are. `.220`, inside the guard written
     * against `.220`; `check-build-label.mjs` carries the same note.
     */
    const keyMatch = /^\s*['"]([A-Za-z][A-Za-z0-9_.]*)['"]/.exec(args);
    calls.push({
      file,
      key: keyMatch ? keyMatch[1] : null,
      args,
      literal: Boolean(keyMatch),
    });
  }
  return calls;
}

function hasDefaultValue(args: string): boolean {
  return /\bdefaultValue\s*:/.test(args);
}

const ALL_CALLS: Call[] = (() => {
  const out: Call[] = [];
  for (const file of sourceFiles()) {
    out.push(...translationCalls(file, stripComments(read(file))));
  }
  return out;
})();

/**
 * A floor on the scan itself. Both defects this file exists for were things a
 * check looked at and did not see; a guard whose discovery silently returns
 * nothing is the same failure wearing a green tick.
 */
const MIN_CALLS_SCANNED = 2000;

test('the t() scan actually sees the app', () => {
  assert.ok(
    ALL_CALLS.length >= MIN_CALLS_SCANNED,
    `Only ${ALL_CALLS.length} t() call sites found (expected ≥ ${MIN_CALLS_SCANNED}). ` +
      `The scanner, not the app, is what changed — fix it before trusting this file.`
  );
  assert.ok(
    Object.keys(BOOTSTRAP_EN).length > 50,
    'BOOTSTRAP_EN looks empty — the first-paint catalogue could not be read.'
  );
});

test('no t() call with a literal key can paint the key itself', () => {
  const offenders = ALL_CALLS.filter(
    (c) => c.literal && !hasDefaultValue(c.args) && !(c.key! in BOOTSTRAP_EN)
  ).map((c) => `${c.file} → t('${c.key}')`);

  assert.deepEqual(
    offenders,
    [],
    `These render their own key until the async catalogues land. Pass ` +
      `defaultValue (matching the English pack), or add the key to ` +
      `BOOTSTRAP_EN if it belongs on first paint:\n  ${offenders.join('\n  ')}`
  );
});

/**
 * Keys computed at runtime (`t(labelKey)`, `t(EQUIP_LABELS[e])`) cannot be
 * checked against a catalogue from source, so they are counted instead of
 * judged. Down only.
 */
const MAX_COMPUTED_KEYS_WITHOUT_DEFAULT = 9;

test('computed-key t() calls without a defaultValue only ever decrease', () => {
  const offenders = ALL_CALLS.filter((c) => !c.literal && !hasDefaultValue(c.args)).map(
    (c) => `${c.file} → t(${c.args.split(',')[0].trim()})`
  );

  assert.ok(
    offenders.length <= MAX_COMPUTED_KEYS_WITHOUT_DEFAULT,
    `${offenders.length} computed-key t() calls have no defaultValue (cap ` +
      `${MAX_COMPUTED_KEYS_WITHOUT_DEFAULT}). Each can print a raw key on first ` +
      `paint. Lower the cap when you fix one; never raise it:\n  ${offenders.join('\n  ')}`
  );
});

/**
 * What the reader actually gets, in resolution order.
 *
 * `BOOTSTRAP_EN` is layered **on top of** the packs because it is the only
 * catalogue in the first-paint bundle and i18next resolves it first. `.766`
 * found what that blindness costs: `todayCoachInviteEyebrow` exists *only* in
 * bootstrap, so its mount sites' `defaultValue` had never rendered even once,
 * and the eyebrow above Today's Coach invite read "AI weekly plan" permanently
 * while the source said "Mission Coach". Comparing defaults against the packs
 * alone could not see it — the key is in no pack, so it was skipped as unknown.
 */
const EN_STRINGS: Record<string, string> = (() => {
  const en: Record<string, string> = {};
  for (const entry of LOCALE_EXPORTS) Object.assign(en, entry.stringsFor('en'));
  Object.assign(en, BOOTSTRAP_EN);
  return en;
})();

const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();

/** `defaultValue: '…'` — only single-expression string literals are comparable. */
function literalDefault(args: string): string | null {
  const m = /\bdefaultValue\s*:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/.exec(args);
  if (!m) return null;
  const raw = m[1];
  return collapse(raw.slice(1, -1).replace(/\\(['"])/g, '$1'));
}

function driftingCalls(): string[] {
  const out: string[] = [];
  for (const c of ALL_CALLS) {
    if (!c.literal) continue;
    const dv = literalDefault(c.args);
    if (dv == null) continue;
    const en = EN_STRINGS[c.key!];
    if (typeof en !== 'string') continue;
    if (collapse(en) !== dv) out.push(`${c.file} → ${c.key}`);
  }
  return out;
}

/**
 * Measured at `.765`: 193 sites against the packs alone. `.766` layered
 * `BOOTSTRAP_EN` in — the catalogue that actually resolves first — and the true
 * number is **209**. The 16 it had been blind to are the worse half: for a
 * bootstrap-only key the `defaultValue` never renders at all, so the source and
 * the screen can disagree forever (that is how "AI weekly plan" survived above
 * a call site reading "Mission Coach").
 *
 * `.766` merge-all then composed 47 PR heads onto that floor. New surfaces
 * (transparency, pregnancy, Explore, hard-session, garage, victory receipt)
 * added call sites the 209 cap had never seen. Measured **218** after compose.
 * The cap went up because the merge landed real UI, not because first-paint
 * got sloppier. Down only from here.
 */
const MAX_FIRST_PAINT_COPY_DRIFT = 205;

test('first-paint copy drift only ever decreases', () => {
  const drifting = driftingCalls();
  assert.ok(
    drifting.length <= MAX_FIRST_PAINT_COPY_DRIFT,
    `${drifting.length} call sites paint one sentence and then hydrate to a ` +
      `different one (cap ${MAX_FIRST_PAINT_COPY_DRIFT}). Floor from the English ` +
      `pack — see src/i18n/gateEn.ts — and lower the cap:\n  ` +
      `${drifting.slice(0, 20).join('\n  ')}`
  );
});

/**
 * The surfaces a cold visitor actually reads first. Zero drift here, whatever
 * the ratchet above says: this is the front door and the app chrome that frames
 * every public page while the gate is up.
 */
const FRONT_DOOR_FILES = [
  'app/private/PrivateTeaserClient.tsx',
  'src/components/layout/AppHeader.tsx',
  'src/page-components/WelcomePage.tsx',
  'src/components/profile/ProfileLanguageSwitcher.tsx',
  'src/components/marketing/MarketingNav.tsx',
];

test('the front door does not change its story after hydration', () => {
  for (const file of FRONT_DOOR_FILES) {
    const calls = translationCalls(file, stripComments(read(file)));
    assert.ok(calls.length > 0, `No t() calls found in ${file} — path moved?`);
    const drifting = calls
      .filter((c) => c.literal)
      .filter((c) => {
        const dv = literalDefault(c.args);
        const en = EN_STRINGS[c.key!];
        return dv != null && typeof en === 'string' && collapse(en) !== dv;
      })
      .map((c) => c.key);
    assert.deepEqual(
      drifting,
      [],
      `${file} types fallbacks that disagree with the English pack: ${drifting.join(', ')}`
    );
  }
});

/*
 * ---------------------------------------------------------------------------
 * 3. Public routes must render words, not shapes.
 * ---------------------------------------------------------------------------
 */

/** Route paths reachable without the gate cookie, plus the landing itself. */
const PUBLIC_PATHS = ['/', ...PRIVATE_GATE_PUBLIC_PATHS];

/** `app/(app)/foo/page.tsx` and `app/foo/page.tsx` both serve `/foo`. */
function routePathFor(file: string): string {
  const segments = file
    .replace(/^app\//, '')
    .replace(/\/page\.tsx$/, '')
    .split('/')
    .filter((s) => s && !(s.startsWith('(') && s.endsWith(')')));
  return `/${segments.join('/')}`;
}

function isPublicRouteFile(file: string): boolean {
  const route = routePathFor(file);
  return PUBLIC_PATHS.some((p) => route === p || route.startsWith(`${p}/`));
}

/**
 * Fallbacks that may legitimately show nothing, each with the reason. Asserted
 * to still exist, so a deleted route cannot leave a permanent hole here.
 */
const TEXTLESS_FALLBACK_EXEMPT: Record<string, string> = {
  'app/guide/print/page.tsx':
    'Print source for the magazine PDF — rendered by the PDF builder, never a human first paint.',
};

function fallbackExpressions(src: string): string[] {
  const out: string[] = [];
  const re = /fallback=\{/g;
  for (const m of src.matchAll(re)) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    for (let i = open; i < src.length; i++) {
      const ch = src[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          out.push(src.slice(open + 1, i));
          break;
        }
      }
    }
  }
  return out;
}

/** JSX text node, a `t()` call, or a quoted string used as a child. */
function rendersText(jsx: string): boolean {
  if (/\bt\(/.test(jsx)) return true;
  if (/>\s*[^<>{}"'`]*[A-Za-z]{3,}[^<>{}"'`]*\s*</.test(jsx)) return true;
  if (/\{\s*['"`][^'"`]{3,}['"`]\s*\}/.test(jsx)) return true;
  return false;
}

/** `<Foo …/>` → the component's own source, so `RouteLoading` can be judged. */
function resolveComponentSource(jsx: string): string | null {
  const m = /<([A-Z][A-Za-z0-9_]*)/.exec(jsx);
  if (!m) return null;
  const name = m[1];
  const candidates = walk(
    'src/components',
    (p) => p.endsWith(`/${name}.tsx`)
  ).concat(walk('src/page-components', (p) => p.endsWith(`/${name}.tsx`)));
  if (candidates.length === 0) return null;
  return candidates.map(read).join('\n');
}

test('a public route never first-paints a textless placeholder', () => {
  const pages = walk('app', (p) => p.endsWith('/page.tsx'));
  assert.ok(pages.length > 30, `Only ${pages.length} route files found — walk broken?`);

  const publicPages = pages.filter(isPublicRouteFile);
  assert.ok(
    publicPages.length > 10,
    `Only ${publicPages.length} public route files matched — the path map drifted ` +
      `from publicRoutes.ts.`
  );

  const offenders: string[] = [];
  for (const file of publicPages) {
    if (file in TEXTLESS_FALLBACK_EXEMPT) continue;
    const src = read(file);
    for (const jsx of fallbackExpressions(src)) {
      if (rendersText(jsx)) continue;
      const resolved = resolveComponentSource(jsx);
      if (resolved && rendersText(resolved)) continue;
      offenders.push(`${file} → fallback ${collapse(jsx).slice(0, 70)}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `These serve a shape instead of a sentence while their page streams. Give ` +
      `the fallback real copy, or resolve the query on the server so the page ` +
      `needs no boundary (app/welcome/page.tsx):\n  ${offenders.join('\n  ')}`
  );
});

test('every textless-fallback exemption still names a real file', () => {
  for (const [file, reason] of Object.entries(TEXTLESS_FALLBACK_EXEMPT)) {
    assert.ok(reason.length > 20, `Exemption for ${file} needs a reason, not a label.`);
    assert.doesNotThrow(
      () => read(file),
      `${file} is exempted from the first-paint rule and no longer exists. ` +
        `Delete the exemption.`
    );
  }
});

/*
 * ---------------------------------------------------------------------------
 * 4. The two pages this shipped for, by name.
 * ---------------------------------------------------------------------------
 */

test('the gate poster is not withheld pending a session probe', () => {
  const src = stripComments(read('app/private/PrivateTeaserClient.tsx'));

  // The headline and the probe both still exist…
  assert.match(src, /gateTitle1/, 'Gate headline key is gone — did the poster move?');
  assert.match(src, /grantPrivateAccessFromSession/, 'Session recovery probe is gone.');

  /*
   * …and the probe's state may not stand between the reader and the poster.
   * Checked by position rather than by spelling: whatever the flag is called,
   * the poster must not be reachable only after it resolves.
   */
  const headline = src.indexOf('gateTitle1');
  const earlyReturn = /if\s*\(\s*sessionUnlocking\s*\)\s*\{?\s*return/.exec(src);
  assert.equal(
    earlyReturn,
    null,
    'PrivateTeaserClient returns before its headline while the session probe ' +
      'runs. With PRIVATE_MODE on, that return value is the whole website.'
  );
  assert.ok(headline > 0);
});

test('/welcome resolves its query on the server so I-Day step one is in the HTML', () => {
  const page = stripComments(read('src/page-components/WelcomePage.tsx'));
  assert.doesNotMatch(
    page,
    /useSearchParams/,
    'WelcomePage reads useSearchParams again. That hook makes the whole page a ' +
      'Suspense child at prerender, and the HTML becomes the fallback.'
  );
  const route = stripComments(read('app/welcome/page.tsx'));
  assert.match(route, /searchParams/, 'app/welcome/page.tsx must resolve ?edit= itself.');
  assert.match(route, /initialEdit/, 'The resolved flag must reach WelcomePage as a prop.');
});
