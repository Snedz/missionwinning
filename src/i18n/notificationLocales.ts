/**
 * What the app says about the notes it sends — merged into `common`.
 *
 * `.243`. English-first `Record<string, string>` per language, the
 * [`firstStepsLocales`](./firstStepsLocales.ts) / [`zeroStateLocales`](./zeroStateLocales.ts)
 * shape, so a language can carry the lines that matter to it without a
 * fifteen-way pass blocking the wave. Every lookup falls back to `EN`.
 *
 * Two reasons this module exists rather than more inline `defaultValue`:
 *
 *   1. `i18n-coverage.ts` fails on any **new** uncovered key, and it has caught
 *      this wave's predecessors twice running.
 *   2. `WindDownOptIn.tsx` was not wired to `useTranslation` **at all** — six
 *      raw string literals in JSX, so the one surface that asks an athlete to
 *      turn notifications *on* was English in fifteen languages. A permission
 *      ask nobody can read is a permission nobody grants.
 *
 * The per-kind trigger lines are the substance. The reminders card said *"Two
 * kinds"* while a signed-in athlete could receive **five** — the two it named,
 * the evening review configured one row below, and the two that ride along with
 * the weekly emails. Naming each one and when it fires is the reference app's
 * one genuinely good structural idea in this batch; it costs nothing but honest
 * copy, because every one of these is a note the app already sends.
 */

const NOTIFICATION_EN: Record<string, string> = {
  // --- /profile → Training reminders, per-kind trigger lines ---
  remindersPushDesc:
    'On this device only — the subscription is tied to this browser, not to your account.',
  remindersKindsLabel: 'What this device will receive',
  remindersKindComeback: 'If you go quiet — one check-in, at your own cadence rather than a fixed day.',
  remindersKindWindDown: 'After a session that ran hotter than your recent usual — one evening note.',
  remindersKindWeekRecap: 'A recap at the end of your first week, with what you logged in it.',
  remindersKindWeekBehind:
    'Near the end of a week where you are short of the target you set — never framed as a deficit.',
  remindersKindsAccountNote: 'The last two need an account, because they are sent alongside an email.',
  // Push dark (no VAPID / private SW) — signed-out athlete still sees a card.
  remindersPushUnavailable:
    'Device notifications are not available on this install yet. When they are, you can turn them on here without an account.',
  remindersPushUnavailableHint:
    'Until then: open Today after a rest day — one next session, no catch-up.',

  // --- wind-down opt-in (was six raw literals in JSX) ---
  windDownAsk: 'Want a heads-up on evenings like this?',
  windDownDesc: 'One note after a session that runs hot. Nothing else, and no account needed.',
  windDownEnable: 'Turn on evening notes',
  windDownInstallFirst: 'Add to Home Screen first',
  windDownNotNow: 'Not now',
  windDownDone: 'Done — you’ll get a note on evenings like this one.',

  /** Kaizen Loop 5 O1 — Profile reminders leftovers (.311) */
  remindersDayReviewDesc:
    'One evening note asking you to look back at the day, at an hour you pick. The review itself is written on this device — the note carries no numbers.',
  remindersDayReviewLabel: 'Evening review time',
  remindersOff: 'Off',
  remindersTitle: 'Training reminders',
  remindersDesc:
    'Occasional emails when you go quiet — never more than one every two days. One-tap unsubscribe in every email.',
  remindersOn: 'On',
  remindersUpdateFailed: 'Could not update reminders',
  remindersUpdateFailedDesc: 'Try again in a moment.',
  remindersPushFailed: 'Could not enable device notifications',
  remindersDayReviewFailed: 'Could not save the evening review time',
};

const nl = (over: Record<string, string>): Record<string, string> => ({
  ...NOTIFICATION_EN,
  ...over,
});

const BY_LANG: Record<string, Record<string, string>> = {
  en: NOTIFICATION_EN,
  es: nl({
    remindersPushDesc:
      'Solo en este dispositivo: la suscripción está ligada a este navegador, no a tu cuenta.',
    remindersKindsLabel: 'Lo que recibirá este dispositivo',
    remindersKindComeback: 'Si te ausentas: un aviso, a tu propio ritmo y no en un día fijo.',
    remindersKindWindDown: 'Tras una sesión más dura de lo habitual: una nota por la tarde.',
    remindersKindWeekRecap: 'Un resumen al final de tu primera semana, con lo que registraste.',
    windDownAsk: '¿Quieres un aviso en tardes como esta?',
    windDownEnable: 'Activar notas de la tarde',
    windDownNotNow: 'Ahora no',
  }),
  fr: nl({
    remindersPushDesc:
      'Sur cet appareil uniquement — l’abonnement est lié à ce navigateur, pas à votre compte.',
    remindersKindsLabel: 'Ce que cet appareil recevra',
    remindersKindComeback: 'Si vous disparaissez : un message, à votre rythme et non à date fixe.',
    remindersKindWindDown: 'Après une séance plus dure que d’habitude : une note le soir.',
    remindersKindWeekRecap: 'Un bilan à la fin de votre première semaine, avec ce que vous avez enregistré.',
    windDownAsk: 'Un mot les soirs comme celui-ci ?',
    windDownEnable: 'Activer les notes du soir',
    windDownNotNow: 'Pas maintenant',
  }),
  pt: nl({
    remindersPushDesc:
      'Apenas neste dispositivo — a inscrição está ligada a este navegador, não à sua conta.',
    remindersKindsLabel: 'O que este dispositivo vai receber',
    remindersKindComeback: 'Se você sumir: um aviso, no seu próprio ritmo e não num dia fixo.',
    remindersKindWindDown: 'Depois de uma sessão mais pesada que o habitual: uma nota à noite.',
    remindersKindWeekRecap: 'Um resumo no fim da sua primeira semana, com o que você registrou.',
    windDownAsk: 'Quer um aviso em noites como esta?',
    windDownEnable: 'Ativar notas da noite',
    windDownNotNow: 'Agora não',
  }),
  de: nl({
    remindersPushDesc:
      'Nur auf diesem Gerät — das Abo hängt an diesem Browser, nicht an deinem Konto.',
    remindersKindsLabel: 'Was dieses Gerät bekommt',
    remindersKindComeback: 'Wenn du still wirst: eine Nachricht, in deinem Rhythmus statt an einem festen Tag.',
    remindersKindWindDown: 'Nach einer Einheit, die härter lief als sonst: eine Notiz am Abend.',
    remindersKindWeekRecap: 'Eine Bilanz am Ende deiner ersten Woche, mit dem, was du erfasst hast.',
    windDownAsk: 'Magst du an Abenden wie diesem einen Hinweis?',
    windDownEnable: 'Abendnotizen einschalten',
    windDownNotNow: 'Jetzt nicht',
  }),
  it: nl({
    remindersPushDesc:
      'Solo su questo dispositivo — l’iscrizione è legata a questo browser, non al tuo account.',
    remindersKindsLabel: 'Cosa riceverà questo dispositivo',
    remindersKindComeback: 'Se sparisci: un messaggio, al tuo ritmo e non in un giorno fisso.',
    remindersKindWindDown: 'Dopo una sessione più dura del solito: una nota la sera.',
    remindersKindWeekRecap: 'Un riepilogo a fine della tua prima settimana, con ciò che hai registrato.',
    windDownAsk: 'Vuoi un avviso nelle sere come questa?',
    windDownEnable: 'Attiva le note della sera',
    windDownNotNow: 'Non ora',
  }),
};

export function notificationStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en!;
}

export function mergeNotificationStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, notificationStringsFor(lang));
}
