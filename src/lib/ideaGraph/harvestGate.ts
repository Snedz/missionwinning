/**
 * Whether a generate-harvest is still legal.
 *
 * IDEA_LOOP stop rule: two consecutive *generate* runs (scout > 0) that
 * survive red team 0-of-N means the source is mined out. Paste-only rows
 * (scout 0) do not count. The LEDGER table is the one home; we discover
 * columns by header name so a renamed column goes red instead of silently
 * reading the wrong cell.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const LEDGER_REL = 'docs/mechanics/LEDGER.md';

const REQUIRED = ['run', 'scout', 'survived red team'] as const;

export type LedgerGenerateRun = {
  run: string;
  scout: number;
  survivedZero: boolean;
  survivedCell: string;
};

export type LedgerParse =
  | { ok: true; generates: LedgerGenerateRun[] }
  | { ok: false; reason: string };

function cellsOf(line: string): string[] {
  const t = line.trim();
  if (!t.startsWith('|')) return [];
  return t
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

function isSep(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

export function parseLedgerGenerates(src: string): LedgerParse {
  const lines = src.split('\n');
  const start = lines.findIndex((l) => {
    const c = cellsOf(l).map((x) => x.toLowerCase());
    return REQUIRED.every((name) => c.includes(name));
  });
  if (start < 0) {
    return { ok: false, reason: `LEDGER table is missing columns: ${REQUIRED.join(', ')}` };
  }
  const header = cellsOf(lines[start]).map((x) => x.toLowerCase());
  const idx = {
    run: header.indexOf('run'),
    scout: header.indexOf('scout'),
    survived: header.indexOf('survived red team'),
  };
  const generates: LedgerGenerateRun[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) {
      if (generates.length > 0) break;
      continue;
    }
    if (isSep(line)) continue;
    const cells = cellsOf(line);
    if (cells.length < header.length) continue;
    const scoutCell = cells[idx.scout] ?? '';
    const scout = /^(\d+)$/.test(scoutCell) ? Number(scoutCell) : 0;
    if (scout <= 0) continue;
    const survivedCell = cells[idx.survived] ?? '';
    const survivedZero = /^0\s+of\s+\d+/i.test(survivedCell);
    generates.push({
      run: cells[idx.run] ?? '',
      scout,
      survivedZero,
      survivedCell,
    });
  }
  return { ok: true, generates };
}

/** Two trailing generate-harvests with zero survivors → do not generate again. */
export function generateHarvestLegalFrom(src: string): boolean {
  const parsed = parseLedgerGenerates(src);
  if (!parsed.ok) return false;
  const { generates } = parsed;
  if (generates.length < 2) return true;
  const last = generates[generates.length - 1];
  const prev = generates[generates.length - 2];
  return !(last.survivedZero && prev.survivedZero);
}

export function generateHarvestLegal(root: string): boolean {
  const full = path.join(root, LEDGER_REL);
  if (!existsSync(full)) return false;
  try {
    return generateHarvestLegalFrom(readFileSync(full, 'utf8'));
  } catch {
    return false;
  }
}
