/** Programs page filter chip labels + catalog — merged into i18n `common` namespace. */

const PROGRAMS_EN: Record<string, string> = {
  programsEyebrow: 'Programs',
  programsCatalogIntro:
    'Specialist education outlines below. Free core tools live in Learn and the public guide. Super Bundle unlocks full premium depth.',
  /** Free-beta: no Super Bundle pitch (pack would override a freeBeta defaultValue). */
  programsCatalogIntroOpenBeta:
    'Specialist education outlines below. Free core tools live in Learn and the public guide.',
  programsCurriculumOutline: 'Curriculum outline',
  programsModuleLabel: 'Module {{n}}',
  programsFreeNote: 'Free education path',
  programsNoMatchTitle: 'No programs match those filters',
  programsNoMatchBody:
    'Nothing in the catalog fits that combination of goal and equipment yet. Clear the filters to see all programs.',
  programsClearFilters: 'Clear filters',
  programsFilterGoal: 'Filter by goal:',
  programsFilterEquip: 'Equipment:',
  programsGoalAll: 'All',
  programsGoalHypertrophy: 'Hypertrophy',
  programsGoalCorrective: 'Corrective',
  programsGoalStrengthBusiness: 'Strength/Business',
  programsGoalConditioning: 'Conditioning',
  programsEquipAll: 'All',
  programsEquipBodyweight: 'Bodyweight/Minimal',
  programsEquipGym: 'Gym/Barbell',
  programsWhatYouGet: 'What you get',
  programsBundleNote: 'Free intro — full in Super Bundle',
  programsDownloadSummary: 'Download summary',
  /** Paid foot merch — muted in free beta. */
  programsFootBundle:
    'Bundle all programs for significant discount (coming soon). Existing purchasers get notified of updates.',
  programsFootOpenBeta:
    'Education outlines for every track. Free core paths live in Learn — share feedback if something is unclear.',
  progPtTitle: 'Elite Personal Training Education + Nutrition',
  progPtPrice: '$497',
  progPtDuration: 'Self-paced • ~40 hours core content',
  progPtBullet1:
    'Complete practical curriculum covering assessment, program design, periodization, coaching skills',
  progPtBullet2:
    'Integrated nutrition module (macros, client eating psychology, contest prep basics)',
  progPtBullet3: '50+ ready-to-use templates (strength, hypertrophy, fat loss, corrective)',
  progPtBullet4: 'Business basics: how to actually get and keep clients',
  progPtBullet5: 'Premium unlocks in Mission Winning (advanced programming, nutrition planner)',
  /** Free-beta: no premium merch in education bullets (depth already open). */
  progPtBullet5OpenBeta:
    'Advanced programming and nutrition planner tools in the app',
  progPtBullet6: 'Certificate of Educational Achievement upon completion review',
  progPtDisclaimer:
    'This is premium education and skill development. Not a replacement for an accredited certification from an issuing body.',
  progBbTitle: 'Bodybuilding Specialist Exercises & Programming',
  progBbPrice: '$297',
  progBbDuration: 'Self-paced',
  progBbBullet1: 'Exercise execution masterclass (hundreds of variations)',
  progBbBullet2: 'Hypertrophy science + application',
  progBbBullet3: 'Specialization techniques, weak point training, posing integration',
  progBbBullet4: 'Full contest prep periodization (offseason → peak week)',
  progBbBullet5: 'Direct templates for the Log app',
  progBbBullet6: 'Nutrition for muscle gain & stage conditioning',
  progBbDisclaimer:
    'Educational program. We do not issue pro cards or official bodybuilding certifications.',
  progCorrTitle: 'Corrective Exercise Specialist',
  progCorrPrice: '$347',
  progCorrDuration: 'Self-paced + practical application',
  progCorrBullet1: 'Movement assessment system you can use on day 1',
  progCorrBullet2: 'Corrective exercise library mapped to common dysfunctions',
  progCorrBullet3: 'How to layer correctives into real strength programs without regression',
  progCorrBullet4: 'Case studies and client communication frameworks',
  progCorrBullet5: 'Progress tracking inside the Log for you and clients',
  progCorrDisclaimer:
    'This is continuing education for coaches and serious lifters. Not a medical license or physical therapy degree.',
  progBizTitle: 'Strength Business of Personal Training',
  progBizPrice: '$397',
  progBizDuration: 'Self-paced + templates',
  progBizBullet1:
    'Multiple proven programming systems (5x5, Texas, DUP, block, etc.) with exact progressions',
  progBizBullet2: 'How to sell, price, and deliver online & in-person coaching profitably',
  progBizBullet3: 'Client onboarding, retention, and results systems',
  progBizBullet4: 'Scaling to group programs, online, or your own facility',
  progBizBullet5: 'Premium business features inside Mission Winning',
  progBizBullet5OpenBeta: 'Business tools for coaches in the app',
  progBizDisclaimer:
    'Business and programming education. Success depends on execution, market, and effort.',
  progOnlineTitle: 'Online Coaching Mastery',
  progOnlinePrice: '$297',
  progOnlineDuration: 'Self-paced',
  progOnlineBullet1: 'How to run high-touch online coaching at scale',
  progOnlineBullet2: 'Communication systems, check-in protocols, habit coaching',
  progOnlineBullet3: 'Tech stack recommendations and automation',
  progOnlineBullet4: 'Ethics, boundaries, and long-term client relationships',
  progOnlineDisclaimer: 'Practical education for coaches. Not legal or medical advice.',
  progCondTitle: 'Conditioning Specialist',
  progCondPrice: '$247',
  progCondDuration: 'Self-paced',
  progCondBullet1: 'Energy system development for athletes and general population',
  progCondBullet2: 'Conditioning protocols that complement (not destroy) strength',
  progCondBullet3: 'HWPO-inspired high-volume blocks + recovery management',
  progCondBullet4: 'Test protocols and Log-based conditioning tracking',
  progCondDisclaimer:
    'Educational content for training professionals and dedicated athletes.',
  programsShareFeedback: 'Share feedback',
};

const PROGRAMS_ES: Record<string, string> = {
  ...PROGRAMS_EN,
  programsFilterGoal: 'Filtrar por objetivo:',
  programsFilterEquip: 'Equipo:',
  programsGoalAll: 'Todos',
  programsGoalHypertrophy: 'Hipertrofia',
  programsGoalCorrective: 'Correctivo',
  programsGoalStrengthBusiness: 'Fuerza/Negocio',
  programsGoalConditioning: 'Acondicionamiento',
  programsEquipBodyweight: 'Peso corporal/Mínimo',
  programsEquipGym: 'Gimnasio/Barra',
  programsWhatYouGet: 'Qué incluye',
  programsBundleNote: 'Intro gratis — completo en Super Bundle',
  programsDownloadSummary: 'Descargar resumen',
  progPtTitle: 'Educación élite en entrenamiento personal + nutrición',
  progBbTitle: 'Ejercicios y programación de culturismo especializado',
  progCorrTitle: 'Especialista en ejercicio correctivo',
};

/** UI chrome + titles; long product bullets stay EN until sales pass. */
function programsUi(
  partial: Partial<Record<string, string>>
): Record<string, string> {
  return { ...PROGRAMS_EN, ...(partial as Record<string, string>) };
}

const BY_LANG: Record<string, Record<string, string>> = {
  en: PROGRAMS_EN,
  es: PROGRAMS_ES,
  fr: programsUi({
    programsFilterGoal: 'Filtrer par objectif :',
    programsFilterEquip: 'Équipement :',
    programsGoalAll: 'Tous',
    programsGoalHypertrophy: 'Hypertrophie',
    programsGoalCorrective: 'Correctif',
    programsGoalStrengthBusiness: 'Force/Business',
    programsGoalConditioning: 'Conditionnement',
    programsEquipBodyweight: 'Poids du corps/Minimal',
    programsEquipGym: 'Salle/Barre',
    programsWhatYouGet: 'Ce que vous obtenez',
    programsBundleNote: 'Intro gratuite — complet dans Super Bundle',
    programsDownloadSummary: 'Télécharger le résumé',
  }),
  pt: programsUi({
    programsFilterGoal: 'Filtrar por objetivo:',
    programsFilterEquip: 'Equipamento:',
    programsGoalAll: 'Todos',
    programsGoalHypertrophy: 'Hipertrofia',
    programsGoalCorrective: 'Corretivo',
    programsGoalStrengthBusiness: 'Força/Negócio',
    programsGoalConditioning: 'Condicionamento',
    programsEquipBodyweight: 'Peso corporal/Mínimo',
    programsEquipGym: 'Academia/Barra',
    programsWhatYouGet: 'O que você recebe',
    programsBundleNote: 'Intro grátis — completo no Super Bundle',
    programsDownloadSummary: 'Baixar resumo',
  }),
  de: programsUi({
    programsFilterGoal: 'Nach Ziel filtern:',
    programsFilterEquip: 'Equipment:',
    programsGoalAll: 'Alle',
    programsGoalHypertrophy: 'Hypertrophie',
    programsGoalCorrective: 'Korrektiv',
    programsGoalStrengthBusiness: 'Kraft/Business',
    programsGoalConditioning: 'Kondition',
    programsEquipBodyweight: 'Körpergewicht/Minimal',
    programsEquipGym: 'Gym/Langhantel',
    programsWhatYouGet: 'Das bekommst du',
    programsBundleNote: 'Gratis-Intro — voll im Super Bundle',
    programsDownloadSummary: 'Zusammenfassung laden',
  }),
  it: programsUi({
    programsFilterGoal: 'Filtra per obiettivo:',
    programsFilterEquip: 'Attrezzatura:',
    programsGoalAll: 'Tutti',
    programsWhatYouGet: 'Cosa ottieni',
    programsDownloadSummary: 'Scarica riepilogo',
  }),
  ru: programsUi({
    programsFilterGoal: 'Фильтр по цели:',
    programsFilterEquip: 'Оборудование:',
    programsGoalAll: 'Все',
    programsWhatYouGet: 'Что вы получите',
    programsDownloadSummary: 'Скачать сводку',
  }),
  ja: programsUi({
    programsFilterGoal: '目標で絞り込み:',
    programsFilterEquip: '器具:',
    programsGoalAll: 'すべて',
    programsWhatYouGet: '内容',
    programsDownloadSummary: '概要をダウンロード',
  }),
  ko: programsUi({
    programsFilterGoal: '목표별 필터:',
    programsFilterEquip: '장비:',
    programsGoalAll: '전체',
    programsWhatYouGet: '포함 내용',
    programsDownloadSummary: '요약 다운로드',
  }),
  zh: programsUi({
    programsFilterGoal: '按目标筛选：',
    programsFilterEquip: '器械：',
    programsGoalAll: '全部',
    programsWhatYouGet: '你将获得',
    programsDownloadSummary: '下载摘要',
  }),
  th: programsUi({
    programsFilterGoal: 'กรองตามเป้าหมาย:',
    programsFilterEquip: 'อุปกรณ์:',
    programsGoalAll: 'ทั้งหมด',
    programsWhatYouGet: 'สิ่งที่คุณจะได้',
  }),
  vi: programsUi({
    programsFilterGoal: 'Lọc theo mục tiêu:',
    programsFilterEquip: 'Thiết bị:',
    programsGoalAll: 'Tất cả',
    programsWhatYouGet: 'Bạn nhận được',
  }),
  hi: programsUi({
    programsFilterGoal: 'लक्ष्य से फ़िल्टर:',
    programsFilterEquip: 'उपकरण:',
    programsGoalAll: 'सभी',
    programsWhatYouGet: 'आपको मिलेगा',
  }),
  id: programsUi({
    programsFilterGoal: 'Filter berdasarkan tujuan:',
    programsFilterEquip: 'Peralatan:',
    programsGoalAll: 'Semua',
    programsWhatYouGet: 'Yang Anda dapatkan',
  }),
  ar: programsUi({
    programsFilterGoal: 'تصفية حسب الهدف:',
    programsFilterEquip: 'المعدات:',
    programsGoalAll: 'الكل',
    programsWhatYouGet: 'ما ستحصل عليه',
    programsDownloadSummary: 'تحميل الملخص',
  }),
};

export function programsStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeProgramsStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, programsStringsFor(lang));
}

/** EN floors for catalog keys before async i18n hydrate — never paint raw `prog*` keys. */
export function programsEnFloor(key: string): string {
  return PROGRAMS_EN[key] ?? key;
}

/**
 * Free-beta rewrites of pay-merch bullets. Keys that stay product education
 * (e.g. “premium education” disclaimer) are not rewritten.
 */
export const PROGRAMS_FREE_BETA_BULLET_KEYS: Record<string, { openBetaKey: string; en: string }> = {
  progPtBullet5: {
    openBetaKey: 'progPtBullet5OpenBeta',
    en: 'Advanced programming and nutrition planner tools in the app',
  },
  progBizBullet5: {
    openBetaKey: 'progBizBullet5OpenBeta',
    en: 'Business tools for coaches in the app',
  },
};

/** Internal filter values → i18n keys for display labels. */
export const PROGRAM_GOAL_FILTERS = [
  { value: 'All', labelKey: 'programsGoalAll' },
  { value: 'Hypertrophy', labelKey: 'programsGoalHypertrophy' },
  { value: 'Corrective', labelKey: 'programsGoalCorrective' },
  { value: 'Strength/Business', labelKey: 'programsGoalStrengthBusiness' },
  { value: 'Conditioning', labelKey: 'programsGoalConditioning' },
] as const;

export const PROGRAM_EQUIP_FILTERS = [
  { value: 'All', labelKey: 'programsEquipAll' },
  { value: 'Bodyweight/Minimal', labelKey: 'programsEquipBodyweight' },
  { value: 'Gym/Barbell', labelKey: 'programsEquipGym' },
] as const;

export type ProgramCatalogEntry = {
  id: string;
  productId: string;
  titleKey: string;
  priceKey: string;
  durationKey: string;
  bulletKeys: string[];
  disclaimerKey: string;
  goalFilter: string;
  equipFilter: string;
};

export const PROGRAM_CATALOG: ProgramCatalogEntry[] = [
  {
    id: 'pt-education',
    productId: 'pt-nutrition',
    titleKey: 'progPtTitle',
    priceKey: 'progPtPrice',
    durationKey: 'progPtDuration',
    bulletKeys: [
      'progPtBullet1',
      'progPtBullet2',
      'progPtBullet3',
      'progPtBullet4',
      'progPtBullet5',
      'progPtBullet6',
    ],
    disclaimerKey: 'progPtDisclaimer',
    goalFilter: 'Strength/Business',
    equipFilter: 'Gym/Barbell',
  },
  {
    id: 'bodybuilding',
    productId: 'bodybuilding',
    titleKey: 'progBbTitle',
    priceKey: 'progBbPrice',
    durationKey: 'progBbDuration',
    bulletKeys: [
      'progBbBullet1',
      'progBbBullet2',
      'progBbBullet3',
      'progBbBullet4',
      'progBbBullet5',
      'progBbBullet6',
    ],
    disclaimerKey: 'progBbDisclaimer',
    goalFilter: 'Hypertrophy',
    equipFilter: 'Gym/Barbell',
  },
  {
    id: 'corrective',
    productId: 'corrective',
    titleKey: 'progCorrTitle',
    priceKey: 'progCorrPrice',
    durationKey: 'progCorrDuration',
    bulletKeys: [
      'progCorrBullet1',
      'progCorrBullet2',
      'progCorrBullet3',
      'progCorrBullet4',
      'progCorrBullet5',
    ],
    disclaimerKey: 'progCorrDisclaimer',
    goalFilter: 'Corrective',
    equipFilter: 'Bodyweight/Minimal',
  },
  {
    id: 'strength-business',
    productId: 'strength-business',
    titleKey: 'progBizTitle',
    priceKey: 'progBizPrice',
    durationKey: 'progBizDuration',
    bulletKeys: [
      'progBizBullet1',
      'progBizBullet2',
      'progBizBullet3',
      'progBizBullet4',
      'progBizBullet5',
    ],
    disclaimerKey: 'progBizDisclaimer',
    goalFilter: 'Strength/Business',
    equipFilter: 'Gym/Barbell',
  },
  {
    id: 'online-coaching',
    productId: 'online-coaching',
    titleKey: 'progOnlineTitle',
    priceKey: 'progOnlinePrice',
    durationKey: 'progOnlineDuration',
    bulletKeys: [
      'progOnlineBullet1',
      'progOnlineBullet2',
      'progOnlineBullet3',
      'progOnlineBullet4',
    ],
    disclaimerKey: 'progOnlineDisclaimer',
    goalFilter: 'Strength/Business',
    equipFilter: 'All',
  },
  {
    id: 'conditioning',
    productId: 'conditioning',
    titleKey: 'progCondTitle',
    priceKey: 'progCondPrice',
    durationKey: 'progCondDuration',
    bulletKeys: [
      'progCondBullet1',
      'progCondBullet2',
      'progCondBullet3',
      'progCondBullet4',
    ],
    disclaimerKey: 'progCondDisclaimer',
    goalFilter: 'Conditioning',
    equipFilter: 'Bodyweight/Minimal',
  },
];
