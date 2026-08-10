/** Landing / marketing page copy — merged into i18n `common` namespace. */

import { isFreeBeta } from '@/lib/freeBeta';

const LANDING_EN: Record<string, string> = {
  compareEyebrow: 'Honest comparison',
  compareTitle: 'How we compare',
  compareSubtitle:
    'Free tiers side by side. We lead with the offline logger and Coach from your logs — not a paywall.',
  compareTableTitle: 'Free tier at a glance',
  landingPillarsQuiet:
    'Fuel, Move, Mind, Track, and Learn deepen the path after Train + Coach — never the pitch.',
  landingAboutLink: 'About Mission Winning',
  // ── Homepage loop rebuild (log → adapt → anywhere → free → start) ──
  landingHeroEyebrowLoop: 'Free · offline · no account',
  landingHeroLine1: 'Log a set.',
  landingHeroLine2: 'Your week rewrites itself.',
  landingHeroSubtitleLoop:
    'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no subscription to start.',
  landingHeroProofLoop: 'Under three minutes to your first logged set.',

  landingAdaptEyebrow: 'When you miss',
  landingAdaptTitle: 'A missed day is not a failed plan',
  landingAdaptBody:
    'Sleep badly, travel, lose a week — Mission Coach reshapes what is left instead of leaving you behind a schedule you already broke.',

  landingAnywhereEyebrow: 'Where you train',
  landingAnywhereTitle: 'Built for one bar of signal and no rack',
  landingAnywhereOfflineH: 'Offline first',
  landingAnywhereOfflineB:
    'Sets save on the device the moment you log them. Signal is optional; the log is not.',
  landingAnywhereGearH: 'Your gear, not a gym',
  landingAnywhereGearB:
    'Tell it what you have — a bar, two bands, nothing — and the week is built from that.',
  landingAnywhereNoSensorH: 'No wearable',
  landingAnywhereNoSensorB:
    'The plan comes from logged sets, so nothing needs charging for it to work.',

  landingFreeTitleLoop: 'Free is the mission, not the trial',
  landingFreeTermLogger: 'The logger',
  landingFreeTermCoach: 'Mission Coach',
  landingFreeTermLibrary: '217 exercises',
  landingFreeTermAccount: 'No account',
  landingFreeCoachLine: 'A week built from your logs, regenerated every week.',

  landingFinalCtaTitleLoop: 'One set is the whole beginning',

  // Hero signature — the log→plan demo (src/components/landing/LogToPlanHero.tsx)
  heroDemoExercise: 'Squat · today',
  heroDemoWhyToday:
    'Last squat session you finished 3 × 12 at 80 kg, so today asks for more load.',
  heroDemoNextSession: 'Next session',
  heroDemoNextWhy: 'one more rep than today, because you finished all three sets.',
  heroDemoLog: 'Log set',
  heroDemoStart: 'Do this with your own numbers',
  heroDemoReplay: 'Replay',
  heroDemoLabel: 'Demo · same engine as the app',

  landingNavPath: 'The path',
  landingNavPillars: 'Pillars',
  landingNavBundle: 'Super Bundle',
  landingNavStart: 'Start free',
  landingNavHome: 'Home',
  navMenuLabel: 'Menu',
  navMenuClose: 'Close menu',
  landingHeroEyebrow: 'Free offline logger · Adaptive AI coach',
  landingHeroTitle1: 'Train anywhere.',
  landingHeroTitle2: 'Win daily.',
  landingHeroSubtitle:
    'Free offline logging (no account) and weekly plans that adapt from your logs alone — no wearable required.',
  landingHeroLibrary: 'Library of 217 free exercise pages — form cues, hubs, and a full foundations guide.',
  landingHeroLibraryCta: 'Browse exercises',
  landingHeroProof: 'Log a set → Coach shapes the week → Win Score ticks.',
  landingSeeHow: 'See how it works',
  landingProofChip: '217 exercises · offline · no account',
  landingProofNoAiKey:
    'Free core needs no AI key. Optional AI coach when enabled.',
  landingTrustInstall: 'Installs like an app',
  landingTrustOffline: 'Trains offline',
  landingTrustLang: '14 languages',
  landingCtaStart: 'Start your path',
  landingCtaBundle: 'Super Bundle',
  landingStatExercises: '217 exercises',
  landingStatOffline: 'Offline PWA',
  landingStatLangs: '14 languages',
  landingStatCore: '$0 core',
  landingStatAccount: 'No account required',
  landingJourneyTitle: 'The member path',
  landingJourneyHeadline1: 'A clear beginning.',
  landingJourneyHeadline2: 'One step at a time.',
  landingJourneyBody:
    'Borrowed from academy onboarding: you always know exactly where you are and what comes next. No wall of features on day one.',
  landingJourneyPhase0Name: 'I-Day',
  landingJourneyPhase0Desc:
    'Three questions — experience, equipment, goal. No account needed. Under three minutes.',
  landingJourneyPhase1Name: 'Basic Training',
  landingJourneyPhase1Desc:
    'One small win in each pillar: first workout, first meal logged, first flow, first breath, first lesson.',
  landingJourneyPhase2Name: 'Readiness',
  landingJourneyPhase2Desc:
    'A health screen, your baseline Win Score, and a seven-day streak. Standards before speed.',
  landingJourneyPhase3Name: 'Commissioned',
  landingJourneyPhase3Desc:
    'Today becomes your command center. One clear action every day, scored across all six pillars.',
  landingCoachDemoTitle: 'Plans that adapt when life happens',
  landingCoachDemoBody:
    'Miss a day, sleep poorly, or crush a PR — Mission Coach reshapes the week without a spreadsheet.',
  landingFreeEyebrow: 'The free core',
  landingFreeTitle1: 'Free is the mission,',
  landingFreeTitle2: 'not the trial.',
  landingFreeBody:
    'The fundamentals that make people healthier should have no price of admission — anywhere in the world. That is the founding promise, written into our vision, and it does not expire.',
  landingFreeVisionLink: 'our vision',
  landingFreeLogger: 'Full workout logger — sets, reps, RPE, rest timers',
  landingFreeLibrary: '217-exercise library — bodyweight and minimal gear first',
  landingFreeOffline: 'Offline PWA — no store, no fees, no account required',
  landingFreeWinScore: 'Win Score from your logs — readiness, strain, recovery',
  landingFreeStatWorkouts: 'Unlimited logs',
  landingFreeStatWorkoutsHint: 'Forever free',
  landingFreeStatLibrary: '217 exercises',
  landingFreeStatLibraryHint: 'Form cues included',
  landingFreeStatOffline: 'Works offline',
  landingFreeStatOfflineHint: 'Install as PWA',
  landingFreeStatScore: 'Win Score',
  landingFreeStatScoreHint: 'Six pillars, one number',
  landingPillarsEyebrow: 'Six pillars',
  landingPillarsTitle: 'Everything reinforces everything.',
  landingPillarsBody:
    'Mobility improves training. Mind improves consistency. Fuel powers results. The Win Score weighs all six — one number for the whole self, not another silo.',
  landingPillarsFree: 'Free',
  landingPillarsBundle: 'Bundle',
  landingPillarsOpen: 'Open {{name}}',
  landingBundleEyebrow: 'The Super Bundle',
  landingBundleTitle1: 'Coach + depth.',
  landingBundleTitle2: 'One subscription.',
  landingBundleBody:
    'Mission Coach weekly plans that adapt from your logs, then deep nutrition, mobility, mind, tracking, and learning — the depth of six tools, priced like one. Free logger stays free. Founding members lock in discounted pricing for good.',
  landingBundlePriceLine: 'From ${{perMonth}}/mo · free core forever',
  landingBundleCta: 'See the bundle',
  landingBundleFoot:
    'The free core never moves behind the bundle. Premium funds the mission — it doesn’t gate it.',
  landingMissionEyebrow: 'Why we build',
  landingMissionQuote:
    '“The right way to build a body and a life should be obvious, doable, and free — for every human on Earth.”',
  landingMissionBody:
    'Mission Winning is the entrance to that path: evidence-based, holistic, habit-first. Showing up for training often brings clearer energy and mood — structured plans beat “just go work out.” Educational fitness only — not medical care.',
  landingMissionLink: 'Read the full vision',
  landingFaqEyebrow: 'Straight answers',
  landingFaqFreeQ: 'Is the free version actually complete?',
  landingFaqFreeA:
    'Yes. The workout tracker, exercise library, program templates, nutrition log, scores, streaks, and leaderboards are free forever, with no account required.',
  landingFaqOfflineQ: 'Does it work offline, in my country, in my language?',
  landingFaqOfflineA:
    'Mission Winning is an installable web app that runs in any modern browser and keeps the core working offline.',
  landingFaqBundleQ: 'What is the Super Bundle?',
  landingFaqBundleA:
    'One subscription that unlocks premium depth across all six pillars — training plans, deep nutrition, mobility, mind, tracking, and specialist programs.',
  landingFaqWhoQ: 'Who is this for?',
  landingFaqWhoA:
    'Anyone who wants a disciplined, evidence-based path — from a garage gym to a park with only floor space.',
  landingFinalCtaTitle: 'The path starts with one workout.',
  landingFinalCtaButton: 'Start free — no account',
  landingFinalCtaFoot: 'Under three minutes to your first session. Nothing to install, nothing to pay.',
  landingCaptureEyebrow: 'Launch list',
  landingCaptureTitle: 'Get launch notes. Stay free forever.',
  landingCaptureBody:
    'One email when we go public, plus rare free-core tips. No spam cadence. Unsubscribe anytime.',
  landingCapturePlaceholder: 'you@email.com',
  landingCaptureButton: 'Notify me',
  landingCaptureSending: 'Saving…',
  landingCaptureDone:
    'You’re on the list. Check your inbox for a confirmation when email is live.',
  landingCapturePrivacy: 'We store your email only for launch updates.',
  landingCaptureInvalid: 'Enter a valid email.',
  landingCaptureError: 'Could not save. Try again.',
  footerTagline: 'Train anywhere. Win daily.',
  footerGroupProduct: 'Product',
  footerGroupLearn: 'Learn',
  footerGroupCompany: 'Company',
  footerGroupLegal: 'Legal',
  footerProductPath: 'The path',
  footerProductPillars: 'Pillars',
  footerProductBundle: 'Super Bundle',
  footerProductCompare: 'Compare',
  footerLearnGuide: 'Guide',
  footerLearnExercises: 'Exercises',
  footerLearnPaths: 'Paths',
  footerLearnBeta: 'Beta guide',
  footerCompanyAbout: 'About',
  footerCompanyVision: 'Vision',
  footerCompanyFeedback: 'Feedback',
  footerLegalPrivacy: 'Privacy',
  footerLegalTerms: 'Terms',
  footerLegalCookies: 'Cookies',
  footerLegalA11y: 'Accessibility',
  footerDisclaimer:
    'Educational fitness tools — not medical advice. Consult a physician before starting any training program.',
  coachDemoTitle: 'Mission Coach',
  coachDemoAdaptedBody:
    'Wednesday is gone, so upper body moved to Thursday and conditioning to Saturday. Same week, same dose.',
  coachDemoPlannedBody: 'Three sessions, spaced from the days you said you can train.',
  coachDemoReset: 'Start over',
  coachDemoMissCta: 'Miss Wednesday',
};

const LANDING_ES: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'El camino',
  landingNavPillars: 'Pilares',
  landingNavBundle: 'Super Bundle',
  landingNavStart: 'Empezar gratis',
  landingNavHome: 'Inicio',
  landingHeroEyebrow: 'Rastreador gratis · PWA offline',
  landingHeroTitle1: 'Entrena en cualquier lugar.',
  landingHeroTitle2: 'Gana a diario.',
  landingHeroSubtitle:
    'El rastreador de entrenamientos gratis que funciona offline — sin cuenta, sin tienda, sin muro de pago en lo básico. Nutrición, movilidad, mente y aprendizaje suman al mismo Win Score.',
  landingHeroLibrary: 'Biblioteca de 217 ejercicios gratis — cues, hubs y guía completa.',
  landingHeroLibraryCta: 'Ver ejercicios',
  landingHeroProof: 'Registra una serie en el demo → el Win Score se mueve. Ese es el bucle.',
  landingSeeHow: 'Cómo funciona',
  landingProofChip: '217 ejercicios · offline · sin cuenta',
  landingProofNoAiKey: 'El core gratis no necesita clave de IA. Coach IA opcional si está activo.',
  landingTrustInstall: 'Se instala como app',
  landingTrustOffline: 'Entrena offline',
  landingTrustLang: '14 idiomas',
  landingCtaStart: 'Comienza tu camino',
  landingStatExercises: '217 ejercicios',
  landingStatOffline: 'PWA offline',
  landingStatLangs: '14 idiomas',
  landingStatCore: 'Núcleo $0',
  landingStatAccount: 'Sin cuenta',
  landingJourneyTitle: 'El camino del miembro',
  landingJourneyHeadline1: 'Un inicio claro.',
  landingJourneyHeadline2: 'Un paso a la vez.',
  landingJourneyBody:
    'Como el onboarding de una academia: siempre sabes dónde estás y qué sigue. Sin muro de funciones el día uno.',
  landingCoachDemoTitle: 'Planes que se adaptan cuando la vida pasa',
  landingCoachDemoBody:
    'Faltas un día, duermes mal o logras un PR — Mission Coach reordena la semana sin hojas de cálculo.',
  landingFreeEyebrow: 'El núcleo gratis',
  landingFreeTitle1: 'Gratis es la misión,',
  landingFreeTitle2: 'no la prueba.',
  landingFreeBody:
    'Los fundamentos que hacen a las personas más sanas no deberían tener precio de entrada — en ningún lugar del mundo.',
  landingFreeVisionLink: 'nuestra visión',
  landingPillarsEyebrow: 'Seis pilares',
  landingPillarsTitle: 'Todo refuerza todo.',
  landingPillarsBody:
    'La movilidad mejora el entrenamiento. La mente mejora la constancia. El fuel impulsa resultados. El Win Score pesa los seis.',
  landingPillarsFree: 'Gratis',
  landingPillarsBundle: 'Bundle',
  landingBundleEyebrow: 'El Super Bundle',
  landingBundleTitle1: 'Seis herramientas premium.',
  landingBundleTitle2: 'Una suscripción.',
  landingBundleCta: 'Ver el bundle',
  landingBundleFoot:
    'El núcleo gratis nunca pasa detrás del bundle. Premium financia la misión — no la bloquea.',
  landingMissionEyebrow: 'Por qué construimos',
  landingMissionLink: 'Lee la visión completa',
  landingFaqEyebrow: 'Respuestas directas',
  landingFaqFreeQ: '¿La versión gratis es realmente completa?',
  landingFaqFreeA:
    'Sí. El rastreador, la biblioteca, plantillas, log de nutrición, scores, rachas y leaderboards son gratis para siempre, sin cuenta.',
  landingFaqOfflineQ: '¿Funciona offline, en mi país y en mi idioma?',
  landingFaqOfflineA:
    'Mission Winning es una web app instalable que corre en cualquier navegador moderno y mantiene el núcleo offline.',
  landingFaqBundleQ: '¿Qué es el Super Bundle?',
  landingFaqBundleA:
    'Una suscripción que desbloquea profundidad premium en los seis pilares.',
  landingFaqWhoQ: '¿Para quién es?',
  landingFaqWhoA:
    'Cualquiera que quiera un camino disciplinado y basado en evidencia — del garage al parque.',
  landingFinalCtaTitle: 'El camino empieza con un entrenamiento.',
  landingFinalCtaButton: 'Empieza gratis — sin cuenta',
  landingFinalCtaFoot: 'Menos de tres minutos a tu primera sesión. Nada que instalar ni pagar.',
  landingCaptureEyebrow: 'Lista de lanzamiento',
  landingCaptureTitle: 'Notas de lanzamiento. Núcleo gratis para siempre.',
  landingCaptureBody:
    'Un email cuando seamos públicos, más tips raros del núcleo gratis. Sin spam. Cancela cuando quieras.',
  landingCapturePlaceholder: 'tu@email.com',
  landingCaptureButton: 'Avísame',
  landingCaptureSending: 'Guardando…',
  landingCaptureDone: 'Estás en la lista. Revisa tu bandeja cuando el email esté activo.',
  landingCapturePrivacy: 'Guardamos tu email solo para actualizaciones de lanzamiento.',
  landingCaptureInvalid: 'Introduce un email válido.',
  landingCaptureError: 'No se pudo guardar. Inténtalo de nuevo.',
  footerTagline: 'Entrena en cualquier lugar. Gana a diario.',
  footerGroupProduct: 'Producto',
  footerGroupLearn: 'Aprende',
  footerGroupCompany: 'Empresa',
  footerGroupLegal: 'Legal',
  footerProductPath: 'El camino',
  footerProductPillars: 'Pilares',
  footerLearnGuide: 'Guía',
  footerLearnExercises: 'Ejercicios',
  footerLearnPaths: 'Rutas',
  footerCompanyAbout: 'Acerca de',
  footerCompanyVision: 'Visión',
  footerCompanyFeedback: 'Feedback',
  footerLegalPrivacy: 'Privacidad',
  footerLegalTerms: 'Términos',
  footerLegalCookies: 'Cookies',
  footerLegalA11y: 'Accesibilidad',
  footerDisclaimer:
    'Herramientas educativas de fitness — no es consejo médico. Consulta a un médico antes de empezar cualquier programa.',
};

/** Brazil wedge — PT-BR style conversion surfaces. */
const LANDING_PT: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'O caminho',
  landingNavPillars: 'Pilares',
  landingNavStart: 'Começar grátis',
  landingNavHome: 'Início',
  landingHeroEyebrow: 'Tracker grátis · PWA offline',
  landingHeroTitle1: 'Treine em qualquer lugar.',
  landingHeroTitle2: 'Vença todo dia.',
  landingHeroSubtitle:
    'O tracker de treinos grátis que funciona offline — sem conta, sem loja, sem paywall no básico. Nutrição, mobilidade, mente e aprendizado somam no mesmo Win Score.',
  landingSeeHow: 'Como funciona',
  landingCtaStart: 'Comece seu caminho',
  landingJourneyTitle: 'O caminho do membro',
  landingJourneyHeadline1: 'Um começo claro.',
  landingJourneyHeadline2: 'Um passo de cada vez.',
  landingFreeEyebrow: 'O núcleo grátis',
  landingFreeTitle1: 'Grátis é a missão,',
  landingFreeTitle2: 'não o trial.',
  landingPillarsEyebrow: 'Seis pilares',
  landingPillarsTitle: 'Tudo reforça tudo.',
  landingBundleEyebrow: 'O Super Bundle',
  landingBundleTitle1: 'Seis ferramentas premium.',
  landingBundleTitle2: 'Uma assinatura.',
  landingBundleCta: 'Ver o bundle',
  landingFinalCtaTitle: 'O caminho começa com um treino.',
  landingFinalCtaButton: 'Comece grátis — sem conta',
  landingCaptureEyebrow: 'Lista de lançamento',
  landingCaptureTitle: 'Receba o lançamento. Núcleo grátis para sempre.',
  landingCaptureBody:
    'Um e-mail quando formos públicos, mais dicas raras do núcleo grátis. Sem spam. Cancele quando quiser.',
  landingCapturePlaceholder: 'voce@email.com',
  landingCaptureButton: 'Me avise',
  landingCaptureDone: 'Você está na lista.',
  landingCapturePrivacy: 'Guardamos seu e-mail só para atualizações de lançamento.',
  footerGroupProduct: 'Produto',
  footerGroupLearn: 'Aprenda',
  footerGroupCompany: 'Empresa',
  footerGroupLegal: 'Legal',
  footerTagline: 'Treine em qualquer lugar. Vença todo dia.',
};

/** LLM-drafted DE — founder review before public flip. */
const LANDING_DE: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'Der Weg',
  landingNavPillars: 'Säulen',
  landingNavStart: 'Kostenlos starten',
  landingNavHome: 'Start',
  landingHeroEyebrow: 'Kostenloser Tracker · Offline-PWA',
  landingHeroTitle1: 'Trainiere überall.',
  landingHeroTitle2: 'Gewinne täglich.',
  landingHeroSubtitle:
    'Der kostenlose Offline-Workout-Tracker — kein Konto, kein App-Store, keine Paywall bei den Basics. Ernährung, Mobility, Mind und Lernen fließen in denselben Win Score.',
  landingSeeHow: 'So funktioniert’s',
  landingCtaStart: 'Starte deinen Weg',
  landingJourneyTitle: 'Der Member-Pfad',
  landingJourneyHeadline1: 'Ein klarer Start.',
  landingJourneyHeadline2: 'Ein Schritt nach dem anderen.',
  landingFreeEyebrow: 'Der Free Core',
  landingFreeTitle1: 'Gratis ist die Mission,',
  landingFreeTitle2: 'nicht die Testphase.',
  landingPillarsEyebrow: 'Sechs Säulen',
  landingPillarsTitle: 'Alles verstärkt alles.',
  landingBundleEyebrow: 'Das Super Bundle',
  landingBundleTitle1: 'Sechs Premium-Tools.',
  landingBundleTitle2: 'Ein Abo.',
  landingBundleCta: 'Bundle ansehen',
  landingFinalCtaTitle: 'Der Weg beginnt mit einem Workout.',
  landingFinalCtaButton: 'Kostenlos starten — kein Konto',
  landingCaptureEyebrow: 'Launch-Liste',
  landingCaptureTitle: 'Launch-News. Kern für immer gratis.',
  landingCaptureButton: 'Benachrichtigen',
  landingCaptureBody:
    'Eine E-Mail zum Public Launch, plus seltene Free-Core-Tipps. Kein Spam. Jederzeit abmelden.',
  landingCapturePlaceholder: 'du@email.com',
  landingCaptureDone: 'Du bist auf der Liste.',
  landingCapturePrivacy: 'Wir speichern deine E-Mail nur für Launch-Updates.',
  footerGroupProduct: 'Produkt',
  footerGroupLearn: 'Lernen',
  footerGroupCompany: 'Unternehmen',
  footerGroupLegal: 'Rechtliches',
  footerTagline: 'Trainiere überall. Gewinne täglich.',
};

/** LLM-drafted FR — founder review before public flip. */
const LANDING_FR: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'Le parcours',
  landingNavPillars: 'Piliers',
  landingNavStart: 'Commencer gratuit',
  landingNavHome: 'Accueil',
  landingHeroEyebrow: 'Tracker gratuit · PWA hors ligne',
  landingHeroTitle1: 'Entraîne-toi partout.',
  landingHeroTitle2: 'Gagne chaque jour.',
  landingHeroSubtitle:
    'Le tracker d’entraînement gratuit qui marche hors ligne — pas de compte, pas de store, pas de paywall sur l’essentiel. Nutrition, mobilité, mental et apprentissage dans le même Win Score.',
  landingSeeHow: 'Comment ça marche',
  landingCtaStart: 'Commence ton parcours',
  landingJourneyTitle: 'Le parcours membre',
  landingJourneyHeadline1: 'Un début clair.',
  landingJourneyHeadline2: 'Une étape à la fois.',
  landingFreeEyebrow: 'Le cœur gratuit',
  landingFreeTitle1: 'Gratuit est la mission,',
  landingFreeTitle2: 'pas l’essai.',
  landingPillarsEyebrow: 'Six piliers',
  landingPillarsTitle: 'Tout renforce tout.',
  landingBundleEyebrow: 'Le Super Bundle',
  landingBundleTitle1: 'Six outils premium.',
  landingBundleTitle2: 'Un abonnement.',
  landingBundleCta: 'Voir le bundle',
  landingFinalCtaTitle: 'Le parcours commence par un entraînement.',
  landingFinalCtaButton: 'Commencer gratuit — sans compte',
  landingCaptureEyebrow: 'Liste de lancement',
  landingCaptureTitle: 'Notes de lancement. Cœur gratuit pour toujours.',
  landingCaptureButton: 'Me prévenir',
  landingCaptureBody:
    'Un e-mail au lancement public, plus de rares conseils free core. Pas de spam. Désinscription à tout moment.',
  landingCapturePlaceholder: 'toi@email.com',
  landingCaptureDone: 'Tu es sur la liste.',
  landingCapturePrivacy: 'On garde ton e-mail seulement pour les news de lancement.',
  footerGroupProduct: 'Produit',
  footerGroupLearn: 'Apprendre',
  footerGroupCompany: 'Entreprise',
  footerGroupLegal: 'Légal',
  footerTagline: 'Entraîne-toi partout. Gagne chaque jour.',
};

/** Batch C — LLM-drafted conversion surfaces; founder review before public flip. */
const LANDING_IT: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'Il percorso',
  landingNavPillars: 'Pilastri',
  landingNavBundle: 'Super Bundle',
  landingNavStart: 'Inizia gratis',
  landingNavHome: 'Home',
  landingHeroEyebrow: 'Logger offline gratuito · Coach IA adattivo',
  landingHeroTitle1: 'Allenati ovunque.',
  landingHeroTitle2: 'Vinci ogni giorno.',
  landingHeroSubtitle:
    'Registro offline gratuito (senza account) e piani settimanali che si adattano solo dai tuoi log — nessun wearable richiesto.',
  landingHeroProof: 'Registra una serie → Coach modella la settimana → Win Score avanza.',
  landingSeeHow: 'Come funziona',
  landingProofChip: '217 esercizi · offline · senza account',
  landingProofNoAiKey:
    'Il core gratis non richiede chiave IA. Coach IA opzionale se attivo.',
  landingTrustInstall: 'Si installa come app',
  landingTrustOffline: 'Allenati offline',
  landingTrustLang: '14 lingue',
  landingCtaStart: 'Inizia il percorso',
  landingCtaBundle: 'Super Bundle',
  landingStatExercises: '217 esercizi',
  landingStatOffline: 'PWA offline',
  landingStatLangs: '14 lingue',
  landingStatCore: 'Core $0',
  landingStatAccount: 'Senza account',
  landingCoachDemoTitle: 'Piani che si adattano quando la vita accade',
  landingCoachDemoBody:
    'Salti un giorno, dormi male o batti un PR — Mission Coach rimodella la settimana senza fogli di calcolo.',
  landingPillarsEyebrow: 'Sei pilastri',
  landingPillarsTitle: 'Tutto rafforza tutto.',
  landingPillarsBody:
    'La mobilità migliora l’allenamento. La mente migliora la costanza. Il fuel alimenta i risultati. Il Win Score pesa tutti e sei.',
  landingPillarsFree: 'Gratis',
  landingPillarsBundle: 'Bundle',
  landingBundleEyebrow: 'Il Super Bundle',
  landingBundleTitle1: 'Coach + profondità.',
  landingBundleTitle2: 'Un abbonamento.',
  landingBundleBody:
    'Piani settimanali Mission Coach che si adattano dai tuoi log, poi nutrizione, mobilità, mente, tracking e apprendimento in profondità — la profondità di sei strumenti, al prezzo di uno. Il logger gratis resta gratis.',
  landingBundlePriceLine: 'Da ${{perMonth}}/mese · core gratis per sempre',
  landingBundleCta: 'Vedi il bundle',
  landingBundleFoot:
    'Il core gratis non passa mai dietro al bundle. Il premium finanzia la missione — non la blocca.',
  landingFaqEyebrow: 'Risposte dirette',
  landingFaqFreeQ: 'La versione gratis è davvero completa?',
  landingFaqFreeA:
    'Sì. Tracker, biblioteca, modelli, log nutrizione, punteggi, streak e classifiche sono gratis per sempre, senza account.',
  landingFaqOfflineQ: 'Funziona offline, nel mio paese e nella mia lingua?',
  landingFaqOfflineA:
    'Mission Winning è una web app installabile che gira in qualsiasi browser moderno e mantiene il core offline.',
  landingFaqBundleQ: 'Cos’è il Super Bundle?',
  landingFaqBundleA:
    'Un abbonamento che sblocca profondità premium su tutti e sei i pilastri.',
  landingFaqWhoQ: 'Per chi è?',
  landingFaqWhoA:
    'Per chi vuole un percorso disciplinato e basato sull’evidenza — dal garage al parco con solo il pavimento.',
  landingFinalCtaTitle: 'Il percorso inizia con un allenamento.',
  landingFinalCtaButton: 'Inizia gratis — senza account',
  landingFinalCtaFoot:
    'Meno di tre minuti alla prima sessione. Niente da installare, niente da pagare.',
  landingCaptureEyebrow: 'Lista di lancio',
  landingCaptureTitle: 'Note di lancio. Core gratis per sempre.',
  landingCaptureBody:
    'Un’email quando saremo pubblici, più rari consigli sul core gratis. Niente spam. Disiscriviti quando vuoi.',
  landingCapturePlaceholder: 'tu@email.com',
  landingCaptureButton: 'Avvisami',
  landingCaptureSending: 'Salvataggio…',
  landingCaptureDone:
    'Sei in lista. Controlla la posta per la conferma quando l’email sarà attiva.',
  landingCapturePrivacy: 'Conserviamo la tua email solo per aggiornamenti di lancio.',
  landingCaptureInvalid: 'Inserisci un’email valida.',
  landingCaptureError: 'Impossibile salvare. Riprova.',
  footerTagline: 'Allenati ovunque. Vinci ogni giorno.',
  footerGroupProduct: 'Prodotto',
  footerGroupLearn: 'Impara',
  footerGroupCompany: 'Azienda',
  footerGroupLegal: 'Legale',
  footerProductPath: 'Il percorso',
  footerProductPillars: 'Pilastri',
  footerProductBundle: 'Super Bundle',
  footerProductCompare: 'Confronta',
  footerLearnGuide: 'Guida',
  footerLearnExercises: 'Esercizi',
  footerLearnPaths: 'Percorsi',
  footerLearnBeta: 'Guida beta',
  footerCompanyAbout: 'Chi siamo',
  footerCompanyVision: 'Visione',
  footerCompanyFeedback: 'Feedback',
  footerLegalPrivacy: 'Privacy',
  footerLegalTerms: 'Termini',
  footerDisclaimer:
    'Strumenti fitness educativi — non consiglio medico. Consulta un medico prima di iniziare qualsiasi programma.',
};

const LANDING_RU: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'Путь',
  landingNavPillars: 'Столпы',
  landingNavBundle: 'Super Bundle',
  landingNavStart: 'Начать бесплатно',
  landingNavHome: 'Главная',
  landingHeroEyebrow: 'Бесплатный офлайн-логгер · Адаптивный AI Coach',
  landingHeroTitle1: 'Тренируйся где угодно.',
  landingHeroTitle2: 'Побеждай каждый день.',
  landingHeroSubtitle:
    'Бесплатное офлайн-логирование (без аккаунта) и недельные планы, которые адаптируются только из твоих логов — носимый гаджет не нужен.',
  landingHeroProof: 'Запиши подход → Coach формирует неделю → Win Score растёт.',
  landingSeeHow: 'Как это работает',
  landingProofChip: '217 упражнений · офлайн · без аккаунта',
  landingProofNoAiKey:
    'Бесплатному ядру не нужен AI-ключ. AI Coach опционален, если включён.',
  landingTrustInstall: 'Устанавливается как приложение',
  landingTrustOffline: 'Тренируйся офлайн',
  landingTrustLang: '14 языков',
  landingCtaStart: 'Начать путь',
  landingCtaBundle: 'Super Bundle',
  landingStatExercises: '217 упражнений',
  landingStatOffline: 'Офлайн PWA',
  landingStatLangs: '14 языков',
  landingStatCore: 'Ядро $0',
  landingStatAccount: 'Без аккаунта',
  landingCoachDemoTitle: 'Планы, которые подстраиваются под жизнь',
  landingCoachDemoBody:
    'Пропустил день, плохо спал или побил PR — Mission Coach перестраивает неделю без таблиц.',
  landingPillarsEyebrow: 'Шесть столпов',
  landingPillarsTitle: 'Всё усиливает всё.',
  landingPillarsBody:
    'Мобильность улучшает тренировки. Разум улучшает постоянство. Fuel питает результат. Win Score взвешивает все шесть.',
  landingPillarsFree: 'Бесплатно',
  landingPillarsBundle: 'Bundle',
  landingBundleEyebrow: 'Super Bundle',
  landingBundleTitle1: 'Coach + глубина.',
  landingBundleTitle2: 'Одна подписка.',
  landingBundleBody:
    'Недельные планы Mission Coach из твоих логов, затем глубокое питание, мобильность, разум, трекинг и обучение — глубина шести инструментов по цене одного. Бесплатный логгер остаётся бесплатным.',
  landingBundlePriceLine: 'От ${{perMonth}}/мес · ядро бесплатно навсегда',
  landingBundleCta: 'Смотреть bundle',
  landingBundleFoot:
    'Бесплатное ядро никогда не уходит за bundle. Premium финансирует миссию — не блокирует её.',
  landingFaqEyebrow: 'Прямые ответы',
  landingFaqFreeQ: 'Бесплатная версия действительно полная?',
  landingFaqFreeA:
    'Да. Трекер, библиотека, шаблоны, лог питания, очки, серии и таблицы лидеров бесплатны навсегда, без аккаунта.',
  landingFaqOfflineQ: 'Работает офлайн, в моей стране и на моём языке?',
  landingFaqOfflineA:
    'Mission Winning — устанавливаемое веб-приложение в любом современном браузере с офлайн-ядром.',
  landingFaqBundleQ: 'Что такое Super Bundle?',
  landingFaqBundleA:
    'Одна подписка на премиум-глубину во всех шести столпах.',
  landingFaqWhoQ: 'Для кого это?',
  landingFaqWhoA:
    'Для всех, кому нужен дисциплинированный путь на основе доказательств — от гаражного зала до парка.',
  landingFinalCtaTitle: 'Путь начинается с одной тренировки.',
  landingFinalCtaButton: 'Начать бесплатно — без аккаунта',
  landingFinalCtaFoot:
    'Меньше трёх минут до первой сессии. Ничего устанавливать и платить не нужно.',
  landingCaptureEyebrow: 'Список запуска',
  landingCaptureTitle: 'Новости запуска. Ядро бесплатно навсегда.',
  landingCaptureBody:
    'Одно письмо при публичном запуске и редкие советы по бесплатному ядру. Без спама. Отписка в любой момент.',
  landingCapturePlaceholder: 'you@email.com',
  landingCaptureButton: 'Сообщить мне',
  landingCaptureSending: 'Сохранение…',
  landingCaptureDone:
    'Ты в списке. Проверь почту для подтверждения, когда email заработает.',
  landingCapturePrivacy: 'Мы храним email только для новостей о запуске.',
  landingCaptureInvalid: 'Введи корректный email.',
  landingCaptureError: 'Не удалось сохранить. Попробуй снова.',
  footerTagline: 'Тренируйся где угодно. Побеждай каждый день.',
  footerGroupProduct: 'Продукт',
  footerGroupLearn: 'Учёба',
  footerGroupCompany: 'Компания',
  footerGroupLegal: 'Правовое',
  footerProductPath: 'Путь',
  footerProductPillars: 'Столпы',
  footerProductBundle: 'Super Bundle',
  footerProductCompare: 'Сравнить',
  footerLearnGuide: 'Гид',
  footerLearnExercises: 'Упражнения',
  footerLearnPaths: 'Маршруты',
  footerLearnBeta: 'Гид по бете',
  footerCompanyAbout: 'О нас',
  footerCompanyVision: 'Видение',
  footerCompanyFeedback: 'Обратная связь',
  footerLegalPrivacy: 'Конфиденциальность',
  footerLegalTerms: 'Условия',
  footerDisclaimer:
    'Образовательные фитнес-инструменты — не медицинский совет. Проконсультируйся с врачом перед началом программы.',
};

const LANDING_KO: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: '경로',
  landingNavPillars: '여섯 기둥',
  landingNavBundle: 'Super Bundle',
  landingNavStart: '무료 시작',
  landingNavHome: '홈',
  landingHeroEyebrow: '무료 오프라인 로거 · 적응형 AI 코치',
  landingHeroTitle1: '어디서나 훈련하세요.',
  landingHeroTitle2: '매일 이기세요.',
  landingHeroSubtitle:
    '무료 오프라인 기록(계정 불필요)과 로그만으로 적응하는 주간 플랜 — 웨어러블 필요 없음.',
  landingHeroProof: '세트 기록 → 코치가 주간 조정 → Win Score 상승.',
  landingSeeHow: '작동 방식',
  landingProofChip: '217개 운동 · 오프라인 · 계정 없음',
  landingProofNoAiKey:
    '무료 코어는 AI 키가 필요 없습니다. AI 코치는 활성화 시 선택 사항.',
  landingTrustInstall: '앱처럼 설치',
  landingTrustOffline: '오프라인 훈련',
  landingTrustLang: '14개 언어',
  landingCtaStart: '경로 시작',
  landingCtaBundle: 'Super Bundle',
  landingStatExercises: '217개 운동',
  landingStatOffline: '오프라인 PWA',
  landingStatLangs: '14개 언어',
  landingStatCore: '코어 $0',
  landingStatAccount: '계정 불필요',
  landingCoachDemoTitle: '삶이 바뀔 때 적응하는 플랜',
  landingCoachDemoBody:
    '하루를 놓치거나, 잠을 못 자거나, PR을 달성해도 — Mission Coach가 스프레드시트 없이 주간을 재구성합니다.',
  landingPillarsEyebrow: '여섯 기둥',
  landingPillarsTitle: '모든 것이 서로를 강화합니다.',
  landingPillarsBody:
    '모빌리티는 훈련을, 마인드는 꾸준함을, Fuel은 결과를 이끕니다. Win Score가 여섯 기둥을 모두 반영합니다.',
  landingPillarsFree: '무료',
  landingPillarsBundle: 'Bundle',
  landingBundleEyebrow: 'Super Bundle',
  landingBundleTitle1: '코치 + 깊이.',
  landingBundleTitle2: '하나의 구독.',
  landingBundleBody:
    '운동 로그에서 적응하는 Mission Coach 주간 플랜, 그다음 영양·모빌리티·마인드·추적·학습의 깊이 — 여섯 도구의 깊이를 하나의 가격으로. 무료 로거는 영원히 무료.',
  landingBundlePriceLine: '${{perMonth}}/월부터 · 코어 영원히 무료',
  landingBundleCta: '번들 보기',
  landingBundleFoot:
    '무료 코어는 번들 뒤로 가지 않습니다. 프리미엄은 미션을 지원합니다 — 막지 않습니다.',
  landingFaqEyebrow: '직접적인 답변',
  landingFaqFreeQ: '무료 버전이 정말 완전한가요?',
  landingFaqFreeA:
    '네. 운동 트래커, 운동 라이브러리, 프로그램 템플릿, 영양 로그, 점수, 연속 기록, 리더보드는 계정 없이 영원히 무료입니다.',
  landingFaqOfflineQ: '오프라인, 내 국가, 내 언어로 작동하나요?',
  landingFaqOfflineA:
    'Mission Winning은 모든 최신 브라우저에서 실행되는 설치형 웹 앱이며 코어는 오프라인에서 작동합니다.',
  landingFaqBundleQ: 'Super Bundle이란?',
  landingFaqBundleA:
    '여섯 기둥 전체의 프리미엄 깊이를 여는 하나의 구독입니다.',
  landingFaqWhoQ: '누구를 위한 서비스인가요?',
  landingFaqWhoA:
    '차고 체육관부터 바닥만 있는 공원까지, 근거 기반의 규율 있는 경로를 원하는 모든 이.',
  landingFinalCtaTitle: '경로는 한 번의 운동으로 시작됩니다.',
  landingFinalCtaButton: '무료 시작 — 계정 없음',
  landingFinalCtaFoot:
    '첫 세션까지 3분 미만. 설치도, 결제도 없습니다.',
  landingCaptureEyebrow: '출시 목록',
  landingCaptureTitle: '출시 알림. 코어는 영원히 무료.',
  landingCaptureBody:
    '공개 출시 시 이메일 한 통과 가끔의 무료 코어 팁. 스팸 없음. 언제든 구독 해지.',
  landingCapturePlaceholder: 'you@email.com',
  landingCaptureButton: '알림 받기',
  landingCaptureSending: '저장 중…',
  landingCaptureDone:
    '목록에 등록되었습니다. 이메일이 활성화되면 확인 메일을 확인하세요.',
  landingCapturePrivacy: '이메일은 출시 업데이트에만 사용합니다.',
  landingCaptureInvalid: '유효한 이메일을 입력하세요.',
  landingCaptureError: '저장할 수 없습니다. 다시 시도하세요.',
  footerTagline: '어디서나 훈련. 매일 승리.',
  footerGroupProduct: '제품',
  footerGroupLearn: '학습',
  footerGroupCompany: '회사',
  footerGroupLegal: '법적 고지',
  footerProductPath: '경로',
  footerProductPillars: '여섯 기둥',
  footerProductBundle: 'Super Bundle',
  footerProductCompare: '비교',
  footerLearnGuide: '가이드',
  footerLearnExercises: '운동',
  footerLearnPaths: '경로',
  footerLearnBeta: '베타 가이드',
  footerCompanyAbout: '소개',
  footerCompanyVision: '비전',
  footerCompanyFeedback: '피드백',
  footerLegalPrivacy: '개인정보',
  footerLegalTerms: '약관',
  footerDisclaimer:
    '교육용 피트니스 도구 — 의학적 조언이 아닙니다. 운동 프로그램 시작 전 의사와 상담하세요.',
};

const LANDING_JA: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'パス',
  landingNavPillars: '6つの柱',
  landingNavBundle: 'Super Bundle',
  landingNavStart: '無料で始める',
  landingNavHome: 'ホーム',
  landingHeroEyebrow: '無料オフラインロガー · 適応型AIコーチ',
  landingHeroTitle1: 'どこでもトレーニング。',
  landingHeroTitle2: '毎日勝つ。',
  landingHeroSubtitle:
    '無料のオフライン記録（アカウント不要）とログだけから適応する週間プラン — ウェアラブル不要。',
  landingHeroProof: 'セットを記録 → コーチが週を調整 → Win Scoreが動く。',
  landingSeeHow: '仕組みを見る',
  landingProofChip: '217種のエクササイズ · オフライン · アカウント不要',
  landingProofNoAiKey:
    '無料コアにAIキーは不要。AIコーチは有効時のみオプション。',
  landingTrustInstall: 'アプリのようにインストール',
  landingTrustOffline: 'オフラインでトレーニング',
  landingTrustLang: '14言語',
  landingCtaStart: 'パスを始める',
  landingCtaBundle: 'Super Bundle',
  landingStatExercises: '217種のエクササイズ',
  landingStatOffline: 'オフラインPWA',
  landingStatLangs: '14言語',
  landingStatCore: 'コア $0',
  landingStatAccount: 'アカウント不要',
  landingCoachDemoTitle: '生活に合わせて適応するプラン',
  landingCoachDemoBody:
    '一日休んでも、睡眠不足でも、PRを出しても — Mission Coachがスプレッドシートなしで週を組み直します。',
  landingPillarsEyebrow: '6つの柱',
  landingPillarsTitle: 'すべてがすべてを強化する。',
  landingPillarsBody:
    'モビリティはトレーニングを、マインドは継続を、Fuelは結果を支えます。Win Scoreが6つの柱をひとつに。',
  landingPillarsFree: '無料',
  landingPillarsBundle: 'Bundle',
  landingBundleEyebrow: 'Super Bundle',
  landingBundleTitle1: 'コーチ + 深さ。',
  landingBundleTitle2: 'ひとつのサブスク。',
  landingBundleBody:
    'ログから適応するMission Coachの週間プラン、そして栄養・モビリティ・マインド・トラッキング・学習の深さ — 6つのツールの深さを1つの価格で。無料ロガーは永久無料。',
  landingBundlePriceLine: '${{perMonth}}/月〜 · コアは永久無料',
  landingBundleCta: 'バンドルを見る',
  landingBundleFoot:
    '無料コアはバンドルの後ろに回りません。プレミアムはミッションを支えます — 閉じません。',
  landingFaqEyebrow: '率直な回答',
  landingFaqFreeQ: '無料版は本当に完成していますか？',
  landingFaqFreeA:
    'はい。ワークアウトトラッカー、エクササイズライブラリ、プログラムテンプレート、栄養ログ、スコア、連続記録、リーダーボードはアカウント不要で永久無料です。',
  landingFaqOfflineQ: 'オフライン、自分の国、自分の言語で使えますか？',
  landingFaqOfflineA:
    'Mission Winningは任意のモダンブラウザで動くインストール可能なWebアプリで、コアはオフラインで動作します。',
  landingFaqBundleQ: 'Super Bundleとは？',
  landingFaqBundleA:
    '6つの柱すべてのプレミアム深度を解放するひとつのサブスクリプション。',
  landingFaqWhoQ: '誰のためのサービスですか？',
  landingFaqWhoA:
    'ガレージジムから床だけの公園まで、根拠に基づいた規律あるパスを求めるすべての人。',
  landingFinalCtaTitle: 'パスはひとつのワークアウトから始まる。',
  landingFinalCtaButton: '無料で始める — アカウント不要',
  landingFinalCtaFoot:
    '最初のセッションまで3分未満。インストールも支払いも不要。',
  landingCaptureEyebrow: 'ローンチリスト',
  landingCaptureTitle: 'ローンチ通知。コアは永久無料。',
  landingCaptureBody:
    '公開時にメール1通と、たまの無料コアのヒント。スパムなし。いつでも解除可能。',
  landingCapturePlaceholder: 'you@email.com',
  landingCaptureButton: '通知を受け取る',
  landingCaptureSending: '保存中…',
  landingCaptureDone:
    'リストに登録されました。メールが有効になったら確認メールをご確認ください。',
  landingCapturePrivacy: 'メールはローンチ更新のためだけに保存します。',
  landingCaptureInvalid: '有効なメールを入力してください。',
  landingCaptureError: '保存できませんでした。もう一度お試しください。',
  footerTagline: 'どこでもトレーニング。毎日勝つ。',
  footerGroupProduct: 'プロダクト',
  footerGroupLearn: '学ぶ',
  footerGroupCompany: '会社',
  footerGroupLegal: '法務',
  footerProductPath: 'パス',
  footerProductPillars: '6つの柱',
  footerProductBundle: 'Super Bundle',
  footerProductCompare: '比較',
  footerLearnGuide: 'ガイド',
  footerLearnExercises: 'エクササイズ',
  footerLearnPaths: 'パス',
  footerLearnBeta: 'ベータガイド',
  footerCompanyAbout: '概要',
  footerCompanyVision: 'ビジョン',
  footerCompanyFeedback: 'フィードバック',
  footerLegalPrivacy: 'プライバシー',
  footerLegalTerms: '利用規約',
  footerDisclaimer:
    '教育用フィットネスツール — 医療アドバイスではありません。トレーニング開始前に医師に相談してください。',
};

/** Batch D — LLM-drafted; founder review before public flip. */
const LANDING_HI: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'मार्ग',
  landingNavPillars: 'स्तंभ',
  landingNavStart: 'मुफ़्त शुरू करें',
  landingNavHome: 'होम',
  landingHeroTitle1: 'कहीं भी ट्रेन करें।',
  landingHeroTitle2: 'हर दिन जीतें।',
  landingHeroSubtitle:
    'मुफ़्त ऑफ़लाइन वर्कआउट ट्रैकर — बिना खाते, बिना स्टोर, कोर पर कोई paywall नहीं। Win Score पोषण, गतिशीलता, मन और सीख को जोड़ता है।',
  landingCtaStart: 'अपना मार्ग शुरू करें',
  landingFinalCtaButton: 'मुफ़्त शुरू — बिना खाते',
  landingCaptureTitle: 'लॉन्च नोट्स। कोर हमेशा मुफ़्त।',
  landingCaptureButton: 'मुझे बताएँ',
  footerGroupProduct: 'उत्पाद',
  footerGroupLearn: 'सीखें',
  footerGroupCompany: 'कंपनी',
  footerGroupLegal: 'कानूनी',
};

const LANDING_ID: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'Jalur',
  landingNavPillars: 'Enam pilar',
  landingNavStart: 'Mulai gratis',
  landingNavHome: 'Beranda',
  landingHeroTitle1: 'Latihan di mana saja.',
  landingHeroTitle2: 'Menang setiap hari.',
  landingHeroSubtitle:
    'Pelacak latihan gratis offline — tanpa akun, tanpa toko, tanpa paywall di inti. Win Score menyatukan nutrisi, mobilitas, pikiran, dan belajar.',
  landingCtaStart: 'Mulai jalurmu',
  landingFinalCtaButton: 'Mulai gratis — tanpa akun',
  landingCaptureTitle: 'Catatan rilis. Inti gratis selamanya.',
  landingCaptureButton: 'Kabari saya',
  footerGroupProduct: 'Produk',
  footerGroupLearn: 'Belajar',
  footerGroupCompany: 'Perusahaan',
  footerGroupLegal: 'Hukum',
};

const LANDING_TH: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'เส้นทาง',
  landingNavPillars: 'หกเสา',
  landingNavStart: 'เริ่มฟรี',
  landingNavHome: 'หน้าแรก',
  landingHeroTitle1: 'ฝึกได้ทุกที่',
  landingHeroTitle2: 'ชนะทุกวัน',
  landingHeroSubtitle:
    'ตัวติดตามออกกำลังกายฟรีออฟไลน์ — ไม่ต้องมีบัญชี ไม่ต้องร้านค้า ไม่มี paywall ที่คอร์ Win Score รวมโภชนาการ การเคลื่อนไหว จิตใจ และการเรียนรู้',
  landingCtaStart: 'เริ่มเส้นทางของคุณ',
  landingFinalCtaButton: 'เริ่มฟรี — ไม่ต้องมีบัญชี',
  landingCaptureTitle: 'ข่าวเปิดตัว คอร์ฟรีตลอดไป',
  landingCaptureButton: 'แจ้งฉัน',
  footerGroupProduct: 'ผลิตภัณฑ์',
  footerGroupLearn: 'เรียนรู้',
  footerGroupCompany: 'บริษัท',
  footerGroupLegal: 'กฎหมาย',
};

const LANDING_ZH: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: '路径',
  landingNavPillars: '六大支柱',
  landingNavStart: '免费开始',
  landingNavHome: '首页',
  landingHeroTitle1: '随处训练。',
  landingHeroTitle2: '每日获胜。',
  landingHeroSubtitle:
    '免费离线训练记录器——无需账号、无需应用商店、核心功能无付费墙。Win Score 将营养、活动、心态与学习合而为一。',
  landingCtaStart: '开始你的路径',
  landingFinalCtaButton: '免费开始 — 无需账号',
  landingCaptureTitle: '上线通知。核心永久免费。',
  landingCaptureButton: '通知我',
  footerGroupProduct: '产品',
  footerGroupLearn: '学习',
  footerGroupCompany: '公司',
  footerGroupLegal: '法律',
};

const LANDING_VI: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'Lộ trình',
  landingNavPillars: 'Sáu trụ cột',
  landingNavStart: 'Bắt đầu miễn phí',
  landingNavHome: 'Trang chủ',
  landingHeroTitle1: 'Tập mọi nơi.',
  landingHeroTitle2: 'Thắng mỗi ngày.',
  landingHeroSubtitle:
    'Trình theo dõi tập luyện miễn phí offline — không tài khoản, không cửa hàng, không paywall phần lõi. Win Score gộp dinh dưỡng, vận động, tinh thần và học tập.',
  landingCtaStart: 'Bắt đầu lộ trình',
  landingFinalCtaButton: 'Bắt đầu miễn phí — không tài khoản',
  landingCaptureTitle: 'Tin ra mắt. Lõi miễn phí mãi mãi.',
  landingCaptureButton: 'Báo cho tôi',
  footerGroupProduct: 'Sản phẩm',
  footerGroupLearn: 'Học',
  footerGroupCompany: 'Công ty',
  footerGroupLegal: 'Pháp lý',
};

const LANDING_AR: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'المسار',
  landingNavPillars: 'ستة أعمدة',
  landingNavStart: 'ابدأ مجانًا',
  landingNavHome: 'الرئيسية',
  landingHeroTitle1: 'تدرّب في أي مكان.',
  landingHeroTitle2: 'انتصِر كل يوم.',
  landingHeroSubtitle:
    'متتبع تمارين مجاني يعمل دون اتصال — بلا حساب، بلا متجر، بلا جدار دفع على النواة. Win Score يجمع التغذية والحركة والعقل والتعلم.',
  landingCtaStart: 'ابدأ مسارك',
  landingFinalCtaButton: 'ابدأ مجانًا — بلا حساب',
  landingCaptureTitle: 'ملاحظات الإطلاق. النواة مجانية إلى الأبد.',
  landingCaptureButton: 'أخبرني',
  footerGroupProduct: 'المنتج',
  footerGroupLearn: 'تعلّم',
  footerGroupCompany: 'الشركة',
  footerGroupLegal: 'قانوني',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: LANDING_EN,
  es: LANDING_ES,
  pt: LANDING_PT,
  de: LANDING_DE,
  fr: LANDING_FR,
  it: LANDING_IT,
  ru: LANDING_RU,
  ko: LANDING_KO,
  ja: LANDING_JA,
  hi: LANDING_HI,
  id: LANDING_ID,
  th: LANDING_TH,
  zh: LANDING_ZH,
  vi: LANDING_VI,
  ar: LANDING_AR,
};

export function landingStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeLandingStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, landingStringsFor(lang));
}

export const LANDING_JOURNEY_KEYS = [
  { phase: 'Phase 0', nameKey: 'landingJourneyPhase0Name', descKey: 'landingJourneyPhase0Desc' },
  { phase: 'Phase 1', nameKey: 'landingJourneyPhase1Name', descKey: 'landingJourneyPhase1Desc' },
  { phase: 'Phase 2', nameKey: 'landingJourneyPhase2Name', descKey: 'landingJourneyPhase2Desc' },
  { phase: 'Phase 3', nameKey: 'landingJourneyPhase3Name', descKey: 'landingJourneyPhase3Desc' },
] as const;

export const LANDING_FAQ_KEYS = [
  {
    qKey: 'landingFaqFreeQ',
    aKey: 'landingFaqFreeA',
    qDefault: 'Is the free version actually complete?',
    aDefault:
      'Yes. The workout tracker, exercise library, program templates, nutrition log, scores, streaks, and leaderboards are free forever, with no account required.',
  },
  {
    qKey: 'landingFaqOfflineQ',
    aKey: 'landingFaqOfflineA',
    qDefault: 'Does it work offline, in my country, in my language?',
    aDefault:
      'Mission Winning is an installable web app that runs in any modern browser and keeps the core working offline.',
  },
  {
    qKey: 'landingFaqBundleQ',
    aKey: 'landingFaqBundleA',
    qDefault: 'What is the Super Bundle?',
    aDefault:
      'One subscription that unlocks premium depth across all six pillars — training plans, deep nutrition, mobility, mind, tracking, and specialist programs.',
  },
  {
    qKey: 'landingFaqWhoQ',
    aKey: 'landingFaqWhoA',
    qDefault: 'Who is this for?',
    aDefault:
      'Anyone who wants a disciplined, evidence-based path — from a garage gym to a park with only floor space.',
  },
] as const;

/**
 * FAQ keys for landing UI + FAQPage JSON-LD.
 * Free beta drops Super Bundle merch so schema matches the visible accordion.
 */
export function landingFaqKeysForSurface(): (typeof LANDING_FAQ_KEYS)[number][] {
  if (isFreeBeta()) {
    return LANDING_FAQ_KEYS.filter((f) => f.qKey !== 'landingFaqBundleQ');
  }
  return [...LANDING_FAQ_KEYS];
}
