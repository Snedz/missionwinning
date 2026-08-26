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
  historyDayEmptyTitle: string;
  historyDayEmptyCta: string;
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
  /** K7 / `.991` — start a finished session again. */
  historyTrainAgain: string;
  /** K11 — short label on session list rows. */
  historyTrainAgainShort: string;
  historyTableSet: string;
  historyTableReps: string;
  historyTableWeight: string;
  historyTableVolume: string;
  historyTableType: string;
  historyWarmupExcluded: string;
  /** Kaizen Loop 3 M1 — History chrome (.301) */
  historyBriefingEmpty: string;
  historyBriefingLine: string;
  historyEyebrow: string;
  historyMissionStory: string;
  historyStartWorkout: string;
  historySearchPlaceholder: string;
  historyNoMatches: string;
  historyLoadMore: string;
  /** Kaizen Loop 6 P2 — journal + anatomy (.314) */
  anatomyMapLead: string;
  anatomyFront: string;
  anatomyBack: string;
  journalEmptyTitle: string;
  journalEmptyDesc: string;
  journalSearchPlaceholder: string;
  journalPrivacyLine: string;
  journalNoMatches: string;
  journalCheckInTag: string;
  journalEditAria: string;
  journalEdit: string;
  journalEditLabel: string;
  journalEditPlaceholder: string;
  journalSave: string;
  journalCancel: string;
  /** Kaizen History empty honesty — cross-link to Fuel (`.561`). */
  historyViewFuel: string;
  /** `.720` — session list scan. */
  historySetCount: string;
  historySetCountOne: string;
  historyOpenLog: string;
  /** `.997` — edit the sets on a finished session. */
  historyEdit: string;
  historyEditSave: string;
  historyEditCancel: string;
  historyEditConfirmTitle: string;
  historyEditConfirmDesc: string;
  historyEditConfirm: string;
  historyEditEmpty: string;
  historyEditEmptyDesc: string;
  historyAddSet: string;
  historyRemoveSet: string;
  historyTableTime: string;
  historyTableVest: string;
  historyTableAssist: string;
  historyTableLogged: string;
  /** `.1000` — log a session they already did. */
  historyBackfill: string;
  historyBackfillTitle: string;
  historyBackfillDesc: string;
  historyBackfillSave: string;
  historyBackfillCancel: string;
  historyBackfillEmpty: string;
  historyBackfillEmptyDesc: string;
  historyBackfillDate: string;
  historyBackfillName: string;
  historyBackfillNamePlaceholder: string;
  historyBackfillTiming: string;
  historyBackfillTimingOff: string;
  historyBackfillStart: string;
  historyBackfillEnd: string;
  historyBackfillAddExercise: string;
  historyBackfillRemoveExercise: string;
  /** `.1002` — merge two names of the same movement. */
  historyMerge: string;
  historyMergeTitle: string;
  historyMergeDesc: string;
  historyMergeSource: string;
  historyMergeKeeper: string;
  historyMergeSearch: string;
  historyMergeSelected: string;
  historyMergeEmptyPick: string;
  historyMergeContinue: string;
  historyMergeCancel: string;
  historyMergeConfirmTitle: string;
  historyMergeConfirmDesc: string;
  historyMergeConfirm: string;
  historyMergeEmpty: string;
  historyMergeEmptyDesc: string;
  historyMergeDone: string;
  historyMergeDoneDesc: string;
  /** `.1003` — delete one finished session. */
  historyDelete: string;
  historyDeleteConfirmTitle: string;
  historyDeleteConfirmDesc: string;
  historyDeleteConfirm: string;
  historyDeleteCancel: string;
  /** `.1006` — restore a tombstone. */
  historyRestore: string;
  historyRestoreOpen: string;
  historyRestoreTitle: string;
  historyRestoreDesc: string;
  /** `.1007` — private title on the finished log. */
  historyNameLabel: string;
  historyNameSave: string;
  /** `.1005` — fold older days out of week 1. */
  historyStartFrom: string;
  historyStartFromTitle: string;
  historyStartFromDesc: string;
  historyStartFromDate: string;
  historyStartFromApply: string;
  historyStartFromClear: string;
  historyStartFromActive: string;
  historyStartFromEmpty: string;
  historyStartFromEmptyDesc: string;
  historyStartFromConfirmTitle: string;
  historyStartFromConfirmDesc: string;
  historyStartFromConfirm: string;
  historyStartFromCancel: string;
};

const en: HistoryStrings = {
  historyTitle: 'Workout History',
  historySubtitle: 'Your history powers Today readiness and Mission Score.',
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
  historyDayEmptyTitle: 'Nothing logged this day',
  historyDayEmptyCta: 'Open Today',
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
  historyTrainAgain: 'Start this again',
  historyTrainAgainShort: 'Again',
  historyTableSet: 'Set',
  historyTableReps: 'Reps',
  historyTableWeight: 'Weight',
  historyTableVolume: 'Volume',
  historyTableType: 'Type',
  historyWarmupExcluded: '—',
  historyBriefingEmpty: 'Your mission story starts with the first logged set.',
  historyBriefingLine: '{{count}} sessions · {{volume}} total volume — consistency compounds.',
  historyEyebrow: 'History',
  historyMissionStory: 'At a glance',
  historyStartWorkout: 'Open Today',
  historySearchPlaceholder: 'Search by workout name…',
  historyNoMatches: 'No sessions match these filters',
  historyLoadMore: 'Show more ({{remaining}} left)',
  anatomyMapLead: 'Tap a region for exercises. Color = recent volume; red = overdue.',
  anatomyFront: 'Front',
  anatomyBack: 'Back',
  journalEmptyTitle: 'No journal entries yet',
  journalEmptyDesc:
    'Finish a session and its debrief is kept here. Jot a field note mid-workout and it opens the entry in your own words.',
  journalSearchPlaceholder: 'Search your journal…',
  journalPrivacyLine: 'Your journal stays on this device. It is never uploaded.',
  journalNoMatches: 'Nothing in the journal matches that.',
  journalCheckInTag: 'Check-in note',
  journalEditAria: 'Edit your notes on {{name}}',
  journalEdit: 'Edit',
  journalEditLabel: 'Your notes, one per line',
  journalEditPlaceholder: 'One note per line — your words, kept verbatim.',
  journalSave: 'Save',
  journalCancel: 'Cancel',
  historyViewFuel: 'View in Fuel',
  historySetCount: '{{count}} sets',
  historySetCountOne: '1 set',
  historyOpenLog: 'Open log: {{name}}',
  historyEdit: 'Edit',
  historyEditSave: 'Save',
  historyEditCancel: 'Cancel',
  historyEditConfirmTitle: 'Save these changes?',
  historyEditConfirmDesc:
    'This updates the session you logged. Coach and History will use the new numbers. The session is not deleted.',
  historyEditConfirm: 'Save changes',
  historyEditEmpty: 'Nothing to save',
  historyEditEmptyDesc: 'Empty invents nothing — this session stays as it was.',
  historyAddSet: 'Add set',
  historyRemoveSet: 'Remove',
  historyTableTime: 'Time',
  historyTableVest: '+kg',
  historyTableAssist: 'Assist',
  historyTableLogged: 'Logged',
  historyBackfill: 'Log a past session',
  historyBackfillTitle: 'Log a past session',
  historyBackfillDesc:
    'If you trained and never opened the app, log that session with the date it happened. Empty invents nothing.',
  historyBackfillSave: 'Save',
  historyBackfillCancel: 'Cancel',
  historyBackfillEmpty: 'Nothing to save',
  historyBackfillEmptyDesc: 'Empty invents nothing — pick a date and the sets you remember.',
  historyBackfillDate: 'Date',
  historyBackfillName: 'Name',
  historyBackfillNamePlaceholder: 'Workout',
  historyBackfillTiming: 'Use start and end time',
  historyBackfillTimingOff: 'Timing is off — duration is omitted. The date still stands.',
  historyBackfillStart: 'Start',
  historyBackfillEnd: 'End',
  historyBackfillAddExercise: 'Add exercise',
  historyBackfillRemoveExercise: 'Remove',
  historyMerge: 'Merge duplicate exercises',
  historyMergeTitle: 'Merge duplicate exercises',
  historyMergeDesc:
    'If you logged the same movement under two names, pick which name to keep. This cannot be undone.',
  historyMergeSource: 'Move data from',
  historyMergeKeeper: 'Keep this name',
  historyMergeSearch: 'Search a name…',
  historyMergeSelected: 'Selected: {{name}}',
  historyMergeEmptyPick: 'No matches',
  historyMergeContinue: 'Continue',
  historyMergeCancel: 'Cancel',
  historyMergeConfirmTitle: 'Merge these names?',
  historyMergeConfirmDesc:
    'All history, PRs, notes, tags, rest, and 1RM from {{source}} move onto {{keeper}}. This cannot be undone.',
  historyMergeConfirm: 'Merge — cannot be undone',
  historyMergeEmpty: 'Nothing to merge',
  historyMergeEmptyDesc:
    'Empty invents nothing — pick two different names that already exist.',
  historyMergeDone: 'Merged',
  historyMergeDoneDesc: 'History, PRs, notes, and rest now use the name you kept.',
  historyDelete: 'Delete this session',
  historyDeleteConfirmTitle: 'Delete this session?',
  historyDeleteConfirmDesc:
    'This session leaves History. Restore it from Deleted sessions. Other days stay.',
  historyDeleteConfirm: 'Delete this session',
  historyDeleteCancel: 'Cancel',
  historyRestore: 'Restore this session',
  historyRestoreOpen: 'Deleted sessions',
  historyRestoreTitle: 'Deleted sessions',
  historyRestoreDesc:
    'Restore a session you deleted. Empty invents nothing. A live workout is not this.',
  historyNameLabel: 'Name this session',
  historyNameSave: 'Save name',
  historyStartFrom: 'Start history from this date',
  historyStartFromTitle: 'Start history from this date',
  historyStartFromDesc:
    'Week strip, Coach, and streak start here. Older sessions stay in History. Empty invents nothing.',
  historyStartFromDate: 'Date',
  historyStartFromApply: 'Start history from this date',
  historyStartFromClear: 'Show the full diary',
  historyStartFromActive: 'Week 1 starts {{date}}. Older days stay in History.',
  historyStartFromEmpty: 'Nothing to fold',
  historyStartFromEmptyDesc: 'Empty invents nothing — pick a date that is not in the future.',
  historyStartFromConfirmTitle: 'Fold older days out of week 1?',
  historyStartFromConfirmDesc:
    'This folds {{count}} training days out of the week strip, Coach, and streak. Sessions stay in History.',
  historyStartFromConfirm: 'Fold — sessions stay',
  historyStartFromCancel: 'Cancel',
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
