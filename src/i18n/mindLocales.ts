/** Mind pillar UI copy — merged into i18n `common` namespace. */

type MindStrings = {
  mindTitle: string;
  mindSubtitle: string;
  mindGuidedFree: string;
  mindGuidedPremium: string;
  mindRecentWins: string;
  mindPremiumTitle: string;
  mindPremiumDesc: string;
  mindPremiumBtn: string;
  mindPremiumLockedTitle: string;
  mindPremiumLockedBody: string;
  mindExploreBundle: string;
};

const en: MindStrings = {
  mindTitle: 'Mind & Recovery',
  mindSubtitle:
    'Free breathing timer, guided sessions, and daily check-in. Premium unlocks deeper guided libraries (Super Bundle).',
  mindGuidedFree: 'Free guided sessions',
  mindGuidedPremium: 'Premium guided sessions (Super Bundle)',
  mindRecentWins: 'Recent Mind Wins',
  mindPremiumTitle: 'Premium — Calm / Waking Up depth',
  mindPremiumDesc: 'Guided sessions, sleep stories, expert lessons on building resilience.',
  mindPremiumBtn: 'Mind & Recovery Premium',
  mindPremiumLockedTitle: '+{{count}} Premium Sessions',
  mindPremiumLockedBody:
    'Unlock sleep stories, anxiety resets, focus blocks, and deep recovery scans via the Super Bundle.',
  mindExploreBundle: 'Explore Super Bundle',
};

const es: MindStrings = {
  ...en,
  mindTitle: 'Mente y recuperación',
  mindSubtitle: 'Temporizador de respiración y check-in diario gratis. Premium desbloquea meditaciones guiadas.',
  mindRecentWins: 'Victorias recientes de Mind',
};

const zh: MindStrings = {
  ...en,
  mindTitle: '心理与恢复',
  mindRecentWins: '最近 Mind 成就',
};

const id: MindStrings = {
  ...en,
  mindTitle: 'Pikiran & pemulihan',
  mindRecentWins: 'Kemenangan Mind terbaru',
};

const th: MindStrings = {
  ...en,
  mindTitle: 'จิตใจและการฟื้นตัว',
  mindRecentWins: 'ชัยชนะ Mind ล่าสุด',
};

const ar: MindStrings = {
  ...en,
  mindTitle: 'العقل والتعافي',
  mindRecentWins: 'انتصارات Mind الأخيرة',
};

const LOCALES: Partial<Record<string, MindStrings>> = { en, es, zh, id, th, ar };

export function mindStringsFor(lang: string): MindStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeMindStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, mindStringsFor(lang));
}
