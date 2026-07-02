/** Assessment + Pathfinder UI strings — Tier 1 for rural equity (J4). */

export const ASSESSMENT_LANGS = ['en', 'es', 'fr', 'pt', 'ar', 'hi'] as const;

type AssessmentStrings = Record<string, string>;

const en: AssessmentStrings = {
  assessSubtitle:
    'Free core tool. Answer honestly for personalized guidance — including a Pathfinder track if regular doctor access is difficult.',
  assessContinue: 'Continue',
  assessDisclaimer:
    'Educational screening only — not medical advice. Emergency symptoms (chest pain, fainting): seek urgent care if available.',
  assessPathfinderTitle: 'Pathfinder — care access',
  assessPathfinderBody:
    'Many members train in villages, rural areas, or places without a regular doctor. This helps us recommend safe starters — not replace clinical care.',
  assessPathfinderQuestion: 'Can you reach a doctor or nurse regularly?',
  assessAccessRegular: 'Yes — I can usually see a clinician',
  assessAccessLimited: 'Sometimes — clinics are far or appointments are rare',
  assessAccessNone: 'No — I cannot reach a doctor easily (Pathfinder track)',
  assessBackQuestions: 'Back to questions',
  assessResultTitle: 'Assessment Result',
  assessPathfinderBadge: 'Pathfinder track',
  assessLowImpactNote:
    'Low-impact programs only until you can seek medical clearance. Intense templates stay locked for your safety.',
  assessRecsLabel: 'Recommendations (click to start a matching free starter):',
  assessStartPrefix: 'Start',
  assessRetake: 'Retake Assessment',
  assessSavedNote: 'Results saved locally. Pathfinder access:',
  assessGoToday: 'Go to Today Hub for all free starters',
  assessVillageCard: 'Print Village Health Card',
  assessYes: 'Yes',
  assessNo: 'No',
  assessUnsure: 'Unsure',
  assessQ_chest_pain: 'Have you experienced any chest pain associated with either exercise or stress?',
  assessQ_shortness_breath: 'Have you experienced shortness of breath with or without exercise?',
  assessQ_fainting: 'Have you experienced fainting or light-headedness?',
  assessQ_hospital: 'Have you had a recent hospitalization for any cause?',
  assessQ_ortho: 'Do you have any orthopedic conditions (including arthritis)?',
  assessQ_heart: 'Have you ever experienced a rapid heartbeat or palpitations?',
  assessQ_no_exercise: 'Is there any reason why you should not follow a regular exercise program?',
  assessQ_smoke: 'Do you smoke? (yes/no/former)',
  assessQ_sleep: 'Average hours of sleep per night? (under 5 / 5-7 / 8-10 / over 10)',
  assessQ_energy: 'Daily energy level? (high / moderate / low)',
  assessQ_high_bp: 'Has your doctor ever diagnosed you with high blood pressure?',
  assessQ_bone_joint:
    'Has your doctor ever diagnosed you with a bone or joint problem that has been or could be made worse by exercise?',
  assessQ_family_heart:
    'Family history of heart disease, heart attack, or stroke before age 55 (father/brother) or 65 (mother/sister)?',
};

const es: AssessmentStrings = {
  assessSubtitle:
    'Herramienta gratuita. Responde con honestidad — incluye la ruta Pathfinder si no tienes acceso regular a un médico.',
  assessContinue: 'Continuar',
  assessDisclaimer:
    'Solo evaluación educativa — no es consejo médico. Síntomas de emergencia: busca atención urgente si es posible.',
  assessPathfinderTitle: 'Pathfinder — acceso a atención',
  assessPathfinderBody:
    'Muchas personas entrenan en zonas rurales sin médico regular. Esto ayuda a recomendar inicios seguros — no reemplaza la atención clínica.',
  assessPathfinderQuestion: '¿Puedes ver a un médico o enfermera con regularidad?',
  assessAccessRegular: 'Sí — normalmente puedo ver a un profesional',
  assessAccessLimited: 'A veces — la clínica está lejos o hay pocas citas',
  assessAccessNone: 'No — no puedo llegar fácilmente a un médico (ruta Pathfinder)',
  assessBackQuestions: 'Volver a las preguntas',
  assessResultTitle: 'Resultado de la evaluación',
  assessPathfinderBadge: 'Ruta Pathfinder',
  assessLowImpactNote:
    'Solo programas de bajo impacto hasta que puedas obtener autorización médica.',
  assessRecsLabel: 'Recomendaciones (toca para iniciar):',
  assessStartPrefix: 'Iniciar',
  assessRetake: 'Repetir evaluación',
  assessSavedNote: 'Resultados guardados localmente. Acceso Pathfinder:',
  assessGoToday: 'Ir al hub Hoy para todos los inicios gratuitos',
  assessVillageCard: 'Imprimir tarjeta de salud comunitaria',
  assessYes: 'Sí',
  assessNo: 'No',
  assessUnsure: 'No sé',
  assessQ_chest_pain: '¿Has tenido dolor en el pecho con ejercicio o estrés?',
  assessQ_shortness_breath: '¿Has tenido falta de aire con o sin ejercicio?',
  assessQ_fainting: '¿Has tenido desmayos o mareos?',
  assessQ_hospital: '¿Has estado hospitalizado recientemente?',
  assessQ_ortho: '¿Tienes problemas ortopédicos (incluida artritis)?',
  assessQ_heart: '¿Has tenido palpitaciones o latidos rápidos?',
  assessQ_no_exercise: '¿Hay alguna razón para no seguir un programa de ejercicio?',
  assessQ_smoke: '¿Fumas? (sí/no/exfumador)',
  assessQ_sleep: '¿Horas de sueño por noche? (menos de 5 / 5-7 / 8-10 / más de 10)',
  assessQ_energy: '¿Nivel de energía diario? (alto / moderado / bajo)',
  assessQ_high_bp: '¿Te han diagnosticado presión arterial alta?',
  assessQ_bone_joint: '¿Problema óseo o articular que empeore con el ejercicio?',
  assessQ_family_heart: '¿Antecedentes familiares de enfermedad cardíaca antes de los 55/65 años?',
};

const fr: AssessmentStrings = {
  assessSubtitle:
    'Outil gratuit. Répondez honnêtement — y compris la piste Pathfinder si l’accès à un médecin est difficile.',
  assessContinue: 'Continuer',
  assessDisclaimer:
    'Dépistage éducatif uniquement — pas un avis médical. Symptômes d’urgence : consultez si possible.',
  assessPathfinderTitle: 'Pathfinder — accès aux soins',
  assessPathfinderBody:
    'Beaucoup s’entraînent en zone rurale sans médecin régulier. Cela aide à recommander des départs sûrs — sans remplacer les soins.',
  assessPathfinderQuestion: 'Pouvez-vous voir un médecin ou une infirmière régulièrement ?',
  assessAccessRegular: 'Oui — j’ai généralement accès à un professionnel',
  assessAccessLimited: 'Parfois — la clinique est loin ou les rendez-vous sont rares',
  assessAccessNone: 'Non — pas d’accès facile à un médecin (piste Pathfinder)',
  assessBackQuestions: 'Retour aux questions',
  assessResultTitle: 'Résultat de l’évaluation',
  assessPathfinderBadge: 'Piste Pathfinder',
  assessLowImpactNote: 'Programmes à faible impact jusqu’à avis médical.',
  assessRecsLabel: 'Recommandations (cliquer pour démarrer) :',
  assessStartPrefix: 'Démarrer',
  assessRetake: 'Refaire l’évaluation',
  assessSavedNote: 'Résultats enregistrés localement. Accès Pathfinder :',
  assessGoToday: 'Aller au hub Aujourd’hui',
  assessVillageCard: 'Imprimer la carte santé village',
  assessYes: 'Oui',
  assessNo: 'Non',
  assessUnsure: 'Incertain',
  assessQ_chest_pain: 'Douleur thoracique liée à l’effort ou au stress ?',
  assessQ_shortness_breath: 'Essoufflement avec ou sans effort ?',
  assessQ_fainting: 'Évanouissements ou vertiges ?',
  assessQ_hospital: 'Hospitalisation récente ?',
  assessQ_ortho: 'Problèmes orthopédiques (arthrite incluse) ?',
  assessQ_heart: 'Palpitations ou rythme cardiaque rapide ?',
  assessQ_no_exercise: 'Raison de ne pas suivre un programme d’exercice ?',
  assessQ_smoke: 'Fumez-vous ? (oui/non/ancien)',
  assessQ_sleep: 'Heures de sommeil ? (moins de 5 / 5-7 / 8-10 / plus de 10)',
  assessQ_energy: 'Niveau d’énergie ? (élevé / modéré / faible)',
  assessQ_high_bp: 'Hypertension diagnostiquée ?',
  assessQ_bone_joint: 'Problème osseux/articulaire aggravé par l’exercice ?',
  assessQ_family_heart: 'Antécédents familiaux de maladie cardiaque avant 55/65 ans ?',
};

const pt: AssessmentStrings = {
  assessSubtitle:
    'Ferramenta gratuita. Responda com honestidade — inclui trilha Pathfinder se o acesso médico for difícil.',
  assessContinue: 'Continuar',
  assessDisclaimer:
    'Triagem educativa — não é conselho médico. Sintomas graves: busque atendimento se possível.',
  assessPathfinderTitle: 'Pathfinder — acesso a cuidados',
  assessPathfinderBody:
    'Muitas pessoas treinam em áreas rurais sem médico regular. Isso ajuda a recomendar inícios seguros.',
  assessPathfinderQuestion: 'Você consegue ver médico ou enfermeiro regularmente?',
  assessAccessRegular: 'Sim — geralmente consigo atendimento',
  assessAccessLimited: 'Às vezes — clínica longe ou poucas consultas',
  assessAccessNone: 'Não — não consigo médico facilmente (trilha Pathfinder)',
  assessBackQuestions: 'Voltar às perguntas',
  assessResultTitle: 'Resultado da avaliação',
  assessPathfinderBadge: 'Trilha Pathfinder',
  assessLowImpactNote: 'Apenas programas de baixo impacto até liberação médica.',
  assessRecsLabel: 'Recomendações (toque para iniciar):',
  assessStartPrefix: 'Iniciar',
  assessRetake: 'Refazer avaliação',
  assessSavedNote: 'Resultados salvos localmente. Acesso Pathfinder:',
  assessGoToday: 'Ir ao hub Hoje',
  assessVillageCard: 'Imprimir cartão de saúde comunitário',
  assessYes: 'Sim',
  assessNo: 'Não',
  assessUnsure: 'Não sei',
  assessQ_chest_pain: 'Dor no peito com exercício ou estresse?',
  assessQ_shortness_breath: 'Falta de ar com ou sem exercício?',
  assessQ_fainting: 'Desmaios ou tontura?',
  assessQ_hospital: 'Hospitalização recente?',
  assessQ_ortho: 'Problemas ortopédicos (incluindo artrite)?',
  assessQ_heart: 'Palpitações ou batimentos rápidos?',
  assessQ_no_exercise: 'Algum motivo para não seguir exercícios?',
  assessQ_smoke: 'Fuma? (sim/não/ex-fumante)',
  assessQ_sleep: 'Horas de sono? (menos de 5 / 5-7 / 8-10 / mais de 10)',
  assessQ_energy: 'Nível de energia? (alto / moderado / baixo)',
  assessQ_high_bp: 'Pressão alta diagnosticada?',
  assessQ_bone_joint: 'Problema ósseo/articular piorado por exercício?',
  assessQ_family_heart: 'Histórico familiar de doença cardíaca antes dos 55/65 anos?',
};

const ar: AssessmentStrings = {
  assessSubtitle:
    'أداة مجانية. أجب بصدق — بما في ذلك مسار Pathfinder إذا كان الوصول إلى الطبيب صعباً.',
  assessContinue: 'متابعة',
  assessDisclaimer:
    'فحص تعليمي فقط — ليس نصيحة طبية. أعراض طوارئ: اطلب رعاية عاجلة إن أمكن.',
  assessPathfinderTitle: 'Pathfinder — الوصول للرعاية',
  assessPathfinderBody:
    'كثيرون يتدربون في قرى أو مناطق بلا طبيب منتظم. هذا يساعد على توصيات آمنة — لا يغني عن العيادة.',
  assessPathfinderQuestion: 'هل يمكنك الوصول إلى طبيب أو ممرض بانتظام؟',
  assessAccessRegular: 'نعم — أستطيع عادةً رؤية مختص',
  assessAccessLimited: 'أحياناً — العيادة بعيدة أو المواعيد نادرة',
  assessAccessNone: 'لا — لا أستطيع الوصول لطبيب بسهولة (مسار Pathfinder)',
  assessBackQuestions: 'العودة للأسئلة',
  assessResultTitle: 'نتيجة التقييم',
  assessPathfinderBadge: 'مسار Pathfinder',
  assessLowImpactNote: 'برامج منخفضة التأثير فقط حتى الحصول على موافقة طبية.',
  assessRecsLabel: 'التوصيات (اضغط للبدء):',
  assessStartPrefix: 'ابدأ',
  assessRetake: 'إعادة التقييم',
  assessSavedNote: 'النتائج محفوظة محلياً. الوصول Pathfinder:',
  assessGoToday: 'اذهب إلى مركز اليوم',
  assessVillageCard: 'طباعة بطاقة صحة القرية',
  assessYes: 'نعم',
  assessNo: 'لا',
  assessUnsure: 'غير متأكد',
  assessQ_chest_pain: 'هل شعرت بألم في الصدر مع التمرين أو التوتر؟',
  assessQ_shortness_breath: 'هل شعرت بضيق تنفس مع أو بدون تمرين؟',
  assessQ_fainting: 'هل أُغمي عليك أو شعرت بدوخة؟',
  assessQ_hospital: 'هل دخلت المستشفى مؤخراً؟',
  assessQ_ortho: 'هل لديك مشاكل عظام أو مفاصل (بما فيها التهاب المفاصل)؟',
  assessQ_heart: 'هل شعرت بخفقان أو نبض سريع؟',
  assessQ_no_exercise: 'هل هناك سبب يمنعك من برنامج تمرين؟',
  assessQ_smoke: 'هل تدخن؟ (نعم/لا/سابق)',
  assessQ_sleep: 'ساعات النوم؟ (أقل من 5 / 5-7 / 8-10 / أكثر من 10)',
  assessQ_energy: 'مستوى الطاقة؟ (عالي / متوسط / منخفض)',
  assessQ_high_bp: 'هل تشخيص ضغط دم مرتفع؟',
  assessQ_bone_joint: 'مشكلة عظام/مفاصل تسوء بالتمرين؟',
  assessQ_family_heart: 'تاريخ عائلي لمرض قلب قبل 55/65 سنة؟',
};

const hi: AssessmentStrings = {
  assessSubtitle:
    'मुफ़्त उपकरण। ईमानदारी से उत्तर दें — Pathfinder ट्रैक भी, यदि डॉक्टर तक पहुँच कठिन हो।',
  assessContinue: 'आगे बढ़ें',
  assessDisclaimer:
    'केवल शैक्षिक जाँच — चिकित्सा सलाह नहीं। आपात लक्षण: संभव हो तो तुरंत देखें।',
  assessPathfinderTitle: 'Pathfinder — देखभाल तक पहुँच',
  assessPathfinderBody:
    'कई लोग गाँव या दूरस्थ क्षेत्रों में बिना नियमित डॉक्टर के प्रशिक्षण करते हैं। यह सुरक्षित शुरुआत सुझाता है।',
  assessPathfinderQuestion: 'क्या आप नियमित रूप से डॉक्टर या नर्स से मिल सकते हैं?',
  assessAccessRegular: 'हाँ — आमतौर पर चिकित्सक मिल जाता है',
  assessAccessLimited: 'कभी-कभी — क्लिनिक दूर या अपॉइंटमेंट कम',
  assessAccessNone: 'नहीं — डॉक्टर तक आसानी से नहीं (Pathfinder ट्रैक)',
  assessBackQuestions: 'प्रश्नों पर वापस',
  assessResultTitle: 'मूल्यांकन परिणाम',
  assessPathfinderBadge: 'Pathfinder ट्रैक',
  assessLowImpactNote: 'चिकित्सक की अनुमति तक केवल कम-प्रभाव कार्यक्रम।',
  assessRecsLabel: 'सिफारिशें (शुरू करने के लिए टैप करें):',
  assessStartPrefix: 'शुरू',
  assessRetake: 'फिर से मूल्यांकन',
  assessSavedNote: 'परिणाम स्थानीय रूप से सहेजे। Pathfinder पहुँच:',
  assessGoToday: 'आज हब पर जाएँ',
  assessVillageCard: 'गाँव स्वास्थ्य कार्ड प्रिंट करें',
  assessYes: 'हाँ',
  assessNo: 'नहीं',
  assessUnsure: 'अनिश्चित',
  assessQ_chest_pain: 'व्यायाम या तनाव में सीने में दर्द?',
  assessQ_shortness_breath: 'व्यायाम के साथ/बिना साँस फूलना?',
  assessQ_fainting: 'बेहोशी या चक्कर?',
  assessQ_hospital: 'हाल में अस्पताल में भर्ती?',
  assessQ_ortho: 'हड्डी/जोड़ की समस्या (गठिया सहित)?',
  assessQ_heart: 'धड़कन तेज़ या palpitations?',
  assessQ_no_exercise: 'व्यायाम कार्यक्रम न करने का कोई कारण?',
  assessQ_smoke: 'धूम्रपान? (हाँ/नहीं/पूर्व)',
  assessQ_sleep: 'नींद के घंटे? (5 से कम / 5-7 / 8-10 / 10 से अधिक)',
  assessQ_energy: 'ऊर्जा स्तर? (उच्च / मध्यम / निम्न)',
  assessQ_high_bp: 'उच्च रक्तचाप का निदान?',
  assessQ_bone_joint: 'व्यायाम से बढ़ने वाली हड्डी/जोड़ समस्या?',
  assessQ_family_heart: '55/65 से पहले हृदय रोग का पारिवारिक इतिहास?',
};

const MAP: Record<string, AssessmentStrings> = { en, es, fr, pt, ar, hi };

export function assessmentStringsFor(lang: string): AssessmentStrings {
  return MAP[lang] ?? en;
}

export function mergeAssessmentStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, assessmentStringsFor(lang));
}

export const ASSESSMENT_QUESTION_KEYS = [
  'chest_pain',
  'shortness_breath',
  'fainting',
  'hospital',
  'ortho',
  'heart',
  'no_exercise',
  'smoke',
  'sleep',
  'energy',
  'high_bp',
  'bone_joint',
  'family_heart',
] as const;
