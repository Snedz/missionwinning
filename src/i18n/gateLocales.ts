/** Private gate + offline fallback copy — full APP_LANGS records. EN lives in gateEn.ts. */

import { GATE_EN } from '@/i18n/gateEn';

const GATE_ES: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta gratis',
  gateTitle1: 'Entrena en cualquier lugar.',
  gateTitle2: 'Gana a diario.',
  gateSubtitle:
    'Registro offline gratis + Mission Coach desde tus logs (sin wearable). Herramientas completas gratis para invitados; el logger es gratis para siempre.',
  gateLogASet: 'Registrar una serie',
  gateWaitlistTitle: 'Pide una invitación',
  gateWaitlistPlaceholder: 'tu@correo.com',
  gateWaitlistSubmit: 'Avísame',
  gateWaitlistSubmitting: 'Uniendo…',
  gateWaitlistDone: 'Estás en la lista.',
  gateWaitlistDoneFoot: 'Te escribiremos cuando haya un sitio.',
  gateWaitlistFoot: 'Sin spam — un correo cuando tu invitación esté lista.',
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


const GATE_PT: Record<string, string> = {
  ...GATE_EN,
  gateEyebrow: 'Beta grátis',
  gateTitle1: 'Treine em qualquer lugar.',
  gateTitle2: 'Vença todo dia.',
  gateSubtitle:
    'Registro offline grátis + Mission Coach a partir dos seus logs (sem wearable). Ferramentas completas grátis para convidados; o logger fica grátis para sempre.',
  gateLogASet: 'Registrar uma série',
  gateWaitlistTitle: 'Peça um convite',
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
  gateEyebrow: 'Kostenlose Beta',
  gateTitle1: 'Überall trainieren.',
  gateTitle2: 'Täglich gewinnen.',
  gateSubtitle:
    'Kostenloses Offline-Logging + Mission Coach aus deinen Logs (ohne Wearable). Volle Tools gratis für Eingeladene; der Logger bleibt für immer gratis.',
  gateWaitlistTitle: 'Einladung anfragen',
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
  gateEyebrow: 'Beta aperta solo su invito',
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
  gateEyebrow: 'Открытая бета по приглашению',
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
  gateEyebrow: '招待制オープンベータ',
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
  gateEyebrow: '초대 전용 오픈 베타',
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
  gateEyebrow: '仅邀请开放测试',
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
  gateEyebrow: 'โอเพนเบต้าเฉพาะผู้ได้รับเชิญ',
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
  gateEyebrow: 'Beta mở chỉ theo lời mời',
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
  gateEyebrow: 'केवल आमंत्रण ओपन बीटा',
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
  gateEyebrow: 'Beta terbuka hanya undangan',
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
  gateEyebrow: 'بيتا مفتوحة بالدعوة فقط',
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
