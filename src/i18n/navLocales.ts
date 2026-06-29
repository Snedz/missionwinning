/** Extended nav + header dropdown copy — merged into i18n `common` namespace. */

type NavStrings = {
  navSectionRecover: string;
  navSectionTrain: string;
  navSectionLearn: string;
  navSectionPremium: string;
  navMove: string;
  navMind: string;
  navLearn: string;
  navBuilder: string;
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
};

const en: NavStrings = {
  navSectionRecover: 'Recover',
  navSectionTrain: 'Train deeper',
  navSectionLearn: 'Learn & measure',
  navSectionPremium: 'Premium',
  navMove: 'Move',
  navMind: 'Mind',
  navLearn: 'Learn',
  navBuilder: 'Builder',
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
};

const es: NavStrings = {
  ...en,
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

const zh: NavStrings = {
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

const id: NavStrings = {
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

const th: NavStrings = {
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

const ar: NavStrings = {
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

const LOCALES: Partial<Record<string, NavStrings>> = { en, es, zh, id, th, ar };

export function navStringsFor(lang: string): NavStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeNavStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, navStringsFor(lang));
}

export type { NavStrings };
