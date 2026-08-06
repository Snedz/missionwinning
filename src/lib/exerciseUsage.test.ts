import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { templatesUsingExercise, type ExerciseUsageHit } from '@/lib/exerciseUsage';
import { PROGRAM_TEMPLATES } from '@/data/programTemplates';
import { FREE_STARTER_PROGRAMS } from '@/data/starterPrograms';

/**
 * `exerciseUsage` is a reverse index built once, at module load, off two static
 * catalogs. Nothing is injectable, so every expectation below is *derived from
 * the catalogs themselves* — never a hand-copied program name. A rename in
 * `starterPrograms.ts` or `programTemplates.ts` must not be able to leave this
 * file green while the index has gone wrong.
 */

/** Bigger than any plausible hit count — makes `templatesUsingExercise` return everything. */
const NO_LIMIT = Number.MAX_SAFE_INTEGER;

const key = (h: ExerciseUsageHit) => `${h.kind}::${h.name}`;

/** Every exercise id either catalog mentions — the domain the index is defined over. */
const ALL_IDS: string[] = [
  ...new Set([
    ...FREE_STARTER_PROGRAMS.flatMap((p) => p.exercises.map((e) => e.exerciseId)),
    ...PROGRAM_TEMPLATES.flatMap((t) => t.sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId))),
  ]),
].filter(Boolean);

describe('templatesUsingExercise — starter coverage', () => {
  it('resolves every free starter program, with kind "starter"', () => {
    assert.ok(FREE_STARTER_PROGRAMS.length > 0, 'catalog precondition: starters exist');

    for (const prog of FREE_STARTER_PROGRAMS) {
      assert.ok(prog.exercises.length > 0, `catalog precondition: ${prog.name} has exercises`);
      for (const ex of prog.exercises) {
        const hits = templatesUsingExercise(ex.exerciseId, NO_LIMIT);
        assert.ok(
          hits.some((h) => h.name === prog.name && h.kind === 'starter'),
          `${ex.exerciseId} should list starter "${prog.name}"`
        );
      }
    }
  });

  it('never emits a starter name that is not in the starter catalog', () => {
    const catalogNames = new Set(FREE_STARTER_PROGRAMS.map((p) => p.name));
    for (const id of ALL_IDS) {
      for (const hit of templatesUsingExercise(id, NO_LIMIT)) {
        if (hit.kind !== 'starter') continue;
        assert.ok(catalogNames.has(hit.name), `"${hit.name}" is tagged starter but is not one`);
      }
    }
  });
});

describe('templatesUsingExercise — template coverage and the pro filter', () => {
  it('emits exactly the non-pro templates, no more and no fewer', () => {
    const expected = new Set(
      PROGRAM_TEMPLATES.filter(
        (t) => t.category !== 'pro' && t.sessions.some((s) => s.exercises.some((e) => e.exerciseId))
      ).map((t) => t.name)
    );
    assert.ok(expected.size > 0, 'catalog precondition: free templates exist');

    const emitted = new Set<string>();
    for (const id of ALL_IDS) {
      for (const hit of templatesUsingExercise(id, NO_LIMIT)) {
        if (hit.kind === 'template') emitted.add(hit.name);
      }
    }

    // Soundness: nothing outside the free set leaks in (this is the `pro` guard).
    for (const name of emitted) {
      assert.ok(expected.has(name), `"${name}" was indexed but is not a free template`);
    }
    // Completeness: adding a template without it reaching the index fails here.
    for (const name of expected) {
      assert.ok(emitted.has(name), `free template "${name}" is missing from the index`);
    }
  });
});

describe('templatesUsingExercise — de-duplication', () => {
  it('lists a template once even when it programs the exercise in several sessions', () => {
    // Discovered, not hardcoded: find a free template that repeats an exercise id.
    let repeat: { name: string; exerciseId: string; occurrences: number } | null = null;
    for (const tmpl of PROGRAM_TEMPLATES) {
      if (tmpl.category === 'pro') continue;
      const counts = new Map<string, number>();
      for (const session of tmpl.sessions) {
        for (const ex of session.exercises) {
          if (ex.exerciseId) counts.set(ex.exerciseId, (counts.get(ex.exerciseId) ?? 0) + 1);
        }
      }
      for (const [exerciseId, occurrences] of counts) {
        if (occurrences > 1) {
          repeat = { name: tmpl.name, exerciseId, occurrences };
          break;
        }
      }
      if (repeat) break;
    }

    // Precondition, asserted rather than skipped past: without a repeat in the
    // catalog this case would prove nothing.
    assert.ok(repeat, 'catalog precondition: some free template repeats an exercise across sessions');
    assert.ok(repeat!.occurrences > 1);

    const matching = templatesUsingExercise(repeat!.exerciseId, NO_LIMIT).filter(
      (h) => h.kind === 'template' && h.name === repeat!.name
    );
    assert.equal(
      matching.length,
      1,
      `"${repeat!.name}" programs ${repeat!.exerciseId} ${repeat!.occurrences}× and must still appear once`
    );
  });

  it('returns no repeated name+kind pair for any indexed exercise', () => {
    for (const id of ALL_IDS) {
      const hits = templatesUsingExercise(id, NO_LIMIT);
      const keys = hits.map(key);
      assert.equal(new Set(keys).size, keys.length, `duplicate hit for ${id}: ${keys.join(' | ')}`);
    }
  });
});

describe('templatesUsingExercise — ordering, limit and misses', () => {
  it('orders free starters ahead of templates', () => {
    // An id used by both catalogs — derived, so a catalog reshuffle cannot fake it.
    const starterIds = new Set(FREE_STARTER_PROGRAMS.flatMap((p) => p.exercises.map((e) => e.exerciseId)));
    const shared = ALL_IDS.find((id) => {
      if (!starterIds.has(id)) return false;
      const hits = templatesUsingExercise(id, NO_LIMIT);
      return hits.some((h) => h.kind === 'starter') && hits.some((h) => h.kind === 'template');
    });
    assert.ok(shared, 'catalog precondition: some exercise appears in both a starter and a template');

    const kinds = templatesUsingExercise(shared!, NO_LIMIT).map((h) => h.kind);
    const firstTemplate = kinds.indexOf('template');
    assert.ok(firstTemplate >= 0);
    assert.ok(
      !kinds.slice(firstTemplate).includes('starter'),
      `starters must precede templates, got ${kinds.join(',')}`
    );
  });

  it('caps at 8 by default and honours an explicit limit as a prefix', () => {
    // The busiest exercise in the catalogs — guaranteed to exceed the default cap.
    const busiest = ALL_IDS.reduce((best, id) =>
      templatesUsingExercise(id, NO_LIMIT).length > templatesUsingExercise(best, NO_LIMIT).length ? id : best
    );
    const all = templatesUsingExercise(busiest, NO_LIMIT);
    assert.ok(all.length > 8, `catalog precondition: "${busiest}" needs >8 uses, has ${all.length}`);

    assert.equal(templatesUsingExercise(busiest).length, 8);
    assert.deepEqual(templatesUsingExercise(busiest), all.slice(0, 8));

    assert.deepEqual(templatesUsingExercise(busiest, 3), all.slice(0, 3));
    assert.deepEqual(templatesUsingExercise(busiest, 0), []);
  });

  it('returns an empty array for an id no catalog programs', () => {
    const unknown = 'definitely-not-a-real-exercise-id';
    assert.ok(!ALL_IDS.includes(unknown), 'precondition: the probe id really is absent');
    assert.deepEqual(templatesUsingExercise(unknown), []);

    // A quiet miss, not a shared mutable empty: callers must not be able to poison the index.
    const miss = templatesUsingExercise(unknown, NO_LIMIT);
    miss.push({ name: 'injected', kind: 'starter' });
    assert.deepEqual(templatesUsingExercise(unknown), []);
  });
});
