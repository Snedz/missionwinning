import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PREMIUM_TRACK_PROGRAM_DATA } from '@/data/premiumTrackProgramData';
import { PREMIUM_TRACK_PROGRAM_COUNT } from '@/lib/trackPremiumMeta';

describe('premiumTrackPrograms (Phase I3)', () => {
  it('defines at least 4 premium programs', () => {
    assert.ok(PREMIUM_TRACK_PROGRAM_DATA.length >= 4);
  });

  it('count matches meta constant for locked teaser', () => {
    assert.equal(PREMIUM_TRACK_PROGRAM_DATA.length, PREMIUM_TRACK_PROGRAM_COUNT);
  });

  it('each program has unique id and loggable sessions', () => {
    const ids = new Set<string>();
    for (const program of PREMIUM_TRACK_PROGRAM_DATA) {
      assert.ok(program.id.length > 0);
      assert.ok(!ids.has(program.id), `duplicate id ${program.id}`);
      ids.add(program.id);
      assert.ok(program.sessions.length >= 2, `${program.id} needs sessions`);
      for (const s of program.sessions) {
        assert.ok(s.title.length > 0);
        assert.ok(s.durationMin > 0);
        assert.ok(['walk', 'run', 'bike', 'hike', 'swim', 'other'].includes(s.type));
      }
    }
  });
});
