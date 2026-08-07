import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { localizedChallengeDesc, localizedChallengeTitle } from '@/lib/challengeI18n';
import { CHALLENGES } from '@/lib/challenges';

type TCall = { key: string; defaultValue?: string };

function recordingT(translations: Record<string, string>, calls: TCall[]) {
  return (key: string, opts?: { defaultValue?: string }) => {
    calls.push({ key, defaultValue: opts?.defaultValue });
    return translations[key] ?? opts?.defaultValue ?? key;
  };
}

describe('challengeI18n', () => {
  it('every challenge in the catalog resolves a distinct title and desc key — never the raw id', () => {
    const calls: TCall[] = [];
    const t = recordingT({}, calls);
    const titleKeys = new Set<string>();
    for (const c of CHALLENGES) {
      localizedChallengeTitle(c.id, c.title, t);
      localizedChallengeDesc(c.id, c.description, t);
      const titleCall = calls[calls.length - 2];
      assert.ok(
        titleCall.key && titleCall.key !== c.id,
        `challenge '${c.id}' must map to an i18n key, not fall through to its id`
      );
      titleKeys.add(titleCall.key);
    }
    assert.equal(titleKeys.size, CHALLENGES.length, 'two challenges must never share a title key');
  });

  it('falls back to the catalog copy when no translation exists', () => {
    const c = CHALLENGES[0];
    const t = recordingT({}, []);
    assert.equal(localizedChallengeTitle(c.id, c.title, t), c.title);
    assert.equal(localizedChallengeDesc(c.id, c.description, t), c.description);
  });

  it('uses the translation when the pack has one', () => {
    const c = CHALLENGES[0];
    const calls: TCall[] = [];
    const probe = recordingT({}, calls);
    localizedChallengeTitle(c.id, c.title, probe);
    const key = calls[0].key;
    const t = recordingT({ [key]: 'übersetzt' }, []);
    assert.equal(localizedChallengeTitle(c.id, c.title, t), 'übersetzt');
  });
});
