/**
 * Honest set-row formatter for printable sheets.
 * Never invents RPE, RIR, weight or reps. Unknown values print as a blank marker.
 */

export type HonestSetType = 'warmup' | 'working' | 'drop' | 'failure';

export type HonestSetInput = {
  type: HonestSetType;
  weightKg?: number | null;
  reps?: number | null;
  rpe?: number | null;
  rir?: number | null;
  parentIndex?: number | null;
};

export type HonestSetRow = {
  ok: boolean;
  text: string;
  issues: string[];
};

export const BLANK = '—';

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

function isFiniteInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && Number.isInteger(n);
}

function isValidRpe(n: unknown): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 10;
}

function isValidRir(n: unknown): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 10 && Number.isInteger(n);
}

function formatWeight(weightKg: number | null | undefined): string {
  if (!isFiniteNonNegative(weightKg)) return BLANK;
  return `${weightKg} kg`;
}

function formatReps(reps: number | null | undefined): string {
  if (!isFiniteInteger(reps)) return BLANK;
  return `${reps} reps`;
}

function formatRpe(rpe: number | null | undefined): { text: string; issue: string | null } {
  if (rpe === null || rpe === undefined) {
    return { text: `RPE ${BLANK}`, issue: null };
  }
  if (isValidRpe(rpe)) {
    return { text: `RPE ${rpe}`, issue: null };
  }
  return { text: `RPE ${BLANK}`, issue: 'rpe unknown' };
}

function formatRir(rir: number | null | undefined): { text: string; issue: string | null } {
  if (rir === null || rir === undefined) {
    return { text: `RIR ${BLANK}`, issue: null };
  }
  if (isValidRir(rir)) {
    return { text: `RIR ${rir}`, issue: null };
  }
  return { text: `RIR ${BLANK}`, issue: 'rir unknown' };
}

function typeLabel(type: HonestSetType): string {
  switch (type) {
    case 'warmup':
      return 'W';
    case 'working':
      return 'S';
    case 'drop':
      return 'D';
    case 'failure':
      return 'F';
  }
}

export function formatSetRow(input: HonestSetInput): HonestSetRow {
  const issues: string[] = [];

  const label = typeLabel(input.type);
  const weight = formatWeight(input.weightKg);
  const reps = formatReps(input.reps);
  const rpeResult = formatRpe(input.rpe);
  const rirResult = formatRir(input.rir);

  if (rpeResult.issue) issues.push(rpeResult.issue);
  if (rirResult.issue) issues.push(rirResult.issue);

  if (input.type === 'drop' && (input.parentIndex === null || input.parentIndex === undefined)) {
    issues.push('drop without parent');
  }

  if (input.type === 'failure' && !isFiniteInteger(input.reps)) {
    issues.push('failure without reps');
  }

  const text = [label, weight, reps, rpeResult.text, rirResult.text].join(' · ');

  return {
    ok: issues.length === 0,
    text,
    issues,
  };
}

function areRowsIdentical(a: HonestSetInput, b: HonestSetInput): boolean {
  return (
    a.type === b.type &&
    a.weightKg === b.weightKg &&
    a.reps === b.reps &&
    a.rpe === b.rpe &&
    a.rir === b.rir
  );
}

export function formatSetSheet(rows: HonestSetInput[]): { lines: string[]; issues: string[] } {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { lines: [], issues: ['empty sheet'] };
  }

  const lines: string[] = [];
  const issues: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const formatted = formatSetRow(row);
    lines.push(`${i + 1}. ${formatted.text}`);

    for (const issue of formatted.issues) {
      issues.push(`row ${i + 1}: ${issue}`);
    }

    if (i > 0 && areRowsIdentical(rows[i - 1], rows[i])) {
      issues.push(`row ${i + 1}: duplicate row`);
    }
  }

  return { lines, issues };
}
