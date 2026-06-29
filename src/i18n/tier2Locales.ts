/** Tier-2 UI strings — SEA, South Asia, MEA expansion. Same keys as Tier 1 core chrome. */

export const TIER2_LANGS = ['th', 'vi', 'hi'] as const;
export type Tier2Lang = (typeof TIER2_LANGS)[number];

type CoreStrings = {
  navToday: string;
  navTrain: string;
  navFuel: string;
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
  lang_th: string;
  lang_vi: string;
  lang_hi: string;
  editJourneyProfile: string;
  cloudSyncActive: string;
  cloudSyncPending: string;
  saveProfile: string;
  yourProfile: string;
  firstTimeSetup: string;
  betaJourneyProgress: string;
  emailNextStep: string;
  emailNextStepSent: string;
  navLeaderboard: string;
};

const sharedLangNames = {
  lang_de: 'Deutsch',
  lang_it: 'Italiano',
  lang_ko: '한국어',
  lang_ja: '日本語',
  lang_th: 'ไทย',
  lang_vi: 'Tiếng Việt',
  lang_hi: 'हिन्दी',
};

const th: CoreStrings = {
  navToday: 'วันนี้',
  navTrain: 'ฝึก',
  navFuel: 'โภชนาการ',
  navTrack: 'ติดตาม',
  navYou: 'โปรไฟล์',
  navMore: 'เพิ่มเติม',
  yourNextStep: 'ขั้นตอนถัดไป',
  formGuide: 'คู่มือท่า',
  formGuideTitle: 'คู่มือท่า',
  gotItStartSet: 'เข้าใจแล้ว — เริ่มเซ็ต',
  setup: 'เตรียมตัว',
  execute: 'ทำ',
  avoid: 'หลีกเลี่ยง',
  breath: 'หายใจ',
  simpleMode: 'ง่าย',
  proMode: 'โปร',
  appMode: 'โหมดแอป',
  commissionedLabel: 'พร้อมปฏิบัติ',
  commissionedTitle: 'คุณพร้อมสำหรับทุกวัน',
  commissionedBody:
    'การฝึกพื้นฐานและความพร้อมเสร็จสมบูรณ์ วันนี้คือศูนย์กลางของคุณ — หนึ่งการกระทำที่ชัดเจนทุกวัน สุขภาพสำหรับทุกคน',
  commissionedCta: 'ไปที่วันนี้',
  missionOperator: 'ผู้ปฏิบัติภารกิจ',
  welcomeBegin: 'เริ่ม',
  welcomeTitle: 'ยินดีต้อนรับ',
  welcomeSubtitle: 'เส้นทางสู่สุขภาพตลอดชีวิต — ทีละขั้น ใช้เวลาประมาณ 2 นาที',
  welcomeAccept: 'ฉันยอมรับเส้นทางนี้',
  welcomeContinue: 'ดำเนินการต่อ',
  welcomeSkipSignIn: 'ข้าม — ไปวันนี้',
  ...sharedLangNames,
  editJourneyProfile: 'แก้ไขโปรไฟล์',
  cloudSyncActive: 'ซิงค์เส้นทางไปยังคลาวด์แล้ว',
  cloudSyncPending: 'ลงชื่อเข้าใช้เพื่อซิงค์ข้ามอุปกรณ์',
  saveProfile: 'บันทึกโปรไฟล์',
  yourProfile: 'โปรไฟล์ของคุณ',
  firstTimeSetup: 'ตั้งค่าครั้งแรก',
  betaJourneyProgress: 'ความคืบหน้าเบต้า',
  emailNextStep: 'ส่งขั้นตอนถัดไปทางอีเมล',
  emailNextStepSent: 'ตรวจสอบกล่องจดหมายของคุณ',
  navLeaderboard: 'อันดับ',
};

const vi: CoreStrings = {
  navToday: 'Hôm nay',
  navTrain: 'Tập',
  navFuel: 'Dinh dưỡng',
  navTrack: 'Theo dõi',
  navYou: 'Hồ sơ',
  navMore: 'Thêm',
  yourNextStep: 'Bước tiếp theo',
  formGuide: 'Hướng dẫn động tác',
  formGuideTitle: 'Hướng dẫn động tác',
  gotItStartSet: 'Đã hiểu — bắt đầu set',
  setup: 'Chuẩn bị',
  execute: 'Thực hiện',
  avoid: 'Tránh',
  breath: 'Hơi thở',
  simpleMode: 'Đơn giản',
  proMode: 'Pro',
  appMode: 'Chế độ app',
  commissionedLabel: 'Sẵn sàng',
  commissionedTitle: 'Bạn đã sẵn sàng cho mỗi ngày',
  commissionedBody:
    'Hoàn thành huấn luyện cơ bản và sẵn sàng. Hôm nay là trung tâm — một hành động rõ ràng mỗi ngày. Sức khỏe cho mọi người.',
  commissionedCta: 'Tiếp tục đến Hôm nay',
  missionOperator: 'Người vận hành',
  welcomeBegin: 'Bắt đầu',
  welcomeTitle: 'Chào mừng',
  welcomeSubtitle: 'Hành trình sức khỏe suốt đời — từng bước một. Khoảng 2 phút.',
  welcomeAccept: 'Tôi chấp nhận con đường này',
  welcomeContinue: 'Tiếp tục',
  welcomeSkipSignIn: 'Bỏ qua — đến Hôm nay',
  ...sharedLangNames,
  editJourneyProfile: 'Sửa hồ sơ hành trình',
  cloudSyncActive: 'Đã đồng bộ hành trình lên cloud',
  cloudSyncPending: 'Đăng nhập để đồng bộ giữa các thiết bị',
  saveProfile: 'Lưu hồ sơ',
  yourProfile: 'Hồ sơ của bạn',
  firstTimeSetup: 'Thiết lập lần đầu',
  betaJourneyProgress: 'Tiến độ beta',
  emailNextStep: 'Gửi bước tiếp theo qua email',
  emailNextStepSent: 'Kiểm tra hộp thư của bạn',
  navLeaderboard: 'Bảng xếp hạng',
};

const hi: CoreStrings = {
  navToday: 'आज',
  navTrain: 'प्रशिक्षण',
  navFuel: 'पोषण',
  navTrack: 'ट्रैक',
  navYou: 'प्रोफ़ाइल',
  navMore: 'और',
  yourNextStep: 'अगला कदम',
  formGuide: 'फॉर्म गाइड',
  formGuideTitle: 'फॉर्म गाइड',
  gotItStartSet: 'समझ गया — सेट शुरू',
  setup: 'तैयारी',
  execute: 'क्रिया',
  avoid: 'बचें',
  breath: 'साँस',
  simpleMode: 'सरल',
  proMode: 'प्रो',
  appMode: 'ऐप मोड',
  commissionedLabel: 'तैनात',
  commissionedTitle: 'आप रोज़ाना के लिए तैयार हैं',
  commissionedBody:
    'बुनियादी प्रशिक्षण और तत्परता पूरी। आज आपका केंद्र है — हर दिन एक स्पष्ट कदम। सभी के लिए स्वास्थ्य।',
  commissionedCta: 'आज पर जाएँ',
  missionOperator: 'मिशन ऑपरेटर',
  welcomeBegin: 'शुरू',
  welcomeTitle: 'स्वागत है',
  welcomeSubtitle: 'जीवनभर स्वास्थ्य की ओर — एक कदम। लगभग 2 मिनट।',
  welcomeAccept: 'मैं इस रास्ते को स्वीकार करता/करती हूँ',
  welcomeContinue: 'जारी रखें',
  welcomeSkipSignIn: 'छोड़ें — आज पर जाएँ',
  ...sharedLangNames,
  editJourneyProfile: 'प्रोफ़ाइल संपादित करें',
  cloudSyncActive: 'क्लाउड में सिंक हो गया',
  cloudSyncPending: 'डिवाइसों पर सिंक के लिए साइन इन करें',
  saveProfile: 'प्रोफ़ाइल सहेजें',
  yourProfile: 'आपकी प्रोफ़ाइल',
  firstTimeSetup: 'पहली बार सेटअप',
  betaJourneyProgress: 'बीटा प्रगति',
  emailNextStep: 'अगला कदम ईमेल करें',
  emailNextStepSent: 'अपना इनबॉक्स देखें',
  navLeaderboard: 'लीडरबोर्ड',
};

export const TIER2_LOCALES: Record<Tier2Lang, CoreStrings> = { th, vi, hi };

export function tier2StringsFor(lang: string): CoreStrings | null {
  const code = lang.split('-')[0] as Tier2Lang;
  return TIER2_LOCALES[code] ?? null;
}
