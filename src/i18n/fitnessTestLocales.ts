/** Presidential Fitness Test + America track UI — merged into i18n `common`. */

type FitnessTestStrings = {
  pftSectionTitle: string;
  pftSectionDesc: string;
  pftLatestResult: string;
  pftTakeFull: string;
  pftTakeMini: string;
  pftDisclaimer: string;
  pftPageTitle: string;
  pftPageSubtitle: string;
  pftMiniTitle: string;
  pftFullTitle: string;
  pftProfileHint: string;
  pftAge: string;
  pftSex: string;
  pftSexMale: string;
  pftSexFemale: string;
  pftContinue: string;
  pftScore: string;
  pftBack: string;
  pftResultsTitle: string;
  pftOverallAward: string;
  pftBackBenchmarks: string;
  pftShareAmerica: string;
  pftMilePlaceholder: string;
  pftRepsPlaceholder: string;
  councilTitle: string;
  councilBodyAspirational: string;
  councilBodyPending: string;
  councilBodyMember: string;
  councilDisclaimer: string;
  mahaTagline: string;
  americaHeroTitle: string;
  americaHeroMaha: string;
  americaHeroDefault: string;
  americaKids: string;
  americaKidsDesc: string;
  americaPft: string;
  americaPftDesc: string;
  americaFree: string;
  americaFreeDesc: string;
  americaYouthMode: string;
  americaYouthModeDesc: string;
  americaYouthOn: string;
  americaYouthOff: string;
  americaCtaTest: string;
  americaCtaWelcome: string;
  americaCtaToday: string;
  americaGlobalNote: string;
  americaDisabled: string;
  youthGateTitle: string;
  youthGateBody: string;
  youthParentEmail: string;
  youthConsentCheckbox: string;
  youthContinue: string;
  youthEmailInvalid: string;
  youthConsentRequired: string;
  schoolTitle: string;
  schoolDesc: string;
  schoolJoin: string;
  schoolJoinPlaceholder: string;
  schoolInvalidCode: string;
  schoolJoined: string;
  schoolStats: string;
  schoolRefreshStats: string;
  schoolLeave: string;
  schoolCreateTitle: string;
  schoolCreate: string;
  schoolNamePlaceholder: string;
  schoolDefaultName: string;
  schoolCreated: string;
  schoolInviteCopied: string;
  schoolLinkCopied: string;
  schoolYourClasses: string;
  pftShareResult: string;
  shareFitness: string;
  shareCopied: string;
  shareSent: string;
  commissionedShareMaha: string;
};

const en: FitnessTestStrings = {
  pftSectionTitle: 'Presidential Fitness Test',
  pftSectionDesc:
    "Classic youth fitness events — curl-ups, push-ups, sit-and-reach, mile run, and pull-ups. Free for families and schools. Inspired by America's tradition of moving with purpose.",
  pftLatestResult: 'Last test: {{tier}} · {{date}}',
  pftTakeFull: 'Take the full test →',
  pftTakeMini: 'Mini test ({{events}} events)',
  pftDisclaimer:
    'Educational fitness tool by Mission Winning LLC — not an official U.S. government test or endorsement.',
  pftPageTitle: 'Presidential Fitness Test',
  pftPageSubtitle: 'Log your events, earn Presidential / National / Participant awards.',
  pftMiniTitle: 'Mini fitness test',
  pftFullTitle: 'Presidential Fitness Test',
  pftProfileHint:
    'Age and sex select scoring bands inspired by classic youth fitness standards.',
  pftAge: 'Age',
  pftSex: 'Scoring group',
  pftSexMale: 'Male standards',
  pftSexFemale: 'Female standards',
  pftContinue: 'Continue to events',
  pftScore: 'Score my test',
  pftBack: 'Back',
  pftResultsTitle: 'Your fitness test results',
  pftOverallAward: 'Overall award',
  pftBackBenchmarks: 'Back to Benchmarks',
  pftShareAmerica: 'National fitness mission →',
  pftMilePlaceholder: '6:30 or 390',
  pftRepsPlaceholder: 'Enter result',
  councilTitle: 'National fitness mission',
  councilBodyAspirational:
    'Mission Winning is being built in alignment with national priorities for sports, fitness, and nutrition — free tools that help kids move, parents lead, and communities get stronger together.',
  councilBodyPending:
    'Mission Winning supports the national movement to restore youth fitness and healthy families — with founder leadership advancing Council priorities.',
  councilBodyMember:
    'Mission Winning carries the President\'s Council on Sports, Fitness, and Nutrition mission into every home and school — free tools for the Presidential Fitness Test revival.',
  councilDisclaimer:
    'Mission Winning LLC is a private educational fitness platform. Not a U.S. government website. Council references reflect alignment or confirmed service only — not an official endorsement unless explicitly stated with authorization.',
  mahaTagline:
    "Let's Make America Healthy Again — starting with strength, movement, and families training together.",
  americaHeroTitle: 'Strength for the next generation',
  americaHeroMaha:
    "Mission Winning is bringing back the spirit of the Presidential Fitness Test — inspiring kids to get moving and restoring a culture of strength, health, and fitness. Let's Make America Healthy Again!",
  americaHeroDefault:
    'Mission Winning is reviving the Presidential Fitness Test tradition — free digital scoring for families, schools, and anyone ready to move with purpose.',
  americaKids: 'Kids & schools',
  americaKidsDesc: 'Age-based scoring, mini tests, and daily 10-minute missions.',
  americaPft: 'Presidential Fitness Test',
  americaPftDesc: 'Curl-ups, push-ups, sit-and-reach, mile, pull-ups — log and earn badges.',
  americaFree: 'Free forever',
  americaFreeDesc: 'Core test prep stays in the free tier — global mission unchanged.',
  americaYouthMode: 'Youth mode',
  americaYouthModeDesc: 'Simplified focus for athletes under 18 (local preference).',
  americaYouthOn: 'Youth mode on',
  americaYouthOff: 'Enable youth mode',
  americaCtaTest: 'Take the fitness test',
  americaCtaWelcome: 'Start I-Day journey',
  americaCtaToday: 'Go to Today',
  americaGlobalNote:
    'Mission Winning remains a global health app — this U.S. track is optional and does not replace worldwide free access.',
  americaDisabled: 'National fitness track is not enabled in this build.',
  youthGateTitle: 'Parent or guardian approval',
  youthGateBody:
    'Athletes under 13 need a parent or guardian to approve before logging fitness test results. We store consent locally on this device only.',
  youthParentEmail: 'Parent/guardian email',
  youthConsentCheckbox:
    'I am the parent/guardian. I consent to my child using Mission Winning fitness tools. I understand this is not medical advice and results stay on this device unless we sign in to sync.',
  youthContinue: 'Continue',
  youthEmailInvalid: 'Enter a valid parent or guardian email.',
  youthConsentRequired: 'Parent or guardian must accept the youth privacy notice.',
  schoolTitle: 'School & PE class',
  schoolDesc:
    'Teachers create a class code. Students join and sync fitness test results when signed in — aggregate stats only on the leaderboard card.',
  schoolJoin: 'Join class',
  schoolJoinPlaceholder: 'MWA3K9',
  schoolInvalidCode: 'Enter a valid class code (e.g. MWA3K9).',
  schoolJoined: 'Joined class',
  schoolStats: '{{tests}} tests · {{athletes}} athletes synced',
  schoolRefreshStats: 'Refresh stats',
  schoolLeave: 'Leave class',
  schoolCreateTitle: 'Create a class',
  schoolCreate: 'Generate class code',
  schoolNamePlaceholder: 'Mrs. Smith — 5th Grade PE',
  schoolDefaultName: 'PE Class',
  schoolCreated: 'Class created — share the code with students.',
  schoolInviteCopied: 'Invite link copied.',
  schoolLinkCopied: 'Join link copied.',
  schoolYourClasses: 'Your saved classes:',
  pftShareResult: 'Share my results',
  shareFitness: 'Share',
  shareCopied: 'Copied!',
  shareSent: 'Shared!',
  commissionedShareMaha: 'Share — Make America Healthy Again',
};

export function fitnessTestStringsFor(lang: string): FitnessTestStrings {
  if (lang === 'en') return en;
  return en;
}

export function mergeFitnessTestStrings(
  target: Record<string, string>,
  lang: string
): void {
  Object.assign(target, fitnessTestStringsFor(lang));
}
