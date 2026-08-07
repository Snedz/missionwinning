import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { templatesUsingExercise } from '@/lib/exerciseUsage';
import { PROGRAM_TEMPLATES } from '@/data/programTemplates';
import { FREE_STARTER_PROGRAMS } from '@/data/starterPrograms';

// Discover ids from the catalogs rather than naming one — a renamed starter
// exercise must not silently turn this suite into a no-op.
const starterIds = FREE_STARTER_PROGRAMS.flatMap((p) => p.exercises.map((e) => e.exerciseId));
const allCatalogIds = new Set<string>([
  ...starterIds,
  ...PROGRAM_TEMPLATES.flatMap((tmpl) =>
    tmpl.sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId).filter(Boolean) as string[])
  ),
]);

describe('exerciseUsage', () => {
  it('catalogs are non-empty — otherwise every assertion below runs on nothing', () => {
    assert.ok(starterIds.length > 0);
    assert.ok(allCatalogIds.size > 0);
  });

  it('a starter-program exercise is found with kind starter and its program name', () => {
    const id = starterIds[0];
    const hits = templatesUsingExercise(id);
    assert.ok(hits.length > 0, `expected usage hits for starter exercise '${id}'`);
    const starterHit = hits.find((h) => h.kind === 'starter');
    assert.ok(starterHit, 'starter program must appear among the hits');
    assert.ok(
      FREE_STARTER_PROGRAMS.some((p) => p.name === starterHit?.name),
      'hit name must be a real starter program name'
    );
  });

  it('unknown exercise → empty list, never undefined', () => {
    assert.deepEqual(templatesUsingExercise('no-such-exercise-id'), []);
  });

  it('limit caps the list', () => {
    const id = starterIds[0];
    assert.ok(templatesUsingExercise(id, 1).length <= 1);
  });

  it('no duplicate name+kind pairs for any catalog exercise', () => {
    for (const id of allCatalogIds) {
      const hits = templatesUsingExercise(id, 100);
      const seen = new Set(hits.map((h) => `${h.kind}:${h.name}`));
      assert.equal(seen.size, hits.length, `duplicates for '${id}'`);
    }
  });

  it('pro-category templates never leak into free usage hits', () => {
    const proNames = new Set(
      PROGRAM_TEMPLATES.filter((tmpl) => tmpl.category === 'pro').map((tmpl) => tmpl.name)
    );
    for (const id of allCatalogIds) {
      for (const hit of templatesUsingExercise(id, 100)) {
        assert.ok(
          !(hit.kind === 'template' && proNames.has(hit.name)),
          `pro template '${hit.name}' leaked into usage for '${id}'`
        );
      }
    }
  });
});
