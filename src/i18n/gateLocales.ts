/** Private gate + offline fallback copy — full APP_LANGS records. EN lives in gateEn.ts. */

import { GATE_EN } from '@/i18n/gateEn';

/**
 * Overlays inherit EN public line + support (Log a set. Offline. /
 * No account. No wearable.). Eyebrows are Free equivalents — no beta.
 */

const GATE_ES: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/año",
  gateOfferBody: "Completa los entrenamientos del programa y te reembolsamos $99.",
  gateOfferCta: "Iniciar anual — $99",
  gateOfferFoot: "Pago seguro con Stripe.",
  gateOfferRefunds: "Términos de reembolso",
  gateEyebrow: 'Gratis',
  gateLogASet: 'Registrar una serie',
  gateWaitlistTitle: 'Avísame',
  gateWaitlistPlaceholder: 'tu@correo.com',
  gateWaitlistSubmit: 'Avísame',
  gateWaitlistSubmitting: 'Uniendo…',
  gateWaitlistDone: 'Estás en la lista.',
  gateWaitlistDoneFoot: 'Te escribiremos cuando se abra el acceso.',
  gateWaitlistFoot: 'Sin spam — un correo cuando se abra el acceso.',
  gateAccessSummary: '¿Tienes un código de acceso?',
  gateAccessLabel: 'Código de acceso',
  gateAccessPlaceholder: 'Código de acceso',
  gateAccessSubmit: 'Entrar con código',
  gateAccessChecking: 'Comprobando…',
  gateBetaGuide: 'guía de inicio',
  gateBetaGuideFoot: '¿Tienes un código? Ver la',
  offlineEyebrow: 'Sin conexión',
  offlineTitle: 'Sin conexión — pero en misión.',
  offlineBody:
    'Esta página aún no está en caché, pero lo que ya usaste sigue funcionando — tus entrenos viven en este dispositivo y se sincronizan al volver.',
  offlineCta: 'Abrir Hoy',
  gateFooterTagline: 'núcleo gratis para siempre',
};

const GATE_PT: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/ano",
  gateOfferBody: "Complete os treinos do programa e devolvemos o seu $99.",
  gateOfferCta: "Iniciar anual — $99",
  gateOfferFoot: "Pagamento seguro via Stripe.",
  gateOfferRefunds: "Termos de reembolso",
  gateEyebrow: 'Grátis',
  gateLogASet: 'Registrar uma série',
  gateWaitlistTitle: 'Avise-me',
  gateWaitlistSubmit: 'Avise-me',
  gateWaitlistSubmitting: 'Entrando…',
  gateWaitlistDone: 'Você está na lista.',
  gateAccessSummary: 'Tem um código de acesso?',
  gateAccessLabel: 'Código de acesso',
  gateAccessPlaceholder: 'Código de acesso',
  gateAccessSubmit: 'Entrar com código',
  gateAccessChecking: 'Verificando…',
  offlineEyebrow: 'Sem conexão',
  offlineTitle: 'Offline — mas na missão.',
  offlineCta: 'Abrir Hoje',
  gateFooterTagline: 'núcleo grátis para sempre',
};

const GATE_DE: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/Jahr",
  gateOfferBody: "Schließe die Trainings des Programms ab und wir erstatten dir $99.",
  gateOfferCta: "Jährlich starten — $99",
  gateOfferFoot: "Sichere Zahlung über Stripe.",
  gateOfferRefunds: "Rückgabebedingungen",
  gateEyebrow: 'Kostenlos',
  gateWaitlistTitle: 'Benachrichtigen',
  gateWaitlistSubmit: 'Benachrichtigen',
  gateWaitlistSubmitting: 'Beitritt…',
  gateWaitlistDone: 'Du bist auf der Liste.',
  gateAccessSummary: 'Hast du einen Zugangscode?',
  gateAccessLabel: 'Zugangscode',
  gateAccessPlaceholder: 'Zugangscode',
  gateAccessSubmit: 'Mit Code eintreten',
  gateAccessChecking: 'Prüfe…',
  offlineEyebrow: 'Offline',
  offlineTitle: 'Offline — Mission läuft weiter.',
  offlineCta: 'Heute öffnen',
  gateFooterTagline: 'Kern für immer gratis',
};

const GATE_IT: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/anno",
  gateOfferBody: "Completa gli allenamenti del programma e ti rimborsiamo $99.",
  gateOfferCta: "Inizia annuale — $99",
  gateOfferFoot: "Pagamento sicuro con Stripe.",
  gateOfferRefunds: "Termini di rimborso",
  gateEyebrow: 'Gratis',
  gateWaitlistTitle: 'Avvisami al lancio',
  gateWaitlistSubmit: 'Avvisami',
  gateAccessSummary: 'Hai un codice di accesso?',
  gateAccessLabel: 'Codice di accesso',
  gateAccessSubmit: 'Entra con codice',
  offlineTitle: 'Offline — ma in missione.',
  offlineCta: 'Apri Oggi',
  gateFooterTagline: 'nucleo gratis per sempre',
};

const GATE_RU: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/год",
  gateOfferBody: "Заверши тренировки программы, и мы вернём тебе $99.",
  gateOfferCta: "Начать годовой — $99",
  gateOfferFoot: "Безопасная оплата через Stripe.",
  gateOfferRefunds: "Условия возврата",
  gateEyebrow: 'Бесплатно',
  gateWaitlistTitle: 'Уведомить о запуске',
  gateWaitlistSubmit: 'Подписаться',
  gateAccessSummary: 'Есть код доступа?',
  gateAccessLabel: 'Код доступа',
  gateAccessSubmit: 'Войти с кодом',
  offlineTitle: 'Офлайн — миссия продолжается.',
  offlineCta: 'Открыть Сегодня',
  gateFooterTagline: 'ядро бесплатно навсегда',
};

const GATE_JA: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/年",
  gateOfferBody: "プログラムのワークアウトを完了すると、$99を返金いたします。",
  gateOfferCta: "年間を開始 — $99",
  gateOfferFoot: "Stripeによる安全な決済。",
  gateOfferRefunds: "返金条件",
  gateEyebrow: '無料',
  gateWaitlistTitle: 'ローンチ時に通知',
  gateWaitlistSubmit: '通知を受け取る',
  gateAccessSummary: 'アクセスコードをお持ちですか？',
  gateAccessLabel: 'アクセスコード',
  gateAccessSubmit: 'コードで入る',
  offlineTitle: 'オフライン — ミッションは続きます。',
  offlineCta: '今日を開く',
  gateFooterTagline: 'コア機能はずっと無料',
};

const GATE_KO: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/년",
  gateOfferBody: "프로그램의 워크아웃을 완료하면 $99를 환불해 드립니다.",
  gateOfferCta: "연간 시작 — $99",
  gateOfferFoot: "Stripe를 통한 안전한 결제.",
  gateOfferRefunds: "환불 약관",
  gateEyebrow: '무료',
  gateWaitlistTitle: '출시 알림 받기',
  gateWaitlistSubmit: '알림 받기',
  gateAccessSummary: '액세스 코드가 있나요?',
  gateAccessLabel: '액세스 코드',
  gateAccessSubmit: '코드로 입장',
  offlineTitle: '오프라인 — 미션은 계속됩니다.',
  offlineCta: '오늘 열기',
  gateFooterTagline: '핵심 기능은 영원히 무료',
};

const GATE_ZH: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/年",
  gateOfferBody: "完成计划的训练，我们将退还您的$99。",
  gateOfferCta: "开始年度 — $99",
  gateOfferFoot: "通过Stripe安全结账。",
  gateOfferRefunds: "退款条款",
  gateEyebrow: '免费',
  gateWaitlistTitle: '上线时通知我',
  gateWaitlistSubmit: '通知我',
  gateAccessSummary: '有访问码吗？',
  gateAccessLabel: '访问码',
  gateAccessSubmit: '用代码进入',
  offlineTitle: '离线 — 任务仍在继续。',
  offlineCta: '打开今日',
  gateFooterTagline: '核心功能永久免费',
};

const GATE_TH: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/ปี",
  gateOfferBody: "ทำโปรแกรมออกกำลังกายให้เสร็จสิ้น และเราจะคืนเงิน $99 ให้คุณ.",
  gateOfferCta: "เริ่มต้นรายปี — $99",
  gateOfferFoot: "ชำระเงินอย่างปลอดภัยผ่าน Stripe.",
  gateOfferRefunds: "เงื่อนไขการคืนเงิน",
  gateEyebrow: 'ฟรี',
  gateWaitlistTitle: 'แจ้งเมื่อเปิดตัว',
  gateWaitlistSubmit: 'แจ้งฉัน',
  gateAccessSummary: 'มีรหัสเข้าถึงไหม?',
  gateAccessLabel: 'รหัสเข้าถึง',
  gateAccessSubmit: 'เข้าด้วยรหัส',
  offlineTitle: 'ออฟไลน์ — แต่ยังอยู่ในภารกิจ',
  offlineCta: 'เปิดวันนี้',
  gateFooterTagline: 'ฟีเจอร์หลักฟรีตลอดไป',
};

const GATE_VI: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/năm",
  gateOfferBody: "Hoàn thành các bài tập của chương trình và chúng tôi sẽ hoàn lại $99 cho bạn.",
  gateOfferCta: "Bắt đầu hàng năm — $99",
  gateOfferFoot: "Thanh toán an toàn qua Stripe.",
  gateOfferRefunds: "Điều khoản hoàn tiền",
  gateEyebrow: 'Miễn phí',
  gateWaitlistTitle: 'Báo khi ra mắt',
  gateWaitlistSubmit: 'Báo cho tôi',
  gateAccessSummary: 'Bạn có mã truy cập?',
  gateAccessLabel: 'Mã truy cập',
  gateAccessSubmit: 'Vào bằng mã',
  offlineTitle: 'Ngoại tuyến — vẫn trong nhiệm vụ.',
  offlineCta: 'Mở Hôm nay',
  gateFooterTagline: 'tính năng cốt lõi miễn phí mãi mãi',
};

const GATE_HI: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/वर्ष",
  gateOfferBody: "कार्यक्रम के वर्कआउट पूरे करें और हम आपको $99 वापस कर देंगे।",
  gateOfferCta: "वार्षिक शुरू करें — $99",
  gateOfferFoot: "Stripe द्वारा सुरक्षित भुगतान।",
  gateOfferRefunds: "रिफंड की शर्तें",
  gateEyebrow: 'मुफ़्त',
  gateWaitlistTitle: 'लॉन्च पर सूचित करें',
  gateWaitlistSubmit: 'मुझे बताएं',
  gateAccessSummary: 'एक्सेस कोड है?',
  gateAccessLabel: 'एक्सेस कोड',
  gateAccessSubmit: 'कोड से प्रवेश',
  offlineTitle: 'ऑफ़लाइन — मिशन जारी।',
  offlineCta: 'आज खोलें',
  gateFooterTagline: 'कोर हमेशा मुफ़्त',
};

const GATE_ID: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/tahun",
  gateOfferBody: "Selesaikan latihan program dan kami akan mengembalikan $99 Anda.",
  gateOfferCta: "Mulai tahunan — $99",
  gateOfferFoot: "Pembayaran aman melalui Stripe.",
  gateOfferRefunds: "Ketentuan pengembalian",
  gateEyebrow: 'Gratis',
  gateWaitlistTitle: 'Beritahu saat peluncuran',
  gateWaitlistSubmit: 'Beritahu saya',
  gateAccessSummary: 'Punya kode akses?',
  gateAccessLabel: 'Kode akses',
  gateAccessSubmit: 'Masuk dengan kode',
  offlineTitle: 'Offline — misi tetap jalan.',
  offlineCta: 'Buka Hari Ini',
  gateFooterTagline: 'fitur inti gratis selamanya',
};

const GATE_AR: Record<string, string> = {
  ...GATE_EN,
  gateOfferTitle: "Mission Winning Yearly · $99/سنة",
  gateOfferBody: "أكمل تمارين البرنامج وسنقوم باسترداد $99 لك.",
  gateOfferCta: "ابدأ سنويًا — $99",
  gateOfferFoot: "الدفع الآمن عبر Stripe.",
  gateOfferRefunds: "شروط الاسترداد",
  gateEyebrow: 'مجاني',
  gateWaitlistTitle: 'أبلغني عند الإطلاق',
  gateWaitlistSubmit: 'أبلغني',
  gateAccessSummary: 'هل لديك رمز وصول؟',
  gateAccessLabel: 'رمز الوصول',
  gateAccessSubmit: 'ادخل بالرمز',
  offlineTitle: 'بدون اتصال — المهمة مستمرة.',
  offlineCta: 'افتح اليوم',
  gateFooterTagline: 'الأساس مجاني للأبد',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: GATE_EN,
  es: GATE_ES,
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
