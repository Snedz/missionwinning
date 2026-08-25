/** Learn pillar UI chrome — merged into i18n `common` namespace. */

import { learnContentStringsFor } from './learnContentLocales';

type LearnStrings = {
  learnTitle: string;
  learnSubtitle: string;
  /** Free-beta: no Super Bundle / premium pay pitch (pack would override defaultValue). */
  learnSubtitleOpenBeta: string;
  learnSubtitleBrief: string;
  learnSubtitleBriefOpenBeta: string;
  learnMoreLearn: string;
  learnMoreLearnOpenBeta: string;
  learnDone: string;
  learnMarkComplete: string;
  learnSampleTitle: string;
  learnSampleBtn: string;
  learnPremiumTitle: string;
  /** Free-beta: specialist depth unlocked — no "Premium" merchandising word. */
  learnPremiumTitleOpenBeta: string;
  learnPremiumDesc: string;
  learnPremiumBtn: string;
  learnEyebrow: string;
  learnExpandedBanner: string;
  learnExpandedDesc: string;
  learnOpenGuidebook: string;
  learnSearchPlaceholder: string;
  learnNoMatches: string;
  learnNoMatchesDesc: string;
  learnClearSearch: string;
  learnPremiumCourseDesc: string;
  learnOpenCourses: string;
  learnCourseEmpty: string;
  /** Free-beta: depth unlocked — no “premium” empty merch. */
  learnCourseEmptyOpenBeta: string;
  learnCourseNav: string;
  learnBack: string;
  learnCourseProgress: string;
  learnChapterComplete: string;
  learnChapterNextHint: string;
  learnFreeIntro: string;
  learnReadIntro: string;
  learnPreviewCourse: string;
  learnLockedHint: string;
  learnCourseTitle: string;
  learnCourseSubtitle: string;
  learnCourseSubtitleBrief: string;
  learnCourseSignIn: string;
  learnCourseFetchFailed: string;
  learnCourseFetchFailedDesc: string;
  learnCourseRetry: string;
  learnCourseEmptyTitle: string;
  learnCourseEmptyBeta: string;
  learnCourseBrowseFree: string;
  /** Kaizen Learn magazine link (`.560`). */
  learnOpenMagazine: string;
  /** Quiet Learn first-success subtitle (`.978`). */
  quietLearnSubtitle: string;
  quietLearnMorePaths: string;
  quietLearnEyebrow: string;
  quietLearnEmpty: string;
  quietLearnEmptyDesc: string;
};

const en: LearnStrings = {
  learnTitle: 'Learn & Master',
  learnSubtitle:
    '{{count}} free education paths — evidence-based foundations plus specialist intros. Premium unlocks full programs (Super Bundle).',
  learnSubtitleOpenBeta:
    '{{count}} education paths — foundations first. Guidebook and specialist courses open in Alpha.',
  learnSubtitleBrief: 'Free paths first. Guide and Bundle depth when you want them.',
  learnSubtitleBriefOpenBeta: 'Free paths first. Guidebook and specialist depth when you want them.',
  learnMoreLearn: 'Guide, sample & premium',
  learnMoreLearnOpenBeta: 'Guide, sample & more',
  learnDone: '✓ Done',
  learnMarkComplete: 'Mark complete',
  learnSampleTitle: 'Try it — free sample workout',
  learnSampleBtn: 'Start Bodyweight Sample →',
  learnPremiumTitle: 'Premium Specialist Programs',
  learnPremiumTitleOpenBeta: 'Specialist Programs',
  learnPremiumDesc:
    'Full PT+Nutrition, Bodybuilding, Corrective, Business, Coaching, Conditioning.',
  learnPremiumBtn: 'Learn & Master Bundle (All Programs)',
  learnEyebrow: 'Learn',
  learnExpandedBanner: 'Beyond the Basics',
  learnExpandedDesc:
    'Six free chapters on performance, movement, and programming — practical, not hype.',
  learnOpenGuidebook: 'Open Guidebook →',
  learnSearchPlaceholder: 'Search paths or lessons…',
  learnNoMatches: 'No paths match that search.',
  learnNoMatchesDesc: 'Try a different keyword, or clear search to see all free paths.',
  learnClearSearch: 'Clear search',
  learnPremiumCourseDesc: 'Multi-chapter specialist courses with progress that survives reload.',
  learnOpenCourses: 'Open specialist courses →',
  learnCourseEmpty: 'No premium courses available.',
  learnCourseEmptyOpenBeta: 'No specialist courses available yet.',
  learnCourseNav: 'Course chapters',
  learnBack: 'Learn',
  learnCourseProgress: 'Chapter progress',
  learnChapterComplete: 'Chapter complete — logged to Learn pillar.',
  learnChapterNextHint:
    'Practice what you learned — mobility or a Fuel log compounds the win.',
  learnFreeIntro: 'Free — read now',
  learnReadIntro: 'Read intro chapter →',
  learnPreviewCourse: 'Multi-chapter courses with progress tracking',
  learnLockedHint:
    'Free: 6 guidebook chapters + 10 paths. Premium: one Train→Coach→Fuel/Move/Mind sequence course plus specialist depth — 24 sections.',
  learnCourseTitle: 'Specialist courses',
  learnCourseSubtitle:
    'Train → Coach → Fuel/Move/Mind as one sequence, plus specialist depth.',
  learnCourseSubtitleBrief: 'Specialist courses when unlocked. Free paths live on Learn.',
  learnCourseSignIn: 'Sign in with your bundle email to load specialist courses.',
  learnCourseFetchFailed: 'Courses could not load',
  learnCourseFetchFailedDesc:
    'The specialist catalogue is fetched when you open this page, so this is usually the connection rather than your account.',
  learnCourseRetry: 'Try again',
  learnCourseEmptyTitle: 'No specialist courses yet',
  learnCourseEmptyBeta:
    'The specialist catalogue is still being written. The free learning paths and the guidebook are complete and open to everyone.',
  learnCourseBrowseFree: 'Browse free paths',
  learnOpenMagazine: 'Magazine (web)',
  quietLearnSubtitle: 'Log a set. Then Coach from those logs.',
  quietLearnMorePaths: 'Other paths, guidebook & more',
  quietLearnEyebrow: 'First success',
  quietLearnEmpty: 'No first-success intro yet.',
  quietLearnEmptyDesc: 'Learn invents nothing when the catalog has no log-then-Coach path.',
};

const es: LearnStrings = {
  ...en,
  learnTitle: 'Aprender y dominar',
  learnSubtitle:
    '{{count}} rutas educativas gratis — fundamentos basados en evidencia e intros especialistas. Premium desbloquea programas completos.',
  learnSubtitleOpenBeta:
    '{{count}} rutas educativas — fundamentos primero. Guía y cursos especialistas abiertos en beta abierta.',
  learnSubtitleBrief: 'Rutas gratis primero. Profundidad de Guía y Bundle cuando las quieras.',
  learnSubtitleBriefOpenBeta:
    'Rutas gratis primero. Profundidad de guía y especialistas cuando las quieras.',
  learnMarkComplete: 'Marcar completado',
  learnSampleTitle: 'Pruébalo — entrenamiento muestra gratis',
  learnSampleBtn: 'Iniciar muestra bodyweight →',
};

const zh: LearnStrings = {
  ...en,
  learnTitle: '学习与精通',
  learnMarkComplete: '标记完成',
  learnSampleBtn: '开始徒手样本训练 →',
};

const id: LearnStrings = {
  ...en,
  learnTitle: 'Belajar & kuasai',
  learnMarkComplete: 'Tandai selesai',
};

const th: LearnStrings = {
  ...en,
  learnTitle: 'เรียนรู้และเชี่ยวชาญ',
  learnMarkComplete: 'ทำเครื่องหมายเสร็จ',
};

const ar: LearnStrings = {
  ...en,
  learnTitle: 'تعلّم وإتقان',
  learnMarkComplete: 'تحديد كمكتمل',
};

const LOCALES: Partial<Record<string, LearnStrings>> = {
  en,
  es,
  zh,
  id,
  th,
  ar,
  pt: {
    ...en,
    learnSubtitleOpenBeta:
      '{{count}} percursos educativos — fundamentos primeiro. Guia e cursos especialistas abertos no beta aberto.',
    learnSubtitleBrief: 'Percursos grátis primeiro. Profundidade de Guia e Bundle quando quiser.',
    learnSubtitleBriefOpenBeta:
      'Percursos grátis primeiro. Profundidade do guia e especialistas quando quiser.',
  },
};

export function learnStringsFor(lang: string): LearnStrings & Record<string, string> {
  const ui = LOCALES[lang.split('-')[0]] ?? en;
  return { ...ui, ...learnContentStringsFor(lang) };
}

export function mergeLearnStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, learnStringsFor(lang));
}
