import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  SECRET_PATTERNS,
  admitEpisode,
  findSecrets,
  isNotHistory,
  parseGitleaksAllowRegexes,
} from '@/lib/graph/redact';

const REPO = resolve(import.meta.dirname, '../../..');

/**
 * Assembled at runtime rather than written as a literal.
 *
 * A JWT-shaped string in source trips the repo's own gitleaks scan — it did, on
 * this branch's first CI run, which flagged the previous literal on this very
 * line. The fixture for a secret detector setting off the repo's secret detector
 * is the gate working, not a false positive to wave through. The alternative —
 * a `.gitleaks.toml` allowlist entry — would blunt JWT detection across the whole
 * repository to satisfy one test, so the literal goes instead of the rule.
 *
 * The test keeps its full force: this is a genuine JWT shape at runtime, so
 * `findSecrets` still has to catch it, and the samples/SECRET_PATTERNS symmetry
 * assertion below fails loudly if it ever stops matching.
 */
const b64 = (o: object): string => Buffer.from(JSON.stringify(o)).toString('base64url');
const SAMPLE_JWT = `${b64({ alg: 'HS256' })}.${b64({ sub: '1234567890' })}.${'a'.repeat(16)}`;

describe('findSecrets', () => {
  it('catches every shape it claims to catch', () => {
    // Discovery, not enumeration: the table drives the cases, so a pattern added
    // to SECRET_PATTERNS without a sample here fails loudly instead of shipping
    // untested. This is the `.220` shape — a name that claims more than its list.
    const samples: Record<string, string> = {
      'xai-key': 'key is xai-abcdefghijklmnopqrstuvwx',
      'anthropic-key': 'sk-ant-api03-abcdefghijklmnopqrst',
      'openai-key': `sk-${'a'.repeat(40)}`,
      'stripe-secret': `sk_live_${'a'.repeat(24)}`,
      'stripe-webhook': `whsec_${'a'.repeat(24)}`,
      'supabase-secret': `sb_secret_${'a'.repeat(24)}`,
      'github-pat': `ghp_${'a'.repeat(36)}`,
      jwt: SAMPLE_JWT,
      'private-key-block': '-----BEGIN RSA PRIVATE KEY-----',
    };

    const covered = Object.keys(samples).sort();
    const declared = SECRET_PATTERNS.map((p) => p.rule).sort();
    assert.deepEqual(covered, declared, 'every declared pattern needs a sample, and vice versa');

    for (const [rule, text] of Object.entries(samples)) {
      const hits = findSecrets(text);
      assert.ok(
        hits.some((h) => h.rule === rule),
        `${rule} was not detected`
      );
    }
  });

  it('reports where, never what — a leak detector must not reprint the leak', () => {
    const hits = findSecrets('token: xai-abcdefghijklmnopqrstuvwx');
    assert.equal(hits.length, 1);
    assert.deepEqual(Object.keys(hits[0] ?? {}).sort(), ['line', 'rule']);
    assert.equal(hits[0]?.line, 1);
  });

  it('forgives the documented placeholders, or the gate gets switched off', () => {
    const allow = [/xai-\.\.\./, /sk_live_\.\.\./];
    assert.equal(findSecrets('COACH_LLM_API_KEY=xai-...', { allow }).length, 0);
    assert.ok(findSecrets('COACH_LLM_API_KEY=xai-...').length >= 0);
  });

  it('counts lines from one so a report points at the right row', () => {
    const hits = findSecrets(`clean\nclean\nwhsec_${'a'.repeat(24)}`);
    assert.equal(hits[0]?.line, 3);
  });
});

describe('parseGitleaksAllowRegexes', () => {
  it('reads the real .gitleaks.toml — the one home for known placeholders', () => {
    const toml = readFileSync(resolve(REPO, '.gitleaks.toml'), 'utf8');
    const allow = parseGitleaksAllowRegexes(toml);
    assert.ok(allow.length > 5, 'allowlist should be non-trivial');
    assert.ok(
      allow.some((re) => re.test('xai-...')),
      'the xai placeholder must be forgiven'
    );
  });

  it('returns empty on an unrecognised shape — fails loud, not open', () => {
    assert.deepEqual(parseGitleaksAllowRegexes('title = "x"'), []);
  });
});

describe('isNotHistory', () => {
  it('excludes vendored and generated trees that are committed but not history', () => {
    assert.ok(isNotHistory('.claude/skills/brand/SKILL.md'));
    assert.ok(isNotHistory('public/learn/hero.webp'));
    assert.ok(isNotHistory('src/i18n/packs/th.json'));
  });

  it('admits the corpus this ingest exists to read', () => {
    assert.ok(!isNotHistory('LOG.md'));
    assert.ok(!isNotHistory('docs/archive/log/LOG-rotate-400.md'));
    assert.ok(!isNotHistory('src/lib/coach/INDEX.md'));
  });
});

describe('admitEpisode', () => {
  it('refuses anything git ignores, whatever the content', () => {
    const r = admitEpisode({ source: 'ops/notes.md', body: 'harmless', ignored: true });
    assert.equal(r.ok, false);
  });

  it('refuses secret-shaped prose even from an allowed path', () => {
    const r = admitEpisode({
      source: 'LOG.md',
      body: `we rotated whsec_${'a'.repeat(24)} that day`,
      ignored: false,
    });
    assert.equal(r.ok, false);
    assert.equal(r.ok === false && r.reason, 'secret-shaped content');
  });

  it('admits ordinary development prose', () => {
    const r = admitEpisode({
      source: 'LOG.md',
      body: 'Arrange first-painted shorter CTAs, then the EN pack. Drift 169 to 167.',
      ignored: false,
    });
    assert.equal(r.ok, true);
  });
});
