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
    href: '/coach',
    ctaKey: 'betaStep4Cta',
  },
  {
    n: 5,
    titleKey: 'betaStep5Title',
    bodyKey: 'betaStep5Body',
    href: '/profile',
    ctaKey: 'betaStep5Cta',
  },
] as const;

/**
 * English beta guide strings — also merged into `BOOTSTRAP_EN` so `/beta` first
 * paint never shows bare keys while hydrateResources is still in flight
 * (dogfood Wave 8 · `.632`).
 */
export const BETA_EN: Record<string, string> = {
  betaFootWedge: 'Train anywhere: log from Today offline — no account required. After your first log, open Mission Coach for a week that adapts from sessions alone.',
  /*
   * Shown while the build ships no service worker, so "log offline" would be a
   * promise the tester can falsify on the first screen they ever see. States the
   * part that is true without one: the store persists locally and every cloud
   * write rides the durable outbox, so an open session survives a signal drop.
   */
  betaFootWedgeNoSw:
    'Train anywhere: log from Today with no account required. Lose signal mid-session and logging keeps going — it syncs when you are back. After your first log, open Mission Coach for a week that adapts from sessions alone.',
  betaStep1Title: 'Enter invite access',
  betaStep1Body:
    'Open /private (or your invite link) and enter the access code from your invite email. Query ?access= is off in production — type the code on the gate page.',
  betaStep1Cta: 'Enter access code',
  betaStep2Title: 'Complete I-Day (≈2 min)',
  betaStep2Body: 'Welcome flow sets your goal and equipment. This syncs to your profile when you sign in.',
  betaStep2Cta: 'Start I-Day',
  betaStep3Title: 'Log your first workout',
  betaStep3Body:
    'Today → your next step → Train. One completed session unlocks streaks and Mission Coach adaptation.',
  betaStep3Cta: 'Go to Today',
  betaStep4Title: 'Open Mission Coach',
  betaStep4Body:
    'After your first log, open Coach to see this week’s plan adapt from your sessions alone — no wearable required.',
  betaStep4Cta: 'Open Mission Coach',
  betaStep5Title: 'Sign in (optional but recommended)',
  betaStep5Body: 'Magic link on Profile keeps journey, workouts, and Coach plans in the cloud across devices.',
  betaStep5Cta: 'Profile & sign in',
  betaNeedLi1: 'Finish I-Day and at least one workout this week',
  betaNeedLi2: 'Open Mission Coach after your first log — does the week feel useful?',
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
    betaStep4Title: 'Ouvrir Mission Coach',
    betaStep4Cta: 'Ouvrir Mission Coach',
    betaStep5Title: 'Se connecter (recommandé)',
    betaStep5Cta: 'Profil & connexion',
  }),
  pt: betaUi({
    betaStep1Title: 'Desbloquear acesso',
    betaStep2Title: 'Concluir o I-Day (≈2 min)',
    betaStep3Title: 'Registrar o primeiro treino',
    betaStep3Cta: 'Ir para Hoje',
    betaStep4Title: 'Abrir Mission Coach',
    betaStep4Cta: 'Abrir Mission Coach',
    betaStep5Title: 'Entrar (recomendado)',
    betaStep5Cta: 'Perfil e entrar',
  }),
  de: betaUi({
    betaStep1Title: 'Zugang freischalten',
    betaStep2Title: 'I-Day abschließen (≈2 Min)',
    betaStep3Title: 'Erstes Training loggen',
    betaStep3Cta: 'Zu Heute',
    betaStep4Title: 'Mission Coach öffnen',
    betaStep4Cta: 'Mission Coach öffnen',
    betaStep5Title: 'Anmelden (empfohlen)',
    betaStep5Cta: 'Profil & Anmelden',
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
