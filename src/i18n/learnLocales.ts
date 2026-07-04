/** Learn pillar UI chrome — merged into i18n `common` namespace. */

import { learnContentStringsFor } from './learnContentLocales';

type LearnStrings = {
  learnTitle: string;
  learnSubtitle: string;
  learnDone: string;
  learnMarkComplete: string;
  learnSampleTitle: string;
  learnSampleBtn: string;
  learnPremiumTitle: string;
  learnPremiumDesc: string;
  learnPremiumBtn: string;
};

const en: LearnStrings = {
  learnTitle: 'Learn & Master',
  learnSubtitle:
    '{{count}} free education paths — evidence-based foundations plus specialist intros. Premium unlocks full programs (Super Bundle).',
  learnDone: '✓ Done',
  learnMarkComplete: 'Mark complete',
  learnSampleTitle: 'Try it — free sample workout',
  learnSampleBtn: 'Start Bodyweight Sample →',
  learnPremiumTitle: 'Premium Specialist Programs',
  learnPremiumDesc:
    'Full PT+Nutrition, Bodybuilding, Corrective, Business, Coaching, Conditioning.',
  learnPremiumBtn: 'Learn & Master Bundle (All Programs)',
};

const es: LearnStrings = {
  ...en,
  learnTitle: 'Aprender y dominar',
  learnSubtitle:
    '{{count}} rutas educativas gratis — fundamentos basados en evidencia e intros especialistas. Premium desbloquea programas completos.',
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

const LOCALES: Partial<Record<string, LearnStrings>> = { en, es, zh, id, th, ar };

export function learnStringsFor(lang: string): LearnStrings & Record<string, string> {
  const ui = LOCALES[lang.split('-')[0]] ?? en;
  return { ...ui, ...learnContentStringsFor(lang) };
}

export function mergeLearnStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, learnStringsFor(lang));
}
