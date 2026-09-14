import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  coachConceptLabel,
  deriveCoachConceptFromSession,
  formatVictoryNextEnvCite,
  isCoachConceptId,
} from '@/lib/coach/coachConcept';
import type { PlanSession } from '@/lib/coach/types';

function sess(
  partial: Partial<PlanSession> & Pick<PlanSession, 'kind' | 'focusGroups'>
): Pick<PlanSession, 'kind' | 'focusGroups' | 'name'> {
  return { name: 'Session', ...partial };
}

describe('coachConcept', () => {
  it('accepts known ids only', () => {
    assert.equal(isCoachConceptId('strength-push'), true);
    assert.equal(isCoachConceptId('nope'), false);
  });

  it('derives recovery / conditioning from kind', () => {
    assert.equal(
      deriveCoachConceptFromSession(sess({ kind: 'recovery', focusGroups: [] })),
      'recovery'
    );
    assert.equal(
      deriveCoachConceptFromSession(
        sess({ kind: 'conditioning', focusGroups: [] })
      ),
      'conditioning'
    );
  });

  it('derives push/pull/legs from focus or name', () => {
    assert.equal(
      deriveCoachConceptFromSession(
        sess({ kind: 'strength', focusGroups: ['Chest', 'Triceps'] })
      ),
      'strength-push'
    );
    assert.equal(
      deriveCoachConceptFromSession(
        sess({ kind: 'strength', focusGroups: ['Back'], name: 'Pull A' })
      ),
      'strength-pull'
    );
    assert.equal(
      deriveCoachConceptFromSession(
        sess({ kind: 'strength', focusGroups: ['Quads', 'Glutes'] })
      ),
      'strength-legs'
    );
  });

  it('formats Victory cite concept-first', () => {
    assert.equal(
      formatVictoryNextEnvCite('strength-legs'),
      'Next: Legs · updated from this workout'
    );
    assert.equal(
      formatVictoryNextEnvCite(null),
      'Next session updated from this workout'
    );
    assert.equal(coachConceptLabel('strength-push'), 'Push');
  });
});
