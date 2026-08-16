/**
 * Write one `IL-` harvest row into GRAPH_LOOP.
 *
 * `/harness` on a harvest-paste route calls this. It is the baton, not a
 * side effect of `idea:next`. One row. Not a letter refill (AU2).
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const QUEUE_REL = 'docs/GRAPH_LOOP.md';

const AFTER_H0 = '\n### After H0';
const HARVEST_HEAD = /^### Now — ([A-Z]+) \(harvest\b/gm;

export function incrementSectionId(id: string): string {
  const chars = id.split('');
  for (let i = chars.length - 1; i >= 0; i--) {
    const c = chars[i];
    if (c !== 'Z') {
      chars[i] = String.fromCharCode(c.charCodeAt(0) + 1);
      return chars.join('');
    }
    chars[i] = 'A';
  }
  return `A${chars.join('')}`;
}

export function lastHarvestSectionId(src: string): string | null {
  let last: string | null = null;
  const re = new RegExp(HARVEST_HEAD.source, 'gm');
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) last = m[1];
  return last;
}

export function nextHarvestSectionId(src: string): string {
  const last = lastHarvestSectionId(src);
  return last ? incrementSectionId(last) : 'AN';
}

export type PastePick = {
  id: string;
  title: string;
  /** docs/-relative link target, e.g. mechanics/hypotheses/H-15-….md */
  href: string;
};

export type PasteResult =
  | { ok: true; sectionId: string; rowId: string; already: boolean; src: string }
  | { ok: false; reason: string };

function rowIdOf(pick: PastePick): string {
  return pick.id.startsWith('IL-') ? pick.id : `IL-${pick.id}`;
}

export function applyHarvestPaste(src: string, pick: PastePick, today: string): PasteResult {
  const rowId = rowIdOf(pick);
  if (new RegExp(`\\*\\*${rowId}\\*\\*`).test(src)) {
    return { ok: true, sectionId: lastHarvestSectionId(src) ?? '?', rowId, already: true, src };
  }
  const at = src.indexOf(AFTER_H0);
  if (at < 0) return { ok: false, reason: 'GRAPH_LOOP.md has no `### After H0` insert point' };

  const prev = lastHarvestSectionId(src);
  const sectionId = nextHarvestSectionId(src);
  const notPrev = prev ? `Not ${prev}2.` : 'Harvest row.';
  const block = `
### Now — ${sectionId} (harvest · ${today})

${notPrev} Next \`idea:next\` pick. One \`IL-\` row.

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **${rowId}** | ${pick.title} | [${pick.id.replace(/^IL-/, '')}](${pick.href}) | \`open\` |

D4 stays hold. Do not invent ${sectionId}2.
`;
  return {
    ok: true,
    sectionId,
    rowId,
    already: false,
    src: `${src.slice(0, at)}${block}${src.slice(at)}`,
  };
}

export function pasteHarvestFile(
  root: string,
  pick: PastePick,
  today = new Date().toISOString().slice(0, 10)
): PasteResult {
  const full = path.join(root, QUEUE_REL);
  if (!existsSync(full)) return { ok: false, reason: `missing ${QUEUE_REL}` };
  const out = applyHarvestPaste(readFileSync(full, 'utf8'), pick, today);
  if (!out.ok) return out;
  if (!out.already) writeFileSync(full, out.src);
  return out;
}
