/** Fuel / Nutrition page UI copy — merged into i18n `common` namespace. */

type FuelStrings = {
  fuelPremiumActive: string;
  fuelBundleUpsell: string;
  fuelWinScore: string;
  fuelTargetsTitle: string;
  fuelCalories: string;
  fuelProtein: string;
  fuelMacrosSummary: string;
  fuelPillarWinsToday: string;
  fuelHydrationTitle: string;
  fuelGlasses: string;
  fuelHydrationHint: string;
  fuelQuickLogTitle: string;
  fuelQuickLogFoot: string;
  fuelCustomEntryTitle: string;
  fuelFoodLabel: string;
  fuelProteinGLabel: string;
  fuelCalsLabel: string;
  fuelLogBtn: string;
  fuelTodayLogTitle: string;
  fuelClearDay: string;
  fuelLoadCloud: string;
  fuelCloudLoading: string;
  fuelCloudLoaded: string;
  fuelNoEntries: string;
  fuelTotals: string;
  fuelTotalsLine: string;
  fuelLocalNote: string;
  fuelFreeRecipesTitle: string;
  fuelPremiumRecipesTitle: string;
  fuelPremiumLockedTitle: string;
  fuelPremiumLockedBody: string;
  fuelExploreBundle: string;
};

const en: FuelStrings = {
  fuelPremiumActive: ' Premium: full recipe library + deep plans (Super Bundle).',
  fuelBundleUpsell: ' Super Bundle unlocks the full recipe library and advanced meal plans.',
  fuelWinScore: 'Win Score',
  fuelTargetsTitle: "Today's Targets",
  fuelCalories: 'Calories',
  fuelProtein: 'Protein',
  fuelMacrosSummary: 'Carbs: {{carbs}}g • Fat: {{fat}}g • Water: {{water}} / 8 glasses',
  fuelPillarWinsToday: 'Pillar wins today (Move/Mind/Assess): {{count}} — e.g. {{example}}',
  fuelHydrationTitle: 'Hydration',
  fuelGlasses: 'glasses',
  fuelHydrationHint: 'Aim for 8+ (adjust for climate/activity)',
  fuelQuickLogTitle: 'Quick Log (common foods)',
  fuelQuickLogFoot: 'More complete database + recipes in the full Nutrition program. Adjust targets via Calculators page.',
  fuelCustomEntryTitle: 'Custom Entry',
  fuelFoodLabel: 'Food',
  fuelProteinGLabel: 'Protein g',
  fuelCalsLabel: 'Cals',
  fuelLogBtn: 'Log',
  fuelTodayLogTitle: "Today's Log",
  fuelClearDay: 'Clear day',
  fuelLoadCloud: 'Load from Cloud',
  fuelCloudLoading: 'Loading...',
  fuelCloudLoaded: 'Cloud loaded (signed-in only)',
  fuelNoEntries: 'No entries yet. Use quick logs or custom above.',
  fuelTotals: 'Totals',
  fuelTotalsLine: '{{protein}}g protein • {{cals}} kcal',
  fuelLocalNote:
    'Data stored locally (synced when you sign in). Full integration + meal plans in the paid Nutrition course.',
  fuelFreeRecipesTitle: 'Free Recipes ({{count}} — core mission)',
  fuelPremiumRecipesTitle: 'Premium Recipes & Meal Ideas (Super Bundle)',
  fuelPremiumLockedTitle: '+{{count}} Premium Recipes',
  fuelPremiumLockedBody:
    'Unlock the full Fuel pillar recipe library, meal timing strategies, and advanced macro coaching via the Super Bundle.',
  fuelExploreBundle: 'Explore Super Bundle',
};

const es: FuelStrings = {
  ...en,
  fuelPremiumActive: ' Premium: biblioteca completa + planes profundos (Super Bundle).',
  fuelBundleUpsell: ' Super Bundle desbloquea recetas completas y planes avanzados.',
  fuelWinScore: 'Puntuación de Misión',
  fuelTargetsTitle: 'Objetivos de hoy',
  fuelCalories: 'Calorías',
  fuelProtein: 'Proteína',
  fuelMacrosSummary: 'Carbos: {{carbs}}g • Grasa: {{fat}}g • Agua: {{water}} / 8 vasos',
  fuelPillarWinsToday: 'Victorias hoy (Move/Mind/Assess): {{count}} — ej. {{example}}',
  fuelHydrationTitle: 'Hidratación',
  fuelGlasses: 'vasos',
  fuelHydrationHint: 'Objetivo 8+ (ajusta por clima/actividad)',
  fuelQuickLogTitle: 'Registro rápido',
  fuelCustomEntryTitle: 'Entrada personalizada',
  fuelFoodLabel: 'Alimento',
  fuelProteinGLabel: 'Proteína g',
  fuelCalsLabel: 'Cal',
  fuelLogBtn: 'Registrar',
  fuelTodayLogTitle: 'Registro de hoy',
  fuelClearDay: 'Limpiar día',
  fuelLoadCloud: 'Cargar de la nube',
  fuelCloudLoading: 'Cargando...',
  fuelCloudLoaded: 'Nube cargada (solo con sesión)',
  fuelNoEntries: 'Sin entradas. Usa registro rápido o personalizado.',
  fuelTotals: 'Totales',
  fuelTotalsLine: '{{protein}}g proteína • {{cals}} kcal',
  fuelFreeRecipesTitle: 'Recetas gratis ({{count}} — misión core)',
  fuelPremiumRecipesTitle: 'Recetas premium (Super Bundle)',
  fuelPremiumLockedTitle: '+{{count}} recetas premium',
  fuelPremiumLockedBody: 'Desbloquea la biblioteca Fuel completa y coaching avanzado con Super Bundle.',
  fuelExploreBundle: 'Explorar Super Bundle',
};

const zh: FuelStrings = {
  fuelPremiumActive: ' 高级版：完整食谱库与深度计划（Super Bundle）。',
  fuelBundleUpsell: ' Super Bundle 解锁完整食谱库与高级餐计划。',
  fuelWinScore: '任务分数',
  fuelTargetsTitle: '今日目标',
  fuelCalories: '热量',
  fuelProtein: '蛋白质',
  fuelMacrosSummary: '碳水: {{carbs}}g • 脂肪: {{fat}}g • 饮水: {{water}} / 8 杯',
  fuelPillarWinsToday: '今日支柱胜利 (Move/Mind/Assess): {{count}} — 如 {{example}}',
  fuelHydrationTitle: '补水',
  fuelGlasses: '杯',
  fuelHydrationHint: '目标 8+ 杯（按气候/活动调整）',
  fuelQuickLogTitle: '快速记录（常见食物）',
  fuelQuickLogFoot: '完整数据库与食谱见营养课程。在计算器页调整目标。',
  fuelCustomEntryTitle: '自定义记录',
  fuelFoodLabel: '食物',
  fuelProteinGLabel: '蛋白质 g',
  fuelCalsLabel: '热量',
  fuelLogBtn: '记录',
  fuelTodayLogTitle: '今日记录',
  fuelClearDay: '清空今日',
  fuelLoadCloud: '从云端加载',
  fuelCloudLoading: '加载中…',
  fuelCloudLoaded: '已从云端加载（需登录）',
  fuelNoEntries: '暂无记录。请使用快速或自定义记录。',
  fuelTotals: '合计',
  fuelTotalsLine: '{{protein}}g 蛋白质 • {{cals}} kcal',
  fuelLocalNote: '数据保存在本地（登录后同步）。完整整合见付费营养课程。',
  fuelFreeRecipesTitle: '免费食谱 ({{count}} — 核心任务)',
  fuelPremiumRecipesTitle: '高级食谱与餐点 (Super Bundle)',
  fuelPremiumLockedTitle: '+{{count}} 高级食谱',
  fuelPremiumLockedBody: '通过 Super Bundle 解锁完整 Fuel 食谱库、用餐时机与高级宏量指导。',
  fuelExploreBundle: '了解 Super Bundle',
};

const id: FuelStrings = {
  fuelPremiumActive: ' Premium: perpustakaan resep lengkap + rencana mendalam (Super Bundle).',
  fuelBundleUpsell: ' Super Bundle membuka perpustakaan resep lengkap dan rencana makan lanjutan.',
  fuelWinScore: 'Skor Misi',
  fuelTargetsTitle: 'Target hari ini',
  fuelCalories: 'Kalori',
  fuelProtein: 'Protein',
  fuelMacrosSummary: 'Karbo: {{carbs}}g • Lemak: {{fat}}g • Air: {{water}} / 8 gelas',
  fuelPillarWinsToday: 'Kemenangan pilar hari ini: {{count}} — contoh {{example}}',
  fuelHydrationTitle: 'Hidrasi',
  fuelGlasses: 'gelas',
  fuelHydrationHint: 'Target 8+ (sesuaikan iklim/aktivitas)',
  fuelQuickLogTitle: 'Log cepat (makanan umum)',
  fuelQuickLogFoot: 'Database lengkap + resep di program Nutrisi. Sesuaikan target di Kalkulator.',
  fuelCustomEntryTitle: 'Entri kustom',
  fuelFoodLabel: 'Makanan',
  fuelProteinGLabel: 'Protein g',
  fuelCalsLabel: 'Kal',
  fuelLogBtn: 'Log',
  fuelTodayLogTitle: 'Log hari ini',
  fuelClearDay: 'Hapus hari',
  fuelLoadCloud: 'Muat dari cloud',
  fuelCloudLoading: 'Memuat...',
  fuelCloudLoaded: 'Cloud dimuat (hanya saat masuk)',
  fuelNoEntries: 'Belum ada entri. Gunakan log cepat atau kustom.',
  fuelTotals: 'Total',
  fuelTotalsLine: '{{protein}}g protein • {{cals}} kcal',
  fuelLocalNote: 'Data disimpan lokal (sinkron saat masuk). Integrasi penuh di kursus Nutrisi berbayar.',
  fuelFreeRecipesTitle: 'Resep gratis ({{count}} — misi inti)',
  fuelPremiumRecipesTitle: 'Resep premium (Super Bundle)',
  fuelPremiumLockedTitle: '+{{count}} resep premium',
  fuelPremiumLockedBody: 'Buka perpustakaan Fuel lengkap dan coaching makro lanjutan via Super Bundle.',
  fuelExploreBundle: 'Jelajahi Super Bundle',
};

const th: FuelStrings = {
  fuelPremiumActive: ' พรีเมียม: สูตรครบ + แผนลึก (Super Bundle)',
  fuelBundleUpsell: ' Super Bundle ปลดล็อกสูตรครบและแผนมื้อขั้นสูง',
  fuelWinScore: 'คะแนนภารกิจ',
  fuelTargetsTitle: 'เป้าหมายวันนี้',
  fuelCalories: 'แคลอรี่',
  fuelProtein: 'โปรตีน',
  fuelMacrosSummary: 'คาร์บ: {{carbs}}g • ไขมัน: {{fat}}g • น้ำ: {{water}} / 8 แก้ว',
  fuelPillarWinsToday: 'ชัยชนะเสาหลักวันนี้: {{count}} — เช่น {{example}}',
  fuelHydrationTitle: 'การดื่มน้ำ',
  fuelGlasses: 'แก้ว',
  fuelHydrationHint: 'เป้า 8+ แก้ว (ปรับตามสภาพอากาศ/กิจกรรม)',
  fuelQuickLogTitle: 'บันทึกด่วน (อาหารทั่วไป)',
  fuelQuickLogFoot: 'ฐานข้อมูลและสูตรเต็มในโปรแกรมโภชนาการ ปรับเป้าที่หน้าเครื่องคิดเลข',
  fuelCustomEntryTitle: 'บันทึกเอง',
  fuelFoodLabel: 'อาหาร',
  fuelProteinGLabel: 'โปรตีน g',
  fuelCalsLabel: 'แคล',
  fuelLogBtn: 'บันทึก',
  fuelTodayLogTitle: 'บันทึกวันนี้',
  fuelClearDay: 'ล้างวันนี้',
  fuelLoadCloud: 'โหลดจากคลาวด์',
  fuelCloudLoading: 'กำลังโหลด…',
  fuelCloudLoaded: 'โหลดคลาวด์แล้ว (ต้องลงชื่อเข้าใช้)',
  fuelNoEntries: 'ยังไม่มีรายการ ใช้บันทึกด่วนหรือกำหนดเอง',
  fuelTotals: 'รวม',
  fuelTotalsLine: '{{protein}}g โปรตีน • {{cals}} kcal',
  fuelLocalNote: 'เก็บข้อมูลในเครื่อง (ซิงค์เมื่อลงชื่อเข้าใช้) บูรณาการเต็มในคอร์สโภชนาการ',
  fuelFreeRecipesTitle: 'สูตรฟรี ({{count}} — ภารกิจหลัก)',
  fuelPremiumRecipesTitle: 'สูตรพรีเมียม (Super Bundle)',
  fuelPremiumLockedTitle: '+{{count}} สูตรพรีเมียม',
  fuelPremiumLockedBody: 'ปลดล็อกไลบรารี Fuel เต็มและโค้ชมาโครขั้นสูงผ่าน Super Bundle',
  fuelExploreBundle: 'ดู Super Bundle',
};

const ar: FuelStrings = {
  fuelPremiumActive: ' Premium: مكتبة وصفات كاملة + خطط (Super Bundle).',
  fuelBundleUpsell: ' Super Bundle يفتح الوصفات الكاملة وخطط الوجبات المتقدمة.',
  fuelWinScore: 'نقاط المهمة',
  fuelTargetsTitle: 'أهداف اليوم',
  fuelCalories: 'السعرات',
  fuelProtein: 'البروتين',
  fuelMacrosSummary: 'كرب: {{carbs}}g • دهون: {{fat}}g • ماء: {{water}} / 8 أكواب',
  fuelPillarWinsToday: 'انتصارات الركائز اليوم: {{count}} — مثلاً {{example}}',
  fuelHydrationTitle: 'الترطيب',
  fuelGlasses: 'أكواب',
  fuelHydrationHint: 'هدف 8+ (عدّل حسب المناخ/النشاط)',
  fuelQuickLogTitle: 'تسجيل سريع (أطعمة شائعة)',
  fuelQuickLogFoot: 'قاعدة بيانات كاملة في برنامج التغذية. عدّل الأهداف في الحاسبات.',
  fuelCustomEntryTitle: 'إدخال مخصص',
  fuelFoodLabel: 'طعام',
  fuelProteinGLabel: 'بروتين g',
  fuelCalsLabel: 'سعرات',
  fuelLogBtn: 'تسجيل',
  fuelTodayLogTitle: 'سجل اليوم',
  fuelClearDay: 'مسح اليوم',
  fuelLoadCloud: 'تحميل من السحابة',
  fuelCloudLoading: 'جاري التحميل…',
  fuelCloudLoaded: 'تم التحميل (يتطلب تسجيل الدخول)',
  fuelNoEntries: 'لا إدخالات. استخدم التسجيل السريع أو المخصص.',
  fuelTotals: 'المجموع',
  fuelTotalsLine: '{{protein}}g بروتين • {{cals}} kcal',
  fuelLocalNote: 'البيانات محلية (تُزامن عند تسجيل الدخول).',
  fuelFreeRecipesTitle: 'وصفات مجانية ({{count}} — المهمة الأساسية)',
  fuelPremiumRecipesTitle: 'وصفات Premium (Super Bundle)',
  fuelPremiumLockedTitle: '+{{count}} وصفات Premium',
  fuelPremiumLockedBody: 'افتح مكتبة Fuel الكاملة وتدريب الماكرو عبر Super Bundle.',
  fuelExploreBundle: 'استكشف Super Bundle',
};

const LOCALES: Partial<Record<string, FuelStrings>> = { en, es, zh, id, th, ar };

export function fuelStringsFor(lang: string): FuelStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeFuelStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, fuelStringsFor(lang));
}

export type { FuelStrings };
