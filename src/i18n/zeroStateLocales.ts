/**
 * Empty-state, error-recovery and calendar strings — merged into `common`.
 *
 * `.225`. English-first `Record<string, string>` per language, the
 * [`feedbackLocales`](./feedbackLocales.ts) / [`firstStepsLocales`](./firstStepsLocales.ts)
 * shape, so a language can carry the lines that matter to it without a
 * fifteen-way pass blocking the wave. Every lookup falls back to `EN`.
 *
 * These exist as keys at all because `i18n-coverage.ts` fails on any **new**
 * uncovered key — a `t('x', { defaultValue: 'English' })` with no EN pack entry
 * is invisible to translators and renders English in fourteen languages
 * silently. It caught this wave doing exactly that, for the second wave running,
 * which is the ratchet working rather than a nuisance.
 *
 * The calendar strings are the ones that most need translating: a month grid is
 * a screen made almost entirely of chrome.
 */

const ZERO_STATE_EN: Record<string, string> = {
  // --- /history calendar ---
  historyTabCalendar: 'Calendar',
  historyCalendarLabel: 'Training calendar',
  historyCalPrev: 'Previous month',
  historyCalNext: 'Next month',
  historyCalTrained: 'Trained',
  historyCalLogged: 'Logged activity',
  historyCalNothing: 'Nothing logged',
  historyCalSummary: '{{trained}} training days · {{logged}} other logged days',
  historyCalRetention:
    'Workouts are kept forever. Meals and check-ins older than about three months are cleared from this device, so this month may show fewer of those than you logged.',

  // --- /history empty + filter states ---
  historyNoMatchesDesc:
    'Nothing in this range matches that search. Widen the range or clear the search to see everything you have logged.',
  historyClearFilters: 'Clear filters',
  historyNoPillarWins:
    'No pillar wins logged today yet — a mobility flow, a check-in or an assessment all count.',

  // --- /programs filter miss ---
  programsNoMatchTitle: 'No programs match those filters',
  programsNoMatchBody:
    'Nothing in the catalog fits that combination of goal and equipment yet. Clear the filters to see all programs.',
  programsClearFilters: 'Clear filters',

  // --- /learn/course: a failure and an empty catalogue are different facts ---
  learnCourseFetchFailed: 'Courses could not load',
  learnCourseFetchFailedDesc:
    'The specialist catalogue is fetched when you open this page, so this is usually the connection rather than your account.',
  learnCourseRetry: 'Try again',
  learnCourseEmptyTitle: 'No specialist courses yet',
  learnCourseEmptyBeta:
    'The specialist catalogue is still being written. The free learning paths and the guidebook are complete and open to everyone.',
  learnCourseBrowseFree: 'Browse free paths',

  // --- recoverable errors ---
  movePremiumRetry: 'Try again',
  mindPremiumRetry: 'Try again',
};

const zs = (over: Record<string, string>): Record<string, string> => ({
  ...ZERO_STATE_EN,
  ...over,
});

const BY_LANG: Record<string, Record<string, string>> = {
  en: ZERO_STATE_EN,
  es: zs({
    historyTabCalendar: 'Calendario',
    historyCalendarLabel: 'Calendario de entrenamiento',
    historyCalPrev: 'Mes anterior',
    historyCalNext: 'Mes siguiente',
    historyCalTrained: 'Entrenado',
    historyCalLogged: 'Actividad registrada',
    historyCalNothing: 'Sin registro',
    historyCalSummary: '{{trained}} días de entrenamiento · {{logged}} otros días registrados',
    historyClearFilters: 'Borrar filtros',
    programsClearFilters: 'Borrar filtros',
    learnCourseRetry: 'Reintentar',
    movePremiumRetry: 'Reintentar',
    mindPremiumRetry: 'Reintentar',
  }),
  fr: zs({
    historyTabCalendar: 'Calendrier',
    historyCalendarLabel: 'Calendrier d’entraînement',
    historyCalPrev: 'Mois précédent',
    historyCalNext: 'Mois suivant',
    historyCalTrained: 'Entraîné',
    historyCalLogged: 'Activité enregistrée',
    historyCalNothing: 'Rien enregistré',
    historyCalSummary: '{{trained}} jours d’entraînement · {{logged}} autres jours enregistrés',
    historyClearFilters: 'Effacer les filtres',
    programsClearFilters: 'Effacer les filtres',
    learnCourseRetry: 'Réessayer',
    movePremiumRetry: 'Réessayer',
    mindPremiumRetry: 'Réessayer',
  }),
  pt: zs({
    historyTabCalendar: 'Calendário',
    historyCalendarLabel: 'Calendário de treino',
    historyCalPrev: 'Mês anterior',
    historyCalNext: 'Próximo mês',
    historyCalTrained: 'Treinou',
    historyCalLogged: 'Atividade registrada',
    historyCalNothing: 'Nada registrado',
    historyCalSummary: '{{trained}} dias de treino · {{logged}} outros dias registrados',
    historyClearFilters: 'Limpar filtros',
    programsClearFilters: 'Limpar filtros',
    learnCourseRetry: 'Tentar novamente',
    movePremiumRetry: 'Tentar novamente',
    mindPremiumRetry: 'Tentar novamente',
  }),
  de: zs({
    historyTabCalendar: 'Kalender',
    historyCalendarLabel: 'Trainingskalender',
    historyCalPrev: 'Vorheriger Monat',
    historyCalNext: 'Nächster Monat',
    historyCalTrained: 'Trainiert',
    historyCalLogged: 'Aktivität erfasst',
    historyCalNothing: 'Nichts erfasst',
    historyCalSummary: '{{trained}} Trainingstage · {{logged}} weitere erfasste Tage',
    historyClearFilters: 'Filter zurücksetzen',
    programsClearFilters: 'Filter zurücksetzen',
    learnCourseRetry: 'Erneut versuchen',
    movePremiumRetry: 'Erneut versuchen',
    mindPremiumRetry: 'Erneut versuchen',
  }),
  it: zs({
    historyTabCalendar: 'Calendario',
    historyCalendarLabel: 'Calendario di allenamento',
    historyCalPrev: 'Mese precedente',
    historyCalNext: 'Mese successivo',
    historyCalTrained: 'Allenato',
    historyCalLogged: 'Attività registrata',
    historyCalNothing: 'Nulla registrato',
    historyCalSummary: '{{trained}} giorni di allenamento · {{logged}} altri giorni registrati',
    historyClearFilters: 'Azzera i filtri',
    programsClearFilters: 'Azzera i filtri',
    learnCourseRetry: 'Riprova',
    movePremiumRetry: 'Riprova',
    mindPremiumRetry: 'Riprova',
  }),
};

export function zeroStateStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en!;
}

export function mergeZeroStateStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, zeroStateStringsFor(lang));
}
