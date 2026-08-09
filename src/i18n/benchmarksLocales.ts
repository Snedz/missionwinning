/** Benchmarks page UI — merged into i18n `common` namespace. */

type BenchmarksStrings = {
  benchmarksTitle: string;
  benchmarksSubtitle: string;
  benchmarksSubtitleBrief: string;
  benchmarksMoreTests: string;
  benchmarksEmptyTitle: string;
  benchmarksEmptyDesc: string;
  benchmarksExercisesTracked: string;
  benchmarksSessions: string;
  benchmarksAvgGap: string;
  benchmarksSelectExercise: string;
  benchmarksFormulaNote: string;
  benchmarksBestEst: string;
  benchmarksBestActual: string;
  benchmarksNo1Rep: string;
  benchmarksLatestEst: string;
  benchmarksEstVsActual: string;
  benchmarksSessionsLogged: string;
  benchmarksTotalSets: string;
  benchmarks1rmProgress: string;
  benchmarks1rmProgressDesc: string;
  benchmarksEstLegend: string;
  benchmarksActLegend: string;
  benchmarksTimeline: string;
  benchmarksTimelineDesc: string;
  benchmarksTableDate: string;
  benchmarksTableWorkout: string;
  benchmarksTableBestSet: string;
  benchmarksTableEst: string;
  benchmarksTableActual: string;
  benchmarksTableDelta: string;
  benchmarksAllExercises: string;
  benchmarksAllExercisesDesc: string;
  benchmarksTableExercise: string;
  benchmarksQuickTitle: string;
  benchmarksQuickDesc: string;
  benchmarksQuickBench: string;
  benchmarksQuickSquat: string;
  benchmarksQuickDeadlift: string;
  benchmarksQuickStarters: string;
  benchmarksQuickHabit: string;
  benchmarksSignInFoot: string;
  benchmarksWeightTimesReps: string;
  benchmarksEyebrow: string;
  anatomyMapTitle: string;
  anatomyMapDesc: string;
  militaryReadinessTitle: string;
  militaryReadinessDesc: string;
  militaryReadinessCta: string;
  militaryReadinessFoot: string;
  benchmarksHabitLogged: string;
  benchmarksHabitLoggedDesc: string;
  benchmarksEmptyCta: string;
};

const en: BenchmarksStrings = {
  benchmarksTitle: 'Benchmarks',
  benchmarksSubtitle: 'Statistics, rep maxes, estimated vs actual, and progress over time.',
  benchmarksSubtitleBrief: 'Rep maxes from your logs. Other tests when you want them.',
  benchmarksMoreTests: 'Military & youth tests',
  benchmarksEmptyTitle: 'No benchmark data yet',
  benchmarksEmptyDesc:
    'Complete workouts with logged sets to build estimated 1RMs. Log a set at 1 rep to record an actual 1RM for comparison.',
  benchmarksExercisesTracked: 'Exercises Tracked',
  benchmarksSessions: 'Benchmark Sessions',
  benchmarksAvgGap: 'Avg Est. − Actual',
  benchmarksSelectExercise: 'Select exercise…',
  benchmarksFormulaNote: 'Estimates use the Epley formula from logged sets. Actual = weight on 1-rep sets.',
  benchmarksBestEst: 'Best Estimated 1RM',
  benchmarksBestActual: 'Best Actual 1RM',
  benchmarksNo1Rep: 'No 1-rep sets',
  benchmarksLatestEst: 'Latest Session Est.',
  benchmarksEstVsActual: 'Est. vs Actual Gap',
  benchmarksSessionsLogged: '{{count}} sessions logged',
  benchmarksTotalSets: '{{count}} total sets',
  benchmarks1rmProgress: '1RM Progress',
  benchmarks1rmProgressDesc: 'Estimated (dashed) from all sets · Actual (solid) from 1-rep attempts only',
  benchmarksEstLegend: 'Estimated 1RM',
  benchmarksActLegend: 'Actual 1RM',
  benchmarksTimeline: 'Timeline',
  benchmarksTimelineDesc: 'Per-session best estimated and actual rep maxes',
  benchmarksTableDate: 'Date',
  benchmarksTableWorkout: 'Workout',
  benchmarksTableBestSet: 'Best Set',
  benchmarksTableEst: 'Estimated 1RM',
  benchmarksTableActual: 'Actual 1RM',
  benchmarksTableDelta: 'Δ',
  benchmarksAllExercises: 'All Exercises',
  benchmarksAllExercisesDesc: 'Quick comparison across logged movements',
  benchmarksTableExercise: 'Exercise',
  benchmarksQuickTitle: 'Quick Benchmark Starters (Free)',
  benchmarksQuickDesc:
    'Start a short session focused on common benchmark lifts. Log sets → see progress here next time. Bumps streak on launch.',
  benchmarksQuickBench: 'Bench 5/3/1 style →',
  benchmarksQuickSquat: 'Squat working sets →',
  benchmarksQuickDeadlift: 'Deadlift pulls →',
  benchmarksQuickStarters: 'All free starters in Today →',
  benchmarksQuickHabit: 'Log benchmark habit (+streak)',
  benchmarksSignInFoot: 'Sync benchmark history and PRs across devices.',
  benchmarksWeightTimesReps: '{{weight}} {{unit}} × {{reps}}',
  benchmarksEyebrow: 'Benchmarks',
  anatomyMapTitle: 'Muscle balance',
  anatomyMapDesc: '14-day volume by major group — tap a region for exercises.',

  militaryReadinessTitle: 'Readiness test prep',
  militaryReadinessDesc: 'Optional standards for push-ups, pull-ups, deadlift, and loaded carries — service fitness prep. Mission Winning remains for everyone (free core forever).',
  militaryReadinessCta: 'Train for standards',
  militaryReadinessFoot: 'Civilian health app — not affiliated with any armed service.',
  benchmarksHabitLogged: 'Habit logged',
  benchmarksHabitLoggedDesc: 'Streak {{streak}}. Finish a session to update charts.',
  benchmarksEmptyCta: 'Open Today',
};

const es: BenchmarksStrings = {
  ...en,
  benchmarksTitle: 'Referencias',
  benchmarksSubtitle: 'Estadísticas, rep max, estimado vs real y progreso.',
  benchmarksEmptyTitle: 'Sin datos de benchmarks',
  benchmarksExercisesTracked: 'Ejercicios registrados',
  benchmarksBestEst: 'Mejor 1RM estimado',
  benchmarksBestActual: 'Mejor 1RM real',
  benchmarks1rmProgress: 'Progreso 1RM',
  benchmarksTimeline: 'Línea de tiempo',
  benchmarksQuickTitle: 'Inicios rápidos (gratis)',
};

const zh: BenchmarksStrings = {
  ...en,
  benchmarksTitle: '基准测试',
  benchmarksSubtitle: '统计、极限次数、估算与实际对比及进展。',
  benchmarksEmptyTitle: '暂无基准数据',
  benchmarksExercisesTracked: '跟踪动作',
  benchmarksBestEst: '最佳估算 1RM',
  benchmarksBestActual: '最佳实际 1RM',
  benchmarks1rmProgress: '1RM 进展',
};

const id: BenchmarksStrings = {
  ...en,
  benchmarksTitle: 'Benchmark',
  benchmarksExercisesTracked: 'Latihan dilacak',
};

const th: BenchmarksStrings = {
  ...en,
  benchmarksTitle: 'เกณฑ์อ้างอิง',
  benchmarksExercisesTracked: 'ท่าที่ติดตาม',
};

const ar: BenchmarksStrings = {
  ...en,
  benchmarksTitle: 'معايير الأداء',
  benchmarksExercisesTracked: 'تمارين متتبعة',
};

const LOCALES: Partial<Record<string, BenchmarksStrings>> = { en, es, zh, id, th, ar };

export function benchmarksStringsFor(lang: string): BenchmarksStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeBenchmarksStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, benchmarksStringsFor(lang));
}
