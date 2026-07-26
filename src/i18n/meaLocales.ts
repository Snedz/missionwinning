/** MEA (Middle East & Africa) UI strings — Arabic first. Merged into i18n `common` namespace. */

export const MEA_LANGS = ['ar'] as const;
export type MeaLang = (typeof MEA_LANGS)[number];

type MeaCoreStrings = {
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
  lang_ar: string;
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
  lang_en: string;
  lang_es: string;
  lang_zh: string;
};

const ar: MeaCoreStrings = {
  navToday: 'اليوم',
  navTrain: 'تدريب',
  navFuel: 'تغذية',
  navTrack: 'تتبع',
  navYou: 'أنت',
  navMore: 'المزيد',
  yourNextStep: 'خطوتك التالية',
  formGuide: 'دليل الأداء',
  formGuideTitle: 'دليل الأداء',
  gotItStartSet: 'فهمت — ابدأ المجموعة',
  setup: 'الإعداد',
  execute: 'التنفيذ',
  avoid: 'تجنّب',
  breath: 'التنفس',
  commissionedLabel: 'جاهز للخدمة',
  commissionedTitle: 'أنت جاهز للمهمة اليومية',
  commissionedBody:
    'اكتمل التدريب الأساسي والجاهزية. اليوم هو مركز قيادتك — إجراء واحد واضح كل يوم. صحة للجميع.',
  commissionedCta: 'متابعة إلى اليوم',
  missionOperator: 'مشغّل المهمة',
  welcomeBegin: 'ابدأ',
  welcomeTitle: 'مرحباً بك في المهمة',
  welcomeSubtitle: 'رحلتك نحو صحة مدى الحياة — خطوة بخطوة. حوالي دقيقتين.',
  welcomeAccept: 'أقبل المسار',
  welcomeContinue: 'متابعة',
  welcomeSkipSignIn: 'تخطّ — ابدأ التمرين',
  lang_ar: 'العربية',
  editJourneyProfile: 'تعديل ملف الرحلة',
  cloudSyncActive: 'تمت مزامنة الرحلة مع السحابة',
  cloudSyncPending: 'سجّل الدخول للمزامنة بين الأجهزة',
  saveProfile: 'حفظ الملف',
  yourProfile: 'ملفك',
  firstTimeSetup: 'الإعداد الأول',
  betaJourneyProgress: 'تقدّم النسخة التجريبية',
  emailNextStep: 'أرسل الخطوة التالية بالبريد',
  emailNextStepSent: 'تحقق من بريدك للخطوة التالية.',
  signInOptional: 'تسجيل الدخول اختياري — التقدّم يبقى على هذا الجهاز.',
  signInLink: 'تسجيل الدخول',
  cloudSyncOn: 'المزامنة السحابية مفعّلة.',
  welcomeSignInTitle: 'احفظ تقدّمك — اختيارك',
  welcomeSignInSubtitle:
    'سجّل الدخول بGoogle أو البريد للمزامنة. يمكنك التخطّي — التقدّم المحلي يعمل.',
  commandersIntent: 'تركيز اليوم',
  saveProgressCloud: 'حفظ التقدّم في السحابة',
  signInPromptExpand: 'تسجيل الدخول بGoogle أو البريد',
  signInCollapse: 'إخفاء تسجيل الدخول',
  signInPromptDefault: 'سجّل الدخول لمزامنة التدريبات والرحلة بين الأجهزة.',
  termsOfService: 'شروط الخدمة',
  privacyPolicy: 'سياسة الخصوصية',
  about: 'حول',
  leaderboardRankings: 'الترتيب',
  today: 'اليوم',
  lang_en: 'English',
  lang_es: 'Español',
  lang_zh: '中文',
};

export const MEA_LOCALES: Record<MeaLang, MeaCoreStrings> = { ar };

export function meaStringsFor(lang: string): MeaCoreStrings | null {
  const code = lang.split('-')[0] as MeaLang;
  return MEA_LOCALES[code] ?? null;
}
