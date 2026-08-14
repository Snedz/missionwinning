/**
 * The Athlete Page and the Account split — merged into `common`.
 *
 * `.606` split `/profile` in two: the settings became `/account`, and `/profile`
 * became the record the nav label "You" always claimed
 * (docs/IDENTITY_SOCIAL_PLAN.md S2). Both halves are new user-facing surface, so
 * both need catalog entries rather than inline `defaultValue` alone —
 * `i18n-coverage.ts` runs at a cap of **0** since `.596`, and an uncovered key
 * fails the gate on the commit that introduces it.
 *
 * Same English-first `Record<string, string>` shape as
 * [`notificationLocales`](./notificationLocales.ts): every language falls back to
 * `EN`, so a language can carry the lines that matter to it without a fifteen-way
 * pass blocking the wave. The beachhead languages (es/fr/pt) are translated here;
 * the rest inherit English until a translation pass reaches them, which
 * `i18n:parity` permits for a non-core namespace and reports rather than fails.
 *
 * **Register note.** These strings are counts, never verdicts. "Volume moved",
 * not "score"; "Best week", not "rank". `dayReview.ts` holds a standing ruling
 * against a 0–100 judgment and CLUB_PLAN keeps the odometer framing — a label
 * here that implied a grade would quietly reopen both.
 */

const ATHLETE_EN: Record<string, string> = {
  // --- /profile — the Athlete Page ---
  athletePageTitle: 'You',
  athletePageSubtitle: 'Authored here. Counted honestly. Yours on this device.',
  athletePageSettingsLink: 'Account & settings',

  // --- Identity ---
  athleteIdentityTitle: 'Call sign',
  athleteIdentityNameLabel: 'Name',
  athleteIdentityNumber: 'Number',
  athleteIdentityNumberNone: '—',
  athleteIdentityHeroEmpty: 'Pick a call sign',
  athleteIdentitySave: 'Save',
  athleteIdentityEdit: 'Edit call sign',
  athleteIdentitySince: 'Training here since {{date}}',
  athleteIdentityNoStart: 'Your first logged session starts the record.',
  athleteIdentitySaved: 'Saved on this device.',
  athleteIdentityRejectEmpty: 'Pick a call sign first.',
  athleteIdentityRejectLong: 'Too long — 24 characters at most.',
  athleteIdentityRejectReserved:
    'That one reads as the app or its staff. Pick something that is yours.',
  athleteIdentityRejectLink: 'No links or addresses in a call sign.',
  athleteIdentityRejectUnsafe:
    'That contains characters that break a shared list. Try letters and numbers.',

  // --- The line ---
  careerLineTitle: 'Your record',
  careerLineEmpty:
    'Log a session and this fills in — sessions, volume moved, exercises, your best week, days trained.',
  careerSignature: '{{sessions}} sessions · best week {{bestWeek}} · {{days}} days',
  careerLineSessions: 'Sessions',
  careerLineVolume: 'Volume moved',
  careerLineExercises: 'Exercises',
  careerLineBestWeek: 'Best week',
  careerLineDays: 'Days trained',

  // --- The table (S3 MySpace interests) ---
  athleteTableTitle: 'About training',
  athleteTableBody: 'Who you are as an athlete — picks only, stays on this device.',
  athleteTableEdit: 'Edit table',
  athleteTableUnset: '—',
  athleteTableSave: 'Save',
  athleteTableSaved: 'Saved on this device.',
  athleteTableRow_trainingStyle: 'Training style',
  athleteTableRow_homeGym: 'Home gym',
  athleteTableRow_goToLift: 'Go-to lift',
  athleteTableRow_workingOn: 'Currently working on',
  // picks — keys match AthleteTableCard pickLabelKey (hyphens → underscores)
  athleteTablePick_trainingStyle_strength: 'Strength',
  athleteTablePick_trainingStyle_hybrid: 'Hybrid',
  athleteTablePick_trainingStyle_conditioning: 'Conditioning',
  athleteTablePick_trainingStyle_bodyweight: 'Bodyweight',
  athleteTablePick_trainingStyle_power: 'Power',
  athleteTablePick_homeGym_full_gym: 'Full gym',
  athleteTablePick_homeGym_rack_bars: 'Rack + bars',
  athleteTablePick_homeGym_dumbbells: 'Dumbbells',
  athleteTablePick_homeGym_bands: 'Bands',
  athleteTablePick_homeGym_bodyweight_only: 'Bodyweight only',
  athleteTablePick_homeGym_travel: 'Hotel / travel',
  athleteTablePick_goToLift_squat: 'Squat',
  athleteTablePick_goToLift_deadlift: 'Deadlift',
  athleteTablePick_goToLift_bench: 'Bench',
  athleteTablePick_goToLift_press: 'Press',
  athleteTablePick_goToLift_pull_up: 'Pull-up',
  athleteTablePick_goToLift_row: 'Row',
  athleteTablePick_goToLift_other_compound: 'Other compound',
  athleteTablePick_workingOn_strength: 'Strength',
  athleteTablePick_workingOn_hypertrophy: 'Hypertrophy',
  athleteTablePick_workingOn_conditioning: 'Conditioning',
  athleteTablePick_workingOn_skill: 'Skill',
  athleteTablePick_workingOn_consistency: 'Consistency',
  athleteTablePick_workingOn_comeback: 'Comeback',

  // --- Page kits (S3b) ---
  athleteKitTitle: 'Page kit',
  athleteKitBody: 'How this page is laid out. Training unlocks more kits.',
  athleteKitSaved: 'Layout saved on this device.',
  athleteKitLocked: 'T{{tier}}',
  athleteKit_default: 'Stack',
  athleteKit_field: 'Field',
  athleteKit_ledger: 'Ledger',
  athleteKit_poster: 'Poster',

  // --- Share page + private note (.623) ---
  athletePageShareTitle: 'Share page',
  athletePageShareBody:
    'Renders on this device and leaves only if you send it. No public link yet.',
  athletePageShareAction: 'Share your page',
  athletePageShareBusy: 'Preparing…',
  athletePageShareText: 'My Athlete Page — Mission Winning.',
  athletePrivateNoteTitle: 'Private note',
  athletePrivateNoteBody: 'For you only on this device. Never on share cards or public pages.',
  athletePrivateNoteSave: 'Save note',
  athletePrivateNoteSaved: 'Saved on this device only.',

  // --- /account ---
  accountEyebrow: 'Account',
  accountTitle: 'Settings',
  accountSubtitle:
    'Sign-in, units, notifications and backup. Progress stays on this device unless you sign in.',
  accountPrimaryHint: 'What you need day to day',
  accountMoreSettings: 'More settings',
  accountOwnerSection: 'Owner tools',
  navAccount: 'Account',
  moreAccountDesc: 'Settings, notifications, backup',
  transparencyEyebrow: 'Account',
  transparencyTitle: 'Visibility',
  transparencySubtitle:
    'See if anything is limited, the exact reason, and download the full report (JSON + text).',
  transparencyDownloadJson: 'Download JSON',
  transparencyDownloadText: 'Download text',
  transparencyCardTitle: 'Visibility',
  transparencyCardLead:
    'See if anything is limited and why. Under the Hood publishes Mission Points boosts and visibility filters. Download includes both, plus labels on this athlete.',
  transparencyCardOpen: 'Open Visibility',
  transparencyEarnTitle: 'Earn table (live local XP)',
  transparencyEarnEvent: 'Event',
  transparencyEarnPoints: 'Points',
  transparencyEarnCap: 'Cap',
  transparencyStatusOpen: 'Not limited',
  transparencyStatusGated: 'Limited',
  transparencyStatusHidden: 'Hidden',
  transparencyStatusLimited: 'Limited',
  transparencyStatusSkipped: 'Skipped',
  transparencyStatusInfo: 'Explained',
  transparencyBackAccount: 'Back to Account',
  transparencyNoLimits: 'No limits apply',
  transparencyLimitsApply: '{{count}} limits apply',
  hoodEyebrow: 'Account',
  hoodPageTitle: 'Under the Hood',
  hoodKicker: 'Mission Winning',
  hoodTitle: 'Scoring weights',
  hoodSubtitle:
    'Published Mission Points (what this device awards) and visibility filters. Filters never debit points.',
  hoodBoosts: 'Boosts',
  hoodBoostsPlanned: 'Boosts (Club ledger — planned)',
  hoodPenalties: 'Penalties',
  hoodCardOpen: 'Under the Hood',
  hoodPenaltyNote:
    'Report, mute, block, and hide are visibility filters. They do not debit Mission Points.',
  hoodServerHelp:
    'How to post well in Mission Server: replies from people you trained with beat likes. Likes are weak.',

  homeGymKitTitle: 'Home gym kit',
  homeGymKitBody:
    'List what you actually have. Free, stays on this device. Leave this unset if you train at a full gym.',
  homeGymKitItem_barbell: 'Barbell',
  homeGymKitItem_rack: 'Rack',
  homeGymKitItem_plates: 'Plates',
  homeGymKitItem_dumbbells: 'Dumbbells',
  homeGymKitItem_pull_up_bar: 'Pull-up bar',
  homeGymKitItem_floor: 'Floor',

  // --- Founder status (owner tools) ---
  founderStatusTitle: 'Mission status',
  founderStatusBuild: 'Build',
  founderStatusFreeLogger: 'Free logger',
  founderStatusFreeLoggerValue: 'Never gated',
  founderStatusOpsHint:
    'Project diary, strategy memos, and agent handoff live in private Mission Control on your machine — not in this app (keeps war-room content off production).',
  founderStatusOpsCmd: 'npm run ops:dashboard\n# → http://localhost:5173',
  founderStatusFoot:
    'Beta funnel metrics stay in the panel above when signed in. Ship history: root LOG.md · status: CONTEXT.md.',
};

const al = (over: Record<string, string>): Record<string, string> => ({
  ...ATHLETE_EN,
  ...over,
});

const BY_LANG: Record<string, Record<string, string>> = {
  en: ATHLETE_EN,
  es: al({
    athletePageTitle: 'Tú',
    athletePageSubtitle: 'Escrito aquí. Contado con honestidad. Tuyo en este dispositivo.',
    athletePageSettingsLink: 'Cuenta y ajustes',
    athleteIdentityTitle: 'Indicativo',
    athleteIdentityNameLabel: 'Nombre',
    athleteIdentityNumber: 'Número',
    athleteIdentityNumberNone: '—',
    athleteIdentityHeroEmpty: 'Elige un indicativo',
    athleteIdentitySave: 'Guardar',
    athleteIdentitySince: 'Entrenando aquí desde {{date}}',
    athleteIdentityNoStart: 'Tu primera sesión registrada abre el registro.',
    athleteIdentitySaved: 'Guardado en este dispositivo.',
    athleteIdentityRejectEmpty: 'Elige primero un indicativo.',
    athleteIdentityRejectLong: 'Demasiado largo: 24 caracteres como máximo.',
    athleteIdentityRejectReserved:
      'Ese parece la app o su equipo. Elige uno que sea tuyo.',
    athleteIdentityRejectLink: 'Sin enlaces ni direcciones en un indicativo.',
    athleteIdentityRejectUnsafe:
      'Contiene caracteres que rompen una lista compartida. Usa letras y números.',
    careerLineTitle: 'Tu registro',
    careerSignature: '{{sessions}} sesiones · mejor semana {{bestWeek}} · {{days}} días',
    careerLineEmpty:
      'Registra una sesión y esto se completa: sesiones, volumen movido, ejercicios, tu mejor semana y días entrenados.',
    careerLineSessions: 'Sesiones',
    careerLineVolume: 'Volumen movido',
    careerLineExercises: 'Ejercicios',
    careerLineBestWeek: 'Mejor semana',
    careerLineDays: 'Días entrenados',
    athleteTableEdit: 'Editar tabla',
    accountEyebrow: 'Cuenta',
    accountTitle: 'Ajustes',
    accountSubtitle:
      'Inicio de sesión, unidades, notificaciones y copia de seguridad. Tu progreso permanece en este dispositivo salvo que inicies sesión.',
    navAccount: 'Cuenta',
    moreAccountDesc: 'Ajustes, notificaciones, copia de seguridad',
    homeGymKitTitle: 'Kit de gimnasio en casa',
    homeGymKitBody:
      'Lista lo que tienes de verdad. Gratis, se queda en este dispositivo. Déjalo sin tocar si entrenas en un gimnasio completo.',
    homeGymKitItem_barbell: 'Barra',
    homeGymKitItem_rack: 'Rack',
    homeGymKitItem_plates: 'Discos',
    homeGymKitItem_dumbbells: 'Mancuernas',
    homeGymKitItem_pull_up_bar: 'Barra de dominadas',
    homeGymKitItem_floor: 'Suelo',
  }),
  fr: al({
    athletePageTitle: 'Toi',
    athletePageSubtitle: 'Écrit ici. Compté honnêtement. À toi, sur cet appareil.',
    athletePageSettingsLink: 'Compte et réglages',
    athleteIdentityTitle: 'Indicatif',
    athleteIdentityNameLabel: 'Nom',
    athleteIdentityNumber: 'Numéro',
    athleteIdentityNumberNone: '—',
    athleteIdentityHeroEmpty: 'Choisis un indicatif',
    athleteIdentitySave: 'Enregistrer',
    athleteIdentitySince: 'Ici à l’entraînement depuis le {{date}}',
    athleteIdentityNoStart: 'Ta première séance enregistrée ouvre le relevé.',
    athleteIdentitySaved: 'Enregistré sur cet appareil.',
    athleteIdentityRejectEmpty: 'Choisis d’abord un indicatif.',
    athleteIdentityRejectLong: 'Trop long — 24 caractères au maximum.',
    athleteIdentityRejectReserved:
      'Celui-là passe pour l’app ou son équipe. Choisis-en un qui soit le tien.',
    athleteIdentityRejectLink: 'Pas de liens ni d’adresses dans un indicatif.',
    athleteIdentityRejectUnsafe:
      'Il contient des caractères qui cassent une liste partagée. Utilise lettres et chiffres.',
    careerLineTitle: 'Ton relevé',
    careerSignature: '{{sessions}} séances · meilleure semaine {{bestWeek}} · {{days}} jours',
    careerLineEmpty:
      'Enregistre une séance et tout se remplit : séances, volume déplacé, exercices, ta meilleure semaine et jours d’entraînement.',
    careerLineSessions: 'Séances',
    careerLineVolume: 'Volume déplacé',
    careerLineExercises: 'Exercices',
    careerLineBestWeek: 'Meilleure semaine',
    careerLineDays: 'Jours d’entraînement',
    athleteTableEdit: 'Modifier le tableau',
    accountEyebrow: 'Compte',
    accountTitle: 'Réglages',
    accountSubtitle:
      'Connexion, unités, notifications et sauvegarde. Ta progression reste sur cet appareil sauf si tu te connectes.',
    navAccount: 'Compte',
    moreAccountDesc: 'Réglages, notifications, sauvegarde',
    homeGymKitTitle: 'Kit de salle à la maison',
    homeGymKitBody:
      'Indique ce que tu as vraiment. Gratuit, reste sur cet appareil. Laisse tel quel si tu t’entraînes en salle complète.',
    homeGymKitItem_barbell: 'Barre',
    homeGymKitItem_rack: 'Rack',
    homeGymKitItem_plates: 'Disques',
    homeGymKitItem_dumbbells: 'Haltères',
    homeGymKitItem_pull_up_bar: 'Barre de traction',
    homeGymKitItem_floor: 'Sol',
  }),
  pt: al({
    athletePageTitle: 'Tu',
    athletePageSubtitle: 'Escrito aqui. Contado com honestidade. Teu neste dispositivo.',
    athletePageSettingsLink: 'Conta e definições',
    athleteIdentityTitle: 'Indicativo',
    athleteIdentityNameLabel: 'Nome',
    athleteIdentityNumber: 'Número',
    athleteIdentityNumberNone: '—',
    athleteIdentityHeroEmpty: 'Escolhe um indicativo',
    athleteIdentitySave: 'Guardar',
    athleteIdentitySince: 'A treinar aqui desde {{date}}',
    athleteIdentityNoStart: 'A tua primeira sessão registada abre o registo.',
    athleteIdentitySaved: 'Guardado neste dispositivo.',
    athleteIdentityRejectEmpty: 'Escolhe primeiro um indicativo.',
    athleteIdentityRejectLong: 'Demasiado longo — 24 caracteres no máximo.',
    athleteIdentityRejectReserved:
      'Esse parece a app ou a equipa. Escolhe um que seja teu.',
    athleteIdentityRejectLink: 'Sem links nem endereços num indicativo.',
    athleteIdentityRejectUnsafe:
      'Contém caracteres que quebram uma lista partilhada. Usa letras e números.',
    careerLineTitle: 'O teu registo',
    careerSignature: '{{sessions}} sessões · melhor semana {{bestWeek}} · {{days}} dias',
    careerLineEmpty:
      'Regista uma sessão e isto preenche-se: sessões, volume movido, exercícios, a tua melhor semana e dias treinados.',
    careerLineSessions: 'Sessões',
    careerLineVolume: 'Volume movido',
    careerLineExercises: 'Exercícios',
    careerLineBestWeek: 'Melhor semana',
    careerLineDays: 'Dias treinados',
    athleteTableEdit: 'Editar tabela',
    accountEyebrow: 'Conta',
    accountTitle: 'Definições',
    accountSubtitle:
      'Início de sessão, unidades, notificações e cópia de segurança. O teu progresso fica neste dispositivo a não ser que inicies sessão.',
    navAccount: 'Conta',
    moreAccountDesc: 'Definições, notificações, cópia de segurança',
    homeGymKitTitle: 'Kit de ginásio em casa',
    homeGymKitBody:
      'Lista o que tens de verdade. Grátis, fica neste dispositivo. Deixa por definir se treinas num ginásio completo.',
    homeGymKitItem_barbell: 'Barra',
    homeGymKitItem_rack: 'Rack',
    homeGymKitItem_plates: 'Discos',
    homeGymKitItem_dumbbells: 'Halteres',
    homeGymKitItem_pull_up_bar: 'Barra de pull-up',
    homeGymKitItem_floor: 'Chão',
  }),
};

export function athleteStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en!;
}

export function mergeAthleteStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, athleteStringsFor(lang));
}
