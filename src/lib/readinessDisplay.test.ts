/**
 * The focus line the athlete reads first, and the fallbacks under it.
 *
 * "Chest focus — Prime for growth" is the one sentence on the Today header that
 * explains *why* today's session is what it is. It is assembled from three
 * translations, and each has its own miss: the muscle group key, the status key,
 * and the sentence template that joins them.
 *
 * The failure this guards is the one i18next makes easy — a missing key
 * resolving to the **raw key name**, so the header reads
 * "muscleChest focus — todayReadinessPrime". Every call site therefore passes
 * a `defaultValue`, and these tests prove it by running the functions through a
 * `t` that resolves nothing, which is exactly what a locale with no pack entry
 * does.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRecommendedFocusLine,
  muscleGroupLabel,
  translateCoachInsightLine,
} from '@/lib/readinessDisplay';
import {
  MUSCLE_GROUP_I18N,
  type MuscleGroup,
  type ReadinessStatusKey,
} from '@/lib/muscleGroups';
import type { RecommendedFocus } from '@/lib/score';

const GROUPS = Object.keys(MUSCLE_GROUP_I18N) as MuscleGroup[];

/** A `t` that finds nothing — the untranslated-locale path. */
const missing = (_key: string, opts?: Record<string, unknown>) =>
  (opts?.defaultValue as string) ?? _key;

/** A `t` that resolves from a pack, so interpolation can be observed. */
const from = (pack: Record<string, string>) => (key: string, opts?: Record<string, unknown>) => {
  const hit = pack[key];
  if (hit === undefined) return (opts?.defaultValue as string) ?? key;
  return hit.replace(/\{\{(\w+)\}\}/g, (_m, name) => String(opts?.[name] ?? ''));
};

/** A real status key from the union — an invented one would not typecheck. */
const STATUS: ReadinessStatusKey = 'todayReadinessPrime';

const focusFor = (group: MuscleGroup): RecommendedFocus =>
  ({ group, statusKey: STATUS }) as RecommendedFocus;

describe('muscleGroupLabel', () => {
  it('every muscle group has a key and falls back to the group name, never a raw key', () => {
    assert.ok(GROUPS.length >= 4, `only ${GROUPS.length} muscle groups discovered`);
    for (const group of GROUPS) {
      const key = MUSCLE_GROUP_I18N[group];
      assert.ok(key && key.trim().length > 0, `${group}: no i18n key`);

      const label = muscleGroupLabel(group, missing);
      assert.equal(label, group, `${group}: must fall back to the group name`);
      assert.notEqual(label, key, `${group}: rendered the raw i18n key`);
    }
  });

  it('prefers the translation when the pack carries one', () => {
    const group = GROUPS[0];
    const t = from({ [MUSCLE_GROUP_I18N[group]]: 'Pecho' });
    assert.equal(muscleGroupLabel(group, t), 'Pecho');
  });
});

describe('formatRecommendedFocusLine', () => {
  it('reads as a sentence with an empty pack — no raw keys anywhere', () => {
    for (const group of GROUPS) {
      const line = formatRecommendedFocusLine(focusFor(group), missing);
      assert.ok(line.includes(group), `${group}: the group is missing from "${line}"`);
      assert.ok(
        !line.includes(MUSCLE_GROUP_I18N[group]),
        `${group}: leaked the muscle i18n key into "${line}"`
      );
      assert.ok(
        !line.includes('todayRecommendedFocusLine'),
        `${group}: leaked the template key into "${line}"`
      );
    }
  });

  it('interpolates the translated group and status into the translated template', () => {
    const group = GROUPS[0];
    const t = from({
      [MUSCLE_GROUP_I18N[group]]: 'Pecho',
      [STATUS]: 'Listo para crecer',
      todayRecommendedFocusLine: 'Enfoque {{group}} — {{status}}',
    });
    assert.equal(formatRecommendedFocusLine(focusFor(group), t), 'Enfoque Pecho — Listo para crecer');
  });

  it('still resolves the group when only the template is translated', () => {
    // The partial-pack case is the common one: a locale translates the sentence
    // shell long before it translates every muscle name.
    const group = GROUPS[0];
    const t = from({ todayRecommendedFocusLine: '{{group}} · {{status}}' });
    const line = formatRecommendedFocusLine(focusFor(group), t);
    // Group falls back to its own name; status uses the English catalog, never
    // the raw key (bootstrap / missing-pack path).
    assert.equal(line, `${group} · Prime for growth`);
  });

  it('never paints a raw status key when the pack is empty', () => {
    const focus = focusFor(GROUPS[0]);
    const line = formatRecommendedFocusLine(focus, missing);
    assert.ok(
      !line.includes(focus.statusKey),
      `leaked status key into "${line}"`
    );
    assert.ok(
      line.includes('Prime for growth'),
      `expected English catalog status in "${line}"`
    );
  });
});

describe('translateCoachInsightLine', () => {
  it('interpolates focusLine and never returns the message key as the athlete copy', () => {
    const insight = {
      messageKey: 'coachInsightSteady',
      messageParams: { focusGroup: 'Chest', focusStatusKey: 'todayReadinessPrime' },
      actionLabelKey: 'coachActionViewToday',
      actionPath: '/log',
    };
    const line = translateCoachInsightLine(insight, focusFor(GROUPS[0]), missing);
    assert.ok(!line.includes('coachInsightSteady'), `raw key in "${line}"`);
    assert.ok(!line.includes('todayReadinessPrime'), `raw status in "${line}"`);
    assert.ok(line.includes('Prime for growth'), `missing focus in "${line}"`);
    assert.ok(/Steady progress/i.test(line), `missing steady copy in "${line}"`);
  });
});
