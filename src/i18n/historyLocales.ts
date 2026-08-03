/** History page UI copy — merged into i18n `common` namespace. */

type HistoryStrings = {
  historyTitle: string;
  historySubtitle: string;
  historySessionCount: string;
  historySyncing: string;
  historyCloudMerged: string;
  historyAvgVolume: string;
  historyEmptyTitle: string;
  historyEmptyDesc: string;
  historyDetails: string;
  historyTotalVolume: string;
  historyPillarWins: string;
  historyPillarWinsDesc: string;
  historyVolumeTitle: string;
  historyVolumeDesc: string;
  historyVolumeLabel: string;
  historySessionsLabel: string;
  /** `.247` — days logged, and the day the record starts. */
  historyDaysLogged: string;
  historyDaysSince: string;
  /** `.251` — the one-day replay. */
  historyDayEyebrow: string;
  historyDayPosition: string;
  historyDayEmpty: string;
  historyDayBadDate: string;
  historyDayBack: string;
  historyDayToday: string;
  history1rmTitle: string;
  historyEst1rm: string;
  historyAct1rm: string;
  historyChartsEmpty: string;
  historyHeatmapTitle: string;
  historyHeatmapDesc: string;
  historyHeatVolume: string;
  historyHeatDaysRest: string;
  historyHeatNoData: string;
  historySelectExercise: string;
  historySignInFoot: string;
  historySessionVolume: string;
  historyTableSet: string;
  historyTableReps: string;
  historyTableWeight: string;
  historyTableVolume: string;
  historyTableType: string;
  historyWarmupExcluded: string;
};

const en: HistoryStrings = {
  historyTitle: 'Workout History',
  historySubtitle: 'Your history powers the Today Hub readiness and Win Score.',
  historySessionCount: '{{count}} completed session',
  historySyncing: ' — syncing cloud…',
  historyCloudMerged: ' — cloud merged',
  historyAvgVolume: 'Recent trend: Avg volume last 5: {{avg}} {{unit}}.',
  historyEmptyTitle: 'No sessions yet',
  historyEmptyDesc: 'Log one set from Today — History fills from what you finish.',
  historyDetails: 'Details',
  historyTotalVolume: 'Total Volume',
  historyPillarWins: 'Pillar Wins & Habit Logs',
  historyPillarWinsDesc:
    'Mobility wins, mind prompts, assessments logged from pillars appear here (synergy with Nutrition). Free core.',
  historyVolumeTitle: 'Weekly volume',
  historyVolumeDesc: 'Total {{unit}} × reps per week (last 12 weeks)',
  historyVolumeLabel: 'Volume',
  historySessionsLabel: 'Sessions',
  historyDaysLogged: '{{count}} days logged',
  historyDaysSince: 'since {{date}}',
  historyDayEyebrow: 'On this day',
  historyDayPosition: 'Day {{index}} of {{total}} logged',
  historyDayEmpty: 'Nothing was recorded on this day.',
  historyDayBadDate: 'That is not a date. Pick a day from your history.',
  historyDayBack: 'Back to history',
  historyDayToday: 'replay today',
  history1rmTitle: 'Estimated 1RM',
  historyEst1rm: 'Estimated',
  historyAct1rm: 'Actual (1 rep)',
  historyChartsEmpty: 'Log workouts to see trends.',
  historyHeatmapTitle: 'Muscle heatmap',
  historyHeatmapDesc:
    'Volume by group — last {{days}} days. Darker = more work; lighter green = ready to train.',
  historyHeatVolume: '{{volume}} vol',
  historyHeatDaysRest: '{{days}}d since trained',
  historyHeatNoData: 'No recent data',
  historySelectExercise: 'Chart exercise',
  historySignInFoot: 'Sign in (optional) to load full cloud history.',
  historySessionVolume: '{{volume}} {{unit}} total volume',
  historyTableSet: 'Set',
  historyTableReps: 'Reps',
  historyTableWeight: 'Weight',
  historyTableVolume: 'Volume',
  historyTableType: 'Type',
  historyWarmupExcluded: '—',
};

const es: HistoryStrings = {
  ...en,
  historyTitle: 'Historial de entrenamientos',
  historyEmptyTitle: 'Aún no hay entrenamientos',
  historyVolumeTitle: 'Volumen semanal',
  historyHeatmapTitle: 'Mapa muscular',
  history1rmTitle: '1RM estimado',
};

const zh: HistoryStrings = {
  ...en,
  historyTitle: '训练历史',
  historyVolumeTitle: '每周训练量',
  historyHeatmapTitle: '肌群热图',
  history1rmTitle: '估算 1RM',
};

const id: HistoryStrings = {
  ...en,
  historyTitle: 'Riwayat latihan',
  historyVolumeTitle: 'Volume mingguan',
  historyHeatmapTitle: 'Peta otot',
};

const th: HistoryStrings = {
  ...en,
  historyTitle: 'ประวัติการฝึก',
  historyVolumeTitle: 'ปริมาณรายสัปดาห์',
  historyHeatmapTitle: 'แผนที่กล้ามเนื้อ',
};

const ar: HistoryStrings = {
  ...en,
  historyTitle: 'سجل التمارين',
  historyVolumeTitle: 'الحجم الأسبوعي',
  historyHeatmapTitle: 'خريطة العضلات',
};

const LOCALES: Partial<Record<string, HistoryStrings>> = { en, es, zh, id, th, ar };

export function historyStringsFor(lang: string): HistoryStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeHistoryStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, historyStringsFor(lang));
}
