/** Leaderboard UI strings — merged into i18n `common` namespace for Tier 1 + Tier 2 langs. */

export type LeaderboardStrings = {
  navLeaderboard: string;
  leaderboardRankings: string;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  leaderboardSync: string;
  leaderboardOperators: string;
  leaderboardYourRank: string;
  leaderboardCallSign: string;
  leaderboardSquadCode: string;
  leaderboardSquadHint: string;
  leaderboardDemoNote: string;
  leaderboardClassHint: string;
  lbScopeGlobal: string;
  lbScopeRegional: string;
  lbScopeNational: string;
  lbScopeLocal: string;
  lbScopeSquad: string;
  lbScopeClass: string;
  lbBoardMissionScore: string;
  lbBoardTrainingStreak: string;
  lbBoardWeeklyVolume: string;
  lbBoardFuelDays: string;
  lbBoardPresidentialFitness: string;
  lbBoardUnderTheStars: string;
  lbBoardDawnsEarlyLight: string;
  lbNightSessions: string;
  lbDawnSessions: string;
  lbYou: string;
  leaderboardEyebrow: string;
  leaderboardLoadError: string;
  leaderboardOffline: string;
  leaderboardLoadErrorDesc: string;
  leaderboardClassEmptyTitle: string;
  leaderboardClassScopeHint: string;
  leaderboardClassEmptyCta: string;
  leaderboardSquadEmptyTitle: string;
  leaderboardClassNote: string;
  lbPacerHint: string;
  lbPacer: string;
  leaderboardSquadEmptyCta: string;
};

const en: LeaderboardStrings = {
  leaderboardSquadEmptyCta: 'Focus squad code',
  navLeaderboard: 'Leaderboard',
  leaderboardRankings: 'Rankings',
  leaderboardTitle: 'Leaderboard',
  leaderboardSubtitle:
    'Compare Mission Operators globally, by region, country, locale, or squad.',
  leaderboardSync: 'Sync',
  leaderboardOperators: 'operators',
  leaderboardYourRank: 'Your rank',
  leaderboardCallSign: 'Call sign',
  leaderboardSquadCode: 'Squad code (for Squad tab)',
  leaderboardSquadHint:
    'Set a squad code above to compare with others using the same code. Try ALPHA or BRAVO to see demo squad members.',
  leaderboardDemoNote:
    'Demo operators fill boards until more members sync. Sign in and tap Sync to publish scores. Rankings also update after workouts when signed in.',
  leaderboardClassHint:
    'PE class code active — squad rankings include classmates who sync while signed in.',
  lbScopeGlobal: 'Global',
  lbScopeRegional: 'Regional',
  lbScopeNational: 'National',
  lbScopeLocal: 'Local',
  lbScopeSquad: 'Squad',
  lbScopeClass: 'Class',
  lbBoardMissionScore: 'Mission Score',
  lbBoardTrainingStreak: 'Training Streak',
  lbBoardWeeklyVolume: 'Weekly Volume',
  lbBoardFuelDays: 'Fuel Days',
  lbBoardPresidentialFitness: 'Presidential Fitness',
  lbBoardUnderTheStars: 'Under the Stars',
  lbBoardDawnsEarlyLight: "By Dawn's Early Light",
  lbNightSessions: 'night sessions',
  lbDawnSessions: 'dawn sessions',
  lbYou: 'You',
  leaderboardEyebrow: 'Leaderboard',
  leaderboardLoadError: 'Could not refresh standings',
  leaderboardOffline: 'You appear offline. Local ranks still show below when available.',
  leaderboardLoadErrorDesc: 'Cloud sync failed. Retry when the network is ready.',
  leaderboardClassEmptyTitle: 'Join a PE class',
  leaderboardClassScopeHint:
    'Join a PE class on /america to see class standings here. Class board uses signed-in fitness test results.',
  leaderboardClassEmptyCta: 'Open America track',
  leaderboardSquadEmptyTitle: 'Add a squad code',
  leaderboardClassNote:
    'Class standings rank best signed-in fitness test per athlete. Demo operators are hidden on this board.',
  lbPacerHint: 'Pacer — a virtual pace-setter, not a real athlete',
  lbPacer: 'Pacer',
};

const es: LeaderboardStrings = {
  ...en,
  navLeaderboard: 'Clasificación',
  leaderboardRankings: 'Rankings',
  leaderboardTitle: 'Clasificación',
  leaderboardSubtitle:
    'Compara operadores globalmente, por región, país, idioma o escuadra.',
  leaderboardSync: 'Sincronizar',
  leaderboardOperators: 'operadores',
  leaderboardYourRank: 'Tu puesto',
  leaderboardCallSign: 'Indicativo',
  leaderboardSquadCode: 'Código de escuadra',
  lbScopeGlobal: 'Global',
  lbScopeRegional: 'Regional',
  lbScopeNational: 'Nacional',
  lbScopeLocal: 'Local',
  lbScopeSquad: 'Escuadra',
  lbBoardUnderTheStars: 'Bajo las estrellas',
  lbBoardDawnsEarlyLight: 'Al amanecer',
};

const fr: LeaderboardStrings = {
  ...en,
  navLeaderboard: 'Classement',
  leaderboardRankings: 'Classement',
  leaderboardTitle: 'Classement',
  leaderboardSubtitle:
    'Comparez les opérateurs mondialement, par région, pays, locale ou escouade.',
  leaderboardSync: 'Synchroniser',
  lbScopeSquad: 'Escouade',
  lbBoardUnderTheStars: 'Sous les étoiles',
  lbBoardDawnsEarlyLight: 'À la première lumière',
};

const ja: LeaderboardStrings = {
  ...en,
  navLeaderboard: 'ランキング',
  leaderboardRankings: 'ランキング',
  leaderboardTitle: 'リーダーボード',
  leaderboardSubtitle: '世界・地域・国・ロケール・スクワッドで比較。',
  leaderboardSync: '同期',
  leaderboardYourRank: 'あなたの順位',
  lbScopeGlobal: '世界',
  lbScopeRegional: '地域',
  lbScopeNational: '国',
  lbScopeLocal: 'ローカル',
  lbScopeSquad: 'スクワッド',
  lbBoardUnderTheStars: '星空の下で',
  lbBoardDawnsEarlyLight: '夜明けの光',
  lbYou: 'あなた',
};

const de: LeaderboardStrings = {
  ...en,
  navLeaderboard: 'Rangliste',
  leaderboardRankings: 'Rangliste',
  leaderboardSync: 'Sync',
  lbBoardUnderTheStars: 'Unter den Sternen',
  lbBoardDawnsEarlyLight: 'Im Morgengrauen',
};

const th: LeaderboardStrings = {
  ...en,
  navLeaderboard: 'อันดับ',
  leaderboardRankings: 'อันดับ',
  leaderboardTitle: 'กระดานอันดับ',
  leaderboardSync: 'ซิงค์',
  lbBoardUnderTheStars: 'ใต้แสงดาว',
  lbBoardDawnsEarlyLight: 'ยามรุ่งอรุณ',
};

const zh: LeaderboardStrings = {
  ...en,
  navLeaderboard: '排行榜',
  leaderboardRankings: '排名',
  leaderboardTitle: '排行榜',
  leaderboardSubtitle: '全球、区域、国家、语言或小队排名对比。',
  leaderboardSync: '同步',
  leaderboardYourRank: '你的排名',
  leaderboardCallSign: '呼号',
  lbScopeGlobal: '全球',
  lbScopeRegional: '区域',
  lbScopeNational: '国家',
  lbScopeLocal: '本地',
  lbScopeSquad: '小队',
  lbBoardMissionScore: '任务分数',
  lbBoardTrainingStreak: '训练连续天数',
  lbBoardWeeklyVolume: '本周训练量',
  lbBoardFuelDays: '营养达标天数',
  lbBoardUnderTheStars: '星空之下',
  lbBoardDawnsEarlyLight: '黎明之光',
  lbYou: '你',
};

const id: LeaderboardStrings = {
  ...en,
  navLeaderboard: 'Papan peringkat',
  leaderboardRankings: 'Peringkat',
  leaderboardTitle: 'Papan peringkat',
  leaderboardSubtitle: 'Bandingkan operator global, regional, negara, locale, atau squad.',
  leaderboardSync: 'Sinkron',
  lbScopeSquad: 'Squad',
  lbBoardUnderTheStars: 'Di bawah bintang',
  lbBoardDawnsEarlyLight: 'Saat fajar',
};

export const LEADERBOARD_LOCALES: Record<string, LeaderboardStrings> = {
  en,
  es,
  fr,
  ja,
  de,
  th,
  zh,
  id,
};

export function leaderboardStringsFor(lang: string): LeaderboardStrings {
  const code = lang.split('-')[0].toLowerCase();
  return LEADERBOARD_LOCALES[code] ?? en;
}

/** Map board id → i18n key suffix (camelCase). */
export const BOARD_I18N_KEY: Record<
  import('@/lib/leaderboard/types').LeaderboardBoardId,
  keyof Pick<
    LeaderboardStrings,
    | 'lbBoardMissionScore'
    | 'lbBoardTrainingStreak'
    | 'lbBoardWeeklyVolume'
    | 'lbBoardFuelDays'
    | 'lbBoardPresidentialFitness'
    | 'lbBoardUnderTheStars'
    | 'lbBoardDawnsEarlyLight'
  >
> = {
  'mission-score': 'lbBoardMissionScore',
  'training-streak': 'lbBoardTrainingStreak',
  'weekly-volume': 'lbBoardWeeklyVolume',
  'fuel-days': 'lbBoardFuelDays',
  'presidential-fitness': 'lbBoardPresidentialFitness',
  'under-the-stars': 'lbBoardUnderTheStars',
  'dawns-early-light': 'lbBoardDawnsEarlyLight',
};

export const SCOPE_I18N_KEY: Record<
  import('@/lib/leaderboard/types').LeaderboardScope,
  keyof Pick<
    LeaderboardStrings,
    | 'lbScopeGlobal'
    | 'lbScopeRegional'
    | 'lbScopeNational'
    | 'lbScopeLocal'
    | 'lbScopeSquad'
    | 'lbScopeClass'
  >
> = {
  global: 'lbScopeGlobal',
  regional: 'lbScopeRegional',
  national: 'lbScopeNational',
  local: 'lbScopeLocal',
  friends: 'lbScopeSquad',
  class: 'lbScopeClass',
};
