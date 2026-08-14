/**
 * P2-2 — PAR-Q / assessment risk is not a food row.
 *
 * The leak was `saveNutritionEntry({ name: \`Assessment: ${risk} risk\` })`.
 * Persist is `mw_last_assessment` only. Discover assessment-named writers
 * rather than listing two files — a new Assessment*.tsx that calls the
 * food writer is the same defect.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '../..');

function walkTs(dir: string, out: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkTs(p, out);
    else if (/\.(ts|tsx)$/.test(ent.name) && !ent.name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const srcFiles = walkTs(join(root, 'src'));

function rel(p: string): string {
  return relative(root, p).replaceAll('\\', '/');
}

test('assessment-named sources never call saveNutritionEntry', () => {
  const assess = srcFiles.filter((p) => /assess|parq/i.test(p));
  assert.ok(
    assess.some((p) => p.endsWith('AssessmentsPage.tsx')),
    'AssessmentsPage.tsx disappeared from the walk — the guard is blind'
  );
  assert.ok(
    assess.some((p) => p.endsWith('ProfileAssessmentCard.tsx')),
    'ProfileAssessmentCard.tsx disappeared from the walk — the guard is blind'
  );
  assert.ok(
    assess.some((p) => p.endsWith('parqIntake.ts')),
    'parqIntake.ts disappeared from the walk — the persist home is unguarded'
  );
  assert.ok(
    assess.some((p) => p.endsWith('ParqIntakeCard.tsx')),
    'ParqIntakeCard.tsx disappeared from the walk — the persist home is unguarded'
  );
  const leaks = assess.filter((p) => readFileSync(p, 'utf8').includes('saveNutritionEntry'));
  assert.deepEqual(
    leaks.map(rel),
    [],
    `assessment sources write food rows: ${leaks.map(rel).join(', ')}`
  );
});

test('no new Assessment: ${risk} food-row writer', () => {
  const leak = /Assessment:\s*\$\{/;
  const hits = srcFiles.filter((p) => leak.test(readFileSync(p, 'utf8')));
  assert.deepEqual(
    hits.map(rel),
    [],
    `PAR-Q risk interpolated into a food name: ${hits.map(rel).join(', ')}`
  );
});

test('PAR-Q persist is persistParqScreen — never nutrition_logs', () => {
  const page = readFileSync(join(root, 'src/page-components/AssessmentsPage.tsx'), 'utf8');
  const intake = readFileSync(join(root, 'src/lib/journey/parqIntake.ts'), 'utf8');
  const card = readFileSync(join(root, 'src/components/coach/ParqIntakeCard.tsx'), 'utf8');
  assert.match(page, /persistParqScreen/);
  assert.match(card, /persistParqScreen/);
  assert.match(intake, /STORAGE_KEYS\.lastAssessment/);
  assert.match(intake, /writeJson\(\s*STORAGE_KEYS\.lastAssessment/);
  assert.doesNotMatch(page, /saveNutritionEntry/);
  assert.doesNotMatch(card, /saveNutritionEntry/);
  assert.doesNotMatch(intake, /saveNutritionEntry/);
  assert.doesNotMatch(intake, /from\('nutrition_logs'\)/);
});
