/** Beta start guide steps — merged into i18n `common` namespace. */

export const BETA_STEP_DEFS = [
  {
    n: 1,
    titleKey: 'betaStep1Title',
    bodyKey: 'betaStep1Body',
    href: '/private',
    ctaKey: 'betaStep1Cta',
  },
  {
    n: 2,
    titleKey: 'betaStep2Title',
    bodyKey: 'betaStep2Body',
    href: '/welcome',
    ctaKey: 'betaStep2Cta',
  },
  {
    n: 3,
    titleKey: 'betaStep3Title',
    bodyKey: 'betaStep3Body',
    href: '/log',
    ctaKey: 'betaStep3Cta',
  },
  {
    n: 4,
    titleKey: 'betaStep4Title',
    bodyKey: 'betaStep4Body',
    href: '/profile',
    ctaKey: 'betaStep4Cta',
  },
  {
    n: 5,
    titleKey: 'betaStep5Title',
    bodyKey: 'betaStep5Body',
    href: '/leaderboard',
    ctaKey: 'betaStep5Cta',
  },
] as const;

const BETA_EN: Record<string, string> = {
  betaStep1Title: 'Unlock access',
  betaStep1Body:
    'Use the private access code from your invite. Enter it on the gate page or append ?access=YOUR_CODE to any URL once.',
  betaStep1Cta: 'Enter access code',
  betaStep2Title: 'Complete I-Day (≈2 min)',
  betaStep2Body: 'Welcome flow sets your goal and equipment. This syncs to your profile when you sign in.',
  betaStep2Cta: 'Start I-Day',
  betaStep3Title: 'Log your first workout',
  betaStep3Body:
    'Today → your next step → Train. One completed session unlocks streak tracking and leaderboard sync.',
  betaStep3Cta: 'Go to Today',
  betaStep4Title: 'Sign in (optional but recommended)',
  betaStep4Body: 'Magic link on Profile keeps journey, workouts, and rankings in the cloud across devices.',
  betaStep4Cta: 'Profile & sign in',
  betaStep5Title: 'Explore rankings',
  betaStep5Body:
    "Six boards including night and early-morning cohorts. Set a squad code to compare with friends.",
  betaStep5Cta: 'Open leaderboard',
  betaNeedLi1: 'Finish I-Day and at least one workout this week',
  betaNeedLi2: 'Try journey phases on Today — dashboard unlocks as you progress',
  betaNeedLi3: 'Report anything confusing via Profile → feedback or reply to your invite email',
};

const BETA_ES: Record<string, string> = {
  ...BETA_EN,
  betaStep1Title: 'Desbloquear acceso',
  betaStep2Title: 'Completa el Día I (≈2 min)',
  betaStep3Title: 'Registra tu primer entrenamiento',
  betaStep3Cta: 'Ir a Hoy',
};

function betaUi(partial: Partial<Record<string, string>>): Record<string, string> {
  return { ...BETA_EN, ...(partial as Record<string, string>) };
}

const BY_LANG: Record<string, Record<string, string>> = {
  en: BETA_EN,
  es: BETA_ES,
  fr: betaUi({
    betaStep1Title: 'Débloquer l’accès',
    betaStep2Title: 'Terminer le I-Day (≈2 min)',
    betaStep3Title: 'Enregistrer votre première séance',
    betaStep3Cta: 'Aller à Aujourd’hui',
    betaStep4Title: 'Se connecter (recommandé)',
    betaStep5Title: 'Explorer les classements',
  }),
  pt: betaUi({
    betaStep1Title: 'Desbloquear acesso',
    betaStep2Title: 'Concluir o I-Day (≈2 min)',
    betaStep3Title: 'Registrar o primeiro treino',
    betaStep3Cta: 'Ir para Hoje',
    betaStep4Title: 'Entrar (recomendado)',
    betaStep5Title: 'Explorar rankings',
  }),
  de: betaUi({
    betaStep1Title: 'Zugang freischalten',
    betaStep2Title: 'I-Day abschließen (≈2 Min)',
    betaStep3Title: 'Erstes Training loggen',
    betaStep3Cta: 'Zu Heute',
    betaStep4Title: 'Anmelden (empfohlen)',
    betaStep5Title: 'Rankings erkunden',
  }),
  it: betaUi({
    betaStep1Title: 'Sblocca l’accesso',
    betaStep3Cta: 'Vai a Oggi',
  }),
  ru: betaUi({
    betaStep1Title: 'Открыть доступ',
    betaStep3Cta: 'К Сегодня',
  }),
  ja: betaUi({
    betaStep1Title: 'アクセスを解除',
    betaStep3Cta: '今日へ',
  }),
  ko: betaUi({
    betaStep1Title: '액세스 잠금 해제',
    betaStep3Cta: '오늘로 이동',
  }),
  zh: betaUi({
    betaStep1Title: '解锁访问',
    betaStep3Cta: '前往今日',
  }),
  th: betaUi({
    betaStep1Title: 'ปลดล็อกการเข้าถึง',
    betaStep3Cta: 'ไปที่วันนี้',
  }),
  vi: betaUi({
    betaStep1Title: 'Mở khóa truy cập',
    betaStep3Cta: 'Đến Hôm nay',
  }),
  hi: betaUi({
    betaStep1Title: 'एक्सेस अनलॉक करें',
    betaStep3Cta: 'आज पर जाएं',
  }),
  id: betaUi({
    betaStep1Title: 'Buka akses',
    betaStep3Cta: 'Ke Hari Ini',
  }),
  ar: betaUi({
    betaStep1Title: 'فتح الوصول',
    betaStep3Cta: 'إلى اليوم',
  }),
};

export function betaStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeBetaStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, betaStringsFor(lang));
}
