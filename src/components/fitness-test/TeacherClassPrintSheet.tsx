'use client';

import { awardLabel, type FitnessAwardTier } from '@/lib/presidentialFitnessTest';
import { EN_ONLY_SURFACE, formatLocalDateTime } from '@/lib/i18n/formatLocale';

type Props = {
  className: string;
  classCode: string;
  stats: {
    uniqueAthletes: number;
    totalTests: number;
    tierCounts: Record<string, number>;
  };
  entries: {
    rank: number;
    athleteLabel: string;
    bestTier: string;
    score: number;
  }[];
};

/** Print-only class summary for teachers (browser print → PDF). */
export function TeacherClassPrintSheet({ className, classCode, stats, entries }: Props) {
  return (
    <div className="hidden print:block print-sheet p-8 text-black bg-white text-sm">
      <h1 className="text-2xl font-bold mb-1">Mission Winning — Class Fitness Report</h1>
      <p className="text-base mb-4">
        {className} · <span className="font-mono">{classCode}</span>
      </p>
      <p className="text-xs text-gray-600 mb-6">
        Generated {formatLocalDateTime(new Date(), EN_ONLY_SURFACE)} · Educational fitness tool — not an official U.S.
        government report.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="border rounded p-3">
          <p className="text-2xl font-bold">{stats.uniqueAthletes}</p>
          <p className="text-xs text-gray-600">Athletes synced</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-2xl font-bold">{stats.totalTests}</p>
          <p className="text-xs text-gray-600">Tests logged</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-2xl font-bold">{stats.tierCounts.presidential ?? 0}</p>
          <p className="text-xs text-gray-600">Presidential awards</p>
        </div>
      </div>

      <h2 className="font-semibold text-lg mb-2">Standings</h2>
      {entries.length === 0 ? (
        <p className="text-gray-600">No synced results yet.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-1 pr-4">Rank</th>
              <th className="py-1 pr-4">Athlete</th>
              <th className="py-1 pr-4">Award</th>
              <th className="py-1">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.rank} className="border-b border-gray-200">
                <td className="py-1 pr-4">#{e.rank}</td>
                <td className="py-1 pr-4">{e.athleteLabel}</td>
                <td className="py-1 pr-4">{awardLabel(e.bestTier as FitnessAwardTier)}</td>
                <td className="py-1">{e.score} pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
