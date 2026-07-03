/** Info, legal, and marketing-in-app page chrome — merged into i18n `common` namespace. */

type InfoStrings = {
  infoLastUpdated: string;
  infoAboutTitle: string;
  infoAboutSubtitle: string;
  infoTermsTitle: string;
  infoPrivacyTitle: string;
  infoVisionTitle: string;
  infoVisionSubtitle: string;
  infoBetaTitle: string;
  infoBetaSubtitle: string;
  infoFeedbackTitle: string;
  infoFeedbackSubtitle: string;
  infoFeedbackThankTitle: string;
  infoFeedbackThankSubtitle: string;
  infoFeedbackFormTitle: string;
  infoCoachingTitle: string;
  infoCoachingSubtitle: string;
  infoProgramsTitle: string;
  infoProgramsSubtitle: string;
  infoProgramsLegacy: string;
  infoSkipToday: string;
  infoBetaNeedTitle: string;
  infoTermsAgreement: string;
  infoTermsService: string;
  infoTermsEducational: string;
  infoTermsAccounts: string;
  infoTermsPremium: string;
  infoTermsLiability: string;
  infoTermsChanges: string;
  infoPrivacyOverview: string;
  infoPrivacyCollect: string;
  infoPrivacyUse: string;
  infoPrivacyThirdParties: string;
  infoPrivacyChoices: string;
  infoPrivacyNotMedical: string;
  infoAboutMission: string;
  infoAboutNational: string;
  infoAboutBusiness: string;
  infoAboutDisclaimers: string;
  infoAboutMore: string;
  infoAboutContact: string;
  infoVisionCorePromise: string;
  infoVisionSuperApp: string;
  infoVisionSuperBundle: string;
  infoProfileHelpTitle: string;
};

const en: InfoStrings = {
  infoLastUpdated: 'Last updated: June 2026',
  infoAboutTitle: 'About Mission Winning',
  infoAboutSubtitle:
    "The all-in-one global health and workout app — free core forever, premium depth when you're ready.",
  infoTermsTitle: 'Terms of Use',
  infoPrivacyTitle: 'Privacy Policy',
  infoVisionTitle: 'Mission Winning Vision',
  infoVisionSubtitle:
    'The guiding document for the free global everything app for health. Core mission free for all. Super Bundle for synergy.',
  infoBetaTitle: 'Start here',
  infoBetaSubtitle:
    'Mission Winning is in private development. You are among the first Mission Operators helping us validate the journey, Today hub, and rankings before public launch.',
  infoFeedbackTitle: 'Share your wins',
  infoFeedbackSubtitle:
    "Tell us what results you're seeing, what worked, and what to build next. Beta founders shape the roadmap.",
  infoFeedbackThankTitle: 'Thank you',
  infoFeedbackThankSubtitle:
    'Your feedback helps make the free core and Super Bundle better for the global mission.',
  infoFeedbackFormTitle: 'Beta founders feedback',
  infoCoachingTitle: 'A coach in your corner',
  infoCoachingSubtitle:
    "We're building a small 1:1 coaching program on top of the free core. Tell us about your goals — no commitment, no payment today.",
  infoProgramsTitle: 'Learn programs',
  infoProgramsSubtitle:
    'Premium practical education as part of the Super Bundle. Free core tools and intros for everyone worldwide.',
  infoProgramsLegacy:
    'Legacy catalog — the Learn pillar has moved to /learn. See Super Bundle for full access.',
  infoSkipToday: 'Skip to Today',
  infoBetaNeedTitle: 'What we need from you',
  infoTermsAgreement: 'Agreement',
  infoTermsService: 'Service',
  infoTermsEducational: 'Educational only — not medical advice',
  infoTermsAccounts: 'Accounts & acceptable use',
  infoTermsPremium: 'Premium & refunds',
  infoTermsLiability: 'Limitation of liability',
  infoTermsChanges: 'Changes',
  infoPrivacyOverview: 'Overview',
  infoPrivacyCollect: 'What we collect',
  infoPrivacyUse: 'How we use data',
  infoPrivacyThirdParties: 'Third parties',
  infoPrivacyChoices: 'Your choices',
  infoPrivacyNotMedical: 'Not medical advice',
  infoAboutMission: 'Our mission',
  infoAboutNational: 'National fitness (U.S.)',
  infoAboutBusiness: 'Business structure',
  infoAboutDisclaimers: 'Important disclaimers',
  infoAboutMore: 'More',
  infoAboutContact: 'Contact',
  infoVisionCorePromise: 'Core promise: free forever for the mission',
  infoVisionSuperApp: 'The super app structure',
  infoVisionSuperBundle: 'Super Bundle',
  infoProfileHelpTitle: 'Help & legal',
};

const es: InfoStrings = {
  ...en,
  infoAboutTitle: 'Acerca de Mission Winning',
  infoTermsTitle: 'Términos de uso',
  infoPrivacyTitle: 'Política de privacidad',
  infoVisionTitle: 'Visión de Mission Winning',
  infoBetaTitle: 'Empieza aquí',
  infoFeedbackTitle: 'Comparte tus logros',
  infoCoachingTitle: 'Un coach a tu lado',
  infoProgramsTitle: 'Programas Learn',
  infoProfileHelpTitle: 'Ayuda y legal',
  infoTermsAgreement: 'Acuerdo',
  infoPrivacyOverview: 'Resumen',
  infoAboutMission: 'Nuestra misión',
};

const zh: InfoStrings = {
  ...en,
  infoAboutTitle: '关于 Mission Winning',
  infoTermsTitle: '使用条款',
  infoPrivacyTitle: '隐私政策',
  infoBetaTitle: '从这里开始',
  infoFeedbackTitle: '分享你的成果',
  infoProfileHelpTitle: '帮助与法律',
};

const id: InfoStrings = { ...en, infoAboutTitle: 'Tentang Mission Winning' };
const th: InfoStrings = { ...en, infoAboutTitle: 'เกี่ยวกับ Mission Winning' };
const ar: InfoStrings = { ...en, infoAboutTitle: 'حول Mission Winning' };

const LOCALES: Partial<Record<string, InfoStrings>> = { en, es, zh, id, th, ar };

export function infoStringsFor(lang: string): InfoStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeInfoStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, infoStringsFor(lang));
}
