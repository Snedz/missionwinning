export type ChainLink = { name: string; reps?: number | null; restTakenSec?: number | null };
export type ChainLog = { ok: boolean; line: string; reason: string };
export const SKIP_REST = '→ no rest →';

function renderReps(reps: number | null | undefined): string {
  if (typeof reps === 'number' && Number.isFinite(reps) && reps >= 0 && Number.isInteger(reps)) {
    return ` ×${reps}`;
  }
  return ' ×—';
}

export function logSupersetChain(links: ChainLink[]): ChainLog {
  if (!Array.isArray(links) || links.length === 0) {
    return { ok: false, line: '', reason: 'empty chain' };
  }

  for (const link of links) {
    if (!link.name || link.name.trim() === '') {
      return { ok: false, line: '', reason: 'unnamed exercise' };
    }
  }

  if (links.length === 1) {
    const link = links[0];
    const line = `${link.name}${renderReps(link.reps)}`;
    return { ok: true, line, reason: 'single exercise (not a superset)' };
  }

  const parts: string[] = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    parts.push(`${link.name}${renderReps(link.reps)}`);

    if (i < links.length - 1) {
      const rest = link.restTakenSec;
      if (typeof rest === 'number' && Number.isFinite(rest) && rest > 0) {
        parts.push(` → rest ${rest}s → `);
      } else {
        parts.push(` ${SKIP_REST} `);
      }
    }
  }

  const line = parts.join('');
  return { ok: true, line, reason: `superset of ${links.length}` };
}

export function restSkippedCount(links: ChainLink[]): number {
  if (!Array.isArray(links) || links.length < 2) {
    return 0;
  }

  let count = 0;
  for (let i = 0; i < links.length - 1; i++) {
    const rest = links[i].restTakenSec;
    if (!(typeof rest === 'number' && Number.isFinite(rest) && rest > 0)) {
      count++;
    }
  }

  return count;
}
