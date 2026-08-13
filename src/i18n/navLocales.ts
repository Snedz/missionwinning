/** Extended nav + header dropdown copy — merged into i18n `common` namespace. */

type NavStrings = {
  navAssess: string;
  navMore: string;
  navCoachTab: string;
  navMoreEyebrow: string;
  navOpenBeta: string;
  navGroupMission: string;
  navGroupPillars: string;
  navGroupToolkit: string;
  navSectionRecover: string;
  navSectionTrain: string;
  navSectionLearn: string;
  navSectionPremium: string;
  navMove: string;
  navMind: string;
  navLearn: string;
  navBuilder: string;
  navCoach: string;
  navLibrary: string;
  navHistory: string;
  navLeaderboard: string;
  navReadiness: string;
  navHealth: string;
  navCalculators: string;
  navBundle: string;
  journeyBasicFoot: string;
  fuelScienceCh5: string;
  fuelScienceCh12: string;
  fuelHighProteinNote: string;
  fuelPremiumRecipesFoot: string;
  navGuide: string;
  sourceCode: string;
  feedback: string;
  resumeWorkout: string;
  offlineBannerShort: string;
  offlineWaitingCount: string;
};

const en: NavStrings = {
  navOpenBeta: 'Free beta',
  navAssess: 'Assess',
  navMore: 'More',
  navCoachTab: 'Coach',
  navMoreEyebrow: 'All screens',
  navGroupMission: 'Mission',
  navGroupPillars: 'Pillars',
  navGroupToolkit: 'Toolkit',
  navSectionRecover: 'Recover',
  navSectionTrain: 'Train deeper',
  navSectionLearn: 'Learn & measure',
  navSectionPremium: 'Premium',
  navMove: 'Move',
  navMind: 'Mind',
  navLearn: 'Learn',
  navBuilder: 'Builder',
  navCoach: 'AI weekly plan',
  navLibrary: 'Library',
  navHistory: 'History',
  navLeaderboard: 'Leaderboard',
  navReadiness: 'Readiness tests',
  navHealth: 'Health screen',
  navCalculators: 'Calculators',
  navBundle: 'Super Bundle',
  journeyBasicFoot: 'One step at a time. More tools unlock as you progress.',
  fuelHighProteinNote: 'High-protein days boost your',
  fuelScienceCh5:
    'Protein insight (textbook ch.5): Essential for growth, repair, enzymes, and hormones. Active clients often need 1.6–2.2g/kg. Use complete proteins; time intake around workouts. Variety covers essential aminos — recipes below follow these principles.',
  fuelScienceCh12:
    'Nutrition for bodybuilders (ch.12): Complex carbs fuel training; healthy fats support hormones (15–30% calories). Vitamins/minerals from whole foods; fiber 20–30g+. Post-workout protein + carbs aid recovery. Hydration matters — prioritize local whole foods.',
  fuelPremiumRecipesFoot: 'Seeded from protein science + DASH/Med principles for global accessibility.',
  navGuide: 'Guide',
  sourceCode: 'Source',
  feedback: 'Feedback',
  resumeWorkout: 'Resume workout',
  offlineBannerShort: 'Offline — logging still works',
  offlineWaitingCount: '{{count}} waiting',
};

const es: NavStrings = {
  ...en,
  navOpenBeta: 'Beta gratuita',
  navAssess: 'Evaluar',
  navMore: 'Más',
  navCoachTab: 'Coach',
  navMoreEyebrow: 'Todas las pantallas',
  navGroupMission: 'Misión',
  navGroupPillars: 'Pilares',
  navGroupToolkit: 'Herramientas',
  navSectionRecover: 'Recuperar',
  navSectionTrain: 'Entrenar más',
  navSectionLearn: 'Aprender y medir',
  navSectionPremium: 'Premium',
  navMove: 'Mover',
  navMind: 'Mente',
  navLearn: 'Aprender',
  navBuilder: 'Constructor',
  navLibrary: 'Biblioteca',
  navHistory: 'Historial',
  navLeaderboard: 'Clasificación',
  navReadiness: 'Tests de preparación',
  navHealth: 'Evaluación de salud',
  navCalculators: 'Calculadoras',
  navBundle: 'Super Bundle',
  journeyBasicFoot: 'Un paso a la vez. Más herramientas se desbloquean al avanzar.',
  fuelHighProteinNote: 'Los días altos en proteína impulsan tu',
};

const zh: Partial<NavStrings> = {
  navOpenBeta: '免费测试',
  navAssess: '评估',
  navMore: '更多',
  navCoachTab: '教练',
  navMoreEyebrow: '全部页面',
  navGroupMission: '任务',
  navGroupPillars: '支柱',
  navGroupToolkit: '工具',
  navSectionRecover: '恢复',
  navSectionTrain: '深度训练',
  navSectionLearn: '学习与测量',
  navSectionPremium: '高级版',
  navMove: '活动',
  navMind: '心理',
  navLearn: '学习',
  navBuilder: '构建器',
  navLibrary: '动作库',
  navHistory: '历史',
  navLeaderboard: '排行榜',
  navReadiness: '就绪度测试',
  navHealth: '健康筛查',
  navCalculators: '计算器',
  navBundle: 'Super Bundle',
  journeyBasicFoot: '一步一步来。随着进度会解锁更多工具。',
  fuelHighProteinNote: '高蛋白质日提升你的',
  fuelScienceCh5:
    '蛋白质要点（教材第5章）：对生长、修复、酶和激素至关重要。活跃者常需 1.6–2.2g/kg。摄入完整蛋白；训练前后补充。下方食谱遵循这些原则。',
  fuelScienceCh12:
    '健美营养（第12章）：复合碳水供能；健康脂肪支持激素（15–30% 热量）。全食物维生素矿物质；纤维 20–30g+。练后蛋白+碳水助恢复。重视补水 — 优先本地全食物。',
  fuelPremiumRecipesFoot: '基于蛋白质科学与 DASH/地中海原则，全球可及。',
};

const id: Partial<NavStrings> = {
  navOpenBeta: 'Beta gratis',
  navAssess: 'Nilai',
  navMore: 'Lainnya',
  navCoachTab: 'Pelatih',
  navMoreEyebrow: 'Semua layar',
  navGroupMission: 'Misi',
  navGroupPillars: 'Pilar',
  navGroupToolkit: 'Peralatan',
  navSectionRecover: 'Pemulihan',
  navSectionTrain: 'Latihan mendalam',
  navSectionLearn: 'Belajar & ukur',
  navSectionPremium: 'Premium',
  navMove: 'Gerak',
  navMind: 'Pikiran',
  navLearn: 'Belajar',
  navBuilder: 'Builder',
  navLibrary: 'Perpustakaan',
  navHistory: 'Riwayat',
  navLeaderboard: 'Papan peringkat',
  navReadiness: 'Tes kesiapan',
  navHealth: 'Skrining kesehatan',
  navCalculators: 'Kalkulator',
  navBundle: 'Super Bundle',
  journeyBasicFoot: 'Satu langkah demi langkah. Alat lebih banyak terbuka seiring progres.',
  fuelHighProteinNote: 'Hari protein tinggi meningkatkan',
  fuelScienceCh5:
    'Wawasan protein (bab 5): Penting untuk pertumbuhan, perbaikan, enzim, hormon. Klien aktif ~1.6–2.2g/kg. Protein lengkap; waktu di sekitar latihan. Resep di bawah mengikuti prinsip ini.',
  fuelScienceCh12:
    'Nutrisi bodybuilder (bab 12): Karb kompleks untuk energi; lemak sehat untuk hormon (15–30% kalori). Vitamin/mineral dari makanan utuh; serat 20–30g+. Protein+karb pasca latihan. Hidrasi penting — utamakan makanan lokal.',
  fuelPremiumRecipesFoot: 'Dari sains protein + prinsip DASH/Med untuk akses global.',
};

const th: Partial<NavStrings> = {
  navOpenBeta: 'เบต้าฟรี',
  navAssess: 'ประเมิน',
  navMore: 'เพิ่มเติม',
  navCoachTab: 'โค้ช',
  navMoreEyebrow: 'ทุกหน้าจอ',
  navGroupMission: 'ภารกิจ',
  navGroupPillars: 'เสาหลัก',
  navGroupToolkit: 'เครื่องมือ',
  navSectionRecover: 'ฟื้นตัว',
  navSectionTrain: 'ฝึกเชิงลึก',
  navSectionLearn: 'เรียนรู้และวัด',
  navSectionPremium: 'พรีเมียม',
  navMove: 'เคลื่อนไหว',
  navMind: 'จิตใจ',
  navLearn: 'เรียนรู้',
  navBuilder: 'Builder',
  navLibrary: 'ไลบรารี',
  navHistory: 'ประวัติ',
  navLeaderboard: 'อันดับ',
  navReadiness: 'ทดสอบความพร้อม',
  navHealth: 'คัดกรองสุขภาพ',
  navCalculators: 'เครื่องคิดเลข',
  navBundle: 'Super Bundle',
  journeyBasicFoot: 'ทีละขั้น เครื่องมือเพิ่มเมื่อคุณก้าวหน้า',
  fuelHighProteinNote: 'วันโปรตีนสูงช่วย',
  fuelScienceCh5:
    'โปรตีน (บท 5): สำคัญต่อการเติบโต ซ่อมแซม เอนไซม์ ฮอร์โมน ผู้ฝึกที่ออกกำลัง ~1.6–2.2g/kg โปรตีนครบ จัดเวลารอบการฝึก สูตรด้านล่างตามหลักนี้',
  fuelScienceCh12:
    'โภชนาการบอดี้บิลด์ (บท 12): คาร์บซับซ้อนให้พลังงาน ไขมันดีรองรับฮอร์โมน (15–30%) วิตามิน/แร่จากอาหารจริง ไฟเบอร์ 20–30g+ โปรตีน+คาร์บหลังฝึก ดื่มน้ำสำคัญ',
  fuelPremiumRecipesFoot: 'จากวิทยาศาสตร์โปรตีน + หลัก DASH/Med',
};

const ar: Partial<NavStrings> = {
  navOpenBeta: 'بيتا مجانية',
  navAssess: 'تقييم',
  navMore: 'المزيد',
  navCoachTab: 'المدرب',
  navMoreEyebrow: 'كل الشاشات',
  navGroupMission: 'المهمة',
  navGroupPillars: 'الركائز',
  navGroupToolkit: 'الأدوات',
  navSectionRecover: 'استشفاء',
  navSectionTrain: 'تدريب أعمق',
  navSectionLearn: 'تعلّم وقياس',
  navSectionPremium: 'Premium',
  navMove: 'حركة',
  navMind: 'عقل',
  navLearn: 'تعلّم',
  navBuilder: 'البناء',
  navLibrary: 'المكتبة',
  navHistory: 'السجل',
  navLeaderboard: 'الترتيب',
  navReadiness: 'اختبارات الجاهزية',
  navHealth: 'فحص الصحة',
  navCalculators: 'الحاسبات',
  navBundle: 'Super Bundle',
  journeyBasicFoot: 'خطوة بخطوة. المزيد من الأدوات تُفتح مع تقدّمك.',
  fuelHighProteinNote: 'أيام البروتين العالي تعزّز',
  fuelScienceCh5:
    'البروتين (الفصل 5): أساسي للنمو والإصلاح والإنزيمات والهرمونات. النشطون ~1.6–2.2g/kg. بروتين كامل؛ توقيت حول التمرين. الوصفات أدناه تتبع هذه المبادئ.',
  fuelScienceCh12:
    'تغذية كمال الأجسام (الفصل 12): كربوهيدرات معقدة للطاقة؛ الدهون الصحية للهرمونات (15–30%). الفيتامينات والمعادن من أطعمة كاملة؛ ألياف 20–30g+. بروتين+كربوهيدرات بعد التمرين. الترطيب مهم.',
  fuelPremiumRecipesFoot: 'من علم البروتين ومبادئ DASH/Med.',
};

const fr: Partial<NavStrings> = {
  ...en,
  navOpenBeta: 'Bêta gratuite',
  navAssess: 'Évaluer',
  navMore: 'Plus',
  navCoachTab: 'Coach',
  navMoreEyebrow: 'Tous les écrans',
  navGroupMission: 'Mission',
  navGroupPillars: 'Piliers',
  navGroupToolkit: 'Outils',
  navSectionRecover: 'Récupération',
  navSectionTrain: 'Entraînement approfondi',
  navSectionLearn: 'Apprendre et mesurer',
  navMove: 'Mouvement',
  navMind: 'Esprit',
  navLearn: 'Apprendre',
  navBuilder: 'Constructeur',
  navLibrary: 'Bibliothèque',
  navHistory: 'Historique',
  navLeaderboard: 'Classement',
  navReadiness: 'Tests de préparation',
  navHealth: 'Bilan santé',
  navCalculators: 'Calculateurs',
  journeyBasicFoot: 'Une étape à la fois. Plus d\'outils s\'ouvrent avec votre progression.',
  fuelHighProteinNote: 'Les jours riches en protéines boostent votre',
};

const de: Partial<NavStrings> = {
  ...en,
  navOpenBeta: 'Kostenlose Beta',
  navAssess: 'Bewerten',
  navMore: 'Mehr',
  navCoachTab: 'Coach',
  navMoreEyebrow: 'Alle Ansichten',
  navGroupMission: 'Mission',
  navGroupPillars: 'Säulen',
  navGroupToolkit: 'Werkzeuge',
  navSectionRecover: 'Erholung',
  navSectionTrain: 'Tiefer trainieren',
  navSectionLearn: 'Lernen & messen',
  navMove: 'Bewegung',
  navMind: 'Geist',
  navLearn: 'Lernen',
  navBuilder: 'Builder',
  navLibrary: 'Bibliothek',
  navHistory: 'Verlauf',
  navLeaderboard: 'Bestenliste',
  navReadiness: 'Bereitschaftstests',
  navHealth: 'Gesundheitscheck',
  navCalculators: 'Rechner',
  journeyBasicFoot: 'Schritt für Schritt. Mehr Tools öffnen sich mit deinem Fortschritt.',
  fuelHighProteinNote: 'Proteinreiche Tage stärken deinen',
};

const it: Partial<NavStrings> = {
  ...en,
  navOpenBeta: 'Beta gratuita',
  navAssess: 'Valuta',
  navMore: 'Altro',
  navCoachTab: 'Coach',
  navMoreEyebrow: 'Tutte le schermate',
  navGroupMission: 'Missione',
  navGroupPillars: 'Pilastri',
  navGroupToolkit: 'Strumenti',
  navSectionRecover: 'Recupero',
  navSectionTrain: 'Allenamento profondo',
  navSectionLearn: 'Impara e misura',
  navMove: 'Movimento',
  navMind: 'Mente',
  navLearn: 'Impara',
  navBuilder: 'Builder',
  navLibrary: 'Biblioteca',
  navHistory: 'Cronologia',
  navLeaderboard: 'Classifica',
  navReadiness: 'Test di prontezza',
  navHealth: 'Screening salute',
  navCalculators: 'Calcolatori',
  journeyBasicFoot: 'Un passo alla volta. Più strumenti si sbloccano col progresso.',
  fuelHighProteinNote: 'I giorni ad alto proteico potenziano il tuo',
};

const ko: Partial<NavStrings> = {
  ...en,
  navOpenBeta: '무료 베타',
  navAssess: '평가',
  navMore: '더보기',
  navCoachTab: '코치',
  navMoreEyebrow: '모든 화면',
  navGroupMission: '미션',
  navGroupPillars: '기둥',
  navGroupToolkit: '도구',
  navSectionRecover: '회복',
  navSectionTrain: '심화 훈련',
  navSectionLearn: '학습 및 측정',
  navMove: '움직임',
  navMind: '마음',
  navLearn: '학습',
  navBuilder: '빌더',
  navLibrary: '라이브러리',
  navHistory: '기록',
  navLeaderboard: '리더보드',
  navReadiness: '준비도 테스트',
  navHealth: '건강 검진',
  navCalculators: '계산기',
  journeyBasicFoot: '한 걸음씩. 진행에 따라 더 많은 도구가 열립니다.',
  fuelHighProteinNote: '고단백일은 당신의',
};

const ja: Partial<NavStrings> = {
  ...en,
  navOpenBeta: '無料ベータ',
  navAssess: '評価',
  navMore: 'その他',
  navCoachTab: 'コーチ',
  navMoreEyebrow: 'すべての画面',
  navGroupMission: 'ミッション',
  navGroupPillars: '柱',
  navGroupToolkit: 'ツール',
  navSectionRecover: '回復',
  navSectionTrain: '深いトレーニング',
  navSectionLearn: '学習と測定',
  navMove: 'ムーブ',
  navMind: 'マインド',
  navLearn: '学習',
  navBuilder: 'ビルダー',
  navLibrary: 'ライブラリ',
  navHistory: '履歴',
  navLeaderboard: 'ランキング',
  navReadiness: '準備度テスト',
  navHealth: '健康スクリーニング',
  navCalculators: '計算機',
  journeyBasicFoot: '一歩ずつ。進むほどツールが増えます。',
  fuelHighProteinNote: '高タンパク日はあなたの',
};

const pt: Partial<NavStrings> = {
  ...en,
  navOpenBeta: 'Beta gratuita',
  navAssess: 'Avaliar',
  navMore: 'Mais',
  navCoachTab: 'Treinador',
  navMoreEyebrow: 'Todas as telas',
  navGroupMission: 'Missão',
  navGroupPillars: 'Pilares',
  navGroupToolkit: 'Ferramentas',
  navSectionRecover: 'Recuperação',
  navSectionTrain: 'Treino profundo',
  navSectionLearn: 'Aprender e medir',
  navMove: 'Movimento',
  navMind: 'Mente',
  navLearn: 'Aprender',
  navBuilder: 'Construtor',
  navLibrary: 'Biblioteca',
  navHistory: 'Histórico',
  navLeaderboard: 'Ranking',
  navReadiness: 'Testes de prontidão',
  navHealth: 'Triagem de saúde',
  navCalculators: 'Calculadoras',
  journeyBasicFoot: 'Um passo de cada vez. Mais ferramentas conforme você progride.',
  fuelHighProteinNote: 'Dias com alta proteína impulsionam seu',
};

const ru: Partial<NavStrings> = {
  ...en,
  navOpenBeta: 'Бесплатная бета',
  navAssess: 'Оценка',
  navMore: 'Ещё',
  navCoachTab: 'Тренер',
  navMoreEyebrow: 'Все экраны',
  navGroupMission: 'Миссия',
  navGroupPillars: 'Основы',
  navGroupToolkit: 'Инструменты',
  navSectionRecover: 'Восстановление',
  navSectionTrain: 'Углублённая тренировка',
  navSectionLearn: 'Обучение и замеры',
  navMove: 'Движение',
  navMind: 'Разум',
  navLearn: 'Обучение',
  navBuilder: 'Конструктор',
  navLibrary: 'Библиотека',
  navHistory: 'История',
  navLeaderboard: 'Рейтинг',
  navReadiness: 'Тесты готовности',
  navHealth: 'Скрининг здоровья',
  navCalculators: 'Калькуляторы',
  journeyBasicFoot: 'Шаг за шагом. Больше инструментов по мере прогресса.',
  fuelHighProteinNote: 'Дни с высоким белком усиливают ваш',
};

const LOCALES: Partial<Record<string, Partial<NavStrings>>> = { en, es, zh, id, th, ar, fr, de, it, ko, ja, pt, ru };

export function navStringsFor(lang: string): NavStrings {
  const code = lang.split('-')[0];
  return { ...en, ...(LOCALES[code] ?? {}) };
}

export function mergeNavStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, navStringsFor(lang));
}

export type { NavStrings };
