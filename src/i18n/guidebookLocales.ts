/** Guidebook i18n — 8 languages (EN + Tier 1 + AR). */

const GUIDEBOOK_EN: Record<string, string> = {
  guidebookTitle: 'Beyond the Basics',
  guidebookSubtitle:
    'Now with even more content! The Mission Winning guidebook — understand training from the ground up.',
  guidebookProgress: 'Your progress',
  guidebookQuickPaths: 'Quick paths →',
  guidebookBack: 'Guidebook',
  guidebookNotFound: 'Chapter not found.',
  guidebookQuickVersion: '5-minute quick path →',
  guidebookMarkRead: 'Mark section read',
  guidebookChapterComplete: 'Chapter complete!',
  guidebookNextChapter: 'Next chapter →',
  guidebookPracticeInApp: 'Practice in app',
  guidebookContinue: 'Continue guidebook',
  learnExpandedBanner: 'Now with even more content!',
  learnExpandedDesc:
    'Beyond the Basics guidebook — 6 chapters on performance science, movement, programming, and more. Evidence-based, free core.',
  learnOpenGuidebook: 'Open Guidebook →',
  navGuidebook: 'Guidebook',
  moreGuidebookDesc: 'Beyond the Basics — deep reference',
  'guideChapter_human-performance_title': 'Human Performance Science',
  'guideChapter_human-performance_subtitle': 'How your body adapts — evidence over hype',
  'guideChapter_movement-mechanics_title': 'Movement Mechanics',
  'guideChapter_movement-mechanics_subtitle': 'How lifts and patterns work — levers, not lore',
  'guideChapter_programming-tuning_title': 'Programming & Tuning',
  'guideChapter_programming-tuning_subtitle': 'Volume, intensity, and when to deload — tune your plan',
  'guideChapter_getting-started-mw_title': 'Getting Started with Mission Winning',
  'guideChapter_getting-started-mw_subtitle': 'I-Day, six pillars, and your Win Score',
  'guideChapter_nutrition-recovery_title': 'Nutrition & Recovery',
  'guideChapter_nutrition-recovery_subtitle': 'Fuel and sleep — the other half of adaptation',
  'guideChapter_assessments-progress_title': 'Assessments & Progress',
  'guideChapter_assessments-progress_subtitle': 'Screen safely, benchmark honestly, adjust deliberately',
};

const GUIDEBOOK_ES: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Más allá de lo básico',
  guidebookSubtitle:
    '¡Ahora con aún más contenido! La guía Mission Winning — entiende el entrenamiento desde la base.',
  guidebookProgress: 'Tu progreso',
  guidebookQuickPaths: 'Rutas rápidas →',
  guidebookBack: 'Guía',
  guidebookMarkRead: 'Marcar sección leída',
  guidebookChapterComplete: '¡Capítulo completo!',
  guidebookNextChapter: 'Siguiente capítulo →',
  guidebookPracticeInApp: 'Practicar en la app',
  guidebookContinue: 'Continuar guía',
  learnExpandedBanner: '¡Ahora con aún más contenido!',
  learnExpandedDesc:
    'Guía Más allá de lo básico — 6 capítulos sobre ciencia del rendimiento, movimiento y programación. Basado en evidencia, núcleo gratis.',
  learnOpenGuidebook: 'Abrir guía →',
  navGuidebook: 'Guía',
  moreGuidebookDesc: 'Referencia profunda — Más allá de lo básico',
  'guideChapter_human-performance_title': 'Ciencia del rendimiento humano',
  'guideChapter_human-performance_subtitle': 'Cómo se adapta tu cuerpo — evidencia sobre modas',
  'guideChapter_movement-mechanics_title': 'Mecánica del movimiento',
  'guideChapter_movement-mechanics_subtitle': 'Cómo funcionan los patrones — palancas, no mitos',
  'guideChapter_programming-tuning_title': 'Programación y ajuste',
  'guideChapter_programming-tuning_subtitle': 'Volumen, intensidad y cuándo descargar',
  'guideChapter_getting-started-mw_title': 'Empezar con Mission Winning',
  'guideChapter_getting-started-mw_subtitle': 'I-Day, seis pilares y tu Win Score',
  'guideChapter_nutrition-recovery_title': 'Nutrición y recuperación',
  'guideChapter_nutrition-recovery_subtitle': 'Combustible y sueño — la otra mitad de la adaptación',
  'guideChapter_assessments-progress_title': 'Evaluaciones y progreso',
  'guideChapter_assessments-progress_subtitle': 'Evalúa con seguridad, ajusta con criterio',
};

const GUIDEBOOK_FR: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Au-delà des bases',
  guidebookSubtitle:
    'Encore plus de contenu ! Le guide Mission Winning — comprendre l\'entraînement depuis les fondations.',
  navGuidebook: 'Guide',
  learnOpenGuidebook: 'Ouvrir le guide →',
  'guideChapter_human-performance_title': 'Science de la performance humaine',
  'guideChapter_movement-mechanics_title': 'Mécanique du mouvement',
  'guideChapter_programming-tuning_title': 'Programmation et réglage',
};

const GUIDEBOOK_DE: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Über die Grundlagen hinaus',
  navGuidebook: 'Handbuch',
  learnOpenGuidebook: 'Handbuch öffnen →',
};

const GUIDEBOOK_IT: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Oltre le basi',
  navGuidebook: 'Guida',
};

const GUIDEBOOK_PT: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Além do básico',
  navGuidebook: 'Guia',
};

const GUIDEBOOK_JA: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: '基礎のその先',
  navGuidebook: 'ガイドブック',
};

const GUIDEBOOK_AR: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'ما وراء الأساسيات',
  navGuidebook: 'الدليل',
  guidebookSubtitle: 'محتوى أكثر! دليل Mission Winning — افهم التدريب من الأساس.',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: GUIDEBOOK_EN,
  es: GUIDEBOOK_ES,
  fr: GUIDEBOOK_FR,
  de: GUIDEBOOK_DE,
  it: GUIDEBOOK_IT,
  pt: GUIDEBOOK_PT,
  ja: GUIDEBOOK_JA,
  ar: GUIDEBOOK_AR,
};

export function mergeGuidebookStrings(common: Record<string, string>, lang: string): void {
  const pack = BY_LANG[lang] ?? BY_LANG.en;
  Object.assign(common, pack);
}

export function guidebookStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}
