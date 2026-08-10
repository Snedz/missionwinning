import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COACH_VOICE_DEFAULTS, coachVoiceLine } from './coachVoiceDefaults.ts';
import { planVoiceFromRules } from './planVoiceServer.ts';

const root = join(import.meta.dirname, '..', '..', '..');

describe('coachVoiceDefaults', () => {
  it('covers every rules key planVoiceFromRules can emit', () => {
    const base = {
      plan: {
        weekStart: '2026-08-10',
        sessions: [
          { name: 'Push', kind: 'strength', whyKeys: ['coachWhyLoadUp'] as string[] },
          { name: 'Pull', kind: 'strength', whyKeys: ['coachWhyHold'] },
          { name: 'Legs', kind: 'strength', whyKeys: ['coachWhyHold'] },
          { name: 'Upper', kind: 'strength', whyKeys: ['coachWhyHold'] },
        ],
      },
      readiness: 70,
      strain: 40,
      recovery: 60,
    };

    const cases = [
      // 2 strength sessions, healthy metrics → default
      planVoiceFromRules({
        ...base,
        plan: { ...base.plan, sessions: base.plan.sessions.slice(0, 2) },
      }),
      planVoiceFromRules(base), // 4 strength → high volume
      planVoiceFromRules({ ...base, strain: 80 }),
      planVoiceFromRules({ ...base, readiness: 30 }),
      planVoiceFromRules({
        ...base,
        plan: {
          ...base.plan,
          sessions: [
            {
              name: 'Mobility',
              kind: 'recovery',
              whyKeys: ['coachWhyRecovery'],
            },
          ],
        },
      }),
      planVoiceFromRules({
        ...base,
        plan: {
          ...base.plan,
          sessions: base.plan.sessions.map((s) => ({
            ...s,
            whyKeys: ['coachWhyDeload'],
          })),
        },
      }),
    ];

    const seen = new Set<string>();
    for (const out of cases) {
      assert.equal(out.source, 'rules');
      assert.ok(
        COACH_VOICE_DEFAULTS[out.message],
        `rules voice key "${out.message}" has no English floor`
      );
      seen.add(out.message);
    }
    for (const key of Object.keys(COACH_VOICE_DEFAULTS)) {
      assert.ok(seen.has(key), `catalog floor "${key}" never emitted by rules engine`);
    }
  });

  it('never returns a bare catalogued key when the pack is empty', () => {
    const missing = (k: string, o?: Record<string, unknown>) =>
      (o?.defaultValue as string) ?? k;
    for (const [key, floor] of Object.entries(COACH_VOICE_DEFAULTS)) {
      const line = coachVoiceLine(key, missing);
      assert.equal(line, floor);
      assert.notEqual(line, key);
    }
  });

  it('CoachVoiceCard uses coachVoiceLine not defaultValue: voice.message', () => {
    const src = readFileSync(
      join(root, 'src/components/coach/CoachVoiceCard.tsx'),
      'utf8'
    );
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.match(src, /coachVoiceLine/);
    assert.doesNotMatch(code, /defaultValue:\s*voice\.message/);
  });
});
