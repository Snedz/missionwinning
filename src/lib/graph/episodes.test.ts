import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseLogEpisodes, estimateTokens } from '@/lib/graph/episodes';

/**
 * No date literals in fixtures beyond the ones under test.
 *
 * The dates here are *the subject* of the assertions (a heading date is what the
 * parser reads), not an ambient "today" that expires. The rule the repo enforces
 * is against fixtures that quietly rot as the clock moves; a fixed heading in a
 * markdown sample is a constant, like a fixed exercise id.
 */
const LOG = `# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries here.

Archive: [older](docs/archive/log/LOG-old.md).

## 2026-08-15 — Builder arrange matches the pack (\`.834\`)

Arrange first-painted shorter CTAs, then the EN pack.

### Detail
Drift 169 → 167.

## 2026-08-14 — Coach insight matches the pack (\`.833\`)

Title + desc matched.

## 2026-08-13 — Rotation stub (\`.832\`)
`;

describe('parseLogEpisodes', () => {
  it('reads one episode per dated ## section', () => {
    const eps = parseLogEpisodes('LOG.md', LOG);
    assert.deepEqual(
      eps.map((e) => e.label),
      ['834', '833']
    );
  });

  it('takes reference_time from the heading verbatim — never through a Date', () => {
    const [first] = parseLogEpisodes('LOG.md', LOG);
    assert.equal(first?.referenceTime, '2026-08-15');
  });

  it('keeps ### sub-headings inside the body instead of starting a new episode', () => {
    const [first] = parseLogEpisodes('LOG.md', LOG);
    assert.match(first?.body ?? '', /### Detail/);
    assert.match(first?.body ?? '', /Drift 169/);
  });

  it('ignores the preamble — a rotation rule is not a dated ship', () => {
    const eps = parseLogEpisodes('LOG.md', LOG);
    assert.ok(!eps.some((e) => /Rotation rule/.test(e.body)));
    assert.ok(!eps.some((e) => /Chronological record/.test(e.body)));
  });

  it('drops a heading with no prose — a stub carries no knowledge', () => {
    const eps = parseLogEpisodes('LOG.md', LOG);
    assert.ok(!eps.some((e) => e.label === '832'));
  });

  it('rejects an impossible calendar date rather than defaulting it', () => {
    const eps = parseLogEpisodes('LOG.md', '## 2026-02-31 — Not a day (`.900`)\n\nBody.\n');
    assert.equal(eps.length, 0);
  });

  it('accepts the hyphen separator used by some rotated archive files', () => {
    const eps = parseLogEpisodes('a.md', '## 2026-07-20 - Wave 10\n\nBeta engine.\n');
    assert.equal(eps.length, 1);
    assert.equal(eps[0]?.title, 'Wave 10');
  });

  it('ids are stable across reparse and unique when a label repeats', () => {
    const once = parseLogEpisodes('LOG.md', LOG).map((e) => e.id);
    const twice = parseLogEpisodes('LOG.md', LOG).map((e) => e.id);
    assert.deepEqual(once, twice, 're-ingest must upsert, not duplicate');

    const dup = `## 2026-08-01 — A (\`.669\`)\n\nOne.\n\n## 2026-08-02 — B (\`.669\`)\n\nTwo.\n`;
    const ids = parseLogEpisodes('r.md', dup).map((e) => e.id);
    assert.equal(new Set(ids).size, 2, 'a repeated label must not collapse two episodes');
  });

  it('falls back to a title slug when an entry carries no build label', () => {
    const eps = parseLogEpisodes('a.md', '## 2026-07-20 — Wave 10 beta engine\n\nBody.\n');
    assert.equal(eps[0]?.label, null);
    assert.equal(eps[0]?.id, 'a.md#wave-10-beta-engine');
  });
});

describe('estimateTokens', () => {
  it('is conservative — never reports fewer tokens than 4 chars each implies', () => {
    assert.equal(estimateTokens('a'.repeat(2048)), 512);
    assert.equal(estimateTokens('a'.repeat(2049)), 513);
  });
});
