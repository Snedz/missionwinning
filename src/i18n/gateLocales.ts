/** Private gate + offline fallback copy — full APP_LANGS records. */

const GATE_EN: Record<string, string> = {
  gateEyebrow: 'Free beta',
  gateTitle1: 'Train anywhere.',
  gateTitle2: 'Win daily.',
  gateSubtitle:
    'Free offline workout logging plus Mission Coach — weekly plans from your logs alone, no wearable. Full tools free for invited testers; the logger stays free forever.',
  gateFooterTagline: 'free core forever',
  gateWaitlistTitle: 'Get notified',
  gateWaitlistPlaceholder: 'you@example.com',
  gateWaitlistSubmit: 'Get notified',
  gateWaitlistSubmitting: 'Joining…',
  gateWaitlistDone: "You're on the list.",
  gateWaitlistDoneFoot: "We'll email you when a seat opens.",
  gateWaitlistFoot: 'No spam — one email when a seat opens, one if the waitlist moves.',
  gateAccessSummary: 'Have a beta access code?',
  gateAccessLabel: 'Access code',
  gateAccessPlaceholder: 'Enter code from your invite',
  gateAccessSubmit: 'Enter with code',
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
  gateEyebrow: 'Beta gratuita',
  gateTitle1: 'Entrena en cualquier lugar.',
  gateTitle2: 'Gana a diario.',
  gateSubtitle:
    'Registro offline gratis + Mission Coach desde tus logs (sin wearable). Herramientas completas gratis para invitados; el logger es gratis para siempre.',
  gateWaitlistTitle: 'Recibe aviso',
  gateWaitlistPlaceholder: 'tu@correo.com',
  gateWaitlistSubmit: 'Recibir aviso',
  gateWaitlistSubmitting: 'Uniendo…',
  gateWaitlistDone: 'Estás en la lista.',
  gateWaitlistDoneFoot: 'Te escribiremos cuando haya un sitio.',
  gateWaitlistFoot: 'Sin spam — un correo cuando haya un sitio.',
  gateAccessSummary: '¿Tienes un código de acceso beta?',
  gateAccessLabel: 'Código de acceso',
  gateAccessPlaceholder: 'Código de tu invitación',
  gateAccessSubmit: 'Entrar con código',
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
  gateEyebrow: 'Bêta gratuite',
  gateTitle1: 'Entraînez-vous partout.',
  gateTitle2: 'Gagnez chaque jour.',
  gateSubtitle:
    'Journal offline gratuit + Mission Coach depuis vos logs (sans wearable). Outils complets gratuits pour les invités ; le logger reste gratuit pour toujours.',
  gateWaitlistTitle: 'Être prévenu',
  gateWaitlistSubmit: 'Me prévenir',
  gateWaitlistSubmitting: 'Inscription…',
  gateWaitlistDone: 'Vous êtes sur la liste.',
  gateAccessSummary: 'Vous avez un code d’accès bêta ?',
  gateAccessLabel: 'Code d’accès',
  gateAccessPlaceholder: 'Code de votre invitation',
  gateAccessSubmit: 'Entrer avec un code',
  gateAccessChecking: 'Vérification…',
  offlineEyebrow: 'Hors ligne',
  offlineTitle: 'Hors ligne — toujours en mission.',
  offlineCta: 'Ouvrir Aujourd’hui',
  gateFooterTagline: 'cœur gratuit pour toujours',
};

const GATE_PT: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta gratuita',
  gateTitle1: 'Treine em qualquer lugar.',
  gateTitle2: 'Vença todo dia.',
  gateSubtitle:
    'Registro offline grátis + Mission Coach a partir dos seus logs (sem wearable). Ferramentas completas grátis para convidados; o logger fica grátis para sempre.',
  gateWaitlistTitle: 'Receba aviso',
  gateWaitlistSubmit: 'Avise-me',
  gateWaitlistSubmitting: 'Entrando…',
  gateWaitlistDone: 'Você está na lista.',
  gateAccessSummary: 'Tem um código de acesso beta?',
  gateAccessLabel: 'Código de acesso',
  gateAccessPlaceholder: 'Código do seu convite',
  gateAccessSubmit: 'Entrar com código',
  gateAccessChecking: 'Verificando…',
  offlineEyebrow: 'Sem conexão',
  offlineTitle: 'Offline — mas na missão.',
  offlineCta: 'Abrir Hoje',
  gateFooterTagline: 'núcleo grátis para sempre',
};

const GATE_DE: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Kostenlose Beta',
  gateTitle1: 'Überall trainieren.',
  gateTitle2: 'Täglich gewinnen.',
  gateSubtitle:
    'Kostenloses Offline-Logging + Mission Coach aus deinen Logs (ohne Wearable). Volle Tools gratis für Eingeladene; der Logger bleibt für immer gratis.',
  gateWaitlistTitle: 'Benachrichtigt werden',
  gateWaitlistSubmit: 'Benachrichtigen',
  gateWaitlistSubmitting: 'Beitritt…',
  gateWaitlistDone: 'Du bist auf der Liste.',
  gateAccessSummary: 'Hast du einen Beta-Zugangscode?',
  gateAccessLabel: 'Zugangscode',
  gateAccessPlaceholder: 'Code aus deiner Einladung',
  gateAccessSubmit: 'Mit Code eintreten',
  gateAccessChecking: 'Prüfe…',
  offlineEyebrow: 'Offline',
  offlineTitle: 'Offline — Mission läuft weiter.',
  offlineCta: 'Heute öffnen',
  gateFooterTagline: 'Kern für immer gratis',
};

const GATE_IT: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta gratuita',
  gateTitle1: 'Allena ovunque.',
  gateTitle2: 'Vinci ogni giorno.',
  gateWaitlistTitle: 'Avvisami',
  gateWaitlistSubmit: 'Avvisami',
  gateAccessSummary: 'Hai un codice di accesso beta?',
  gateAccessLabel: 'Codice di accesso',
  gateAccessSubmit: 'Entra con codice',
  offlineTitle: 'Offline — ma in missione.',
  offlineCta: 'Apri Oggi',
  gateFooterTagline: 'nucleo gratis per sempre',
};

const GATE_RU: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Бесплатная бета',
  gateTitle1: 'Тренируйся где угодно.',
  gateTitle2: 'Побеждай каждый день.',
  gateWaitlistTitle: 'Уведомить меня',
  gateWaitlistSubmit: 'Подписаться',
  gateAccessSummary: 'Есть код доступа к бете?',
  gateAccessLabel: 'Код доступа',
  gateAccessSubmit: 'Войти с кодом',
  offlineTitle: 'Офлайн — миссия продолжается.',
  offlineCta: 'Открыть Сегодня',
  gateFooterTagline: 'ядро бесплатно навсегда',
};

const GATE_JA: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: '無料ベータ',
  gateTitle1: 'どこでもトレーニング。',
  gateTitle2: '毎日勝つ。',
  gateWaitlistTitle: '通知を受け取る',
  gateWaitlistSubmit: '通知を受け取る',
  gateAccessSummary: 'ベータ招待コードをお持ちですか？',
  gateAccessLabel: 'アクセスコード',
  gateAccessSubmit: 'コードで入る',
  offlineTitle: 'オフライン — ミッションは続きます。',
  offlineCta: '今日を開く',
  gateFooterTagline: 'コア機能はずっと無料',
};

const GATE_KO: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: '무료 베타',
  gateTitle1: '어디서나 훈련하세요.',
  gateTitle2: '매일 승리하세요.',
  gateWaitlistTitle: '알림 받기',
  gateWaitlistSubmit: '알림 받기',
  gateAccessSummary: '베타 초대 코드가 있나요?',
  gateAccessLabel: '액세스 코드',
  gateAccessSubmit: '코드로 입장',
  offlineTitle: '오프라인 — 미션은 계속됩니다.',
  offlineCta: '오늘 열기',
  gateFooterTagline: '핵심 기능은 영원히 무료',
};

const GATE_ZH: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: '免费测试',
  gateTitle1: '随处训练。',
  gateTitle2: '每日取胜。',
  gateWaitlistTitle: '通知我',
  gateWaitlistSubmit: '通知我',
  gateAccessSummary: '有内测邀请码吗？',
  gateAccessLabel: '访问码',
  gateAccessSubmit: '用代码进入',
  offlineTitle: '离线 — 任务仍在继续。',
  offlineCta: '打开今日',
  gateFooterTagline: '核心功能永久免费',
};

const GATE_TH: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'เบต้าฟรี',
  gateTitle1: 'ฝึกได้ทุกที่',
  gateTitle2: 'ชนะทุกวัน',
  gateWaitlistTitle: 'แจ้งฉัน',
  gateWaitlistSubmit: 'แจ้งฉัน',
  gateAccessSummary: 'มีรหัสเข้าถึงเบต้าไหม?',
  gateAccessLabel: 'รหัสเข้าถึง',
  gateAccessSubmit: 'เข้าด้วยรหัส',
  offlineTitle: 'ออฟไลน์ — แต่ยังอยู่ในภารกิจ',
  offlineCta: 'เปิดวันนี้',
  gateFooterTagline: 'ฟีเจอร์หลักฟรีตลอดไป',
};

const GATE_VI: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta miễn phí',
  gateTitle1: 'Tập luyện mọi nơi.',
  gateTitle2: 'Chiến thắng mỗi ngày.',
  gateWaitlistTitle: 'Báo cho tôi',
  gateWaitlistSubmit: 'Báo cho tôi',
  gateAccessSummary: 'Bạn có mã truy cập beta?',
  gateAccessLabel: 'Mã truy cập',
  gateAccessSubmit: 'Vào bằng mã',
  offlineTitle: 'Ngoại tuyến — vẫn trong nhiệm vụ.',
  offlineCta: 'Mở Hôm nay',
  gateFooterTagline: 'tính năng cốt lõi miễn phí mãi mãi',
};

const GATE_HI: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'मुफ्त बीटा',
  gateTitle1: 'कहीं भी ट्रेन करें।',
  gateTitle2: 'रोज जीतें।',
  gateWaitlistTitle: 'मुझे बताएं',
  gateWaitlistSubmit: 'मुझे बताएं',
  gateAccessSummary: 'बीटा एक्सेस कोड है?',
  gateAccessLabel: 'एक्सेस कोड',
  gateAccessSubmit: 'कोड से प्रवेश',
  offlineTitle: 'ऑफ़लाइन — मिशन जारी।',
  offlineCta: 'आज खोलें',
  gateFooterTagline: 'कोर हमेशा मुफ़्त',
};

const GATE_ID: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta gratis',
  gateTitle1: 'Latihan di mana saja.',
  gateTitle2: 'Menang setiap hari.',
  gateWaitlistTitle: 'Beritahu saya',
  gateWaitlistSubmit: 'Beritahu saya',
  gateAccessSummary: 'Punya kode akses beta?',
  gateAccessLabel: 'Kode akses',
  gateAccessSubmit: 'Masuk dengan kode',
  offlineTitle: 'Offline — misi tetap jalan.',
  offlineCta: 'Buka Hari Ini',
  gateFooterTagline: 'fitur inti gratis selamanya',
};

const GATE_AR: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'بيتا مجانية',
  gateTitle1: 'تدرب في أي مكان.',
  gateTitle2: 'انتصِر يوميًا.',
  gateWaitlistTitle: 'أبلغني',
  gateWaitlistSubmit: 'أبلغني',
  gateAccessSummary: 'هل لديك رمز وصول للنسخة التجريبية؟',
  gateAccessLabel: 'رمز الوصول',
  gateAccessSubmit: 'ادخل بالرمز',
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
