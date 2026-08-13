import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { escapeHtml } from './escapeHtml.ts';

const root = path.join(import.meta.dirname, '..', '..');

describe('escapeHtml', () => {
  it('escapes markup delimiters in user text', () => {
    assert.equal(escapeHtml('sets & reps < 5'), 'sets &amp; reps &lt; 5');
    assert.equal(escapeHtml('he said "go"'), 'he said &quot;go&quot;');
  });
});

const NOTE_RENDER_GLOBS = [
  'src/components/history/JournalTimeline.tsx',
  'src/components/workout/SessionDebriefCard.tsx',
  'src/components/profile/ProfileAssessmentCard.tsx',
  'src/page-components/AssessmentsPage.tsx',
  'src/page-components/TrackPage.tsx',
  'src/page-components/BuilderPage.tsx',
  'src/components/builder/BuilderArrangeStep.tsx',
];

describe('logger notes stay text-escaped', () => {
  it('note surfaces do not use dangerouslySetInnerHTML', () => {
    for (const rel of NOTE_RENDER_GLOBS) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      assert.doesNotMatch(
        src,
        /dangerouslySetInnerHTML/,
        `${rel} must render notes as text children so React escapes them`
      );
    }
  });

  it('the HTML-string sink uses the shared escaper', () => {
    const report = readFileSync(path.join(root, 'src/lib/schoolClassReportHtml.ts'), 'utf8');
    assert.match(report, /from '@\/lib\/escapeHtml'/);
    assert.doesNotMatch(report, /function escapeHtml/);
  });

  it('the note-surface list is closed — a new TSX under those folders is reviewed', () => {
    const listed = new Set(NOTE_RENDER_GLOBS.map((p) => path.normalize(p)));
    const extraDirs = [
      'src/components/history',
      'src/components/workout',
      'src/components/builder',
    ];
    const unexpected: string[] = [];
    for (const dir of extraDirs) {
      const abs = path.join(root, dir);
      for (const name of readdirSync(abs)) {
        if (!name.endsWith('.tsx')) continue;
        const rel = path.normalize(`${dir}/${name}`);
        if (listed.has(rel)) continue;
        const src = readFileSync(path.join(root, rel), 'utf8');
        if (/dangerouslySetInnerHTML/.test(src) && /\bnotes?\b/i.test(src)) {
          unexpected.push(rel);
        }
      }
    }
    assert.deepEqual(
      unexpected,
      [],
      'a new note HTML sink must be added to NOTE_RENDER_GLOBS and must not use innerHTML'
    );
  });
});
