/** Landing + marketing shell copy — merged into i18n `common` and exported as landing.json */

import { tier1LandingNative } from './tier1LandingNative';
import { tier1LandingNativeSupplement } from './tier1LandingNativeSupplement';

export const LANDING_PILLAR_IDS = ['train', 'fuel', 'move', 'mind', 'track', 'learn'] as const;

export type LandingPillarId = (typeof LANDING_PILLAR_IDS)[number];

const en: Record<string, string> = {
  landingNavFreeCore: 'Free core',
  landingNavPillars: 'Pillars',
  landingNavBundle: 'Super Bundle',
  landingNavFaq: 'FAQ',
  landingNavHome: 'Home',
  landingStartFree: 'Start free',
  landingStartFreeLong: 'Start free — 2 min setup',
  landingExploreBundle: 'Explore Super Bundle',
  landingMenu: 'Menu',
  landingInstallPwa: 'Install PWA (offline)',
  landingHeroBadge: 'Free core forever · Global PWA · Works offline',
  landingHeroBadgeFounders: 'Founders pricing · Limited beta access',
  landingHeroHeadline: 'One app. Six pillars.',
  landingHeroHeadlineFounders: 'Mission Winning.',
  landingHeroGradient: 'Your path forward.',
  landingHeroGradientFounders: 'Train smarter. Recover better.',
  landingHeroSubtitle:
    'Free workout tracking, nutrition, mobility, mind, activity, and education — forever, everywhere. Readiness, strain, and recovery on Today. Super Bundle adds AI Coach and premium depth when you are ready.',
  landingHeroSubtitleFounders:
    'The everything app for serious lifters — free core forever, premium Super Bundle for full synergy across Train, Fuel, Move, Mind, Track, and Learn.',
  landingTrust1: '✓ Free core forever',
  landingTrust2: '✓ 14 languages in-app',
  landingTrust3: '✓ Offline PWA',
  landingTrust4: '✓ Rural & bodyweight ready',
  landingProblemKicker: 'The system problem',
  landingProblemTitle: 'Five apps. Zero synergy.',
  landingProblemLead:
    'You log workouts in one place, protein in another, and mobility never happens — because nothing connects. Mission Winning unifies Train, Fuel, Move, Mind, Track, and Learn with one Win Score on Today.',
  landingProblemP1:
    'Most fitness tools gate the logger or drown you in ads. They treat training, nutrition, and recovery as separate products — so you train hard but never see the full picture.',
  landingProblemP2:
    'Our promise: the core mission stays free forever — workout tracking, basics in every pillar, offline PWA, global access.',
  landingProblemP3:
    'Premium Super Bundle funds that mission: AI Coach, premium sessions, specialist Learn paths, and deeper Fuel/Move/Track — when you want the full synergistic path.',
  landingProblemHighlight: 'Evidence-based. Accessible everywhere. The right way — not another fad app.',
  landingToolsKicker: 'Free forever',
  landingToolsTitle: 'Start with real tools — not a trial trap',
  landingToolsSubtitle: 'Log your first workout in minutes. No credit card. Core tracking never paywalled.',
  landingTool1Title: 'Free workout logger',
  landingTool1Desc: '5×5, custom builder, WOD-style sessions, history, and PRs. Metric or imperial. Offline PWA.',
  landingTool2Title: 'Mission Score on Today',
  landingTool2Desc: 'Readiness, strain, recovery rings plus cross-pillar Win Score — Bevel-inspired, strength-focused.',
  landingTool3Title: 'Six pillars, one path',
  landingTool3Desc: 'Train, Fuel, Move, Mind, Track, Learn — free entry everywhere. Super Bundle for full depth.',
  landingToolsCta: 'Start free — log your first workout',
  landingToolsFoot: '5×5 · Custom builder · History · PRs · PWA install · Works offline',
  landingPillarsKicker: 'Six pillars',
  landingPillarsTitle: 'One app. Holistic synergy.',
  landingPillarsSubtitle:
    'Free entry in every pillar. Super Bundle unlocks premium depth across all six — modeled on proven holistic bundle models.',
  landingPillarPrice: 'Free core',
  landingEarlyUsers: 'Early users',
  landingEarlyUser1:
    'The free tracker got me consistent. Cross-pillar coach on Today actually tells me what to do next.',
  landingEarlyUser2: 'Free core for my family. Offline PWA works where signal does not.',
  landingBundleKicker: 'Super Bundle',
  landingBundleTitle: 'Replace your fitness app stack with one mission',
  landingBundleSubtitle:
    'Six pillars. One subscription. AI Coach, premium Mind/Move/Track/Learn, and deep Fuel — while core tracking stays free forever.',
  landingBundleCardTitle: 'Mission Winning Super Bundle',
  landingBundleCardDesc: 'Intro pricing for early members · Cancel anytime',
  landingBundleFeature1: 'Premium AI Coach + plan generator',
  landingBundleFeature2: '6 Mind · 5 Move · 5 Track · 6 Learn premium',
  landingBundleFeature3: '92+ premium recipes & pro programs',
  landingBundleFeature4: 'Cross-pillar Win Score on Today',
  landingBundleCta: 'View pricing & unlock',
  landingBundleStartFree: 'Start free first',
  landingBundleFoot: 'Paying for premium funds the free mission for everyone, everywhere.',
  landingFaqTitle: 'Common questions',
  landingFaqSubtitle: 'Free core forever. Premium funds the global mission.',
  landingFaq1Q: 'Is the core app really free forever?',
  landingFaq1A:
    'Yes. Workout logging, basic library, nutrition log, free mobility flows, mind breathing, activity log, and learn paths are never paywalled. Premium adds depth when you choose to upgrade.',
  landingFaq2Q: 'Does it work offline?',
  landingFaq2A:
    'Install the PWA for offline workout logging, cached plans, and offline coach on Today. Built for rural and low-connectivity users worldwide.',
  landingFaq3Q: 'What is the Super Bundle?',
  landingFaq3A:
    'One subscription unlocks premium across all six pillars — AI Coach, premium Mind/Move/Track/Learn programs, 92+ recipes, and pro templates. Core tools stay free if you cancel.',
  landingFaq4Q: 'Who is Mission Winning for?',
  landingFaq4A:
    'Anyone who wants evidence-based training with holistic synergy — home gym lifters, bodyweight athletes, coaches, and users in low-resource settings. The path is free to start.',
  landingFaq5Q: 'Is this medical advice?',
  landingFaq5A:
    'No. Mission Winning provides educational fitness tools. Consult qualified professionals before intense training.',
  landingCoachingKicker: '1-on-1 coaching',
  landingCoachingTitle: 'Human coaching when you want accountability',
  landingCoachingDesc:
    'Application-based elite coaching — programming, nutrition, and weekly reviews. Separate from the Super Bundle app subscription.',
  landingCoaching1Title: 'Monthly coaching',
  landingCoaching1Price: 'From $997/mo',
  landingCoaching1Desc: 'Full programming, nutrition, and weekly video reviews.',
  landingCoaching2Title: '90-day block',
  landingCoaching2Price: 'From $2,497',
  landingCoaching2Desc: 'Intensive transformation with assessments and premium app access.',
  landingCoaching3Title: 'Coach mentorship',
  landingCoaching3Price: 'Custom',
  landingCoaching3Desc: 'For trainers building a practice with Mission Winning systems.',
  landingCoachingCta: 'Apply for coaching',
  landingCloseTitle: 'Ready for your first win?',
  landingCloseSubtitle: 'Two minutes on Welcome. One workout logged. Your Mission Score starts on Today.',
  landingCloseCtaFree: 'Start free',
  landingSkipToContent: 'Skip to content',
  landingDisclaimer:
    'Disclaimer: Mission Winning provides educational fitness tools, not medical advice. Consult qualified professionals before intense training. Premium revenue supports free global access to core tools.',
  marketingTagline: 'Global health super-app',
  marketingTaglineBundle: 'Super Bundle',
  marketingFooterStart: 'Start free',
  marketingFooterBundle: 'Bundle',
  marketingFooterAbout: 'About',
  marketingFooterVision: 'Vision',
  marketingViewPricing: 'View Super Bundle pricing',
  landingMockupToday: 'Today',
  landingMockupMissionScore: 'Mission Score',
  landingMockupCoach: 'Cross-pillar coach suggests your next pillar',
  landingMockupPrimaryCta: 'Start workout',
  landingPillar_train_title: 'Train',
  landingPillar_train_subtitle: 'Free tracker + premium AI Coach',
  landingPillar_train_desc:
    'Workout logger, builder, 200+ library, benchmarks, and history. Premium unlocks AI plan generator and pro templates.',
  landingPillar_train_feat1: 'Free full logger & PR tracking',
  landingPillar_train_feat2: 'Premium: AI Coach + pro programs',
  landingPillar_train_feat3: 'Synergizes with every pillar',
  landingPillar_train_cta: 'Start free',
  landingPillar_fuel_title: 'Fuel',
  landingPillar_fuel_subtitle: 'Nutrition logging + recipes',
  landingPillar_fuel_desc:
    'Macro log, water, and global-friendly high-protein recipes. Premium adds meal plans and periodized nutrition.',
  landingPillar_fuel_feat1: 'Free recipes & daily tracker',
  landingPillar_fuel_feat2: 'Premium: 92+ gated recipes',
  landingPillar_fuel_feat3: 'Powers recovery and training',
  landingPillar_fuel_cta: 'Log nutrition',
  landingPillar_move_title: 'Move',
  landingPillar_move_subtitle: 'Mobility flows + prehab',
  landingPillar_move_desc:
    'Timed bodyweight mobility flows — free for everyone. Premium adds sports-specific prehab depth.',
  landingPillar_move_feat1: '4 free guided flows',
  landingPillar_move_feat2: 'Premium: +5 prehab flows',
  landingPillar_move_feat3: 'Protects joints under load',
  landingPillar_move_cta: 'Try a flow',
  landingPillar_mind_title: 'Mind',
  landingPillar_mind_subtitle: 'Breathing + recovery habits',
  landingPillar_mind_desc:
    'Breathing timer, guided sessions, and daily check-in. Premium unlocks full guided session library.',
  landingPillar_mind_feat1: 'Free breathing & check-in',
  landingPillar_mind_feat2: 'Premium: +6 guided sessions',
  landingPillar_mind_feat3: 'Boosts consistency',
  landingPillar_mind_cta: 'Open Mind',
  landingPillar_track_title: 'Track',
  landingPillar_track_subtitle: 'Activity log + weekly stats',
  landingPillar_track_desc:
    'Manual activity logging and streaks — no GPS required. Premium adds structured programs and pace insights.',
  landingPillar_track_feat1: 'Free activity log',
  landingPillar_track_feat2: 'Premium: 5 activity programs',
  landingPillar_track_feat3: 'Completes your training picture',
  landingPillar_track_cta: 'Log activity',
  landingPillar_learn_title: 'Learn',
  landingPillar_learn_subtitle: 'Evidence-based education',
  landingPillar_learn_desc:
    'Eight free ISSA-aligned education paths. Premium unlocks six specialist programs (PT, bodybuilding, corrective, and more).',
  landingPillar_learn_feat1: '8 free education paths',
  landingPillar_learn_feat2: 'Premium: 6 specialist programs',
  landingPillar_learn_feat3: 'The right way, for everyone',
  landingPillar_learn_cta: 'Start learning',
};

const fr: Record<string, string> = {
  ...en,
  landingNavFreeCore: 'Core gratuit',
  landingNavPillars: 'Piliers',
  landingNavBundle: 'Super Bundle',
  landingNavFaq: 'FAQ',
  landingNavHome: 'Accueil',
  landingStartFree: 'Commencer gratuit',
  landingStartFreeLong: 'Commencer — 2 min',
  landingExploreBundle: 'Voir Super Bundle',
  landingHeroBadge: 'Core gratuit pour toujours · PWA mondial · Offline',
  landingHeroHeadline: 'Une app. Six piliers.',
  landingHeroGradient: 'Votre chemin.',
  landingHeroSubtitle:
    'Entraînement, nutrition, mobilité, esprit, activité et apprentissage — gratuits pour toujours. Préparation, charge et récupération sur Aujourd\'hui.',
  landingProblemTitle: 'Cinq apps. Zéro synergie.',
  landingToolsTitle: 'De vrais outils — pas un piège d\'essai',
  landingPillarsTitle: 'Une app. Synergie holistique.',
  landingBundleTitle: 'Remplacez votre stack fitness par une mission',
  landingFaqTitle: 'Questions fréquentes',
  landingCloseTitle: 'Prêt pour votre première victoire ?',
  marketingTagline: 'Super-app santé mondiale',
};

const de: Record<string, string> = {
  ...en,
  landingNavFreeCore: 'Kostenloser Kern',
  landingNavPillars: 'Säulen',
  landingStartFree: 'Kostenlos starten',
  landingStartFreeLong: 'Kostenlos — 2 Min. Setup',
  landingExploreBundle: 'Super Bundle entdecken',
  landingHeroBadge: 'Kern für immer gratis · Globales PWA · Offline',
  landingHeroHeadline: 'Eine App. Sechs Säulen.',
  landingHeroGradient: 'Dein Weg nach vorn.',
  landingHeroSubtitle:
    'Training, Ernährung, Mobilität, Geist, Aktivität und Lernen — für immer kostenlos. Bereitschaft, Belastung und Erholung auf Heute.',
  landingProblemTitle: 'Fünf Apps. Null Synergie.',
  landingToolsTitle: 'Echte Tools — keine Trial-Falle',
  landingPillarsTitle: 'Eine App. Ganzheitliche Synergie.',
  landingBundleTitle: 'Ersetze deinen Fitness-App-Stack durch eine Mission',
  landingFaqTitle: 'Häufige Fragen',
  landingCloseTitle: 'Bereit für deinen ersten Sieg?',
  marketingTagline: 'Globale Gesundheits-Super-App',
};

const pt: Record<string, string> = {
  ...en,
  landingNavFreeCore: 'Core grátis',
  landingNavPillars: 'Pilares',
  landingStartFree: 'Começar grátis',
  landingStartFreeLong: 'Começar grátis — 2 min',
  landingExploreBundle: 'Ver Super Bundle',
  landingHeroHeadline: 'Um app. Seis pilares.',
  landingHeroGradient: 'Seu caminho.',
  landingHeroSubtitle:
    'Treino, nutrição, mobilidade, mente, atividade e aprendizado — grátis para sempre. Prontidão, carga e recuperação no Hoje.',
  landingProblemTitle: 'Cinco apps. Zero sinergia.',
  landingToolsTitle: 'Ferramentas reais — sem armadilha de trial',
  landingPillarsTitle: 'Um app. Sinergia holística.',
  landingBundleTitle: 'Substitua seu stack fitness por uma missão',
  landingFaqTitle: 'Perguntas frequentes',
  landingCloseTitle: 'Pronto para sua primeira vitória?',
  marketingTagline: 'Super-app de saúde global',
};

const es: Record<string, string> = {
  ...en,
  landingNavFreeCore: 'Core gratis',
  landingNavPillars: 'Pilares',
  landingStartFree: 'Empezar gratis',
  landingStartFreeLong: 'Empezar gratis — 2 min',
  landingExploreBundle: 'Ver Super Bundle',
  landingHeroHeadline: 'Una app. Seis pilares.',
  landingHeroGradient: 'Tu camino.',
  landingHeroSubtitle:
    'Entrenamiento, nutrición, movilidad, mente, actividad y aprendizaje — gratis para siempre. Preparación, carga y recuperación en Hoy.',
  landingProblemTitle: 'Cinco apps. Cero sinergia.',
  landingToolsTitle: 'Herramientas reales — sin trampa de prueba',
  landingPillarsTitle: 'Una app. Sinergia holística.',
  landingBundleTitle: 'Reemplaza tu stack fitness por una misión',
  landingFaqTitle: 'Preguntas frecuentes',
  landingCloseTitle: '¿Listo para tu primera victoria?',
  marketingTagline: 'Super-app de salud global',
};

const LOCALES: Record<string, Record<string, string>> = { en, es, fr, de, pt };

export function landingStringsFor(lang: string): Record<string, string> {
  const code = lang.split('-')[0];
  const base = LOCALES[code] ?? en;
  const native = tier1LandingNative[code as keyof typeof tier1LandingNative];
  const supplement = tier1LandingNativeSupplement[code as keyof typeof tier1LandingNativeSupplement];
  if (native || supplement) {
    return { ...base, ...native, ...supplement };
  }
  return base;
}

export function mergeLandingStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, landingStringsFor(lang));
}

export function landingKeyCount(): number {
  return Object.keys(en).length;
}
