import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyProgressPhrase,
  isHonestProgressCopy,
} from './noFakeProgressPhrases.ts';

describe('classifyProgressPhrase', () => {
  it('empty → refused empty', () => {
    const v = classifyProgressPhrase('');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'empty');
  });

  it('whitespace only → refused empty', () => {
    const v = classifyProgressPhrase('   ');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'empty');
  });

  it('Logged 3 working sets → allowed', () => {
    const v = classifyProgressPhrase('Logged 3 working sets');
    assert.equal(v.kind, 'allowed');
    assert.equal(v.reason, 'evidence-backed');
  });

  it('About 10% stronger (estimate) → estimate', () => {
    const v = classifyProgressPhrase('About 10% stronger (estimate)');
    assert.equal(v.kind, 'estimate');
    assert.equal(v.reason, 'labeled estimate');
  });

  it('est. in parens → estimate', () => {
    const v = classifyProgressPhrase('gains est. at 5lbs');
    assert.equal(v.kind, 'estimate');
    assert.equal(v.reason, 'labeled estimate');
  });

  it('Guaranteed PR this week → refused invented traction', () => {
    const v = classifyProgressPhrase('Guaranteed PR this week');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('viral growth → refused invented traction', () => {
    const v = classifyProgressPhrase('viral growth');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('exploding user base → refused invented traction', () => {
    const v = classifyProgressPhrase('exploding user base');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('undisputed pr claim → refused invented traction', () => {
    const v = classifyProgressPhrase('undisputed pr in lifting');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('fake pr → refused invented traction', () => {
    const v = classifyProgressPhrase('fake pr');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('invented streak → refused invented traction', () => {
    const v = classifyProgressPhrase('invented streak');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('Next session targets from plan → refused plan text as result', () => {
    const v = classifyProgressPhrase('Next session targets from plan');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'plan text as result');
  });

  it('#1 lifter in the gym without logged → refused invented traction', () => {
    const v = classifyProgressPhrase('#1 lifter in the gym');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('number one without logged → refused invented traction', () => {
    const v = classifyProgressPhrase('number one lift this month');
    assert.equal(v.kind, 'refused');
    assert.equal(v.reason, 'invented traction');
  });

  it('#1 from logs this month → allowed', () => {
    const v = classifyProgressPhrase('#1 from logs this month');
    assert.equal(v.kind, 'allowed');
    assert.equal(v.reason, 'evidence-backed');
  });

  it('number one from logs → allowed', () => {
    const v = classifyProgressPhrase('number one from logs');
    assert.equal(v.kind, 'allowed');
    assert.equal(v.reason, 'evidence-backed');
  });

  it('from logs alone → allowed', () => {
    const v = classifyProgressPhrase('from logs');
    assert.equal(v.kind, 'allowed');
    assert.equal(v.reason, 'evidence-backed');
  });

  it('completed sets today → allowed', () => {
    const v = classifyProgressPhrase('completed sets today');
    assert.equal(v.kind, 'allowed');
    assert.equal(v.reason, 'evidence-backed');
  });

  it('session receipt attached → allowed', () => {
    const v = classifyProgressPhrase('session receipt available');
    assert.equal(v.kind, 'allowed');
    assert.equal(v.reason, 'evidence-backed');
  });

  it('case insensitive evidence keywords', () => {
    const v = classifyProgressPhrase('LOGGED 5 REPS');
    assert.equal(v.kind, 'allowed');
  });
});

describe('isHonestProgressCopy', () => {
  it('true for allowed', () => {
    assert.equal(isHonestProgressCopy('Logged 3 working sets'), true);
  });

  it('true for estimate', () => {
    assert.equal(isHonestProgressCopy('About 10% stronger (estimate)'), true);
  });

  it('false for refused', () => {
    assert.equal(isHonestProgressCopy('Guaranteed PR'), false);
  });

  it('false for empty', () => {
    assert.equal(isHonestProgressCopy(''), false);
  });
});
