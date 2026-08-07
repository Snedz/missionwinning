import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Builder/leaderboard/assessments drop accent wash fills', () => {
  for (const rel of [
    'src/page-components/BuilderPage.tsx',
    'src/page-components/LeaderboardPage.tsx',
    'src/page-components/AssessmentsPage.tsx',
    'src/page-components/BenchmarksPage.tsx',
    'src/components/builder/ProgramTemplatesPanel.tsx',
    'src/components/today/StreakChip.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.doesNotMatch(src, /bg-accent-100/, rel);
  }
});

test('PFT and guidebook CTAs drop arrow flourish', () => {
  const pft = readFileSync(
    join(root, 'src/components/fitness-test/PresidentialFitnessSection.tsx'),
    'utf8'
  );
  assert.doesNotMatch(pft, /→/);
  const guide = readFileSync(
    join(root, 'src/page-components/GuidebookChapterPage.tsx'),
    'utf8'
  );
  assert.doesNotMatch(guide, /→/);
  assert.match(guide, /Next chapter/);
});
