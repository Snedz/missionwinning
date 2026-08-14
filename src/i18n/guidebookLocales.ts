/** Guidebook i18n — chrome + chapter titles + content keys from chapter data. */

import { APP_LANGS } from '@/i18n/appLangs';
import { buildGuidebookContentLocaleKeys } from '@/lib/guidebook/buildGuidebookLocaleKeys';
import { withLocalePack } from '@/i18n/localePacks';

const GUIDEBOOK_CONTENT_EN = buildGuidebookContentLocaleKeys();

const GUIDEBOOK_EN: Record<string, string> = {
  guidebookTitle: 'Beyond the Basics',
  guidebookSubtitle:
    'Now with even more content! The Mission Winning guidebook — understand training from the ground up.',
  guidebookSubtitleBrief: 'Free chapters with progress here. Magazine and PDF when you want them.',
  guidebookMoreTools: 'Progress, magazine & PDF',
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
  guidebookPdfDownload: 'Download magazine (PDF)',
  learnOpenGuidebook: 'Open Guidebook →',
  navGuidebook: 'Guidebook',
  moreGuidebookDesc: 'Beyond the Basics — deep reference',
  guideLanguage: 'Language',
  learnPremiumBadge: 'Premium',
  /** Free-beta: depth unlocked — specialist label without pay merch. */
  learnPremiumBadgeOpenBeta: 'Specialist',
  /** Kaizen Guidebook chrome — magazine cross-links (`.561`). */
  guidebookMagazineWeb: 'Magazine (web)',
  guidebookChapterMagazine: 'Same chapter in magazine (web)',
  magazineOpenInApp: 'Track progress in app →',
  ...GUIDEBOOK_CONTENT_EN,
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
  guidebookPdfDownload: 'Descargar revista (PDF)',
  learnOpenGuidebook: 'Abrir guía →',
  navGuidebook: 'Guía',
  moreGuidebookDesc: 'Referencia profunda — Más allá de lo básico',
  guideLanguage: 'Idioma',
  'guideChapter_human-performance_title': 'Ciencia del rendimiento humano',
  'guideChapter_human-performance_subtitle': 'Cómo se adapta tu cuerpo — evidencia sobre modas',
  'guideChapter_movement-mechanics_title': 'Mecánica del movimiento',
  'guideChapter_movement-mechanics_subtitle': 'Cómo funcionan los patrones — palancas, no mitos',
  'guideChapter_programming-tuning_title': 'Programación y ajuste',
  'guideChapter_programming-tuning_subtitle': 'Volumen, intensidad y descargas — planes desde tus registros',
  'guideChapter_getting-started-mw_title': 'Empezar con Mission Winning',
  'guideChapter_getting-started-mw_subtitle': 'I-Day, seis pilares y tu Mission Score',
  'guideChapter_nutrition-recovery_title': 'Nutrición y recuperación',
  'guideChapter_nutrition-recovery_subtitle': 'Combustible y sueño — la otra mitad de la adaptación',
  'guideChapter_assessments-progress_title': 'Evaluaciones y progreso',
  'guideChapter_assessments-progress_subtitle': 'Evalúa con seguridad, ajusta con criterio',
  magazineTitle: 'Más allá de lo básico',
  magazineLine: 'La revista Mission Winning',
  magazineSubtitle: 'Mission Winning para leer',
  magazineEditionLabel: 'Edición recopilatoria',
  magazineDownloadPdf: 'Descargar PDF',
  magazinePrintView: 'Vista de impresión',
  magazineContents: 'Contenido',
  magazineStartFree: 'Empezar gratis',
  magazineOpenContents: 'Abrir contenido',
};

const GUIDEBOOK_FR: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Au-delà des bases',
  guidebookSubtitle:
    "Encore plus de contenu ! Le guide Mission Winning — comprendre l'entraînement depuis les fondations.",
  navGuidebook: 'Guide',
  learnOpenGuidebook: 'Ouvrir le guide →',
  guideLanguage: 'Langue',
  magazineTitle: 'Au-delà des bases',
  magazineDownloadPdf: 'Télécharger le PDF',
  'guideChapter_human-performance_title': 'Science de la performance humaine',
  'guideChapter_movement-mechanics_title': 'Mécanique du mouvement',
  'guideChapter_programming-tuning_title': 'Programmation et réglage',
};

const GUIDEBOOK_DE: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Über die Grundlagen hinaus',
  navGuidebook: 'Handbuch',
  learnOpenGuidebook: 'Handbuch öffnen →',
  guideLanguage: 'Sprache',
  magazineDownloadPdf: 'PDF herunterladen',
};

const GUIDEBOOK_IT: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Oltre le basi',
  navGuidebook: 'Guida',
  guideLanguage: 'Lingua',
  magazineDownloadPdf: 'Scarica PDF',
};

const GUIDEBOOK_PT: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Além do básico',
  navGuidebook: 'Guia',
  guideLanguage: 'Idioma',
  magazineTitle: 'Além do básico',
  magazineDownloadPdf: 'Baixar PDF',
};

const GUIDEBOOK_JA: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: '基本のその先',
  navGuidebook: 'ガイドブック',
  guideLanguage: '言語',
  magazineDownloadPdf: 'PDFをダウンロード',
};

const GUIDEBOOK_AR: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'ما وراء الأساسيات',
  navGuidebook: 'الدليل',
  guidebookSubtitle: 'محتوى أكثر! دليل Mission Winning — افهم التدريب من الأساس.',
  guideLanguage: 'اللغة',
  magazineDownloadPdf: 'تنزيل PDF',
};

const GUIDEBOOK_KO: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: '기초를 넘어',
  navGuidebook: '가이드북',
  guideLanguage: '언어',
  magazineDownloadPdf: 'PDF 다운로드',
};

const GUIDEBOOK_RU: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'За пределами основ',
  navGuidebook: 'Руководство',
  guideLanguage: 'Язык',
  magazineDownloadPdf: 'Скачать PDF',
};

const GUIDEBOOK_TH: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'มากกว่าพื้นฐาน',
  navGuidebook: 'คู่มือ',
  guideLanguage: 'ภาษา',
  magazineDownloadPdf: 'ดาวน์โหลด PDF',
};

const GUIDEBOOK_VI: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Vượt qua cơ bản',
  navGuidebook: 'Sổ tay',
  guideLanguage: 'Ngôn ngữ',
  magazineDownloadPdf: 'Tải PDF',
};

const GUIDEBOOK_HI: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'बुनियादी से आगे',
  navGuidebook: 'गाइडबुक',
  guideLanguage: 'भाषा',
  magazineDownloadPdf: 'PDF डाउनलोड करें',
};

const GUIDEBOOK_ZH: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: '超越基础',
  navGuidebook: '指南',
  guideLanguage: '语言',
  magazineDownloadPdf: '下载 PDF',
};

const GUIDEBOOK_ID: Record<string, string> = {
  ...GUIDEBOOK_EN,
  guidebookTitle: 'Melampaui Dasar',
  navGuidebook: 'Panduan',
  guideLanguage: 'Bahasa',
  magazineDownloadPdf: 'Unduh PDF',
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
  ko: GUIDEBOOK_KO,
  ru: GUIDEBOOK_RU,
  th: GUIDEBOOK_TH,
  vi: GUIDEBOOK_VI,
  hi: GUIDEBOOK_HI,
  zh: GUIDEBOOK_ZH,
  id: GUIDEBOOK_ID,
};

// Ensure every APP_LANG has a record (spread EN if missing)
for (const lang of APP_LANGS) {
  if (!BY_LANG[lang]) BY_LANG[lang] = { ...GUIDEBOOK_EN };
}

export function mergeGuidebookStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, guidebookStringsFor(lang));
}

export function guidebookStringsFor(lang: string): Record<string, string> {
  const code = lang.split('-')[0] ?? 'en';
  const base = BY_LANG[code] ?? BY_LANG.en;
  return withLocalePack(base, code);
}
