/**
 * Download formatters — JSON and plain text from the same report object.
 * The page turns these strings into files; this module stays pure.
 */

import type { TransparencyReport, WeightRow } from '@/lib/transparency/types';

export function formatTransparencyJson(report: TransparencyReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function weightLine(row: WeightRow): string {
  return `${row.label} | ${row.display} | ${row.cap}${row.live ? '' : ' | planned'}`;
}

export function formatTransparencyText(report: TransparencyReport): string {
  const lines: string[] = [
    'Mission Winning — Visibility + Under the Hood',
    `Build: ${report.buildLabel}`,
    `Generated: ${report.generatedAt}`,
    `Limits apply: ${report.limitsApply}`,
    '',
  ];

  lines.push('Labels on this athlete');
  for (const label of report.athleteLabels) {
    lines.push(`${label.title} — ${label.status}${label.applies ? ' (applies)' : ''}`);
    lines.push(label.reason);
    lines.push('');
  }

  for (const row of report.rows) {
    lines.push(`${row.title} — ${row.status}`);
    lines.push(row.reason);
    for (const d of row.details ?? []) {
      lines.push(`  - ${d}`);
    }
    lines.push('');
  }

  lines.push('BOOSTS (live local XP)');
  lines.push(`Source: ${report.sources.live}`);
  lines.push('Event | Weight | Cap');
  for (const e of report.boosts) {
    lines.push(weightLine(e));
  }
  lines.push('');

  lines.push('BOOSTS (Club ledger — planned)');
  lines.push(`Source: ${report.sources.club}`);
  lines.push('Event | Weight | Cap');
  for (const e of report.clubPlannedBoosts) {
    lines.push(weightLine(e));
  }
  lines.push('');

  lines.push('PENALTIES (visibility only)');
  lines.push(`Source: ${report.sources.visibility}`);
  lines.push('Filter | Effect');
  for (const e of report.penalties) {
    lines.push(`${e.label} | ${e.display}`);
  }
  lines.push('');

  lines.push('Earn table (live local XP)');
  lines.push('Event | Points | Cap');
  for (const e of report.earnTable) {
    lines.push(`${e.event} | ${e.points} | ${e.cap}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function collectReportReasons(report: TransparencyReport): string[] {
  return report.rows.map((r) => r.reason);
}
