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
  pftClassRank: string;
  pftViewClassBoard: string;
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
  americaHeroCouncilMember: string;
  americaHeroCouncilPending: string;
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
  schoolViewStandings: string;
  schoolSignInSync: string;
  schoolCodeTaken: string;
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
  schoolTeacherDashboard: string;
  teacherDashboardKicker: string;
  teacherLoading: string;
  teacherAthletes: string;
  teacherTests: string;
  teacherPresidential: string;
  teacherPftBoard: string;
  teacherPftEmpty: string;
  teacherOpenLeaderboard: string;
  teacherWeekOne: string;
  teacherPrint: string;
  teacherCopyPlan: string;
  teacherJoinLink: string;
  pftLeaderboard: string;
  schoolCreatedWithPin: string;
  schoolPinLabel: string;
  teacherPinTitle: string;
  teacherPinDesc: string;
  teacherPinInvalid: string;
  teacherPinUnlock: string;
  teacherDownloadPlan: string;
  teacherDownloadCsv: string;
  teacherDownloadHtml: string;
  teacherPrintReport: string;
  teacherCreatorBadge: string;
  youthVerifyTitle: string;
  youthVerifySent: string;
  youthVerifyPending: string;
  youthVerifyCta: string;
  youthCodeInvalid: string;
  youthSendCode: string;
  youthResendCode: string;
  youthResendIn: string;
  youthResendFailed: string;
  youthConfirmTitle: string;
  youthConfirmLoading: string;
  youthConfirmOk: string;
  youthConfirmCrossDevice: string;
  youthConfirmError: string;
  youthConfirmBack: string;
  youthSendFailed: string;
  youthVerifyNetwork: string;
  youthSending: string;
  schoolJoinedTeacherNote: string;
  /**
   * Teacher class back-link. The `america` surface is parked, so this string is
   * unreachable in production today — catalogued anyway, because the coverage
   * check reads source, and an uncatalogued key is debt whether or not the
   * route is currently served.
   */
  pftBackAmerica: string;
  joinClassLoading: string;
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
  pftClassRank: '#{{rank}} in class {{code}}',
  pftViewClassBoard: 'View class standings →',
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
  americaHeroCouncilMember:
    'Mission Winning supports national fitness priorities with free Presidential Fitness Test tools for families, schools, and communities — built in service of a stronger, healthier America.',
  americaHeroCouncilPending:
    'Mission Winning is advancing national fitness tools in coordination with leadership on sports and youth health — starting with free Presidential Fitness Test scoring for every community.',
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
    'Athletes under 13 need a parent or guardian to approve before logging fitness test results. When signed in, verified consent can sync across devices.',
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
  schoolViewStandings: 'Class standings →',
  schoolSignInSync: 'Class saved locally. Sign in to sync this class across devices.',
  schoolCodeTaken: 'That class code is registered to another teacher.',
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
  schoolTeacherDashboard: 'Teacher dashboard →',
  teacherDashboardKicker: 'Teacher dashboard',
  teacherLoading: 'Loading class data…',
  teacherAthletes: 'Athletes synced',
  teacherTests: 'Tests logged',
  teacherPresidential: 'Presidential awards',
  teacherPftBoard: 'Class fitness test standings',
  teacherPftEmpty:
    'No synced results yet. Students join the class, sign in, and complete /fitness-test.',
  teacherOpenLeaderboard: 'Open squad leaderboard →',
  teacherWeekOne: 'Week 1 challenge (printable)',
  teacherPrint: 'Print challenge',
  teacherCopyPlan: 'Copy plan text',
  teacherJoinLink: 'Student join link',
  pftLeaderboard: 'PFT leaderboard →',
  schoolCreatedWithPin: 'Class {{code}} created. Teacher PIN: {{pin}} — save this PIN.',
  schoolPinLabel: 'Teacher PIN',
  teacherPinTitle: 'Teacher PIN required',
  teacherPinDesc: 'Enter the 6-digit PIN shown when you created class {{code}}.',
  teacherPinInvalid: 'Incorrect teacher PIN.',
  teacherPinUnlock: 'Unlock dashboard',
  teacherDownloadPlan: 'Download .txt',
  teacherDownloadCsv: 'Download CSV',
  teacherDownloadHtml: 'Download report (HTML)',
  teacherPrintReport: 'Print report',
  teacherCreatorBadge: 'Signed in as class creator',
  youthVerifyTitle: 'Enter verification code',
  youthVerifySent:
    'We emailed your parent/guardian a 6-digit code and confirm link. Enter the code here to continue.',
  youthVerifyPending: 'Enter the 6-digit code from the parent consent email.',
  youthVerifyCta: 'Verify & continue',
  youthCodeInvalid: 'Incorrect verification code.',
  youthSendCode: 'Send verification email',
  youthResendCode: 'Resend code',
  youthResendIn: 'Resend code in {{seconds}}s',
  youthResendFailed: 'Could not resend the code. Try again shortly.',
  youthConfirmTitle: 'Parent consent',
  youthConfirmLoading: 'Confirming…',
  youthConfirmOk: 'Consent verified. Redirecting to the fitness test…',
  youthConfirmCrossDevice:
    'Consent saved to the athlete account. They can continue on any signed-in device.',
  youthConfirmError: 'Link expired or invalid. Ask your parent to resubmit consent.',
  youthConfirmBack: 'Back to fitness test',
  youthSendFailed: 'Could not send the verification email. Try again shortly.',
  youthVerifyNetwork: 'Could not verify right now. Check your connection and try again.',
  youthSending: 'Sending…',
  schoolJoinedTeacherNote: 'Complete a fitness test while signed in to sync your score. Teachers view standings on the class dashboard.',
  pftBackAmerica: 'National fitness',
  joinClassLoading: 'Joining class…',
};

const es: FitnessTestStrings = {
  ...en,
  councilTitle: 'Misión nacional de fitness',
  councilBodyAspirational:
    'Mission Winning se alinea con las prioridades nacionales de deporte, fitness y nutrición — herramientas gratuitas para que los niños se muevan y las familias se fortalezcan.',
  councilBodyPending:
    'Mission Winning apoya el movimiento nacional para restaurar el fitness juvenil — con liderazgo avanzando prioridades del Consejo.',
  councilBodyMember:
    'Mission Winning lleva la misión del Consejo Presidencial de Deportes, Fitness y Nutrición a cada hogar y escuela.',
  mahaTagline:
    'Hagamos a América saludable de nuevo — empezando con fuerza, movimiento y familias entrenando juntas.',
  americaHeroTitle: 'Fuerza para la próxima generación',
  americaHeroMaha:
    'Mission Winning revive el espíritu del Presidential Fitness Test — moviendo a los niños y restaurando una cultura de salud. ¡Hagamos a América saludable de nuevo!',
  americaHeroDefault:
    'Mission Winning revive la tradición del Presidential Fitness Test — puntuación digital gratuita para familias y escuelas.',
  americaHeroCouncilMember:
    'Mission Winning apoya las prioridades nacionales de fitness con herramientas gratuitas del Presidential Fitness Test.',
  americaHeroCouncilPending:
    'Mission Winning avanza herramientas nacionales de fitness en coordinación con el liderazgo en deporte juvenil.',
  schoolTitle: 'Escuela y clase de EF',
  schoolJoin: 'Unirse a la clase',
  teacherPinTitle: 'PIN de profesor requerido',
  teacherDownloadCsv: 'Descargar CSV',
  teacherPrintReport: 'Imprimir informe',
};

const fr: FitnessTestStrings = {
  ...en,
  councilTitle: 'Mission fitness nationale',
  councilBodyAspirational:
    'Mission Winning s\'aligne sur les priorités nationales sport, fitness et nutrition — des outils gratuits pour aider les enfants à bouger.',
  councilBodyPending:
    'Mission Winning soutient le mouvement national pour restaurer la forme des jeunes — en avançant les priorités du Conseil.',
  councilBodyMember:
    'Mission Winning porte la mission du Conseil présidentiel du sport, du fitness et de la nutrition dans chaque foyer et école.',
  americaHeroTitle: 'La force pour la prochaine génération',
  americaHeroCouncilMember:
    'Mission Winning soutient les priorités nationales de fitness avec des outils gratuits du Presidential Fitness Test.',
  americaHeroCouncilPending:
    'Mission Winning fait avancer les outils nationaux de fitness en coordination avec le leadership sportif jeunesse.',
  schoolTitle: 'École et cours d\'EPS',
  teacherDownloadCsv: 'Télécharger CSV',
  teacherPrintReport: 'Imprimer le rapport',
};

const ja: FitnessTestStrings = {
  ...en,
  councilTitle: '国家フィットネス・ミッション',
  councilBodyAspirational:
    'Mission Winningはスポーツ・フィットネス・栄養の国家優先事項に沿って構築 — 子どもが動き、家族が強くなる無料ツール。',
  councilBodyPending:
    'Mission Winningは青少年フィットネス復興の国家運動を支援 — カウンシル優先事項を推進。',
  councilBodyMember:
    'Mission Winningは大統領スポーツ・フィットネス・栄養評議会の使命を家庭と学校へ。',
  americaHeroTitle: '次世代のための強さ',
  americaHeroCouncilMember:
    'Mission Winningは大統領フィットネステストの無料ツールで国家フィットネス優先事項を支援。',
  americaHeroCouncilPending:
    'Mission Winningは青少年スポーツリーダーシップと連携し、国家フィットネスツールを推進。',
  schoolTitle: '学校・体育クラス',
  teacherDownloadCsv: 'CSVをダウンロード',
  teacherPrintReport: 'レポートを印刷',
};

const de: FitnessTestStrings = {
  ...en,
  councilTitle: 'Nationale Fitness-Mission',
  councilBodyAspirational:
    'Mission Winning orientiert sich an nationalen Prioritäten für Sport, Fitness und Ernährung — kostenlose Tools für bewegte Kinder.',
  councilBodyPending:
    'Mission Winning unterstützt die nationale Bewegung für Jugendfitness — mit Führung für Council-Prioritäten.',
  councilBodyMember:
    'Mission Winning trägt die Mission des President\'s Council on Sports, Fitness, and Nutrition in jedes Zuhause und jede Schule.',
  americaHeroCouncilMember:
    'Mission Winning unterstützt nationale Fitness-Prioritäten mit kostenlosen Presidential Fitness Test Tools.',
  americaHeroCouncilPending:
    'Mission Winning treibt nationale Fitness-Tools in Abstimmung mit der Jugendsport-Führung voran.',
  teacherDownloadCsv: 'CSV herunterladen',
  teacherPrintReport: 'Bericht drucken',
};

const zh: FitnessTestStrings = {
  ...en,
  councilTitle: '国家健身使命',
  councilBodyAspirational:
    'Mission Winning 与国家体育、健身和营养优先事项保持一致 — 免费工具帮助孩子们动起来。',
  councilBodyPending:
    'Mission Winning 支持恢复青少年健身的国家运动 — 推进理事会优先事项。',
  councilBodyMember:
    'Mission Winning 将总统体育、健身与营养委员会的使命带入每个家庭和学校。',
  americaHeroTitle: '为下一代打造力量',
  americaHeroCouncilMember:
    'Mission Winning 通过免费的总统健身测试工具支持国家健身优先事项。',
  americaHeroCouncilPending:
    'Mission Winning 与青少年体育领导层协调，推进国家健身工具。',
  schoolTitle: '学校与体育班',
  teacherDownloadCsv: '下载 CSV',
  teacherPrintReport: '打印报告',
};

const FITNESS_TEST_LOCALES: Record<string, FitnessTestStrings> = {
  en,
  es,
  fr,
  ja,
  de,
  zh,
};

export function fitnessTestStringsFor(lang: string): FitnessTestStrings {
  const code = lang.split('-')[0].toLowerCase();
  return FITNESS_TEST_LOCALES[code] ?? en;
}

export function mergeFitnessTestStrings(
  target: Record<string, string>,
  lang: string
): void {
  Object.assign(target, fitnessTestStringsFor(lang));
}
