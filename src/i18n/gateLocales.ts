/** Private gate + offline fallback copy — full APP_LANGS records. */

const GATE_EN: Record<string, string> = {
  gateEyebrow: 'Private beta in progress',
  gateTitle1: 'Train anywhere.',
  gateTitle2: 'Win daily.',
  gateSubtitle:
    'Free offline workout logging plus Mission Coach — weekly plans from your logs alone, no wearable. Launching soon; the core is free forever.',
  gateFooterTagline: 'free core forever',
  gateWaitlistTitle: 'Get notified at launch',
  gateWaitlistPlaceholder: 'you@example.com',
  gateWaitlistSubmit: 'Notify me',
  gateWaitlistSubmitting: 'Joining…',
  gateWaitlistDone: "You're on the list.",
  gateWaitlistDoneFoot: "We'll email you the moment doors open.",
  gateWaitlistFoot: 'No spam — one email when the beta opens, one at launch.',
  gateAccessSummary: 'Have a beta access code?',
  gateAccessLabel: 'Access code',
  gateAccessPlaceholder: 'Enter code from your invite',
  gateAccessSubmit: 'Enter the beta',
  gateAccessChecking: 'Checking…',
  gateInviteEyebrow: 'Beta invite',
  gateInviteHeadline: "You're invited — enter your access code to join the beta.",
  gateInviteSubtitle:
    "You're invited — enter the access code from your invite email, then complete I-Day and log your first workout.",
  gateBetaGuide: 'beta start guide',
  gateBetaGuideFoot: 'Invited testers: see the',
  offlineEyebrow: 'No connection',
  offlineTitle: "You're offline. The log isn't.",
  offlineBody:
    "This page isn't cached yet, but everything you've already used keeps working — your workouts live on this device and sync when you're back online.",
  offlineCta: 'Open Today',
};

const GATE_ES: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta privada en curso',
  gateTitle1: 'Entrena en cualquier lugar.',
  gateTitle2: 'Gana a diario.',
  gateSubtitle:
    'Registro de entrenamientos offline gratis + Mission Coach adaptativo desde tus logs (sin wearable). Pronto — núcleo gratis para siempre.',
  gateWaitlistTitle: 'Avísame en el lanzamiento',
  gateWaitlistPlaceholder: 'tu@correo.com',
  gateWaitlistSubmit: 'Avísame',
  gateWaitlistSubmitting: 'Uniendo…',
  gateWaitlistDone: 'Estás en la lista.',
  gateWaitlistDoneFoot: 'Te escribiremos cuando abramos.',
  gateWaitlistFoot: 'Sin spam — un correo al abrir la beta, otro en el lanzamiento.',
  gateAccessSummary: '¿Tienes un código de acceso beta?',
  gateAccessLabel: 'Código de acceso',
  gateAccessPlaceholder: 'Código de tu invitación',
  gateAccessSubmit: 'Entrar a la beta',
  gateAccessChecking: 'Comprobando…',
  gateBetaGuide: 'guía de inicio beta',
  gateBetaGuideFoot: 'Invitados: ver la',
  offlineEyebrow: 'Sin conexión',
  offlineTitle: 'Sin conexión — pero en misión.',
  offlineBody:
    'Esta página aún no está en caché, pero lo que ya usaste sigue funcionando — tus entrenos viven en este dispositivo y se sincronizan al volver.',
  offlineCta: 'Abrir Hoy',
  gateFooterTagline: 'núcleo gratis para siempre',
};

const GATE_FR: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Bêta privée en cours',
  gateTitle1: 'Entraînez-vous partout.',
  gateTitle2: 'Gagnez chaque jour.',
  gateSubtitle:
    'Journal d’entraînement offline gratuit + Mission Coach adaptatif depuis vos logs (sans wearable). Bientôt — cœur gratuit pour toujours.',
  gateWaitlistTitle: 'Être notifié au lancement',
  gateWaitlistSubmit: 'Me prévenir',
  gateWaitlistSubmitting: 'Inscription…',
  gateWaitlistDone: 'Vous êtes sur la liste.',
  gateAccessSummary: 'Vous avez un code d’accès bêta ?',
  gateAccessLabel: 'Code d’accès',
  gateAccessPlaceholder: 'Code de votre invitation',
  gateAccessSubmit: 'Entrer dans la bêta',
  gateAccessChecking: 'Vérification…',
  offlineEyebrow: 'Hors ligne',
  offlineTitle: 'Hors ligne — toujours en mission.',
  offlineCta: 'Ouvrir Aujourd’hui',
  gateFooterTagline: 'cœur gratuit pour toujours',
};

const GATE_PT: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta privada em andamento',
  gateTitle1: 'Treine em qualquer lugar.',
  gateTitle2: 'Vença todo dia.',
  gateSubtitle:
    'Registro de treino offline grátis + Mission Coach adaptativo a partir dos seus logs (sem wearable). Em breve — núcleo grátis para sempre.',
  gateWaitlistTitle: 'Avise-me no lançamento',
  gateWaitlistSubmit: 'Avise-me',
  gateWaitlistSubmitting: 'Entrando…',
  gateWaitlistDone: 'Você está na lista.',
  gateAccessSummary: 'Tem um código de acesso beta?',
  gateAccessLabel: 'Código de acesso',
  gateAccessPlaceholder: 'Código do seu convite',
  gateAccessSubmit: 'Entrar na beta',
  gateAccessChecking: 'Verificando…',
  offlineEyebrow: 'Sem conexão',
  offlineTitle: 'Offline — mas na missão.',
  offlineCta: 'Abrir Hoje',
  gateFooterTagline: 'núcleo grátis para sempre',
};

const GATE_DE: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Private Beta läuft',
  gateTitle1: 'Überall trainieren.',
  gateTitle2: 'Täglich gewinnen.',
  gateSubtitle:
    'Kostenloses Offline-Workout-Logging + adaptiver Mission Coach aus deinen Logs (ohne Wearable). Bald — Kern für immer gratis.',
  gateWaitlistTitle: 'Bei Launch benachrichtigen',
  gateWaitlistSubmit: 'Benachrichtigen',
  gateWaitlistSubmitting: 'Beitritt…',
  gateWaitlistDone: 'Du bist auf der Liste.',
  gateAccessSummary: 'Hast du einen Beta-Zugangscode?',
  gateAccessLabel: 'Zugangscode',
  gateAccessPlaceholder: 'Code aus deiner Einladung',
  gateAccessSubmit: 'In die Beta',
  gateAccessChecking: 'Prüfe…',
  offlineEyebrow: 'Offline',
  offlineTitle: 'Offline — Mission läuft weiter.',
  offlineCta: 'Heute öffnen',
  gateFooterTagline: 'Kern für immer gratis',
};

const GATE_IT: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta privata in corso',
  gateTitle1: 'Allena ovunque.',
  gateTitle2: 'Vinci ogni giorno.',
  gateWaitlistTitle: 'Avvisami al lancio',
  gateWaitlistSubmit: 'Avvisami',
  gateAccessSummary: 'Hai un codice di accesso beta?',
  gateAccessLabel: 'Codice di accesso',
  gateAccessSubmit: 'Entra nella beta',
  offlineTitle: 'Offline — ma in missione.',
  offlineCta: 'Apri Oggi',
  gateFooterTagline: 'nucleo gratis per sempre',
};

const GATE_RU: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Закрытая бета',
  gateTitle1: 'Тренируйся где угодно.',
  gateTitle2: 'Побеждай каждый день.',
  gateWaitlistTitle: 'Уведомить о запуске',
  gateWaitlistSubmit: 'Подписаться',
  gateAccessSummary: 'Есть код доступа к бете?',
  gateAccessLabel: 'Код доступа',
  gateAccessSubmit: 'Войти в бету',
  offlineTitle: 'Офлайн — миссия продолжается.',
  offlineCta: 'Открыть Сегодня',
  gateFooterTagline: 'ядро бесплатно навсегда',
};

const GATE_JA: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'プライベートベータ実施中',
  gateTitle1: 'どこでもトレーニング。',
  gateTitle2: '毎日勝つ。',
  gateWaitlistTitle: 'ローンチ時に通知',
  gateWaitlistSubmit: '通知を受け取る',
  gateAccessSummary: 'ベータ招待コードをお持ちですか？',
  gateAccessLabel: 'アクセスコード',
  gateAccessSubmit: 'ベータに入る',
  offlineTitle: 'オフライン — ミッションは続きます。',
  offlineCta: '今日を開く',
  gateFooterTagline: 'コア機能はずっと無料',
};

const GATE_KO: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: '비공개 베타 진행 중',
  gateTitle1: '어디서나 훈련하세요.',
  gateTitle2: '매일 승리하세요.',
  gateWaitlistTitle: '출시 알림 받기',
  gateWaitlistSubmit: '알림 받기',
  gateAccessSummary: '베타 초대 코드가 있나요?',
  gateAccessLabel: '액세스 코드',
  gateAccessSubmit: '베타 입장',
  offlineTitle: '오프라인 — 미션은 계속됩니다.',
  offlineCta: '오늘 열기',
  gateFooterTagline: '핵심 기능은 영원히 무료',
};

const GATE_ZH: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: '私测进行中',
  gateTitle1: '随处训练。',
  gateTitle2: '每日取胜。',
  gateWaitlistTitle: '上线时通知我',
  gateWaitlistSubmit: '通知我',
  gateAccessSummary: '有内测邀请码吗？',
  gateAccessLabel: '访问码',
  gateAccessSubmit: '进入内测',
  offlineTitle: '离线 — 任务仍在继续。',
  offlineCta: '打开今日',
  gateFooterTagline: '核心功能永久免费',
};

const GATE_TH: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'เบต้าส่วนตัวกำลังดำเนินอยู่',
  gateTitle1: 'ฝึกได้ทุกที่',
  gateTitle2: 'ชนะทุกวัน',
  gateWaitlistTitle: 'แจ้งเมื่อเปิดตัว',
  gateWaitlistSubmit: 'แจ้งฉัน',
  gateAccessSummary: 'มีรหัสเข้าถึงเบต้าไหม?',
  gateAccessLabel: 'รหัสเข้าถึง',
  gateAccessSubmit: 'เข้าสู่เบต้า',
  offlineTitle: 'ออฟไลน์ — แต่ยังอยู่ในภารกิจ',
  offlineCta: 'เปิดวันนี้',
  gateFooterTagline: 'ฟีเจอร์หลักฟรีตลอดไป',
};

const GATE_VI: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta riêng tư đang chạy',
  gateTitle1: 'Tập luyện mọi nơi.',
  gateTitle2: 'Chiến thắng mỗi ngày.',
  gateWaitlistTitle: 'Báo khi ra mắt',
  gateWaitlistSubmit: 'Báo cho tôi',
  gateAccessSummary: 'Bạn có mã truy cập beta?',
  gateAccessLabel: 'Mã truy cập',
  gateAccessSubmit: 'Vào beta',
  offlineTitle: 'Ngoại tuyến — vẫn trong nhiệm vụ.',
  offlineCta: 'Mở Hôm nay',
  gateFooterTagline: 'tính năng cốt lõi miễn phí mãi mãi',
};

const GATE_HI: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'निजी बीटा जारी',
  gateTitle1: 'कहीं भी ट्रेन करें।',
  gateTitle2: 'रोज जीतें।',
  gateWaitlistTitle: 'लॉन्च पर सूचित करें',
  gateWaitlistSubmit: 'मुझे बताएं',
  gateAccessSummary: 'बीटा एक्सेस कोड है?',
  gateAccessLabel: 'एक्सेस कोड',
  gateAccessSubmit: 'बीटा में प्रवेश',
  offlineTitle: 'ऑफ़लाइन — मिशन जारी।',
  offlineCta: 'आज खोलें',
  gateFooterTagline: 'कोर हमेशा मुफ़्त',
};

const GATE_ID: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta privat berlangsung',
  gateTitle1: 'Latihan di mana saja.',
  gateTitle2: 'Menang setiap hari.',
  gateWaitlistTitle: 'Beritahu saat peluncuran',
  gateWaitlistSubmit: 'Beritahu saya',
  gateAccessSummary: 'Punya kode akses beta?',
  gateAccessLabel: 'Kode akses',
  gateAccessSubmit: 'Masuk beta',
  offlineTitle: 'Offline — misi tetap jalan.',
  offlineCta: 'Buka Hari Ini',
  gateFooterTagline: 'fitur inti gratis selamanya',
};

const GATE_AR: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'نسخة تجريبية خاصة جارية',
  gateTitle1: 'تدرب في أي مكان.',
  gateTitle2: 'انتصِر يوميًا.',
  gateWaitlistTitle: 'أبلغني عند الإطلاق',
  gateWaitlistSubmit: 'أبلغني',
  gateAccessSummary: 'هل لديك رمز وصول للنسخة التجريبية؟',
  gateAccessLabel: 'رمز الوصول',
  gateAccessSubmit: 'ادخل النسخة التجريبية',
  offlineTitle: 'بدون اتصال — المهمة مستمرة.',
  offlineCta: 'افتح اليوم',
  gateFooterTagline: 'الأساس مجاني للأبد',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: GATE_EN,
  es: GATE_ES,
  fr: GATE_FR,
  pt: GATE_PT,
  de: GATE_DE,
  it: GATE_IT,
  ru: GATE_RU,
  ja: GATE_JA,
  ko: GATE_KO,
  zh: GATE_ZH,
  th: GATE_TH,
  vi: GATE_VI,
  hi: GATE_HI,
  id: GATE_ID,
  ar: GATE_AR,
};

export function gateStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeGateStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, gateStringsFor(lang));
}
