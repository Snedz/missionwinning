/** Learn path & lesson copy — merged into learn namespace / common.json. */

type ContentOverrides = Record<string, string>;

/** Spanish lesson content overrides (English defaults live in learnPaths.ts). */
const es: ContentOverrides = {
  'learnPath_strength-basics_title': 'Fundamentos de fuerza',
  'learnPath_strength-basics_subtitle': 'La forma correcta de empezar a levantar — evidencia sobre modas',
  'learnLesson_sb-1_title': 'Sobrecarga progresiva',
  'learnLesson_sb-1_summary':
    'Los músculos se adaptan cuando aumentas gradualmente el estímulo — peso, repeticiones o calidad.',
  'learnLesson_sb-1_kp_0': 'Añade carga o reps cuando llegues al tope del rango con buena técnica',
  'learnLesson_sb-1_kp_1': 'Registra sesiones — lo medido mejora',
  'learnLesson_sb-1_kp_2': 'La recuperación es parte del progreso — no es opcional',
  'learnLesson_sb-1_action': 'Registrar entrenamiento',
  'learnLesson_sb-2_title': 'Movimientos compuestos primero',
  'learnLesson_sb-2_summary': 'Sentadilla, bisagra, empuje, tirón, carry — base antes del aislamiento.',
  'learnLesson_sb-2_kp_0': 'Los multiarticulares dan más retorno por minuto',
  'learnLesson_sb-2_kp_1': 'Domina patrones corporales antes de barra pesada',
  'learnLesson_sb-2_kp_2': 'Usa filtros de la Biblioteca por equipamiento',
  'learnLesson_sb-2_action': 'Explorar biblioteca',
  'learnLesson_sb-3_title': 'RPE y autorregulación',
  'learnLesson_sb-3_summary': 'Algunos días empujas, otros mantienes — escucha las puntuaciones de readiness.',
  'learnLesson_sb-3_action': 'Ver Hoy',

  'learnPath_nutrition-101_title': 'Nutrición 101',
  'learnPath_nutrition-101_subtitle': 'Combustible para la misión — proteína, alimentos reales, acceso global',
  'learnLesson_n-1_title': 'Prioridad a la proteína',
  'learnLesson_n-1_summary': 'Proteína suficiente apoya reparación muscular, saciedad y recuperación.',
  'learnLesson_n-1_action': 'Registrar proteína de hoy',
  'learnLesson_n-2_title': 'Alimentos reales, ingredientes comunes',
  'learnLesson_n-2_action': 'Abrir nutrición',

  'learnPath_mobility-longevity_title': 'Movilidad y longevidad',
  'learnPath_mobility-longevity_subtitle': 'Muévete a diario — articulaciones, postura, vida atlética',
  'learnLesson_m-1_title': 'Mínimo diario de movimiento',
  'learnLesson_m-1_action': 'Iniciar un flow',
  'learnLesson_m-2_title': 'Mentalidad correctiva',
  'learnLesson_m-2_action': 'Hacer evaluación',

  'learnPath_mindset-habits_title': 'Mentalidad y hábitos',
  'learnPath_mindset-habits_subtitle': 'La mente hace que los demás pilares perduren',
  'learnLesson_mind-1_title': 'La respiración como ancla',
  'learnLesson_mind-1_action': 'Probar temporizador de respiración',
  'learnLesson_mind-2_title': 'Rachas e identidad',
  'learnLesson_mind-2_action': 'Ver desafíos',

  'learnPath_assessments-path_title': 'Evaluar y ajustar',
  'learnPath_assessments-path_subtitle': 'Sabe dónde estás — entrena más inteligente',
  'learnLesson_a-1_title': 'PAR-Q y readiness',
  'learnLesson_a-1_action': 'Iniciar evaluación',
  'learnLesson_a-2_title': 'Benchmarks y 1RM',
  'learnLesson_a-2_action': 'Ver benchmarks',

  'learnPath_corrective-foundations_title': 'Fundamentos correctivos',
  'learnPath_corrective-foundations_subtitle': 'Evaluar, corregir, luego cargar — nunca al revés',
  'learnLesson_cf-1_action': 'Ejecutar evaluación',
  'learnLesson_cf-2_action': 'Biblioteca correctiva',
  'learnLesson_cf-3_action': 'Cargar plantilla correctiva',

  'learnPath_periodization-design_title': 'Periodización y diseño de programas',
  'learnPath_periodization-design_subtitle': 'Planifica en bloques — lineal, ondulante y deload',
  'learnLesson_pd-1_action': 'Explorar plantillas',
  'learnLesson_pd-2_action': 'Ver puntuación de recuperación',
  'learnLesson_pd-3_action': 'Combustible para la fase',

  'learnPath_coaching-client-success_title': 'Coaching y éxito del cliente',
  'learnPath_coaching-client-success_subtitle': 'Comunicación, adherencia y alcance ético — principios profesionales',
  'learnLesson_cc-1_action': 'Revisar PAR-Q',
  'learnLesson_cc-2_action': 'Check-in diario',
  'learnLesson_cc-3_action': 'Consulta de coaching',
};

/** Chinese lesson content overrides. */
const zh: ContentOverrides = {
  'learnPath_strength-basics_title': '力量基础',
  'learnPath_strength-basics_subtitle': '正确开始举铁的方式——证据优于 hype',
  'learnLesson_sb-1_title': '渐进超负荷',
  'learnLesson_sb-1_summary': '当你逐步增加负荷——重量、次数或质量——肌肉才会适应。',
  'learnLesson_sb-1_action': '记录训练',
  'learnLesson_sb-2_title': '复合动作优先',
  'learnLesson_sb-2_action': '浏览动作库',
  'learnLesson_sb-3_title': 'RPE 与自我调节',
  'learnLesson_sb-3_action': '查看今日',

  'learnPath_nutrition-101_title': '营养 101',
  'learnPath_nutrition-101_subtitle': '为使命供能——蛋白质、天然食物、全球可及',
  'learnLesson_n-1_title': '蛋白质优先',
  'learnLesson_n-1_action': '记录今日蛋白质',
  'learnLesson_n-2_title': '天然食物与常见食材',
  'learnLesson_n-2_action': '打开营养',

  'learnPath_mobility-longevity_title': '灵活性与长寿',
  'learnPath_mobility-longevity_subtitle': '每日活动——关节、姿态、运动寿命',
  'learnPath_mindset-habits_title': '心态与习惯',
  'learnPath_assessments-path_title': '评估与调整',
  'learnPath_corrective-foundations_title': '纠正性训练基础',
  'learnPath_periodization-design_title': '周期化与计划设计',
  'learnPath_coaching-client-success_title': '教练与客户成功',
};

const LOCALES: Partial<Record<string, ContentOverrides>> = { es, zh };

export function learnContentStringsFor(lang: string): Record<string, string> {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? {};
}

export function mergeLearnContentStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, learnContentStringsFor(lang));
}
