import { awardLabel, type FitnessAwardTier } from '@/lib/presidentialFitnessTest';
import type { ClassStandingsRow } from '@/lib/schoolClassExport';
import { EN_ONLY_SURFACE, formatLocalDateTime } from '@/lib/i18n/formatLocale';
import { escapeHtml } from '@/lib/escapeHtml';

export type ClassReportStats = {
  uniqueAthletes: number;
  totalTests: number;
  tierCounts: Record<string, number>;
};

/** Self-contained printable HTML class report (open in browser → Print to PDF). */
export function formatClassReportHtml(
  className: string,
  code: string,
  stats: ClassReportStats,
  entries: ClassStandingsRow[]
): string {
  const generated = formatLocalDateTime(new Date(), EN_ONLY_SURFACE);
  const rows =
    entries.length === 0
      ? '<tr><td colspan="4" class="muted">No synced results yet.</td></tr>'
      : entries
          .map(
            (e) => `<tr>
        <td>#${e.rank}</td>
        <td>${escapeHtml(e.athleteLabel)}</td>
        <td>${escapeHtml(awardLabel(e.bestTier as FitnessAwardTier))}</td>
        <td>${e.score} pts</td>
      </tr>`
          )
          .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Mission Winning — ${escapeHtml(className)} (${code})</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { color: #555; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    /* .221 — was border-radius 8px. Radius is 0 across the brand, and a
       printable report is still the brand on someone else's desk. */
    .stat { border: 1px solid #ccc; border-radius: 0; padding: 1rem; text-align: center; }
    .stat strong { display: block; font-size: 1.75rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { border-bottom: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f5f5f5; }
    .muted { color: #666; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #666; }
    @media print { body { margin: 1cm; } }
  </style>
</head>
<body>
  <h1>Mission Winning — Class Fitness Report</h1>
  <p class="meta"><strong>${escapeHtml(className)}</strong> · <code>${escapeHtml(code)}</code><br />Generated ${escapeHtml(generated)}</p>
  <div class="stats">
    <div class="stat"><strong>${stats.uniqueAthletes}</strong>Athletes synced</div>
    <div class="stat"><strong>${stats.totalTests}</strong>Tests logged</div>
    <div class="stat"><strong>${stats.tierCounts.presidential ?? 0}</strong>Presidential awards</div>
  </div>
  <h2>Standings</h2>
  <table>
    <thead><tr><th>Rank</th><th>Athlete</th><th>Award</th><th>Score</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">Educational fitness tool by Mission Winning LLC — not an official U.S. government report.</p>
</body>
</html>`;
}
