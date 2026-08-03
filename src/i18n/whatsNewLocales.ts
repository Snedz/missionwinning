/**
 * What’s New sheet strings — merged into the i18n `common` namespace.
 *
 * D13. English-first `Record` packs (same shape as firstStepsLocales): new keys
 * must exist in EN so `i18n:coverage` does not treat them as uncovered.
 */

const WHATS_NEW_EN: Record<string, string> = {
  whatsNewEyebrow: 'Updates',
  whatsNewTitle: 'What’s new',
  whatsNewDone: 'Got it',
  whatsNewBuildLine: 'Build {{label}}',
  whatsNewCardTitle: 'What’s new',
  whatsNewCardLead: 'Short notes on what changed for athletes — not a changelog dump.',
  whatsNewOpen: 'What’s new',
  whatsNewOpenUnseen: 'See what’s new',
  whatsNewMoreRow: 'What’s new',
  whatsNewMoreUnseen: 'New',

  whatsNewBulletHistoryTitle: 'Exercises in History',
  whatsNewBulletHistoryBody:
    'Open History → Exercises for lift trends without digging through session lists.',
  whatsNewBulletCoachTitle: 'Manage your week from Coach',
  whatsNewBulletCoachBody:
    'Adjust preferred days, regenerate the week, or ask the coach — one sheet on the plan screen.',
  whatsNewBulletJustGoTitle: 'Coach days say the session name',
  whatsNewBulletJustGoBody:
    'When Mission Coach has today’s session, Start names it. Freestyle still says Just Go.',
  whatsNewBulletTrustTitle: 'Straight answers, first steps again',
  whatsNewBulletTrustBody:
    'Landing FAQ opens one question at a time. Under Profile you can bring First Steps back to Today.',

  firstStepsShowAgain: 'Show First Steps again',
  firstStepsShowAgainLead:
    'You hid First Steps from Today. Bring the card back anytime.',
  firstStepsShowAgainDone: 'First Steps will show on Today again.',
};

const wn = (over: Record<string, string>): Record<string, string> => ({
  ...WHATS_NEW_EN,
  ...over,
});

const BY_LANG: Record<string, Record<string, string>> = {
  en: WHATS_NEW_EN,
  es: wn({
    whatsNewEyebrow: 'Novedades',
    whatsNewTitle: 'Qué hay de nuevo',
    whatsNewDone: 'Entendido',
    whatsNewCardTitle: 'Qué hay de nuevo',
    whatsNewOpen: 'Novedades',
    whatsNewOpenUnseen: 'Ver novedades',
    whatsNewMoreRow: 'Novedades',
    whatsNewMoreUnseen: 'Nuevo',
    firstStepsShowAgain: 'Mostrar Primeros pasos otra vez',
  }),
  fr: wn({
    whatsNewEyebrow: 'Mises à jour',
    whatsNewTitle: 'Nouveautés',
    whatsNewDone: 'Compris',
    whatsNewCardTitle: 'Nouveautés',
    whatsNewOpen: 'Nouveautés',
    whatsNewOpenUnseen: 'Voir les nouveautés',
    whatsNewMoreRow: 'Nouveautés',
    whatsNewMoreUnseen: 'Nouveau',
    firstStepsShowAgain: 'Réafficher Premiers pas',
  }),
  pt: wn({
    whatsNewEyebrow: 'Atualizações',
    whatsNewTitle: 'Novidades',
    whatsNewDone: 'Entendi',
    whatsNewCardTitle: 'Novidades',
    whatsNewOpen: 'Novidades',
    whatsNewOpenUnseen: 'Ver novidades',
    whatsNewMoreRow: 'Novidades',
    whatsNewMoreUnseen: 'Novo',
    firstStepsShowAgain: 'Mostrar Primeiros passos de novo',
  }),
  de: wn({
    whatsNewEyebrow: 'Updates',
    whatsNewTitle: 'Neuigkeiten',
    whatsNewDone: 'Verstanden',
    whatsNewCardTitle: 'Neuigkeiten',
    whatsNewOpen: 'Neuigkeiten',
    whatsNewOpenUnseen: 'Neuigkeiten ansehen',
    whatsNewMoreRow: 'Neuigkeiten',
    whatsNewMoreUnseen: 'Neu',
    firstStepsShowAgain: 'Erste Schritte wieder zeigen',
  }),
  it: wn({
    whatsNewEyebrow: 'Aggiornamenti',
    whatsNewTitle: 'Novità',
    whatsNewDone: 'Capito',
    whatsNewCardTitle: 'Novità',
    whatsNewOpen: 'Novità',
    whatsNewOpenUnseen: 'Vedi novità',
    whatsNewMoreRow: 'Novità',
    whatsNewMoreUnseen: 'Nuovo',
    firstStepsShowAgain: 'Mostra di nuovo Primi passi',
  }),
};

export function whatsNewStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en!;
}

export function mergeWhatsNewStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, whatsNewStringsFor(lang));
}
