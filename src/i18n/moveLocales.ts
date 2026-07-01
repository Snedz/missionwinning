/** Move pillar UI copy — merged into i18n `common` namespace. */

type MoveStrings = {
  moveTitle: string;
  moveSubtitle: string;
  moveFlowsFree: string;
  moveFlowsPremium: string;
  moveStartFlow: string;
  moveRecentWins: string;
  movePremiumTitle: string;
  movePremiumDesc: string;
  movePremiumBtn: string;
  movePremiumLockedTitle: string;
  movePremiumLockedBody: string;
  moveExploreBundle: string;
};

const en: MoveStrings = {
  moveTitle: 'Move & Mobility',
  moveSubtitle:
    'Free guided flows with timers — bodyweight, global-friendly. Premium adds sports-specific depth (Super Bundle).',
  moveFlowsFree: 'Free mobility flows',
  moveFlowsPremium: 'Premium mobility flows (Super Bundle)',
  moveStartFlow: 'Start Flow',
  moveRecentWins: 'Recent Move Wins',
  movePremiumTitle: 'Premium — Pliability / Skill Yoga depth',
  movePremiumDesc: 'Sports-specific mobility, recovery protocols, and advanced flows.',
  movePremiumBtn: 'Move Premium',
  movePremiumLockedTitle: '+{{count}} Premium Flows',
  movePremiumLockedBody:
    'Unlock sports-specific mobility, prehab circuits, and advanced recovery protocols via the Super Bundle.',
  moveExploreBundle: 'Explore Super Bundle',
};

const es: MoveStrings = {
  ...en,
  moveTitle: 'Mover y movilidad',
  moveSubtitle: 'Flujos guiados gratuitos con temporizador. Premium añade profundidad deportiva.',
  moveStartFlow: 'Iniciar flujo',
  moveRecentWins: 'Victorias recientes de Move',
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
