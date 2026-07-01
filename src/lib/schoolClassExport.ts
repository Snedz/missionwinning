export type ClassStandingsRow = {
  rank: number;
  athleteLabel: string;
  bestTier: string;
  score: number;
  lastTestAt?: string;
};

export function formatClassStandingsCsv(
  className: string,
  code: string,
  entries: ClassStandingsRow[]
): string {
  const lines = [
    'Mission Winning — Class Fitness Test Standings',
    `${className} (${code})`,
    `Generated ${new Date().toISOString()}`,
    '',
    'Rank,Athlete,Award,Score,Last Test',
  ];
  for (const e of entries) {
    lines.push(
      `${e.rank},"${e.athleteLabel.replace(/"/g, '""')}",${e.bestTier},${e.score},${e.lastTestAt ?? ''}`
    );
  }
  return lines.join('\n');
}
