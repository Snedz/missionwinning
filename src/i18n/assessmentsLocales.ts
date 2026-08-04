/** Health screen / PAR-Q assessment strings. */

const ASSESS_EN: Record<string, string> = {
  assessTitle: 'Readiness Assessment',
  assessSubtitle:
    'Free core tool. Based on standard health history and ParQ-style questions. Answer honestly for personalized guidance.',
  assessFormTitle: 'Quick Health & Lifestyle Screen',
  assessStageTitle: 'Stage of Change + Coaching Prompts',
  assessDisclaimer:
    'This is educational screening only — not medical advice. Always consult a doctor.',
  assessOarsNote:
    'OARS in practice: Open questions, Affirm strengths, Reflect back, Summarize. Match approach to readiness.',
  assessResultTitle: 'Assessment Result',
  assessRecommendations: 'Recommendations (click to start a matching free starter + log win):',
  assessResultFoot:
    'Results saved locally + to logs. Use to guide program choice in the Builder / Today hub. Streak +1 on start.',
  assessSignInFoot: 'Keep assessment history synced when you sign in.',
  assessYes: 'Yes',
  assessNo: 'No',
  assessUnsure: 'Unsure',
  assessDetailsPlaceholder: 'details',
  assessStartPrefix: 'Start',
  assessGoToday: 'Go to Today Hub for all free starters',
  assessQ_chest_pain:
    'Have you experienced any chest pain associated with either exercise or stress?',
  assessQ_shortness_breath:
    'Have you experienced shortness of breath with or without exercise?',
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
  assessQ_smoking_detail:
    'Current smoking: non / former (date quit) / <15 cigs/day / 16-25 / >25 or pipe/cigar?',
  assessQ_pain_history:
    'Any current or past pain in: head/neck, upper/lower back, shoulder/clavicle, arm/elbow, wrist/hand, hip/pelvis, thigh/knee, arthritis, hernia, surgeries? (list)',
  assessQ_meds: 'Taking any medications? List with dosage/frequency and condition.',
  assessQ_allergies: 'List any and all allergies.',
  assessQ_lifestyle:
    'Occupation stress (low/med/high), energy level, caffeine/alcohol use, recent weight fluctuation, diet plan or supplements?',
  assessStagePreName: 'Pre-Contemplation (Not Ready)',
  assessStagePreFocus: 'Build awareness without pressure. Evoke curiosity and values.',
  assessStagePreQ1: 'What do you enjoy about your current habits?',
  assessStagePreQ2: 'How do you view your health or energy 5 years from now?',
  assessStageContName: 'Contemplation (Getting Ready)',
  assessStageContFocus: 'Normalize ambivalence. Explore benefits and barriers.',
  assessStageContQ1: 'What might be some benefits if you made this change?',
  assessStageContQ2: 'What feels hardest about starting?',
  assessStagePrepName: 'Preparation / Action',
  assessStagePrepFocus: 'Strengthen confidence. Reinforce progress. Small wins + autonomy.',
  assessStagePrepQ1: "What's one small step you could take this week?",
  assessStagePrepQ2: "What's been working best so far?",
  assessStageMaintName: 'Maintenance',
  assessStageMaintFocus: 'Support autonomy, mastery, relapse prevention. New goals.',
  assessStageMaintQ1: 'How do you maintain progress when life gets stressful?',
  assessStageMaintQ2: 'What new goals feel inspiring now?',
  assessCoachFocus: 'Coach Focus:',
  assessRiskLowNotes: 'Great baseline. Proceed with standard programs.',
  assessRiskModerateNotes: 'Some caution advised. Consider starting with corrective work.',
  assessRiskHighNotes:
    'Multiple flags detected. Strongly recommend medical clearance before intense training.',
  assessRecLow1: 'Start with Beginner Full Body or Bodyweight program.',
  assessRecLow2: 'Focus on consistent form.',
  assessRecModerate1: 'Prioritize the Corrective Exercise Specialist templates.',
  assessRecModerate2: 'Build with Bodyweight & Dumbbell Starter first.',
  assessRecHigh1: 'Begin with Corrective & Mobility block.',
  assessRecHigh2: 'Consult physician.',
  assessRecHigh3: 'Use low-impact options and monitor symptoms.',
  /** Kaizen Loop 3 M5 (.305) */
  submitAssessment: 'Submit Assessment',
  riskLow: 'Low risk',
  riskModerate: 'Moderate risk',
  riskHigh: 'High risk',
};

const ASSESS_ES: Record<string, string> = {
  ...ASSESS_EN,
  assessTitle: 'Evaluación de preparación',
  assessSubtitle:
    'Herramienta gratuita. Basada en historial de salud y preguntas estilo ParQ. Responde con honestidad.',
  assessFormTitle: 'Evaluación rápida de salud y estilo de vida',
  assessYes: 'Sí',
  assessNo: 'No',
  assessStagePreFocus: 'Genera conciencia sin presión. Despierta curiosidad y valores.',
  assessStagePreQ1: '¿Qué disfrutas de tus hábitos actuales?',
  assessCoachFocus: 'Enfoque del coach:',
  assessRiskLowNotes: 'Buena línea base. Continúa con programas estándar.',
  assessRiskModerateNotes: 'Algo de precaución. Considera empezar con trabajo correctivo.',
  assessRiskHighNotes:
    'Varias señales detectadas. Se recomienda autorización médica antes de entrenamiento intenso.',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: ASSESS_EN,
  es: ASSESS_ES,
};

export function assessmentsStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeAssessmentsStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, assessmentsStringsFor(lang));
}
