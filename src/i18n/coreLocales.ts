/** Tier-1 UI strings — nav, journey chrome, welcome, profile. Merged into i18n resources. */

export const TIER1_LANGS = ['en', 'es', 'fr', 'pt', 'ru', 'de', 'it', 'ko', 'ja'] as const;
export type Tier1Lang = (typeof TIER1_LANGS)[number];

type CoreStrings = {
  navToday: string;
  navTrain: string;
  navFuel: string;
  navCoach: string;
  navTrack: string;
  navYou: string;
  navMore: string;
  yourNextStep: string;
  formGuide: string;
  formGuideTitle: string;
  gotItStartSet: string;
  setup: string;
  execute: string;
  avoid: string;
  breath: string;
  simpleMode: string;
  proMode: string;
  appMode: string;
  commissionedLabel: string;
  commissionedTitle: string;
  commissionedBody: string;
  commissionedCta: string;
  missionOperator: string;
  welcomeBegin: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeAccept: string;
  welcomeContinue: string;
  welcomeSkipSignIn: string;
  lang_de: string;
  lang_it: string;
  lang_ko: string;
  lang_ja: string;
  editJourneyProfile: string;
  cloudSyncActive: string;
  cloudSyncPending: string;
  saveProfile: string;
  yourProfile: string;
  firstTimeSetup: string;
  betaJourneyProgress: string;
  emailNextStep: string;
  emailNextStepSent: string;
  signInOptional: string;
  signInLink: string;
  cloudSyncOn: string;
  f017LocalBadge: string;
  f017DeferAccountTitle: string;
  f017DeferAccountBody: string;
  f017CreateAccount: string;
  f017NotNow: string;
  welcomeSignInTitle: string;
  welcomeSignInSubtitle: string;
  commandersIntent: string;
  saveProgressCloud: string;
  signInPromptExpand: string;
  signInCollapse: string;
  signInPromptDefault: string;
  termsOfService: string;
  privacyPolicy: string;
  about: string;
  leaderboardRankings: string;
  today: string;
  signInSkip: string;
  signInLinkHint: string;
  continue: string;
  signInDifferentEmail: string;
  signInDemoMode: string;
  signInRedirecting: string;
  signInApple: string;
  signInGoogle: string;
  signInMicrosoft: string;
  signInFacebook: string;
  signInOrEmail: string;
  formGuideReadyPosition: string;
  formGuideCaptionVideo: string;
  formGuideCaptionStill: string;
  formGuideMediaAria: string;
  formGuideCaptionsTrack: string;
  formGuideStillAlt: string;
  holdConfirmAgain: string;
  holdConfirmHint: string;
};

const en: CoreStrings = {
  navToday: 'Today',
  navTrain: 'Train',
  navFuel: 'Fuel',
  navCoach: 'Coach',
  navTrack: 'Track',
  navYou: 'You',
  navMore: 'More tools',
  yourNextStep: 'Your next step',
  formGuide: 'Form guide',
  formGuideTitle: 'Form guide',
  gotItStartSet: 'Got it — start set',
  setup: 'Setup',
  execute: 'Execute',
  avoid: 'Avoid',
  breath: 'Breath',
  simpleMode: 'Simple',
  proMode: 'Pro',
  appMode: 'App mode',
  commissionedLabel: 'Commissioned',
  commissionedTitle: 'You are ready for daily duty',
  commissionedBody:
    'Basic Training and Readiness complete. Today is your command center — one clear action every day. Health for everyone, everywhere.',
  commissionedCta: 'Continue to Today',
  missionOperator: 'Mission Operator',
  welcomeBegin: 'Begin',
  welcomeTitle: 'Welcome, Mission Member',
  welcomeSubtitle:
    'Start your path toward lifelong health — one step at a time. About two minutes.',
  welcomeAccept: 'I accept the path',
  welcomeContinue: 'Continue',
  welcomeSkipSignIn: 'Skip — start training',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Edit journey profile',
  cloudSyncActive: 'Journey synced to cloud',
  cloudSyncPending: 'Sign in to sync journey across devices',
  saveProfile: 'Save profile',
  yourProfile: 'Your profile',
  firstTimeSetup: 'First-time setup',
  betaJourneyProgress: 'Beta journey progress',
  emailNextStep: 'Email my next step',
  emailNextStepSent: 'Check your inbox for your next step.',
  signInOptional: 'Sign in optional — progress stays on this device.',
  signInLink: 'Sign in',
  cloudSyncOn: 'Sets save on this device — backup when online.',
  f017LocalBadge: 'Offline · on this device',
  f017DeferAccountTitle: 'Keep this diary?',
  f017DeferAccountBody:
    'Create an account to sync. You can keep logging offline either way.',
  f017CreateAccount: 'Create account',
  f017NotNow: 'Not now',
  welcomeSignInTitle: 'Save progress — your choice',
  welcomeSignInSubtitle:
    'Logging works on this device with no account. Sign in only if you want the same log on another device — Skip anytime.',
  commandersIntent: "Today's focus",
  saveProgressCloud: 'Save progress to cloud',
  signInPromptExpand: 'Sign in with Google or email',
  signInCollapse: 'Hide sign-in',
  signInPromptDefault: 'Sign in to sync workouts and journey progress across devices.',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  about: 'About',
  leaderboardRankings: 'Rankings',
  today: 'Today',
  signInSkip: 'Skip — continue without account',
  signInLinkHint: 'Open the link on this device to sync. You can keep using the app meanwhile.',
  continue: 'Continue',
  signInDifferentEmail: 'Use a different email',
  signInDemoMode: 'Demo mode — add Supabase keys to enable cloud sync and social sign-in.',
  signInRedirecting: 'Redirecting…',
  signInApple: 'Continue with Apple',
  signInGoogle: 'Continue with Google',
  signInMicrosoft: 'Continue with Microsoft',
  signInFacebook: 'Continue with Facebook',
  signInOrEmail: 'or use email',
  formGuideReadyPosition: 'Ready position',
  formGuideCaptionVideo: 'Side view · full range of motion',
  formGuideCaptionStill: 'Form demo',
  formGuideMediaAria: '{{name}} form demo',
  formGuideCaptionsTrack: 'Captions',
  formGuideStillAlt: '{{name}} form demo, side view',
  holdConfirmAgain: 'Press again to confirm',
  holdConfirmHint: 'Hold {{ms}}ms to confirm. Release early to cancel.',
};

const de: CoreStrings = {
  ...en,
  navToday: 'Heute',
  navTrain: 'Training',
  navFuel: 'Ernährung',
  navTrack: 'Tracken',
  navYou: 'Profil',
  navMore: 'Mehr Tools',
  yourNextStep: 'Dein nächster Schritt',
  formGuide: 'Technik',
  formGuideTitle: 'Technik-Anleitung',
  gotItStartSet: 'Verstanden — Satz starten',
  setup: 'Startposition',
  execute: 'Ausführung',
  avoid: 'Vermeiden',
  breath: 'Atmung',
  simpleMode: 'Einfach',
  proMode: 'Profi',
  appMode: 'App-Modus',
  commissionedLabel: 'Einsatzbereit',
  commissionedTitle: 'Du bist bereit für den Alltag',
  commissionedBody:
    'Grundausbildung und Bereitschaft abgeschlossen. Heute ist deine Kommandozentrale — eine klare Aktion pro Tag. Gesundheit für alle.',
  commissionedCta: 'Weiter zu Heute',
  missionOperator: 'Mission Operator',
  welcomeBegin: 'Starten',
  welcomeTitle: 'Willkommen',
  welcomeSubtitle:
    'Dein Weg zu lebenslanger Gesundheit — Schritt für Schritt. Etwa zwei Minuten.',
  welcomeAccept: 'Ich nehme den Weg an',
  welcomeContinue: 'Weiter',
  welcomeSkipSignIn: 'Überspringen — Training starten',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Profil bearbeiten',
  cloudSyncActive: 'Reise in der Cloud gespeichert',
  cloudSyncPending: 'Anmelden für geräteübergreifende Sync',
  saveProfile: 'Profil speichern',
  yourProfile: 'Dein Profil',
  firstTimeSetup: 'Ersteinrichtung',
  betaJourneyProgress: 'Beta-Fortschritt',
  emailNextStep: 'Nächsten Schritt per E-Mail',
  emailNextStepSent: 'Posteingang prüfen — dein nächster Schritt ist unterwegs.',
  f017LocalBadge: 'Offline · auf diesem Gerät',
  f017DeferAccountTitle: 'Tagebuch behalten?',
  f017DeferAccountBody:
    'Konto anlegen zum Synchronisieren. Du kannst weiter offline loggen.',
  f017CreateAccount: 'Konto erstellen',
  f017NotNow: 'Nicht jetzt',
};

const it: CoreStrings = {
  ...en,
  navToday: 'Oggi',
  navTrain: 'Allenati',
  navFuel: 'Nutrizione',
  navTrack: 'Monitora',
  navYou: 'Profilo',
  navMore: 'Altri strumenti',
  yourNextStep: 'Il tuo prossimo passo',
  formGuide: 'Guida tecnica',
  formGuideTitle: 'Guida tecnica',
  gotItStartSet: 'Capito — inizia la serie',
  setup: 'Posizione',
  execute: 'Esecuzione',
  avoid: 'Evita',
  breath: 'Respiro',
  simpleMode: 'Semplice',
  proMode: 'Pro',
  appMode: 'Modalità app',
  commissionedLabel: 'Operativo',
  commissionedTitle: 'Sei pronto per la routine quotidiana',
  commissionedBody:
    'Addestramento base e idoneità completati. Oggi è il tuo centro di comando — un\'azione chiara ogni giorno. Salute per tutti.',
  commissionedCta: 'Vai a Oggi',
  missionOperator: 'Operatore Missione',
  welcomeBegin: 'Inizia',
  welcomeTitle: 'Benvenuto',
  welcomeSubtitle:
    'Il tuo percorso verso la salute — un passo alla volta. Circa due minuti.',
  welcomeAccept: 'Accetto il percorso',
  welcomeContinue: 'Continua',
  welcomeSkipSignIn: 'Salta — inizia ad allenarti',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Modifica profilo percorso',
  cloudSyncActive: 'Percorso sincronizzato nel cloud',
  cloudSyncPending: 'Accedi per sincronizzare su tutti i dispositivi',
  saveProfile: 'Salva profilo',
  yourProfile: 'Il tuo profilo',
  firstTimeSetup: 'Configurazione iniziale',
  betaJourneyProgress: 'Progresso beta',
  emailNextStep: 'Invia il prossimo passo via email',
  emailNextStepSent: 'Controlla la posta per il prossimo passo.',
  f017LocalBadge: 'Offline · su questo dispositivo',
  f017DeferAccountTitle: 'Tenere questo diario?',
  f017DeferAccountBody:
    'Crea un account per sincronizzare. Puoi continuare a registrare offline.',
  f017CreateAccount: 'Crea account',
  f017NotNow: 'Non ora',
};

const ko: CoreStrings = {
  ...en,
  navToday: '오늘',
  navTrain: '운동',
  navFuel: '영양',
  navTrack: '기록',
  navYou: '프로필',
  navMore: '더보기',
  yourNextStep: '다음 단계',
  formGuide: '자세 가이드',
  formGuideTitle: '자세 가이드',
  gotItStartSet: '확인 — 세트 시작',
  setup: '준비',
  execute: '동작',
  avoid: '주의',
  breath: '호흡',
  simpleMode: '간단',
  proMode: '전문',
  appMode: '앱 모드',
  commissionedLabel: '임명 완료',
  commissionedTitle: '매일 실천할 준비가 되었습니다',
  commissionedBody:
    '기초 훈련과 준비도 완료. 오늘 화면이 당신의 중심 — 매일 하나의 명확한 행동. 전 세계 모두를 위한 건강.',
  commissionedCta: '오늘로 계속',
  missionOperator: '미션 오퍼레이터',
  welcomeBegin: '시작',
  welcomeTitle: '환영합니다',
  welcomeSubtitle: '평생 건강을 향한 여정 — 한 걸음씩. 약 2분.',
  welcomeAccept: '경로를 수락합니다',
  welcomeContinue: '계속',
  welcomeSkipSignIn: '건너뛰기 — 운동 시작',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: '여정 프로필 수정',
  cloudSyncActive: '클라우드에 여정 동기화됨',
  cloudSyncPending: '기기 간 동기화를 위해 로그인하세요',
  saveProfile: '프로필 저장',
  yourProfile: '내 프로필',
  firstTimeSetup: '첫 설정',
  betaJourneyProgress: '베타 진행 상황',
  emailNextStep: '다음 단계 이메일 받기',
  emailNextStepSent: '받은편지함에서 다음 단계를 확인하세요.',
  f017LocalBadge: '오프라인 · 이 기기에서',
  f017DeferAccountTitle: '이 일지를 보관할까요?',
  f017DeferAccountBody:
    '동기화하려면 계정을 만드세요. 오프라인 기록은 그대로 됩니다.',
  f017CreateAccount: '계정 만들기',
  f017NotNow: '나중에',
};

const es: CoreStrings = {
  ...en,
  navToday: 'Hoy',
  navTrain: 'Entrenar',
  navFuel: 'Nutrición',
  navTrack: 'Seguir',
  navYou: 'Tú',
  navMore: 'Más herramientas',
  yourNextStep: 'Tu siguiente paso',
  formGuide: 'Guía de forma',
  gotItStartSet: 'Entendido — empezar serie',
  setup: 'Preparación',
  execute: 'Ejecución',
  avoid: 'Evitar',
  breath: 'Respiración',
  simpleMode: 'Simple',
  proMode: 'Pro',
  appMode: 'Modo de app',
  commissionedTitle: 'Estás listo para el día a día',
  commissionedCta: 'Continuar a Hoy',
  welcomeBegin: 'Comenzar',
  welcomeTitle: 'Bienvenido',
  welcomeAccept: 'Acepto el camino',
  welcomeContinue: 'Continuar',
  welcomeSkipSignIn: 'Omitir — empezar a entrenar',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Editar perfil del recorrido',
  cloudSyncActive: 'Recorrido sincronizado en la nube',
  cloudSyncPending: 'Inicia sesión para sincronizar entre dispositivos',
  saveProfile: 'Guardar perfil',
  f017LocalBadge: 'Sin conexión · en este dispositivo',
  f017DeferAccountTitle: '¿Guardar este diario?',
  f017DeferAccountBody:
    'Crea una cuenta para sincronizar. Puedes seguir registrando sin conexión.',
  f017CreateAccount: 'Crear cuenta',
  f017NotNow: 'Ahora no',
};

const fr: CoreStrings = {
  ...en,
  navToday: 'Aujourd\'hui',
  navTrain: 'Entraînement',
  navFuel: 'Nutrition',
  navTrack: 'Suivi',
  navYou: 'Profil',
  navMore: 'Plus d\'outils',
  yourNextStep: 'Prochaine étape',
  formGuide: 'Guide technique',
  gotItStartSet: 'Compris — commencer la série',
  setup: 'Préparation',
  execute: 'Exécution',
  avoid: 'Éviter',
  breath: 'Respiration',
  simpleMode: 'Simple',
  proMode: 'Pro',
  appMode: 'Mode app',
  commissionedTitle: 'Prêt pour le quotidien',
  commissionedCta: 'Continuer vers Aujourd\'hui',
  welcomeBegin: 'Commencer',
  welcomeTitle: 'Bienvenue',
  welcomeAccept: 'J\'accepte le chemin',
  welcomeContinue: 'Continuer',
  welcomeSkipSignIn: 'Passer — commencer l\'entraînement',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Modifier le profil parcours',
  cloudSyncActive: 'Parcours synchronisé dans le cloud',
  cloudSyncPending: 'Connectez-vous pour synchroniser entre appareils',
  saveProfile: 'Enregistrer le profil',
  f017LocalBadge: 'Hors ligne · sur cet appareil',
  f017DeferAccountTitle: 'Garder ce journal ?',
  f017DeferAccountBody:
    'Créez un compte pour synchroniser. Vous pouvez continuer hors ligne.',
  f017CreateAccount: 'Créer un compte',
  f017NotNow: 'Pas maintenant',
};

const pt: CoreStrings = {
  ...en,
  navToday: 'Hoje',
  navTrain: 'Treinar',
  navFuel: 'Nutrição',
  navTrack: 'Registrar',
  navYou: 'Você',
  navMore: 'Mais ferramentas',
  yourNextStep: 'Seu próximo passo',
  formGuide: 'Guia de forma',
  gotItStartSet: 'Entendi — iniciar série',
  setup: 'Preparação',
  execute: 'Execução',
  avoid: 'Evitar',
  breath: 'Respiração',
  simpleMode: 'Simples',
  proMode: 'Pro',
  appMode: 'Modo do app',
  commissionedTitle: 'Pronto para o dia a dia',
  commissionedCta: 'Continuar para Hoje',
  welcomeBegin: 'Começar',
  welcomeTitle: 'Bem-vindo',
  welcomeAccept: 'Aceito o caminho',
  welcomeContinue: 'Continuar',
  welcomeSkipSignIn: 'Pular — começar a treinar',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Editar perfil da jornada',
  cloudSyncActive: 'Jornada sincronizada na nuvem',
  cloudSyncPending: 'Entre para sincronizar entre dispositivos',
  saveProfile: 'Salvar perfil',
  f017LocalBadge: 'Offline · neste dispositivo',
  f017DeferAccountTitle: 'Manter este diário?',
  f017DeferAccountBody:
    'Crie uma conta para sincronizar. Você pode continuar registrando offline.',
  f017CreateAccount: 'Criar conta',
  f017NotNow: 'Agora não',
};

const ru: CoreStrings = {
  ...en,
  navToday: 'Сегодня',
  navTrain: 'Тренировка',
  navFuel: 'Питание',
  navTrack: 'Трекинг',
  navYou: 'Профиль',
  navMore: 'Ещё инструменты',
  yourNextStep: 'Следующий шаг',
  formGuide: 'Техника',
  gotItStartSet: 'Понятно — начать подход',
  setup: 'Исходное положение',
  execute: 'Выполнение',
  avoid: 'Избегать',
  breath: 'Дыхание',
  simpleMode: 'Простой',
  proMode: 'Про',
  appMode: 'Режим приложения',
  commissionedTitle: 'Вы готовы к ежедневной работе',
  commissionedCta: 'Перейти к Сегодня',
  welcomeBegin: 'Начать',
  welcomeTitle: 'Добро пожаловать',
  welcomeAccept: 'Принимаю путь',
  welcomeContinue: 'Продолжить',
  welcomeSkipSignIn: 'Пропустить — начать тренировку',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'Изменить профиль пути',
  cloudSyncActive: 'Путь синхронизирован в облаке',
  cloudSyncPending: 'Войдите для синхронизации между устройствами',
  saveProfile: 'Сохранить профиль',
  f017LocalBadge: 'Офлайн · на этом устройстве',
  f017DeferAccountTitle: 'Сохранить дневник?',
  f017DeferAccountBody:
    'Создайте аккаунт для синхронизации. Можно продолжать офлайн.',
  f017CreateAccount: 'Создать аккаунт',
  f017NotNow: 'Не сейчас',
};

const ja: CoreStrings = {
  ...en,
  navToday: '今日',
  navTrain: 'トレーニング',
  navFuel: '栄養',
  navTrack: '記録',
  navYou: 'プロフィール',
  navMore: 'その他',
  yourNextStep: '次のステップ',
  formGuide: 'フォームガイド',
  formGuideTitle: 'フォームガイド',
  gotItStartSet: '了解 — セット開始',
  setup: 'セットアップ',
  execute: '動作',
  avoid: '避ける',
  breath: '呼吸',
  simpleMode: 'シンプル',
  proMode: 'プロ',
  appMode: 'アプリモード',
  commissionedLabel: '任命完了',
  commissionedTitle: '毎日の実践の準備ができました',
  commissionedBody:
    '基礎訓練と準備が完了しました。今日があなたの司令室 — 毎日一つの明確なアクション。すべての人のための健康。',
  commissionedCta: '今日へ続ける',
  missionOperator: 'ミッションオペレーター',
  welcomeBegin: '始める',
  welcomeTitle: 'ようこそ',
  welcomeSubtitle: '生涯の健康への道 — 一歩ずつ。約2分。',
  welcomeAccept: 'この道を受け入れる',
  welcomeContinue: '続ける',
  welcomeSkipSignIn: 'スキップ — トレーニング開始',
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  editJourneyProfile: 'ジャーニープロフィールを編集',
  cloudSyncActive: 'クラウドにジャーニーを同期済み',
  cloudSyncPending: 'デバイス間同期にはサインインしてください',
  saveProfile: 'プロフィールを保存',
  yourProfile: 'あなたのプロフィール',
  firstTimeSetup: '初回セットアップ',
  betaJourneyProgress: 'ベータ進捗',
  emailNextStep: '次のステップをメールで受け取る',
  emailNextStepSent: '受信トレイで次のステップを確認してください。',
  f017LocalBadge: 'オフライン · この端末',
  f017DeferAccountTitle: 'この記録を残しますか？',
  f017DeferAccountBody:
    '同期するならアカウントを。オフライン記録はそのまま続けられます。',
  f017CreateAccount: 'アカウント作成',
  f017NotNow: '後で',
};

export const CORE_LOCALES: Record<Tier1Lang, CoreStrings> = {
  en,
  es,
  fr,
  pt,
  ru,
  de,
  it,
  ko,
  ja,
};

export function coreStringsFor(lang: string): CoreStrings {
  const code = lang.split('-')[0] as Tier1Lang;
  return CORE_LOCALES[code] ?? CORE_LOCALES.en;
}
