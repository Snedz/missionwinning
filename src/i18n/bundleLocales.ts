/** Super Bundle merchandising copy — merged into i18n `common` namespace. */

type BundleStrings = {
  bundleBadge: string;
  bundleHeadline: string;
  bundleSubhead: string;
  bundleUrgencyBadge: string;
  bundleTab3mo: string;
  bundleTab12mo: string;
  bundleTabLifetime: string;
  bundleBadgePopular: string;
  bundleBadgeBestValue: string;
  bundleBadgeLimited: string;
  bundleSavePercent: string;
  bundlePerMonth: string;
  bundleBilledTotal: string;
  bundleBilledOnce: string;
  bundleHeroTitle: string;
  bundleHeroSubtitle: string;
  bundleUnlockCta: string;
  bundleOneAppTitle: string;
  bundleOneAppDesc: string;
  bundleWinScoreNote: string;
  bundleCompareTitle: string;
  bundleColPillar: string;
  bundleColPremium: string;
  bundleColMonthly: string;
  bundleColIncluded: string;
  bundleCompareFoot: string;
  bundleFreeForeverTitle: string;
  bundleFreeForeverBody: string;
  bundleStripeHint: string;
  bundlePillarTrain: string;
  bundlePillarFuel: string;
  bundlePillarMove: string;
  bundlePillarMind: string;
  bundlePillarTrack: string;
  bundlePillarLearn: string;
  bundlePillarTrainFree: string;
  bundlePillarTrainPremium: string;
  bundlePillarFuelFree: string;
  bundlePillarFuelPremium: string;
  bundlePillarMoveFree: string;
  bundlePillarMovePremium: string;
  bundlePillarMindFree: string;
  bundlePillarMindPremium: string;
  bundlePillarTrackFree: string;
  bundlePillarTrackPremium: string;
  bundlePillarLearnFree: string;
  bundlePillarLearnPremium: string;
  bundleVsSeparate: string;
  bundleRowTotal: string;
  bundleFaqTitle: string;
  bundleFaqSubtitle: string;
  bundleFaq1Q: string;
  bundleFaq1A: string;
  bundleFaq2Q: string;
  bundleFaq2A: string;
  bundleFaq3Q: string;
  bundleFaq3A: string;
  bundleFaq4Q: string;
  bundleFaq4A: string;
  bundleFaq5Q: string;
  bundleFaq5A: string;
  bundleFaq6Q: string;
  bundleFaq6A: string;
  bundleCheckoutSuccess: string;
  bundleCheckoutCancel: string;
  bundleGoToApp: string;
  bundleStartFreeFirst: string;
};

const en: BundleStrings = {
  bundleBadge: 'Super Bundle',
  bundleHeadline: 'Six pillars. One app. One price.',
  bundleSubhead:
    'Mission Winning replaces a stack of fitness apps with one PWA — Train, Fuel, Move, Mind, Track, Learn, and your unified Win Score on Today.',
  bundleUrgencyBadge: 'Intro pricing — limited time',
  bundleTab3mo: '3 months',
  bundleTab12mo: '12 months',
  bundleTabLifetime: 'Lifetime',
  bundleBadgePopular: 'Most popular',
  bundleBadgeBestValue: 'Best value',
  bundleBadgeLimited: 'Limited offer',
  bundleSavePercent: 'Save {{percent}}%',
  bundlePerMonth: '${{price}}/mo',
  bundleBilledTotal: '${{price}} billed once',
  bundleBilledOnce: '${{price}} one-time',
  bundleHeroTitle: 'Super Bundle',
  bundleHeroSubtitle: 'All six premium pillars + unified Today hub',
  bundleUnlockCta: 'Unlock Super Bundle',
  bundleOneAppTitle: 'One app — not seven',
  bundleOneAppDesc:
    'Freeletics sells separate apps. Mission Winning keeps Train, Fuel, Move, Mind, Track, and Learn in one install with one Win Score.',
  bundleWinScoreNote: 'Today hub Win Score ties every pillar together.',
  bundleCompareTitle: 'Compare standalone vs bundle',
  bundleColPillar: 'Pillar',
  bundleColPremium: 'Premium tier',
  bundleColMonthly: 'Monthly',
  bundleColIncluded: 'In bundle',
  bundleCompareFoot:
    'Standalone prices are illustrative — the bundle costs less than subscribing to equivalent apps separately.',
  bundleFreeForeverTitle: 'Free forever',
  bundleFreeForeverBody:
    'Every pillar includes a free tier: workouts, recipes, mobility flows, breathing, activity logging, and learn paths. Premium unlocks advanced programs, full recipe library, and cloud sync priority.',
  bundleStripeHint:
    'Live Stripe: set STRIPE_SECRET_KEY + price IDs (API checkout) or NEXT_PUBLIC_STRIPE_LINK_BUNDLE (payment link). Webhook: /api/stripe-webhook.',
  bundlePillarTrain: 'Train',
  bundlePillarFuel: 'Fuel',
  bundlePillarMove: 'Move',
  bundlePillarMind: 'Mind',
  bundlePillarTrack: 'Track',
  bundlePillarLearn: 'Learn',
  bundlePillarTrainFree: 'Full logger, builder, library, benchmarks',
  bundlePillarTrainPremium: 'AI Coach, unlimited plans, hybrid programming',
  bundlePillarFuelFree: 'Macro log, water, 12 recipes',
  bundlePillarFuelPremium: 'Meal plans, periodized nutrition, coaching sync',
  bundlePillarMoveFree: '4 guided mobility flows + timer',
  bundlePillarMovePremium: 'Pliability + Skill Yoga depth',
  bundlePillarMindFree: 'Breathing timer + daily check-in',
  bundlePillarMindPremium: 'Guided meditations, sleep tools',
  bundlePillarTrackFree: 'Manual activity log + weekly stats',
  bundlePillarTrackPremium: 'GPS routes, pace charts (MapMy-style)',
  bundlePillarLearnFree: '8 education paths + samples',
  bundlePillarLearnPremium: 'Full specialist programs (PT, BB, etc.)',
  bundleVsSeparate: 'Save {{percent}}% vs buying pillars separately',
  bundleRowTotal: 'Super Bundle (all pillars)',
  bundleFaqTitle: 'Frequently asked questions',
  bundleFaqSubtitle: 'Core stays free. Premium funds the global mission.',
  bundleFaq1Q: 'Is the core app really free forever?',
  bundleFaq1A:
    'Yes. Workout logging, basic library, nutrition log, free mobility flows, mind breathing, activity log, and learn paths are never paywalled. Premium adds depth — AI Coach, premium sessions, specialist programs, and more recipes.',
  bundleFaq2Q: 'What if I cancel the Super Bundle?',
  bundleFaq2A:
    'You keep all free-tier access. Premium features lock when your enrollment ends, but your workout history and core tools remain. Downgrade anytime — no hostage pricing on the logger.',
  bundleFaq3Q: 'Does Mission Winning work offline?',
  bundleFaq3A:
    'Yes. Install the PWA for offline workout logging, cached plans, and offline coach on Today. Built for rural and low-connectivity users worldwide.',
  bundleFaq4Q: 'What is included in premium?',
  bundleFaq4A:
    'AI Coach + plan generator, 6 Mind / 5 Move / 5 Track / 6 Learn premium programs, 92+ recipes, pro workout templates, and cross-pillar Win Score depth on Today.',
  bundleFaq5Q: 'Is this medical advice?',
  bundleFaq5A:
    'No. Mission Winning provides educational fitness tools. Consult qualified professionals before intense training. We issue certificates of educational achievement — not medical licensure.',
  bundleFaq6Q: 'Which languages are supported?',
  bundleFaq6A:
    'Fourteen locales ship today with Tier 1 body copy for Today, Welcome, Fuel, and Active in FR, DE, PT, IT, JA, KO, and RU. More expansion is planned.',
  bundleCheckoutSuccess: 'Welcome to the Super Bundle! Premium unlocks after payment is confirmed.',
  bundleCheckoutCancel: 'Checkout cancelled — your free core access is unchanged.',
  bundleGoToApp: 'Open Today hub',
  bundleStartFreeFirst: 'Start free first — no card required',
};

const es: BundleStrings = {
  ...en,
  bundleHeadline: 'Seis pilares. Una app. Un precio.',
  bundleSubhead:
    'Mission Winning reemplaza un montón de apps de fitness con una PWA — Entrenar, Nutrición, Movimiento, Mente, Seguimiento, Aprender y tu Win Score unificado en Hoy.',
  bundleUrgencyBadge: 'Precio introductorio — tiempo limitado',
  bundleTab3mo: '3 meses',
  bundleTab12mo: '12 meses',
  bundleTabLifetime: 'De por vida',
  bundleBadgePopular: 'Más popular',
  bundleBadgeBestValue: 'Mejor valor',
  bundleBadgeLimited: 'Oferta limitada',
  bundleSavePercent: 'Ahorra {{percent}}%',
  bundlePerMonth: '${{price}}/mes',
  bundleBilledTotal: '${{price}} facturado una vez',
  bundleBilledOnce: '${{price}} pago único',
  bundleHeroSubtitle: 'Los seis pilares premium + hub Hoy unificado',
  bundleUnlockCta: 'Desbloquear Super Bundle',
  bundleOneAppTitle: 'Una app — no siete',
  bundleOneAppDesc:
    'Freeletics vende apps separadas. Mission Winning mantiene Entrenar, Nutrición, Movimiento, Mente, Seguimiento y Aprender en una sola instalación con un Win Score.',
  bundleWinScoreNote: 'El Win Score en Hoy une todos los pilares.',
  bundleCompareTitle: 'Comparar individual vs bundle',
  bundleColPillar: 'Pilar',
  bundleColPremium: 'Nivel premium',
  bundleColMonthly: 'Mensual',
  bundleColIncluded: 'En bundle',
  bundleCompareFoot:
    'Los precios individuales son ilustrativos — el bundle cuesta menos que suscribirse por separado.',
  bundleFreeForeverTitle: 'Gratis para siempre',
  bundleFreeForeverBody:
    'Cada pilar incluye nivel gratuito: entrenamientos, recetas, movilidad, respiración, registro de actividad y rutas de aprendizaje. Premium desbloquea programas avanzados, biblioteca completa y prioridad de sync.',
  bundleVsSeparate: 'Ahorra {{percent}}% vs comprar pilares por separado',
  bundleRowTotal: 'Super Bundle (todos los pilares)',
};

const zh: BundleStrings = {
  ...en,
  bundleHeadline: '六大支柱。一个应用。一个价格。',
  bundleSubhead:
    'Mission Winning 用一个 PWA 取代一堆健身应用 — 训练、营养、活动、心理、追踪、学习，以及 Today 统一的 Win Score。',
  bundleUrgencyBadge: '入门价 — 限时',
  bundleTab3mo: '3 个月',
  bundleTab12mo: '12 个月',
  bundleTabLifetime: '终身',
  bundleBadgePopular: '最受欢迎',
  bundleBadgeBestValue: '最超值',
  bundleBadgeLimited: '限时优惠',
  bundleSavePercent: '省 {{percent}}%',
  bundlePerMonth: '${{price}}/月',
  bundleBilledTotal: '一次性 ${{price}}',
  bundleBilledOnce: '一次性 ${{price}}',
  bundleHeroSubtitle: '六大高级支柱 + 统一 Today 中心',
  bundleUnlockCta: '解锁 Super Bundle',
  bundleOneAppTitle: '一个应用 — 不是七个',
  bundleOneAppDesc:
    'Freeletics 卖多个独立应用。Mission Winning 把训练、营养、活动、心理、追踪、学习放在一个安装里，共用一个 Win Score。',
  bundleWinScoreNote: 'Today 的 Win Score 串联所有支柱。',
  bundleCompareTitle: '单独购买 vs 捆绑',
  bundleColPillar: '支柱',
  bundleColPremium: '高级版',
  bundleColMonthly: '月费',
  bundleColIncluded: '含在 bundle',
  bundleFreeForeverTitle: '永久免费基础版',
  bundleVsSeparate: '比单独购买省 {{percent}}%',
  bundleRowTotal: 'Super Bundle（全部支柱）',
};

const id: BundleStrings = {
  ...en,
  bundleHeadline: 'Enam pilar. Satu app. Satu harga.',
  bundleSubhead:
    'Mission Winning menggantikan banyak app fitness dengan satu PWA — Train, Fuel, Move, Mind, Track, Learn, plus Win Score terpadu di Today.',
  bundleUrgencyBadge: 'Harga intro — waktu terbatas',
  bundleTab3mo: '3 bulan',
  bundleTab12mo: '12 bulan',
  bundleTabLifetime: 'Seumur hidup',
  bundleBadgePopular: 'Paling populer',
  bundleBadgeBestValue: 'Nilai terbaik',
  bundleSavePercent: 'Hemat {{percent}}%',
  bundlePerMonth: '${{price}}/bln',
  bundleUnlockCta: 'Buka Super Bundle',
  bundleOneAppTitle: 'Satu app — bukan tujuh',
  bundleCompareTitle: 'Bandingkan terpisah vs bundle',
  bundleFreeForeverTitle: 'Gratis selamanya',
  bundleVsSeparate: 'Hemat {{percent}}% vs beli pilar terpisah',
  bundleRowTotal: 'Super Bundle (semua pilar)',
};

const th: BundleStrings = {
  ...en,
  bundleHeadline: 'หกเสาหลัก แอปเดียว ราคาเดียว',
  bundleSubhead:
    'Mission Winning แทนที่แอปฟิตเนสหลายตัวด้วย PWA เดียว — Train, Fuel, Move, Mind, Track, Learn และ Win Score รวมบน Today',
  bundleUrgencyBadge: 'ราคาเปิดตัว — จำกัดเวลา',
  bundleTab3mo: '3 เดือน',
  bundleTab12mo: '12 เดือน',
  bundleTabLifetime: 'ตลอดชีพ',
  bundleBadgePopular: 'ยอดนิยม',
  bundleBadgeBestValue: 'คุ้มที่สุด',
  bundleSavePercent: 'ประหยัด {{percent}}%',
  bundlePerMonth: '${{price}}/เดือน',
  bundleUnlockCta: 'ปลดล็อก Super Bundle',
  bundleOneAppTitle: 'แอปเดียว — ไม่ใช่เจ็ดแอป',
  bundleCompareTitle: 'เปรียบเทียบแยก vs ชุดรวม',
  bundleFreeForeverTitle: 'ฟรีตลอดไป',
  bundleVsSeparate: 'ประหยัด {{percent}}% เทียบกับซื้อแยก',
  bundleRowTotal: 'Super Bundle (ทุกเสาหลัก)',
};

const ar: BundleStrings = {
  ...en,
  bundleHeadline: 'ستة أركان. تطبيق واحد. سعر واحد.',
  bundleSubhead:
    'Mission Winning يستبدل مجموعة تطبيقات اللياقة بتطبيق PWA واحد — Train وFuel وMove وMind وTrack وLearn مع Win Score موحد في Today.',
  bundleUrgencyBadge: 'سعر تمهيدي — لفترة محدودة',
  bundleTab3mo: '3 أشهر',
  bundleTab12mo: '12 شهرًا',
  bundleTabLifetime: 'مدى الحياة',
  bundleBadgePopular: 'الأكثر شيوعًا',
  bundleBadgeBestValue: 'أفضل قيمة',
  bundleBadgeLimited: 'عرض محدود',
  bundleSavePercent: 'وفّر {{percent}}%',
  bundlePerMonth: '${{price}}/شهر',
  bundleBilledTotal: '${{price}} دفعة واحدة',
  bundleBilledOnce: '${{price}} لمرة واحدة',
  bundleHeroSubtitle: 'الأركان الستة المميزة + مركز Today الموحد',
  bundleUnlockCta: 'افتح Super Bundle',
  bundleOneAppTitle: 'تطبيق واحد — لا سبعة',
  bundleOneAppDesc:
    'Freeletics تبيع تطبيقات منفصلة. Mission Winning يجمع Train وFuel وMove وMind وTrack وLearn في تثبيت واحد مع Win Score واحد.',
  bundleWinScoreNote: 'Win Score في Today يربط كل الأركان.',
  bundleCompareTitle: 'مقارنة منفرد vs الحزمة',
  bundleColPillar: 'الركن',
  bundleColPremium: 'المستوى المميز',
  bundleColMonthly: 'شهري',
  bundleColIncluded: 'في الحزمة',
  bundleFreeForeverTitle: 'مجاني للأبد',
  bundleFreeForeverBody:
    'كل ركن يتضمن مستوى مجاني: تمارين، وصفات، حركة، تنفس، تتبع نشاط، ومسارات تعلم. المميز يفتح البرامج المتقدمة والمكتبة الكاملة.',
  bundleVsSeparate: 'وفّر {{percent}}% مقارنة بشراء الأركان منفصلة',
  bundleRowTotal: 'Super Bundle (كل الأركان)',
};

const LOCALES: Partial<Record<string, BundleStrings>> = { en, es, zh, id, th, ar };

export function bundleStringsFor(lang: string): BundleStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeBundleStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, bundleStringsFor(lang));
}

/** i18n keys for pillar copy on the bundle page. */
export const BUNDLE_PILLAR_I18N: Record<
  string,
  { nameKey: keyof BundleStrings; freeKey: keyof BundleStrings; premiumKey: keyof BundleStrings }
> = {
  train: { nameKey: 'bundlePillarTrain', freeKey: 'bundlePillarTrainFree', premiumKey: 'bundlePillarTrainPremium' },
  fuel: { nameKey: 'bundlePillarFuel', freeKey: 'bundlePillarFuelFree', premiumKey: 'bundlePillarFuelPremium' },
  move: { nameKey: 'bundlePillarMove', freeKey: 'bundlePillarMoveFree', premiumKey: 'bundlePillarMovePremium' },
  mind: { nameKey: 'bundlePillarMind', freeKey: 'bundlePillarMindFree', premiumKey: 'bundlePillarMindPremium' },
  track: { nameKey: 'bundlePillarTrack', freeKey: 'bundlePillarTrackFree', premiumKey: 'bundlePillarTrackPremium' },
  learn: { nameKey: 'bundlePillarLearn', freeKey: 'bundlePillarLearnFree', premiumKey: 'bundlePillarLearnPremium' },
};
