import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionWhyLine } from '@/lib/coach/sessionWhyLine';

describe('buildSessionWhyLine', () => {
  it('returns null when nothing true to say', () => {
    assert.equal(buildSessionWhyLine({}), null);
    assert.equal(buildSessionWhyLine({ kind: 'strength' }), null);
  });

  it('recovery kind is honest and non-shaming', () => {
    const line = buildSessionWhyLine({ kind: 'recovery', focusGroups: ['Core', 'Back'] });
    assert.ok(line);
    assert.match(line!.defaultValue, /Recovery/i);
    assert.ok(!/fail|missed|lazy|behind/i.test(line!.defaultValue));
  });

  it('strength with focus names the work', () => {
    const line = buildSessionWhyLine({
      kind: 'strength',
      focusGroups: ['Chest', 'Shoulders'],
    });
    assert.ok(line);
    assert.match(line!.defaultValue, /Chest/);
    assert.match(line!.defaultValue, /logs/i);
  });

  it('high load zone adds caution without prediction', () => {
    const line = buildSessionWhyLine({
      kind: 'strength',
      focusGroups: ['Legs'],
      loadZone: 'high',
    });
    assert.ok(line);
    assert.match(line!.defaultValue, /heavier|crisp|fatigue/i);
    assert.ok(!/will injure|guaranteed|must deload/i.test(line!.defaultValue));
  });

  it('conditioning has its own line', () => {
    const line = buildSessionWhyLine({ kind: 'conditioning' });
    assert.ok(line);
    assert.match(line!.defaultValue, /Conditioning/i);
  });
});
