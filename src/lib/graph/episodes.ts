/**
 * Development history → graph episodes.
 *
 * The corpus is this repo's own compaction exhaust. `LOG.md` keeps ≤15 entries
 * and rotates the rest to `docs/archive/log/` (513 files, 781 `##` sections as
 * of `.835`); `CONTEXT.md` `## Now` keeps ≤25 bullets. Both budgets are enforced
 * by tests, and both throw away the thing an agent most needs — why a guard
 * exists, which fix was tried and reverted, what a rotated defect class was. An
 * episode is one `##` section: a dated, titled, self-contained account of one
 * ship. That is already the unit the house style writes in, so nothing has to be
 * re-segmented.
 *
 * **Reference time is read, never derived.** The heading already carries a local
 * calendar date as written by a human on the day. Round-tripping it through
 * `new Date(...)` would reintroduce exactly the defect `time/localDate.ts` exists
 * to document — a bare `YYYY-MM-DD` parses as UTC midnight, so west of UTC the
 * episode lands on the previous day. The string is validated and passed through.
 */

import { isLocalDateKey } from '@/lib/time/localDate';

export type GraphEpisode = {
  /** Stable across re-ingest: same section → same id, so replays upsert. */
  id: string;
  /** Repo-relative path the episode was read from. */
  source: string;
  title: string;
  /** `YYYY-MM-DD`, as written in the heading. Never derived from a Date. */
  referenceTime: string;
  /** Build label without the dot (`834`), or null for undated-label entries. */
  label: string | null;
  body: string;
};

/**
 * `## 2026-08-15 — Builder arrange matches the pack (`.834`)`
 *
 * The separator is an em dash in current entries and a hyphen in some rotated
 * ones, so all three dash forms are accepted. Anchored to `^## ` so a `###`
 * sub-heading inside a body is never mistaken for a new episode.
 */
const HEADING_RE = /^##[ \t]+(\d{4}-\d{2}-\d{2})[ \t]*[—–-][ \t]*(.+?)[ \t]*$/;

/** ``(`.834`)`` → `834`. */
const LABEL_RE = /\(`\.(\d+)`\)/;

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'untitled'
  );
}

/**
 * Parse one markdown file into episodes.
 *
 * Sections whose heading is not a dated `##` are skipped rather than guessed at:
 * the archive files open with a `#` title and a prose preamble, and `LOG.md`
 * carries a rotation-rule block and a very long archive-link line before the
 * first entry. None of that is an episode, and inventing a date for it would put
 * a wrong timestamp on the temporal layer — the one thing the graph is for.
 */
export function parseLogEpisodes(source: string, markdown: string): GraphEpisode[] {
  const lines = markdown.split('\n');
  const episodes: GraphEpisode[] = [];
  const seen = new Set<string>();

  let current: { date: string; title: string; body: string[] } | null = null;

  const flush = (): void => {
    if (!current) return;
    const body = current.body.join('\n').trim();
    // An entry with a heading and no prose is a rotation stub, not knowledge.
    if (body) {
      const label = current.title.match(LABEL_RE)?.[1] ?? null;
      const base = `${source}#${label ?? slugify(current.title)}`;
      // Two sections can legitimately share a label across rotate files (the
      // archive index shows `.669` filed under three targets). Suffixing keeps
      // ids unique without dropping either episode.
      let id = base;
      let n = 2;
      while (seen.has(id)) id = `${base}~${n++}`;
      seen.add(id);
      episodes.push({
        id,
        source,
        title: current.title,
        referenceTime: current.date,
        label,
        body,
      });
    }
    current = null;
  };

  for (const line of lines) {
    const m = line.match(HEADING_RE);
    if (m) {
      flush();
      const [, date, title] = m as unknown as [string, string, string];
      // A malformed date is dropped, not defaulted. `2026-02-31` matches the
      // regex; a graph edge dated to a day that does not exist is worse than a
      // missing episode, because nothing downstream can tell it is wrong.
      if (isLocalDateKey(date)) current = { date, title, body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  flush();

  return episodes;
}

/** Rough token estimate (~4 chars/token). Budgeting only — never billing. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
