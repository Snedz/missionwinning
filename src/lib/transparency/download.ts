/**
 * Download formatters — JSON and plain text from the same report object.
 * The page turns these strings into files; this module stays pure.
 */

import type { TransparencyReport } from '@/lib/transparency/types';

export function formatTransparencyJson(report: TransparencyReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function formatTransparencyText(report: TransparencyReport): string {
  const lines: string[] = [
    'Mission Winning — Why this',
    `Build: ${report.buildLabel}`,
    `Generated: ${report.generatedAt}`,
    '',
  ];

  for (const row of report.rows) {
    lines.push(`${row.title} — ${row.status}`);
    lines.push(row.reason);
    for (const d of row.details ?? []) {
      lines.push(`  - ${d}`);
    }
    lines.push('');
  }

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
