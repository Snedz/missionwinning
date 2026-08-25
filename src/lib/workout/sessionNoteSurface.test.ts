/**
 * Session notes stay on Train / the close receipt. Today and the door stay clean.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(tsx|ts)$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const NOTE_LEAK = /sessionNote|SessionJotField|setHistorySessionNote/;
const PREMIUM = /from ['"]@\/lib\/(premium|trial|bundle)/;

const FORBIDDEN_SURFACES = [
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/LandingPage.tsx',
  'src/lib/gatedWwwHonesty.ts',
  'src/lib/todayPrimaryAction.ts',
  'app/private/GateTeaser.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
];

describe('session notes surface lock', () => {
  it('Today / door do not import session notes', () => {
    for (const file of FORBIDDEN_SURFACES) {
      const src = read(file);
      assert.doesNotMatch(src, NOTE_LEAK, `${file} must not carry session notes`);
    }
  });

  it('Today tree does not mount a notes field', () => {
    const todayFiles = walk(path.join(root, 'src/components/today')).concat(
      walk(path.join(root, 'src/lib/today'))
    );
    const offenders = todayFiles.filter((f) => NOTE_LEAK.test(read(f)));
    assert.deepEqual(offenders, [], `Today leaked session notes: ${offenders.join(', ')}`);
  });

  it('Today lean still one Start; jot stays off Active first paint', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    const open = page.slice(page.indexOf('<ActiveSessionChrome'), page.indexOf('<details'));
    assert.doesNotMatch(open, /<SessionJotField\b/, 'jot is on Active first paint');
    assert.match(page, /<SessionJotField\b/);
  });

  it('receipt first paint has the notes field; it is not a red Start', () => {
    const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
    const jsx = sheet.slice(sheet.indexOf('return ('));
    const open = jsx.split('<details')[0];
    assert.match(open, /<SessionJotField\b/, 'notes belong on the close receipt, not Show all');
    assert.doesNotMatch(open, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(sheet, /discord\.com|WeChat|marketplace|four-scene/i);
    assert.doesNotMatch(sheet, PREMIUM);
  });

  it('jot + helper stay free; no Feed / likes / public URL', () => {
    const field = read('src/components/workout/SessionJotField.tsx');
    assert.match(field, /data-testid="session-notes"/);
    assert.match(field, /maxLength=\{SESSION_NOTE_MAX\}/);
    assert.doesNotMatch(field, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(field, PREMIUM);
    assert.doesNotMatch(field, /discord\.com|likes|https?:\/\//i);
    assert.doesNotMatch(field, /href=["']\/workout\//);
    const helper = read('src/lib/workout/sessionNote.ts');
    assert.doesNotMatch(helper, /https?:\/\//);
  });
});
