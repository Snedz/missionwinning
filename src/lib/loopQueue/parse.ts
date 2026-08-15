/**
 * Reading the queue in `docs/GRAPH_LOOP.md` as a **shape**.
 *
 * The queue is the baton. Every spawn has to answer one question from it — which
 * row is live — and until now that answer came from a human eye, or from a grep.
 * A grep does not survive contact with this file: `grep '`open`'` over
 * `docs/GRAPH_LOOP.md` returns thirteen hits, nine of which are prose, and three
 * of the remaining table rows are **`done`** rows whose *Moves* text happens to
 * contain the word — `D1` ("open beta"), `K2` ("when the beta opens"), `N1`
 * ("open / private beta"). A router keyed to that spelling reports the wrong
 * ticket on a file nobody edited wrongly. That is `.220`, and it is why nothing
 * below matches text where it can match structure.
 *
 * So: parse tables, not lines.
 *
 * 1. Only the `## Queue` region is read. The file also carries `## Research` and
 *    a per-loop dossier below it, both full of tables that are not the queue.
 * 2. Inside it, a table is a **queue table** only if its header row is exactly
 *    `# | Loop | Moves | Status`. Cells are then addressed by header name, so a
 *    column inserted in the middle cannot silently shift `Status` into `Moves`.
 * 3. A table in the queue region whose header is *not* the queue shape must be
 *    named in `NOT_A_QUEUE_TABLE` with a reason. Anything else is reported as a
 *    problem rather than skipped — a section that quietly stopped parsing is how
 *    a queue loses a row, and discovery-with-an-exemption-list is the shape this
 *    repo already uses for the same hazard (`src/lib/ideaGraph/load.ts`).
 */

/** Heading under which a table sits, classified by the lane it belongs to. */
export type SectionKind = 'now' | 'parallel' | 'founder' | 'parked' | 'after-h0' | 'other';

/**
 * Status vocabulary, from `GRAPH_LOOP.md`'s own key line.
 *
 * That line read `open · done · parked · founder · blocked` until this parser ran
 * against the real file and reported `D4`, whose status is `hold` — a state used
 * in earnest ("D4 stays hold" closes roughly twenty section blocks) and absent
 * from the key. The key was stale, not the row, so both were corrected. `hold` is
 * non-routable, like `parked`.
 */
export type RowStatus = 'open' | 'done' | 'parked' | 'hold' | 'founder' | 'blocked' | 'unknown';

/** The only status that routes. Everything else is a lane the graph does not take. */
export const ROUTABLE_STATUS: RowStatus = 'open';

export interface QueueRow {
  /** The `#` cell with markdown emphasis stripped: `AM1`, `H0-1`, `A`. */
  id: string;
  loop: string;
  moves: string;
  /** The leading backticked word of the Status cell. */
  status: RowStatus;
  /** The whole Status cell, annotation included — `` `done` — `.834` this PR ``. */
  statusCell: string;
  section: string;
  sectionKind: SectionKind;
  /** 1-indexed line in the source file, so output is clickable. */
  line: number;
}

export interface QueueSection {
  heading: string;
  kind: SectionKind;
  line: number;
  rows: QueueRow[];
}

export interface ParsedQueue {
  sections: QueueSection[];
  rows: QueueRow[];
  /** Tables the parser reached but refused to interpret. Never silent. */
  problems: string[];
}

/** The one header a queue table may have. Order is part of the contract. */
export const QUEUE_HEADER = ['#', 'Loop', 'Moves', 'Status'] as const;

/**
 * Tables inside `## Queue` that are deliberately not queue tables, keyed by
 * their header signature, each with the reason it is exempt. An exemption list
 * rather than a pattern, so leaving a table out is something a reviewer can
 * disagree with.
 */
export const NOT_A_QUEUE_TABLE: Record<string, string> = {
  'Horizon|Agent-allowed|Founder-only': 'the After-H0 orientation grid — horizons, not loops',
  'Item|Why the graph cannot finish it': 'the founder list — items the graph may never mark done',
  '#|Loop|Status': 'the Parked table — no Moves column, and parked rows are not routable',
};

const HEADING = /^(#{2,3})\s+(.*?)\s*$/;
const DIVIDER = /^\|[\s:|-]+\|$/;

function classify(heading: string): SectionKind {
  if (/^Now\s+—/.test(heading)) return 'now';
  if (/^Parallel\b/.test(heading)) return 'parallel';
  if (/^Founder\b/.test(heading)) return 'founder';
  if (/^Parked\b/.test(heading)) return 'parked';
  if (/^After H0\b/.test(heading)) return 'after-h0';
  return 'other';
}

/** `| a | b |` → `['a','b']`. Leading and trailing empties are the pipes themselves. */
function cells(line: string): string[] {
  const parts = line.split('|');
  return parts.slice(1, parts.length - 1).map((c) => c.trim());
}

/** `**AM1**` → `AM1`; `` `open` — separate lane `` → the backticked head. */
function stripEmphasis(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^`|`$/g, '').trim();
}

/**
 * The Status cell carries an annotation more often than not, and the annotation
 * is prose. Only the leading backticked token is the status; `done (already
 * true)` reduces to `done`, because "already true" is a *reason*, not a fifth
 * state the router should have an opinion about.
 */
export function readStatus(cell: string): RowStatus {
  const quoted = /^`([^`]+)`/.exec(cell.trim());
  if (!quoted) return 'unknown';
  const head = quoted[1].trim().split(/[\s(]/)[0].toLowerCase();
  switch (head) {
    case 'open':
    case 'done':
    case 'parked':
    case 'hold':
    case 'founder':
    case 'blocked':
      return head;
    default:
      return 'unknown';
  }
}

export function parseQueue(src: string, file = 'docs/GRAPH_LOOP.md'): ParsedQueue {
  const lines = src.split('\n');
  const problems: string[] = [];
  const sections: QueueSection[] = [];

  // 1. Bound the region. Everything below `## Research` is dossier, not queue.
  const start = lines.findIndex((l) => HEADING.exec(l)?.[2] === 'Queue');
  if (start === -1) {
    return { sections: [], rows: [], problems: [`${file} has no \`## Queue\` heading`] };
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    const m = HEADING.exec(lines[i]);
    if (m && m[1] === '##') {
      end = i;
      break;
    }
  }

  let current: QueueSection | null = null;

  for (let i = start + 1; i < end; i += 1) {
    const line = lines[i];

    const heading = HEADING.exec(line);
    if (heading && heading[1] === '###') {
      current = { heading: heading[2], kind: classify(heading[2]), line: i + 1, rows: [] };
      sections.push(current);
      continue;
    }

    // A table opens on a header row followed by a divider.
    if (!line.startsWith('|') || !DIVIDER.test(lines[i + 1] ?? '')) continue;

    const header = cells(line);
    const signature = header.join('|');
    const isQueueTable = signature === QUEUE_HEADER.join('|');

    if (!isQueueTable) {
      if (!NOT_A_QUEUE_TABLE[signature]) {
        problems.push(
          `${file}:${i + 1} — table under "${current?.heading ?? '(no heading)'}" has header ` +
            `\`${signature}\`, which is neither the queue shape (\`${QUEUE_HEADER.join('|')}\`) ` +
            `nor exempted in NOT_A_QUEUE_TABLE. Add it to one or the other; do not leave it unparsed`
        );
      }
      continue;
    }

    if (!current) {
      problems.push(`${file}:${i + 1} — a queue table appears before any \`###\` heading`);
      continue;
    }

    // 2. Body rows, until the table ends.
    for (let j = i + 2; j < end; j += 1) {
      const row = lines[j];
      if (!row.startsWith('|')) break;
      const c = cells(row);
      if (c.length !== QUEUE_HEADER.length) {
        problems.push(
          `${file}:${j + 1} — queue row has ${c.length} cells, not ${QUEUE_HEADER.length}: \`${row.trim()}\``
        );
        continue;
      }
      const [id, loop, moves, statusCell] = c;
      const status = readStatus(statusCell);
      if (status === 'unknown') {
        problems.push(
          `${file}:${j + 1} — row \`${stripEmphasis(id)}\` has status cell \`${statusCell}\`, ` +
            `which does not open with one of \`open\` \`done\` \`parked\` \`founder\` \`blocked\``
        );
      }
      current.rows.push({
        id: stripEmphasis(id),
        loop,
        moves,
        status,
        statusCell,
        section: current.heading,
        sectionKind: current.kind,
        line: j + 1,
      });
    }
  }

  // 3. A stale exemption is as bad as a missing one: if a signature in the map
  //    matches nothing in the file, the reason it names has stopped being true.
  const seen = new Set<string>();
  for (let i = start + 1; i < end; i += 1) {
    if (lines[i].startsWith('|') && DIVIDER.test(lines[i + 1] ?? '')) seen.add(cells(lines[i]).join('|'));
  }
  for (const [signature, why] of Object.entries(NOT_A_QUEUE_TABLE)) {
    if (!seen.has(signature)) {
      problems.push(
        `NOT_A_QUEUE_TABLE exempts \`${signature}\` (${why}) but no such table exists in ${file} — ` +
          `remove the stale exemption`
      );
    }
  }

  return { sections, rows: sections.flatMap((s) => s.rows), problems };
}
