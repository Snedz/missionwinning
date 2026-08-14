import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { GATE_EN } from '@/i18n/gateEn';

/**
 * No overlay may own the first paint of a public surface.
 *
 * `.770` — measured on a production build with the gate up:
 * `LocaleCountryChooser` opened itself on every first visit, from the root
 * provider, on every route. `document.elementsFromPoint` over the gate poster's
 * "Log a set" button returned the sheet and its `bg-foreground/50` scrim, so the
 * primary CTA could not be tapped at 390×844 — a Playwright click timed out
 * against a button that was, by every other measure, visible and enabled.
 *
 * What it asked for was already decided: the browser's language had been applied
 * before the sheet rendered, "Continue" only persisted that guess, and
 * dismissing the scrim persisted the same values. A dialog with no branch is a
 * wall, and shard 1 (ops #16) found a wall before value in ~27% of rows.
 */

const ROOT = join(import.meta.dirname, '../../..');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

/** Every component that renders a modal overlay — discovered, not listed. */
function overlayComponents(): string[] {
  const files = [
    ...walk(join(ROOT, 'src/components')),
    ...walk(join(ROOT, 'src/page-components')),
    ...walk(join(ROOT, 'app')),
  ];
  return files.filter((f) => readFileSync(f, 'utf8').includes('<AdaptiveOverlay'));
}

/** The balanced-brace block that opens at the first `{` at or after `from`. */
function blockAt(source: string, from: number): string {
  const braceStart = source.indexOf('{', from);
  if (braceStart === -1) return '';
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(braceStart, i + 1);
    }
  }
  return '';
}

/** Every balanced block introduced by `marker` — not just the first. */
function blocksAfterEach(source: string, marker: string): string[] {
  const out: string[] = [];
  let at = source.indexOf(marker);
  while (at !== -1) {
    const block = blockAt(source, at);
    if (block) out.push(block);
    at = source.indexOf(marker, at + marker.length);
  }
  return out;
}

/** Bodies of every `useEffect(...)` in a file, balanced-brace matched. */
function effectBodies(source: string): string[] {
  const bodies: string[] = [];
  let idx = source.indexOf('useEffect(');
  while (idx !== -1) {
    const braceStart = source.indexOf('{', idx);
    if (braceStart === -1) break;
    let depth = 0;
    let end = braceStart;
    for (; end < source.length; end++) {
      if (source[end] === '{') depth++;
      else if (source[end] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    bodies.push(source.slice(braceStart, end + 1));
    idx = source.indexOf('useEffect(', end);
  }
  return bodies;
}

const OPENS = /\bset(?:Open|Sheet|Show|Visible|Modal)[A-Za-z]*\(\s*true\s*\)/;

describe('no overlay owns the first paint', () => {
  it('opens a modal only when something asks it to', () => {
    const offenders: string[] = [];

    for (const file of overlayComponents()) {
      const source = readFileSync(file, 'utf8');
      for (const body of effectBodies(source)) {
        const lines = body.split('\n').filter((l) => OPENS.test(l) && !l.trim().startsWith('//'));
        if (lines.length === 0) continue;

        /*
         * Two conditions, because either alone is satisfiable by an auto-open:
         * the effect must register a listener (so there is something to respond
         * to), and every open call must sit inside a handler rather than running
         * as the effect's own body.
         */
        const listens = /addEventListener\(/.test(body);
        const allInHandlers = lines.every((l) => l.includes('=>'));
        if (!listens || !allInHandlers) {
          offenders.push(`${relative(ROOT, file)} — ${lines[0].trim().slice(0, 70)}`);
        }
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `these open an overlay on arrival instead of on request:\n  ${offenders.join('\n  ')}`
    );
  });

  it('still finds the components it claims to check', () => {
    // A guard that discovered nothing would pass forever.
    const found = overlayComponents().map((f) => relative(ROOT, f));
    assert.ok(found.length >= 10, `expected the overlay family, found ${found.length}`);
    assert.ok(
      found.includes('src/components/i18n/LocaleCountryChooser.tsx'),
      'the component this rule was written for must be in scope'
    );
  });
});

describe('the language choice survived losing its wall', () => {
  const chooser = readFileSync(
    join(ROOT, 'src/components/i18n/LocaleCountryChooser.tsx'),
    'utf8'
  );

  it('persists the guess instead of posing it as a question', () => {
    /*
     * The sheet's only effect was to persist detected values. Drop that write and
     * `hasConfirmedLocaleChoice()` never becomes true, so the detected language
     * re-applies on every load and the visitor is never actually remembered.
     *
     * Asserted inside the extracted `if (!confirmed)` block, not within a
     * character window of it: the component persists in two places — here and in
     * the sheet's own confirm handler — and a window wide enough to reach the
     * first-visit write also reached the other one, so removing this write left
     * the guard green.
     */
    // Two branches guard on `!confirmed` — applying the language, and recording
    // it. Take every one of them and require that recording happens in one.
    const branches = blocksAfterEach(chooser, 'if (!confirmed) {');
    assert.ok(branches.length > 0, 'expected a first-visit branch to exist');
    const recording = branches.filter((b) => /persistLocaleCountryPref\(\{/.test(b));
    assert.equal(
      recording.length,
      1,
      'exactly one first-visit branch must record the preference, or the visitor is never remembered'
    );
    assert.match(recording[0], /resolvePersistCountry\(\{/);
    // A confirmed choice must never be overwritten by a fresh guess.
    assert.match(chooser, /const confirmed = hasConfirmedLocaleChoice\(\)/);
  });

  it('is reachable from the gate, which had no language control of its own', () => {
    const gate = readFileSync(join(ROOT, 'app/private/PrivateTeaserClient.tsx'), 'utf8');
    assert.match(gate, /openLocaleChooser/, 'the gate must be able to open the sheet');
    assert.match(gate, /gateLanguageCta/, 'and must label the control');

    // The label has to be recognisable to someone who cannot read the current UI
    // language, so it carries more than one script.
    const label = GATE_EN.gateLanguageCta ?? '';
    assert.ok(label.length > 0, 'gateLanguageCta must exist in the English floor');
    assert.ok(
      /[\u4e00-\u9fff]/.test(label),
      `a monolingual English label is unreadable to the visitor who needs it: ${label}`
    );
  });

  it('gives the ungated entry surface the same door', () => {
    /*
     * `LocaleCountryControl` only ever reached `/bundle` and `/press`. With the
     * gate off, www is the landing page — so without this, removing the
     * self-opening sheet would have left `/` with no route to the other 39
     * languages, which is a regression dressed as a fix.
     */
    const landing = readFileSync(join(ROOT, 'src/page-components/LandingPage.tsx'), 'utf8');
    assert.match(landing, /openLocaleChooser/);
    assert.match(landing, /data-mw-locale-open/);

    // The colophon uses literal defaults rather than importing the gate pack;
    // pin the literal to the pack so the two cannot drift apart silently.
    const literal = landing.match(/gateLanguageCta',\s*\{\s*defaultValue:\s*'([^']+)'/)?.[1];
    assert.equal(
      literal,
      GATE_EN.gateLanguageCta,
      'the landing floor and the English pack must say the same thing'
    );
  });

  it('does not pull the 40-language sheet into the gate bundle', () => {
    /*
     * `.768` measured what needless first-paint JS costs. The gate imports only
     * the event name, so the overlay, the country catalogue and supportedRegions
     * stay out of the poster's bundle.
     */
    const gate = readFileSync(join(ROOT, 'app/private/PrivateTeaserClient.tsx'), 'utf8');
    assert.doesNotMatch(gate, /from '@\/components\/i18n\/LocaleCountryChooser'/);
    assert.match(gate, /from '@\/lib\/i18n\/localeChooserEvent'/);
  });
});
