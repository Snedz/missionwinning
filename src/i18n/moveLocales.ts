/** Move pillar UI copy — merged into i18n `common` namespace. */

type MoveStrings = {
  moveTitle: string;
  moveSubtitle: string;
  moveStartFlow: string;
  moveRecentWins: string;
  movePremiumTitle: string;
  movePremiumDesc: string;
  movePremiumBtn: string;
  movePremiumLoading: string;
  /** Kaizen Loop 3 M5 — Move page leftovers (.305) */
  moveEyebrow: string;
  moveFreeFlows: string;
  movePremiumFlows: string;
  movePremiumOffline: string;
  movePremiumPreview: string;
  moveEmptyTitle: string;
  moveEmptyDesc: string;
  moveEmptyCta: string;
  movePremiumFetchFailed: string;
  movePremiumFetchFailedDesc: string;
  movePremiumRetry: string;
  movePreviewPlayer: string;
  moveLockedHint: string;
  moveCollections: string;
  moveCollectionEmpty: string;
  moveFreeFlowsCount: string;
  movePremiumFlowsCount: string;
  movePremiumPreviewCount: string;
};

const en: MoveStrings = {
  moveTitle: 'Move & Mobility',
  moveSubtitle:
    'Free guided flows with timers — bodyweight, global-friendly. Premium adds sports-specific depth (Super Bundle).',
  moveStartFlow: 'Start Flow',
  moveRecentWins: 'Recent Move Wins',
  movePremiumTitle: 'Premium — Pliability / Skill Yoga depth',
  movePremiumDesc: 'Sports-specific mobility, recovery protocols, and advanced flows.',
  movePremiumBtn: 'Move Premium',
  movePremiumLoading: 'Loading recovery flows…',
  moveEyebrow: 'Move',
  moveFreeFlows: 'Mobility flows',
  movePremiumFlows: 'More recovery flows',
  movePremiumOffline: 'Premium recovery flows unavailable offline — free flows below still work.',
  movePremiumPreview: 'Premium recovery flows',
  moveEmptyTitle: 'No Move sessions logged yet',
  moveEmptyDesc: 'Start a free mobility flow — your first win shows here.',
  moveEmptyCta: 'Browse free flows',
  movePremiumFetchFailed: 'Could not load premium flows',
  movePremiumFetchFailedDesc: 'Free flows still work. Check your connection and try again.',
  movePremiumRetry: 'Try again',
  movePreviewPlayer: 'Timed cues — Pliability-style recovery flows',
  moveLockedHint:
    'Free tier includes 10 flows. Premium adds 11 longer protocols — post-lift, morning open, low-back friendly, and athlete recovery.',
  moveCollections: 'Collections',
  moveCollectionEmpty: 'No flows in this collection — try All flows.',
  // `n`, not `count` — i18next treats `count` as a plural selector.
  moveFreeFlowsCount: 'Mobility flows ({{n}})',
  movePremiumFlowsCount: 'More recovery flows ({{n}})',
  movePremiumPreviewCount: 'Premium recovery flows ({{n}})',
};

const es: MoveStrings = {
  ...en,
  moveTitle: 'Mover y movilidad',
  moveSubtitle: 'Flujos guiados gratuitos con temporizador. Premium añade profundidad deportiva.',
  moveStartFlow: 'Iniciar flujo',
  moveRecentWins: 'Victorias recientes de Move',
  movePremiumLoading: 'Cargando flujos de recuperación…',
};

const zh: MoveStrings = {
  ...en,
  moveTitle: '移动与灵活性',
  moveStartFlow: '开始流程',
  moveRecentWins: '最近 Move 成就',
};

const id: MoveStrings = {
  ...en,
  moveTitle: 'Gerak & mobilitas',
  moveStartFlow: 'Mulai alur',
  moveRecentWins: 'Kemenangan Move terbaru',
};

const th: MoveStrings = {
  ...en,
  moveTitle: 'การเคลื่อนไหวและความยืดหยุ่น',
  moveStartFlow: 'เริ่มโฟลว์',
  moveRecentWins: 'ชัยชนะ Move ล่าสุด',
};

const ar: MoveStrings = {
  ...en,
  moveTitle: 'الحركة والمرونة',
  moveStartFlow: 'بدء التدفق',
  moveRecentWins: 'انتصارات Move الأخيرة',
};

const LOCALES: Partial<Record<string, MoveStrings>> = { en, es, zh, id, th, ar };

export function moveStringsFor(lang: string): MoveStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeMoveStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, moveStringsFor(lang));
}
