/** Welcome / I-Day onboarding copy — merged into i18n `common` namespace. */

export type WelcomeLang = string;

type WelcomeStrings = {
  welcomeKicker: string;
  welcomeIDay: string;
  welcomeMissionLead: string;
  welcomeMissionBody1: string;
  welcomeMissionP2: string;
  welcomeMissionP3: string;
  welcomeProfileTitle: string;
  welcomeProfileEditHint: string;
  welcomeProfileHint: string;
  welcomeExperience: string;
  welcomeExpBeginner: string;
  welcomeExpIntermediate: string;
  welcomeExpAdvanced: string;
  welcomeGearCheck: string;
  welcomeEquipBodyweight: string;
  welcomeEquipDumbbells: string;
  welcomeEquipFullGym: string;
  welcomePrimaryGoal: string;
  welcomeGoalPlaceholder: string;
  welcomeBack: string;
  headerSignIn: string;
  photoLogTitle: string;
  photoLogDesc: string;
  photoLogChoose: string;
  photoLogComingSoon: string;
  photoLogBetaNote: string;
  navOurMission: string;
  navBetaGuide: string;
};

const en: WelcomeStrings = {
  welcomeKicker: 'Where the journey begins',
  welcomeIDay: 'I-Day',
  welcomeMissionLead: 'The mission:',
  welcomeMissionBody1:
    'Mission Winning is a free global health app. Train, fuel, move, mind, track, and learn — one place, one path forward.',
  welcomeMissionP2:
    'The fundamentals are free forever. Premium deepens each pillar for those who want more — never required to start.',
  welcomeMissionP3:
    'Your job today: complete one step at a time. Today hub will always show your next single action.',
  welcomeProfileTitle: 'Three quick questions',
  welcomeProfileEditHint: 'Update experience, equipment, and goal. Changes sync when signed in.',
  welcomeProfileHint: 'So Today can recommend the right starting point.',
  welcomeExperience: 'Experience',
  welcomeExpBeginner: 'New to training',
  welcomeExpIntermediate: 'Some experience',
  welcomeExpAdvanced: 'Training for years',
  welcomeGearCheck: 'Gear check — what do you have today?',
  welcomeEquipBodyweight: 'Bodyweight only',
  welcomeEquipDumbbells: 'Dumbbells or bands',
  welcomeEquipFullGym: 'Full gym access',
  welcomePrimaryGoal: 'Primary goal',
  welcomeGoalPlaceholder: 'Build strength and stay healthy',
  welcomeBack: 'Back',
  headerSignIn: 'Sign in',
  photoLogTitle: 'Log from photo',
  photoLogDesc: 'Snap a meal — we estimate macros (beta coming soon).',
  photoLogChoose: 'Choose photo',
  photoLogComingSoon: 'Photo logging is in development. Use quick log or recipes for now.',
  photoLogBetaNote: 'Bevel-style meal capture — privacy-first, on-device when possible.',
  navOurMission: 'Our mission',
  navBetaGuide: 'Beta guide',
};

const zh: WelcomeStrings = {
  welcomeKicker: '旅程从这里开始',
  welcomeIDay: '入门日',
  welcomeMissionLead: '使命：',
  welcomeMissionBody1:
    'Mission Winning 是一款免费全球健康应用。训练、营养、活动、心理、追踪、学习 — 一个应用，一条道路。',
  welcomeMissionP2: '基础功能永久免费。高级功能深化各支柱 — 入门无需付费。',
  welcomeMissionP3: '今天的任务：一步一步完成。今日页面始终显示你的下一个行动。',
  welcomeProfileTitle: '三个简单问题',
  welcomeProfileEditHint: '更新经验、装备和目标。登录后同步。',
  welcomeProfileHint: '以便今日为你推荐合适的起点。',
  welcomeExperience: '训练经验',
  welcomeExpBeginner: '新手',
  welcomeExpIntermediate: '有一些经验',
  welcomeExpAdvanced: '训练多年',
  welcomeGearCheck: '装备 — 你今天有什么？',
  welcomeEquipBodyweight: '仅自重',
  welcomeEquipDumbbells: '哑铃或弹力带',
  welcomeEquipFullGym: '完整健身房',
  welcomePrimaryGoal: '主要目标',
  welcomeGoalPlaceholder: '增强力量，保持健康',
  welcomeBack: '返回',
  headerSignIn: '登录',
  photoLogTitle: '拍照记录',
  photoLogDesc: '拍摄餐食 — 我们将估算营养（测试版即将推出）。',
  photoLogChoose: '选择照片',
  photoLogComingSoon: '拍照记录开发中。请先用快速记录或食谱。',
  photoLogBetaNote: '隐私优先 — 尽可能在设备上处理。',
  navOurMission: '我们的使命',
  navBetaGuide: '测试指南',
};

const id: WelcomeStrings = {
  welcomeKicker: 'Perjalanan dimulai di sini',
  welcomeIDay: 'Hari-I',
  welcomeMissionLead: 'Misi:',
  welcomeMissionBody1:
    'Mission Winning adalah app kesehatan global gratis. Latihan, nutrisi, gerak, pikiran, lacak, dan belajar — satu tempat, satu jalan.',
  welcomeMissionP2:
    'Dasar gratis selamanya. Premium memperdalam setiap pilar — tidak wajib untuk memulai.',
  welcomeMissionP3:
    'Tugas hari ini: selesaikan satu langkah. Tab Hari ini selalu menampilkan aksi berikutnya.',
  welcomeProfileTitle: 'Tiga pertanyaan singkat',
  welcomeProfileEditHint: 'Perbarui pengalaman, peralatan, dan tujuan. Sinkron saat masuk.',
  welcomeProfileHint: 'Agar Hari ini bisa merekomendasikan titik awal yang tepat.',
  welcomeExperience: 'Pengalaman',
  welcomeExpBeginner: 'Baru mulai latihan',
  welcomeExpIntermediate: 'Sudah berpengalaman',
  welcomeExpAdvanced: 'Latihan bertahun-tahun',
  welcomeGearCheck: 'Peralatan — apa yang Anda punya hari ini?',
  welcomeEquipBodyweight: 'Berat badan saja',
  welcomeEquipDumbbells: 'Dumbbell atau band',
  welcomeEquipFullGym: 'Akses gym lengkap',
  welcomePrimaryGoal: 'Tujuan utama',
  welcomeGoalPlaceholder: 'Bangun kekuatan dan tetap sehat',
  welcomeBack: 'Kembali',
  headerSignIn: 'Masuk',
  photoLogTitle: 'Catat dari foto',
  photoLogDesc: 'Foto makanan — kami estimasi makro (beta segera).',
  photoLogChoose: 'Pilih foto',
  photoLogComingSoon: 'Log foto sedang dikembangkan. Gunakan log cepat atau resep dulu.',
  photoLogBetaNote: 'Privasi dulu — diproses di perangkat jika memungkinkan.',
  navOurMission: 'Misi kami',
  navBetaGuide: 'Panduan beta',
};

const th: WelcomeStrings = {
  welcomeKicker: 'จุดเริ่มต้นของเส้นทาง',
  welcomeIDay: 'วัน I',
  welcomeMissionLead: 'ภารกิจ:',
  welcomeMissionBody1:
    'Mission Winning เป็นแอปสุขภาพโลกฟรี ฝึก โภชนาการ เคลื่อนไหว จิต ติดตาม และเรียนรู้ — ที่เดียว เส้นทางเดียว',
  welcomeMissionP2: 'พื้นฐานฟรีตลอดไป พรีเมียมเพิ่มความลึก — ไม่จำเป็นต้องเริ่ม',
  welcomeMissionP3: 'งานวันนี้: ทำทีละขั้น หน้าวันนี้จะแสดงการกระทำถัดไปเสมอ',
  welcomeProfileTitle: 'สามคำถามสั้นๆ',
  welcomeProfileEditHint: 'อัปเดตประสบการณ์ อุปกรณ์ และเป้าหมาย ซิงค์เมื่อลงชื่อเข้าใช้',
  welcomeProfileHint: 'เพื่อให้วันนี้แนะนำจุดเริ่มต้นที่เหมาะสม',
  welcomeExperience: 'ประสบการณ์',
  welcomeExpBeginner: 'ใหม่กับการฝึก',
  welcomeExpIntermediate: 'มีประสบการณ์บ้าง',
  welcomeExpAdvanced: 'ฝึกมาหลายปี',
  welcomeGearCheck: 'อุปกรณ์ — วันนี้มีอะไรบ้าง?',
  welcomeEquipBodyweight: 'น้ำหนักตัวอย่างเดียว',
  welcomeEquipDumbbells: 'ดัมเบลหรือยาง',
  welcomeEquipFullGym: 'ยิมครบ',
  welcomePrimaryGoal: 'เป้าหมายหลัก',
  welcomeGoalPlaceholder: 'สร้างความแข็งแรงและสุขภาพดี',
  welcomeBack: 'ย้อนกลับ',
  headerSignIn: 'ลงชื่อเข้าใช้',
  photoLogTitle: 'บันทึกจากรูป',
  photoLogDesc: 'ถ่ายมื้ออาหาร — ประมาณค่าโภชนาการ (เบต้าเร็วๆ นี้)',
  photoLogChoose: 'เลือกรูป',
  photoLogComingSoon: 'กำลังพัฒนาบันทึกจากรูป ใช้บันทึกด่วนหรือสูตรก่อน',
  photoLogBetaNote: 'ความเป็นส่วนตัวก่อน — ประมวลผลบนอุปกรณ์เมื่อเป็นไปได้',
  navOurMission: 'ภารกิจของเรา',
  navBetaGuide: 'คู่มือเบต้า',
};

const es: WelcomeStrings = {
  ...en,
  welcomeKicker: 'Donde comienza el camino',
  welcomeIDay: 'Día I',
  welcomeMissionLead: 'La misión:',
  welcomeProfileTitle: 'Tres preguntas rápidas',
  welcomeBack: 'Atrás',
  headerSignIn: 'Entrar',
  photoLogTitle: 'Registrar con foto',
  navOurMission: 'Nuestra misión',
  navBetaGuide: 'Guía beta',
};

const LOCALES: Partial<Record<string, WelcomeStrings>> = { en, zh, id, th, es };

export function welcomeStringsFor(lang: string): WelcomeStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeWelcomeStrings(
  target: Record<string, string>,
  lang: string
): void {
  Object.assign(target, welcomeStringsFor(lang));
}
