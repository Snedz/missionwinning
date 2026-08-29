/**
 * Hard-session not-care cite is house leftover — house-lede, not text-muted.
 * Stop / emergency / clinician stay. Confirm stays outline. Portals stay mw-house.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('Hard-session not-care cite is house leftover, not text-muted', () => {
  const sheet = read('src/components/workout/HardSessionWarningSheet.tsx');
  const needle = 'hardSessionNotCare';
  const start = sheet.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = sheet.slice(Math.max(0, start - 160), start + 80);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(sheet, /className="mw-house house-hard-session"/);
});

test('hard-session clinician stays text-muted (not this leftover)', () => {
  const sheet = read('src/components/workout/HardSessionWarningSheet.tsx');
  const clinicianStart = sheet.indexOf('hardSessionClinician');
  assert.ok(clinicianStart >= 0, 'missing hardSessionClinician');
  const clinician = sheet.slice(
    Math.max(0, clinicianStart - 160),
    clinicianStart + 80
  );
  assert.match(clinician, /text-sm text-muted-foreground leading-relaxed/);
});

test('hard-session confirm never house-btn-primary', () => {
  const sheet = read('src/components/workout/HardSessionWarningSheet.tsx');
  const continueStart = sheet.indexOf('hardSessionContinue');
  assert.ok(continueStart >= 0, 'missing hardSessionContinue');
  const cont = sheet.slice(Math.max(0, continueStart - 220), continueStart + 40);
  assert.doesNotMatch(cont, /house-btn-primary/);
  assert.match(cont, /house-btn min-h-\[52px\]/);
});

test('house leftover rule paints hard-session not-care cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-hard-session \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Hard-session not-care cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Hard-session not-care cite is house leftover/);
});

test('Finish / Skip / Swap / Form guide / Repeat last never house-btn-primary', () => {
  const finish = sliceFromTestId(
    read('src/components/workout/ActiveSessionChrome.tsx'),
    'active-finish'
  );
  assert.doesNotMatch(finish, /house-btn-primary/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  for (const id of [
    'active-skip-exercise',
    'active-swap-exercise',
    'active-form-guide',
    'active-repeat-last',
  ] as const) {
    const slice = sliceFromTestId(header, id);
    assert.doesNotMatch(slice, /house-btn-primary/, id);
  }
});
