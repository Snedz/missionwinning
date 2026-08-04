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

  /** Kaizen Loop 5 O2 — Profile backup / account leftovers (.312) */
  backupReading: 'Reading backup…',
  backupRestoring: 'Restoring…',
  importFailed: 'Restore failed',
  importDone: 'Backup restored',
  importDoneDesc: '{{workouts}} workouts merged, {{keys}} settings restored. Reloading…',
  dataBackup: 'Back up your data',
  exportData: 'Download backup (JSON)',
  importData: 'Restore from backup',
  backupDropIdle: 'Drop backup JSON or click to browse',
  backupDropActive: 'Drop to restore',
  backupNeedJson: 'Use a Mission Winning backup JSON file.',
  dataBackupFoot:
    'The backup includes workouts, saved routines, nutrition, and journey progress from this device. Restoring merges — nothing on this device is deleted.',
  account: 'Account',
  signedInAs: 'Signed in as',
  profileFreeBetaFoot: 'Open beta — full tools free while we grow with you. Logger stays free forever.',
  premiumStatusFoot: 'Super Bundle unlocks Coach depth. The free logger is never gated.',
  retake: 'Retake Assessment',
  takeAssessment: 'Take the free Readiness Assessment',
  profileSetupHint: 'Answer a few questions so sessions match your gear (~2 minutes).',
  changeLanguage: 'Change language',
  units: 'Units',
  metric: 'Metric (kg, cm)',
  imperial: 'Imperial (lbs, in)',
  trainingGoals: 'Training Goals',
  saveGoals: 'Save Goals',

  /** Kaizen Loop 6 P1 — Profile privacy / premium / CSV / sync (.313) */
  csvImportFailed: 'Could not read that file',
  csvImportUnrecognized:
    'Expected a Strong or Hevy CSV export. Export from the other app, then drop the file here.',
  csvImportEmpty: 'No workout rows found in the file.',
  csvImportDone: 'History imported',
  csvImportDoneDesc:
    '{{added}} workouts imported ({{duplicates}} already here). Your PRs, 1RM trends and load band now use them. Reloading…',
  csvImportTitle: 'Switching from another app?',
  csvImportSubtitle:
    'Import your Strong or Hevy history from a CSV export. Your records rebuild here in seconds — free, no account needed.',
  csvImportCta: 'Import CSV (Strong / Hevy)',
  csvImportDropIdle: 'Drop a Strong or Hevy CSV or click to browse',
  csvImportDropActive: 'Drop to import',
  csvImportNeedCsv: 'Use the CSV export from Strong or Hevy.',
  premiumStatus: 'Premium Status',
  premiumUnlocked: '✓ Premium unlocked (via Super Bundle or demo request)',
  billingPortalOpening: 'Opening…',
  manageBilling: 'Manage billing',
  noPremium:
    'Free tier active. Unlock full library cues, deep nutrition, mobility flows, mind sessions, advanced programs, and analytics via the Super Bundle or specialist programs.',
  exploreBundle: 'Explore Super Bundle',
  privacyAnalyticsDnt: 'Off — your browser sent Do Not Track.',
  privacyAnalyticsOn: 'On — optional product metrics only (no session replay).',
  privacyAnalyticsOff: 'Off — product analytics disabled on this device.',
  privacyAnalyticsUndecided: 'Not set — no product analytics until you choose.',
  privacyControlsTitle: 'Privacy & analytics',
  privacyControlsLead:
    'Workouts, nutrition, and journey progress stay on this device until you sign in to sync. Product analytics are optional and off until you allow them.',
  privacyAnalyticsStatus: 'Product analytics:',
  privacyKeepPrivate: 'Keep analytics off',
  privacyAllowAnalytics: 'Allow product analytics',
  privacyAnalyticsNotConfigured: 'Product analytics are not configured in this environment.',
  privacyPolicyLink: 'Read the privacy policy',
  syncStorageFull:
    'This device is out of storage space. Export a backup, then clear some space so new sessions save.',
  syncStorageDenied:
    "This browser won't let us save to the device — private browsing does this. Your session works, but it won't be here next time.",
  syncQueuedCount: '{{count}} sessions saved here, waiting to reach your account.',
  syncRetryNow: 'Retry',
  billingPortalError: 'Billing portal',
  billingPortalSignIn: 'Sign in to manage billing.',
  emailNextStepFailed: 'Could not send email',
  profileEyebrow: 'You',
  profileSettings: 'Profile & settings',
  profileCommissionedDay: 'Day {{day}} on the path',
  profileSubtitle:
    'Account, units, and preferences. Progress stays on this device unless you sign in.',

  /** Kaizen Loop 7 Q1 — Profile wearables (.318) */
  wearablesConnected: 'Connected {{provider}}. You can sync now.',
  wearablesOauthResult: 'Wearables: {{code}}',
  wearablesSyncOk: 'Synced {{count}} samples ({{track}} Track activities).',
  wearablesDisconnected: 'Disconnected.',
  wearablesTitle: 'Wearables',
  wearablesLead:
    'Optional. Connect Whoop, Strava, and more when configured. Apple Health and Google Health Connect need the app shell later. Win Score still comes from your logs.',
  wearablesSignIn: 'Sign in to connect wearable accounts.',
  wearablesHubPending: 'Needs thin native shell (coming after TWA / iOS).',
  wearablesBleHint: 'Use live heart rate on the Active workout screen.',
  wearablesNotConfigured: 'Not configured on this server yet.',
  wearablesStatusConnected: 'Connected · last sync {{at}}',
  wearablesStatusAvailable: 'Ready to connect',
  wearablesConnect: 'Connect',
  wearablesSync: 'Sync',
  wearablesDisconnect: 'Disconnect',
  wearablesManualHint: 'No account? Import Apple / Google JSON or CSV on Track.',
  wearablesOpenTrack: 'Open Track',
  retry: 'Retry',
  uploadAlmostDone: 'Almost done…',
  uploadQueued: 'Waiting…',
  uploadFailed: 'Upload failed.',
  uploadDone: 'Done',
  uploadCancel: 'Stop',
  uploadRemove: 'Remove',
  uploadRetry: 'Retry',
  revenueSnapshot: 'Super Bundle Snapshot (Demo)',
  spotsClaimed: 'Members',
  estRevenue: 'Est. revenue from bundles',
  avgTicket: 'Avg bundle ~${{price}}/mo',
  demoAnalytics: 'Demo Analytics (Events)',
  viewEvents: 'View Tracked Events (console)',
  analyticsBannerAria: 'Product analytics preference',
  analyticsBannerBody:
    'Your workouts stay on this device by default. Optional product analytics (no session replay, no autocapture) help improve Mission Winning. You can change this anytime in Profile.',
  analyticsBannerPrivacyLink: 'Privacy policy',
  analyticsBannerStayPrivate: 'Stay private',
  analyticsBannerAllow: 'Allow analytics',
  cancel: 'Cancel',
  save: 'Save',
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
