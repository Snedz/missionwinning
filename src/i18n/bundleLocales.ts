/** Super Bundle merchandising copy — merged into i18n `common` namespace. */

import { CONTENT_FLOORS } from '@/lib/contentFloors';

type BundleStrings = {
  bundleBadge: string;
  bundleHeadline: string;
  bundleSubhead: string;
  bundleUrgencyBadge: string;
  bundleTab3mo: string;
  /** Preferred label for monthly plan (STRATEGY). */
  bundleTabMonthly: string;
  bundleTab12mo: string;
  bundleTabLifetime: string;
  bundleBilledMonthly: string;
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
  bundleCheckoutSuccess: string;
  bundleEyebrow: string;
  bundleHonestNote: string;
  bundleCheckoutStillProcessing: string;
  bundleCheckoutRetry: string;
  bundleCheckoutUnlocking: string;
  bundleStoryEyebrow: string;
  bundleStoryTitle: string;
  bundleStoryBody: string;
  bundleStoryProof: string;
  bundleStoryCompare: string;
  bundleProofNearCta: string;
  bundlePayMethods: string;
  bundleUsdcNote: string;
  bundleUnlockLifetimeCta: string;
  bundleRefundNote: string;
  unlockStartingCheckout: string;
  unlockSecureCheckout: string;
  unlockMoneyBack: string;
  unlockOpenProfile: string;
  unlockFoundersListed: string;
  unlockFoundersEmail: string;
  unlockJoining: string;
  unlockJoinFounders: string;
  unlockGetNotified: string;
  bundleShopPaidCoach: string;
  bundleShopPaidRecipes: string;
  bundleShopPaidMove: string;
  bundleShopPaidMind: string;
  bundleShopPaidLearn: string;
  bundleShopFreeEyebrow: string;
  bundleShopFreeTitle: string;
  bundleShopFreeBody: string;
  bundleShopFreeCta: string;
  bundleShopPaidEyebrow: string;
  bundleShopPaidLead: string;
  bundleShopVsStack: string;
  bundleShopPerYear: string;
  bundleShopSecondaryPrices: string;
  bundleShopPlanChooser: string;
  bundleShopPaidLogger: string;
  bundleShopAlreadyIncluded: string;
  bundleShopAlreadyIncludedBody: string;
  bundleShopOpenCoach: string;
  bundleShopSubscribe: string;
  bundleShopGetNotified: string;
  bundleShopCheckoutSoon: string;
};

const en: BundleStrings = {
  bundleBadge: 'Super Bundle',
  bundleHeadline: 'Mission Coach + depth. One honest price.',
  bundleSubhead:
    'Adaptive weekly plans from your workout logs — then Fuel, Move, Mind, Track, and Learn depth when you want it. Free logger stays free forever.',
  bundleUrgencyBadge: 'Founders pricing — locked in at launch',
  bundleTab3mo: 'Monthly',
  bundleTabMonthly: 'Monthly',
  bundleTab12mo: '12 months',
  bundleTabLifetime: 'Lifetime',
  bundleBadgePopular: 'Founders',
  bundleBadgeBestValue: 'Best value',
  bundleBadgeLimited: 'Limited offer',
  bundleSavePercent: 'Save {{percent}}%',
  bundlePerMonth: '${{price}}/mo',
  bundleBilledTotal: '${{price}} billed once',
  bundleBilledMonthly: '${{price}} billed monthly',
  bundleBilledOnce: '${{price}} one-time',
  bundleHeroTitle: 'Super Bundle',
  bundleHeroSubtitle: 'Coach + pillar depth in one install — vs juggling partner apps',
  bundleUnlockCta: 'Unlock Super Bundle',
  bundleOneAppTitle: 'One app — not seven',
  bundleOneAppDesc:
    'Freeletics Super Bundle spans multiple apps. Mission Winning keeps Train, Fuel, Move, Mind, Track, and Learn in one PWA with one Mission Score.',
  bundleWinScoreNote: 'Today Mission Score ties every pillar together.',
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
    'Stripe checkout activates when NEXT_PUBLIC_STRIPE_LINK_BUNDLE is set in production.',
  bundlePillarTrain: 'Train',
  bundlePillarFuel: 'Fuel',
  bundlePillarMove: 'Move',
  bundlePillarMind: 'Mind',
  bundlePillarTrack: 'Track',
  bundlePillarLearn: 'Learn',
  bundlePillarTrainFree: 'Full logger, builder, library, benchmarks',
  bundlePillarTrainPremium: 'Log-cited why-this-week + adapt — not a chatbot',
  bundlePillarFuelFree: 'Macro log, water, {{count}} free recipes',
  bundlePillarFuelPremium: '{{count}} protein-first recipes — Fuel Coach week from your logs',
  bundlePillarMoveFree: `${CONTENT_FLOORS.moveFree} guided mobility flows + timer`,
  bundlePillarMovePremium: `${CONTENT_FLOORS.movePremium} timed recovery flows — press play, follow cues`,
  bundlePillarMindFree: 'Breathing timer + guided sessions',
  bundlePillarMindPremium: '{{count}} timed sessions — pause/skip; training questions, not a meditation library',
  bundlePillarTrackFree: 'Manual activity log + weekly stats',
  bundlePillarTrackPremium: 'GPS routes, live pace chart, weekly GPS stats',
  bundlePillarLearnFree: '10 education paths + 6-chapter guidebook',
  bundlePillarLearnPremium: '4 specialist courses with chapter progress',
  bundleVsSeparate: 'Save {{percent}}% vs buying pillars separately',
  bundleRowTotal: 'Super Bundle (all pillars)',
  bundleCheckoutSuccess: 'You are in — Super Bundle is active.',
  bundleEyebrow: 'Super Bundle',
  bundleHonestNote:
    'The free logger stays free. Super Bundle unlocks Mission Coach depth and the other pillars — it never gates logging a set.',
  bundleCheckoutStillProcessing: 'Checkout is still processing. This usually finishes in a few seconds.',
  bundleCheckoutRetry: 'Check again',
  bundleCheckoutUnlocking: 'Unlocking your bundle…',
  bundleStoryEyebrow: 'One path',
  bundleStoryTitle: 'Mission Coach depth. Same free logger.',
  bundleStoryBody:
    'Weekly plans adapt from your logs alone. Super Bundle adds Coach depth and pillar tools when you want them — without a second app.',
  bundleStoryProof: 'Founders pricing locks in at launch.',
  bundleStoryCompare: 'See comparisons',
  bundleProofNearCta: 'Cancel anytime on monthly. Lifetime is a one-time buy.',
  bundlePayMethods: 'Card · Apple Pay · Google Pay · USDC',
  bundleUsdcNote: 'Base USDC is a payment rail — not the product.',
  bundleUnlockLifetimeCta: 'Unlock lifetime Super Bundle',
  bundleRefundNote: 'Questions on access? Contact support from Profile.',
  unlockStartingCheckout: 'Starting checkout…',
  unlockSecureCheckout: 'Secure checkout by Stripe · Card · Apple Pay · Google Pay · PayPal · USDC',
  unlockMoneyBack: '14-day money-back on first paid charge',
  unlockOpenProfile: 'Open Profile',
  unlockFoundersListed: "You're on the founders list.",
  unlockFoundersEmail: "We'll email {{email}} when checkout opens.",
  unlockJoining: 'Joining…',
  unlockJoinFounders: 'Join founders list',
  unlockGetNotified: 'Get notified',
  bundleShopPaidCoach: 'Mission Coach weekly plans from your logs',
  bundleShopPaidRecipes: '{{count}} premium recipes',
  bundleShopPaidMove: '{{count}} premium Move flows',
  bundleShopPaidMind: '{{count}} premium Mind sessions',
  bundleShopPaidLearn: '{{count}} premium Learn sections',
  bundleShopFreeEyebrow: 'Always yours',
  bundleShopFreeTitle: 'Free forever',
  bundleShopFreeBody:
    'Logger and free floors. No account. No card. Super Bundle is optional depth — never required to log a set.',
  bundleShopFreeCta: 'Start training',
  bundleShopPaidEyebrow: 'One Super Bundle',
  bundleShopPaidLead: 'Coach depth plus pillar catalogs in one install — not four apps.',
  bundleShopVsStack: 'One Super Bundle vs {{stack}}.',
  bundleShopPerYear: '/year founders',
  bundleShopSecondaryPrices: '${{monthly}}/mo · ${{lifetime}} lifetime',
  bundleShopPlanChooser: 'Super Bundle plan',
  bundleShopPaidLogger: 'Logger stays free. Never gated.',
  bundleShopAlreadyIncluded: 'Already included',
  bundleShopAlreadyIncludedBody: 'Super Bundle depth is on this account.',
  bundleShopOpenCoach: 'Open Coach',
  bundleShopSubscribe: 'Subscribe Now',
  bundleShopGetNotified: 'Get notified',
  bundleShopCheckoutSoon: 'Checkout opens when payments go live.',
};

const es: BundleStrings = {
  ...en,
  bundleHeadline: 'Seis pilares. Una app. Un precio.',
  bundleSubhead:
    'Mission Winning reemplaza un montón de apps de fitness con una PWA — Entrenar, Nutrición, Movimiento, Mente, Seguimiento, Aprender y tu Mission Score unificado en Hoy.',
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
    'Freeletics vende apps separadas. Mission Winning mantiene Entrenar, Nutrición, Movimiento, Mente, Seguimiento y Aprender en una sola instalación con un Mission Score.',
  bundleWinScoreNote: 'El Mission Score en Hoy une todos los pilares.',
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
    'Mission Winning 用一个 PWA 取代一堆健身应用 — 训练、营养、活动、心理、追踪、学习，以及 Today 统一的 Mission Score。',
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
    'Freeletics 卖多个独立应用。Mission Winning 把训练、营养、活动、心理、追踪、学习放在一个安装里，共用一个 Mission Score。',
  bundleWinScoreNote: 'Today 的 Mission Score 串联所有支柱。',
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
    'Mission Winning menggantikan banyak app fitness dengan satu PWA — Train, Fuel, Move, Mind, Track, Learn, plus Mission Score terpadu di Today.',
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
    'Mission Winning แทนที่แอปฟิตเนสหลายตัวด้วย PWA เดียว — Train, Fuel, Move, Mind, Track, Learn และ Mission Score รวมบน Today',
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
    'Mission Winning يستبدل مجموعة تطبيقات اللياقة بتطبيق PWA واحد — Train وFuel وMove وMind وTrack وLearn مع Mission Score موحد في Today.',
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
    'Freeletics تبيع تطبيقات منفصلة. Mission Winning يجمع Train وFuel وMove وMind وTrack وLearn في تثبيت واحد مع Mission Score واحد.',
  bundleWinScoreNote: 'Mission Score في Today يربط كل الأركان.',
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

const pt: BundleStrings = {
  ...en,
  bundleHeadline: 'Super Bundle — seis pilares, uma assinatura',
  bundleSubhead: 'Profundidade premium quando quiser. O núcleo grátis permanece grátis para sempre.',
  bundleTabMonthly: 'Mensal',
  bundleTab12mo: '12 meses',
  bundleTabLifetime: 'Vitalício',
  bundleUnlockCta: 'Desbloquear Super Bundle',
  bundleFreeForeverTitle: 'Grátis para sempre',
  bundleFreeForeverBody:
    'Cada pilar tem um nível grátis. O Bundle aprofunda Coach e conteúdo premium — nunca é obrigatório para registrar treinos.',
};

const de: BundleStrings = {
  ...en,
  bundleHeadline: 'Super Bundle — sechs Säulen, ein Abo',
  bundleSubhead: 'Premium-Tiefe wenn du willst. Der Free-Core bleibt für immer gratis.',
  bundleTabMonthly: 'Monatlich',
  bundleTab12mo: '12 Monate',
  bundleTabLifetime: 'Lifetime',
  bundleUnlockCta: 'Super Bundle freischalten',
  bundleFreeForeverTitle: 'Für immer gratis',
};


/** Batch C — LLM-drafted; founder review before public flip. */
const it: BundleStrings = {
  ...en,
  bundleHeadline: 'Mission Coach + profondità. Un prezzo onesto.',
  bundleSubhead:
    'Piani settimanali adattivi dai log di allenamento — poi Fuel, Move, Mind, Track e Learn quando vuoi. Logger gratis per sempre.',
  bundleUrgencyBadge: 'Prezzo founders — bloccato al lancio',
  bundleTabMonthly: 'Mensile',
  bundleTab12mo: '12 mesi',
  bundleTabLifetime: 'A vita',
  bundleBadgePopular: 'Founders',
  bundleBadgeBestValue: 'Miglior valore',
  bundleBadgeLimited: 'Offerta limitata',
  bundleSavePercent: 'Risparmia {{percent}}%',
  bundlePerMonth: '${{price}}/mese',
  bundleBilledTotal: '${{price}} fatturato una volta',
  bundleBilledMonthly: '${{price}} fatturato mensilmente',
  bundleBilledOnce: '${{price}} una tantum',
  bundleHeroSubtitle: 'Coach + profondità dei pilastri in un’installazione — vs gestire app separate',
  bundleUnlockCta: 'Sblocca Super Bundle',
  bundleOneAppTitle: 'Una app — non sette',
  bundleOneAppDesc:
    'Altri vendono app separate. Mission Winning tiene Train, Fuel, Move, Mind, Track e Learn in una PWA con un Mission Score.',
  bundleWinScoreNote: 'Il Mission Score in Today unisce tutti i pilastri.',
  bundleCompareTitle: 'Confronta singolo vs bundle',
  bundleColPillar: 'Pilastro',
  bundleColPremium: 'Livello premium',
  bundleColMonthly: 'Mensile',
  bundleColIncluded: 'Nel bundle',
  bundleCompareFoot:
    'I prezzi singoli sono indicativi — il bundle costa meno che abbonarsi separatamente.',
  bundleFreeForeverTitle: 'Gratis per sempre',
  bundleFreeForeverBody:
    'Ogni pilastro include un livello gratuito: allenamenti, ricette, mobilità, respirazione, log attività e percorsi di apprendimento. Premium sblocca programmi avanzati, biblioteca completa e priorità sync.',
  bundlePillarTrainFree: 'Logger completo, builder, biblioteca, benchmark',
  bundlePillarTrainPremium: 'Why di questa settimana dai log + adapt — non una chatbot',
  bundlePillarFuelFree: 'Log macro, acqua, {{count}} ricette gratis',
  bundlePillarFuelPremium: '{{count}} ricette protein-first — settimana Fuel Coach dai log',
  bundlePillarMoveFree: `${CONTENT_FLOORS.moveFree} flow di mobilità guidati + timer`,
  bundlePillarMovePremium: `${CONTENT_FLOORS.movePremium} flow di recupero a tempo — premi play, segui i cue`,
  bundlePillarMindFree: 'Timer respirazione + sessioni guidate',
  bundlePillarMindPremium: '{{count}} sessioni a tempo — pausa/salto; domande di allenamento, non una biblioteca di meditazione',
  bundlePillarTrackFree: 'Log attività manuale + statistiche settimanali',
  bundlePillarTrackPremium: 'Percorsi GPS, grafico ritmo live, statistiche GPS settimanali',
  bundlePillarLearnFree: '10 percorsi formativi + guidebook 6 capitoli',
  bundlePillarLearnPremium: '4 corsi specialistici con progresso per capitolo',
  bundleVsSeparate: 'Risparmia {{percent}}% vs acquistare i pilastri separatamente',
  bundleRowTotal: 'Super Bundle (tutti i pilastri)',
};

const ru: BundleStrings = {
  ...en,
  bundleHeadline: 'Mission Coach + глубина. Честная цена.',
  bundleSubhead:
    'Адаптивные недельные планы из логов тренировок — затем Fuel, Move, Mind, Track и Learn, когда нужно. Бесплатный логгер навсегда бесплатен.',
  bundleUrgencyBadge: 'Цена founders — зафиксирована при запуске',
  bundleTabMonthly: 'Ежемесячно',
  bundleTab12mo: '12 месяцев',
  bundleTabLifetime: 'Навсегда',
  bundleBadgePopular: 'Founders',
  bundleBadgeBestValue: 'Лучшая цена',
  bundleBadgeLimited: 'Ограниченное предложение',
  bundleSavePercent: 'Экономия {{percent}}%',
  bundlePerMonth: '${{price}}/мес',
  bundleBilledTotal: '${{price}} единоразово',
  bundleBilledMonthly: '${{price}} ежемесячно',
  bundleBilledOnce: '${{price}} разово',
  bundleHeroSubtitle: 'Coach + глубина столпов в одной установке — vs куча отдельных приложений',
  bundleUnlockCta: 'Открыть Super Bundle',
  bundleOneAppTitle: 'Одно приложение — не семь',
  bundleOneAppDesc:
    'Другие продают отдельные приложения. Mission Winning держит Train, Fuel, Move, Mind, Track и Learn в одной PWA с одним Mission Score.',
  bundleWinScoreNote: 'Mission Score в Today связывает все столпы.',
  bundleCompareTitle: 'Сравнить отдельно vs bundle',
  bundleColPillar: 'Столп',
  bundleColPremium: 'Премиум-уровень',
  bundleColMonthly: 'В месяц',
  bundleColIncluded: 'В bundle',
  bundleCompareFoot:
    'Отдельные цены ориентировочны — bundle дешевле, чем подписки по отдельности.',
  bundleFreeForeverTitle: 'Бесплатно навсегда',
  bundleFreeForeverBody:
    'Каждый столп включает бесплатный уровень: тренировки, рецепты, мобильность, дыхание, лог активности и учебные пути. Premium открывает продвинутые программы, полную библиотеку и приоритет синхронизации.',
  bundlePillarTrainFree: 'Полный логгер, конструктор, библиотека, бенчмарки',
  bundlePillarTrainPremium: 'Why этой недели из логов + adapt — не чатбот',
  bundlePillarFuelFree: 'Лог макросов, вода, {{count}} бесплатных рецептов',
  bundlePillarFuelPremium: '{{count}} protein-first рецептов — неделя Fuel Coach из логов',
  bundlePillarMoveFree: `${CONTENT_FLOORS.moveFree} guided mobility flows + таймер`,
  bundlePillarMovePremium: `${CONTENT_FLOORS.movePremium} timed recovery flows — play, следуй подсказкам`,
  bundlePillarMindFree: 'Таймер дыхания + guided sessions',
  bundlePillarMindPremium: '{{count}} timed sessions — пауза/пропуск; вопросы тренировки, не библиотека медитации',
  bundlePillarTrackFree: 'Ручной лог активности + недельная статистика',
  bundlePillarTrackPremium: 'GPS-маршруты, график темпа live, недельная GPS-статистика',
  bundlePillarLearnFree: '10 образовательных путей + guidebook из 6 глав',
  bundlePillarLearnPremium: '4 специализированных курса с прогрессом по главам',
  bundleVsSeparate: 'Экономия {{percent}}% vs покупка столпов отдельно',
  bundleRowTotal: 'Super Bundle (все столпы)',
};

const ko: BundleStrings = {
  ...en,
  bundleHeadline: 'Mission Coach + 깊이. 정직한 가격.',
  bundleSubhead:
    '운동 로그에서 적응하는 주간 플랜 — 원할 때 Fuel, Move, Mind, Track, Learn 깊이. 무료 로거는 영원히 무료.',
  bundleUrgencyBadge: 'Founders 가격 — 출시 시 고정',
  bundleTabMonthly: '월간',
  bundleTab12mo: '12개월',
  bundleTabLifetime: '평생',
  bundleBadgePopular: 'Founders',
  bundleBadgeBestValue: '최고 가치',
  bundleBadgeLimited: '한정 혜택',
  bundleSavePercent: '{{percent}}% 절약',
  bundlePerMonth: '${{price}}/월',
  bundleBilledTotal: '${{price}} 일시 결제',
  bundleBilledMonthly: '${{price}} 월간 결제',
  bundleBilledOnce: '${{price}} 일회',
  bundleHeroSubtitle: '하나의 설치에 코치 + 기둥 깊이 — 여러 앱을 오가지 않아도 됨',
  bundleUnlockCta: 'Super Bundle 잠금 해제',
  bundleOneAppTitle: '하나의 앱 — 일곱 개가 아님',
  bundleOneAppDesc:
    '다른 서비스는 앱을 나눕니다. Mission Winning은 Train, Fuel, Move, Mind, Track, Learn을 하나의 PWA와 Mission Score로 유지합니다.',
  bundleWinScoreNote: 'Today의 Mission Score가 모든 기둥을 연결합니다.',
  bundleCompareTitle: '개별 vs 번들 비교',
  bundleColPillar: '기둥',
  bundleColPremium: '프리미엄 등급',
  bundleColMonthly: '월간',
  bundleColIncluded: '번들 포함',
  bundleCompareFoot:
    '개별 가격은 참고용 — 번들이 각각 구독하는 것보다 저렴합니다.',
  bundleFreeForeverTitle: '영원히 무료',
  bundleFreeForeverBody:
    '모든 기둥에 무료 등급 포함: 운동, 레시피, 모빌리티, 호흡, 활동 로그, 학습 경로. 프리미엄은 고급 프로그램, 전체 라이브러리, 동기화 우선권을 엽니다.',
  bundlePillarTrainFree: '전체 로거, 빌더, 라이브러리, 벤치마크',
  bundlePillarTrainPremium: '로그가 인용한 이번 주 why + adapt — 챗봇 아님',
  bundlePillarFuelFree: '매크로 로그, 수분, 무료 레시피 {{count}}개',
  bundlePillarFuelPremium: '{{count}} protein-first 레시피 — 로그 기반 Fuel Coach 주간',
  bundlePillarMoveFree: `가이드 모빌리티 플로우 ${CONTENT_FLOORS.moveFree}개 + 타이머`,
  bundlePillarMovePremium: `타이머 회복 플로우 ${CONTENT_FLOORS.movePremium}개 — 재생하고 큐를 따르세요`,
  bundlePillarMindFree: '호흡 타이머 + 가이드 세션',
  bundlePillarMindPremium: '{{count}} 타이머 세션 — 일시정지/건너뛰기; 훈련 질문, 명상 라이브러리 아님',
  bundlePillarTrackFree: '수동 활동 로그 + 주간 통계',
  bundlePillarTrackPremium: 'GPS 경로, 실시간 페이스 차트, 주간 GPS 통계',
  bundlePillarLearnFree: '교육 경로 10개 + 6장 가이드북',
  bundlePillarLearnPremium: '전문 코스 4개, 챕터별 진행',
  bundleVsSeparate: '기둥을 따로 사면 {{percent}}% 절약',
  bundleRowTotal: 'Super Bundle (모든 기둥)',
};

const ja: BundleStrings = {
  ...en,
  bundleHeadline: 'Mission Coach + 深さ。正直な価格。',
  bundleSubhead:
    'ワークアウトログから適応する週間プラン — 必要なときにFuel、Move、Mind、Track、Learnの深さ。無料ロガーは永久無料。',
  bundleUrgencyBadge: 'Founders価格 — ローンチ時に固定',
  bundleTabMonthly: '月額',
  bundleTab12mo: '12か月',
  bundleTabLifetime: '生涯',
  bundleBadgePopular: 'Founders',
  bundleBadgeBestValue: '最もお得',
  bundleBadgeLimited: '期間限定',
  bundleSavePercent: '{{percent}}%お得',
  bundlePerMonth: '${{price}}/月',
  bundleBilledTotal: '${{price}}一括請求',
  bundleBilledMonthly: '${{price}}月額請求',
  bundleBilledOnce: '${{price}}買い切り',
  bundleHeroSubtitle: 'ひとつのインストールにコーチ + 柱の深さ — 複数アプリを行き来しない',
  bundleUnlockCta: 'Super Bundle を解除',
  bundleOneAppTitle: 'ひとつのアプリ — 7つではない',
  bundleOneAppDesc:
    '他社はアプリを分けて売ります。Mission WinningはTrain、Fuel、Move、Mind、Track、LearnをひとつのPWAとMission Scoreにまとめます。',
  bundleWinScoreNote: 'TodayのMission Scoreがすべての柱をつなぎます。',
  bundleCompareTitle: '単体 vs バンドル比較',
  bundleColPillar: '柱',
  bundleColPremium: 'プレミアム層',
  bundleColMonthly: '月額',
  bundleColIncluded: 'バンドルに含む',
  bundleCompareFoot:
    '単体価格は参考 — バンドルは個別購読より安くなります。',
  bundleFreeForeverTitle: '永久無料',
  bundleFreeForeverBody:
    '各柱に無料層あり：ワークアウト、レシピ、モビリティ、呼吸、活動ログ、学習パス。プレミアムで上級プログラム、全ライブラリ、同期優先を解放。',
  bundlePillarTrainFree: 'フルロガー、ビルダー、ライブラリ、ベンチマーク',
  bundlePillarTrainPremium: 'ログに基づく今週のwhy + adapt — チャットボットではない',
  bundlePillarFuelFree: 'マクロログ、水分、無料レシピ{{count}}件',
  bundlePillarFuelPremium: '{{count}}件のprotein-firstレシピ — ログからのFuel Coach週',
  bundlePillarMoveFree: `ガイド付きモビリティフロー${CONTENT_FLOORS.moveFree}本 + タイマー`,
  bundlePillarMovePremium: `タイムド回復フロー${CONTENT_FLOORS.movePremium}本 — 再生してキューに従う`,
  bundlePillarMindFree: '呼吸タイマー + ガイドセッション',
  bundlePillarMindPremium: '{{count}}本のタイマーセッション — 一時停止/スキップ；トレーニングの問い、瞑想ライブラリではない',
  bundlePillarTrackFree: '手動活動ログ + 週間統計',
  bundlePillarTrackPremium: 'GPSルート、ライブペースチャート、週間GPS統計',
  bundlePillarLearnFree: '教育パス10本 + 6章ガイドブック',
  bundlePillarLearnPremium: '専門コース4本、章ごとの進捗',
  bundleVsSeparate: '柱を個別購入より{{percent}}%お得',
  bundleRowTotal: 'Super Bundle（全柱）',
};

/** Batch D — LLM-drafted; founder review before public flip. */
const hi: BundleStrings = {
  ...en,
  bundleHeadline: 'Super Bundle — छह स्तंभ, एक सदस्यता',
  bundleSubhead: 'जब चाहें प्रीमियम गहराई। मुफ़्त कोर हमेशा मुफ़्त।',
  bundleTabMonthly: 'मासिक',
  bundleTab12mo: '12 महीने',
  bundleTabLifetime: 'आजीवन',
  bundleUnlockCta: 'Super Bundle अनलॉक करें',
  bundleFreeForeverTitle: 'हमेशा मुफ़्त',
};

const vi: BundleStrings = {
  ...en,
  bundleHeadline: 'Super Bundle — sáu trụ, một gói',
  bundleSubhead: 'Độ sâu premium khi bạn muốn. Lõi miễn phí mãi mãi.',
  bundleTabMonthly: 'Hàng tháng',
  bundleTab12mo: '12 tháng',
  bundleTabLifetime: 'Trọn đời',
  bundleUnlockCta: 'Mở Super Bundle',
  bundleFreeForeverTitle: 'Miễn phí mãi mãi',
};

const LOCALES: Partial<Record<string, BundleStrings>> = {
  en,
  es,
  zh,
  id,
  th,
  ar,
  pt,
  de,
  it,
  ru,
  ko,
  ja,
  hi,
  vi,
};

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
