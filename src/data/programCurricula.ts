/**
 * Public curriculum outlines for specialist programs on /programs.
 * Titles + focus only — paid deliverable stays behind UnlockButton.
 */

export type ProgramCurriculumSession = {
  title: string;
  outline: string[];
};

export type ProgramCurriculumModule = {
  index: number;
  focus: string;
  sessions: ProgramCurriculumSession[];
};

export type ProgramCurriculum = {
  programId: string;
  modules: ProgramCurriculumModule[];
};

function mod(
  index: number,
  focus: string,
  sessions: Array<[string, string[]]>
): ProgramCurriculumModule {
  return {
    index,
    focus,
    sessions: sessions.map(([title, outline]) => ({ title, outline })),
  };
}

export const PROGRAM_CURRICULA: ProgramCurriculum[] = [
  {
    programId: 'conditioning',
    modules: [
      mod(1, 'Energy systems & testing', [
        ['Aerobic base vs power', ['Define goals', 'Simple field tests', 'Log baseline']],
        ['Work:rest design', ['Intervals vs continuous', 'Sample week']],
      ]),
      mod(2, 'Session construction', [
        ['Warm-up standards', ['Raise temp', 'Specific prep']],
        ['Metcon quality', ['Movement standards', 'Scaling rules']],
      ]),
      mod(3, 'Programming blocks', [
        ['4-week build', ['Volume wave', 'Deload markers']],
        ['Sport transfer', ['Run / field / hybrid']],
      ]),
      mod(4, 'Recovery & monitoring', [
        ['Readiness cues', ['Sleep', 'RPE trends']],
        ['Capstone week', ['Test re-run', 'Next block']],
      ]),
    ],
  },
  {
    programId: 'bodybuilding',
    modules: [
      mod(1, 'Hypertrophy fundamentals', [
        ['Stimulus vs fatigue', ['Effective reps', 'Proximity to failure']],
        ['Exercise selection', ['Compounds first', 'Isolation roles']],
      ]),
      mod(2, 'Volume landmarks', [
        ['MEV / MAV framing', ['Practical ranges', 'Log volume']],
        ['Split design', ['Push-pull-legs', 'Upper/lower']],
      ]),
      mod(3, 'Progression models', [
        ['Double progression', ['Reps then load']],
        ['Technique standards', ['Tempo', 'ROM']],
      ]),
      mod(4, 'Peaking & physique', [
        ['Weak-point focus', ['Unilaterals', 'Mind-muscle']],
        ['Deload & rebuild', ['Signs of need', 'Return plan']],
      ]),
    ],
  },
  {
    programId: 'corrective',
    modules: [
      mod(1, 'Assessment basics', [
        ['Pain vs discomfort', ['Red flags', 'When to refer']],
        ['Movement screen lite', ['Squat hinge push pull']],
      ]),
      mod(2, 'Common patterns', [
        ['Anterior dominance', ['Glute access', 'Core control']],
        ['Desk posture', ['T-spine', 'Scap control']],
      ]),
      mod(3, 'Corrective layers', [
        ['Inhibit / lengthen', ['Soft tissue options']],
        ['Activate / integrate', ['Into strength work']],
      ]),
      mod(4, 'Programming integration', [
        ['Warm-up blocks', ['5–10 min standards']],
        ['Return to load', ['Progression criteria']],
      ]),
    ],
  },
  {
    programId: 'pt-education',
    modules: [
      mod(1, 'Client intake', [
        ['Goals & constraints', ['Equipment', 'Schedule']],
        ['Baseline metrics', ['Logs not labs first']],
      ]),
      mod(2, 'Training design', [
        ['Session templates', ['Full body', 'Split']],
        ['Progression rules', ['When to add load']],
      ]),
      mod(3, 'Nutrition coaching', [
        ['Protein & energy', ['Practical targets']],
        ['Adherence systems', ['Environment design']],
      ]),
      mod(4, 'Business delivery', [
        ['Check-ins', ['What to review']],
        ['Capstone client plan', ['Sample 4-week block']],
      ]),
    ],
  },
  {
    programId: 'strength-business',
    modules: [
      mod(1, 'Positioning', [
        ['Offer design', ['Who you serve']],
        ['Pricing honesty', ['Packages vs hourly']],
      ]),
      mod(2, 'Client acquisition', [
        ['Referrals', ['Simple asks']],
        ['Content that converts', ['Demos not hype']],
      ]),
      mod(3, 'Delivery systems', [
        ['Onboarding checklist', ['Forms', 'Baseline']],
        ['Session quality bar', ['Standards']],
      ]),
      mod(4, 'Operations', [
        ['Scheduling & no-shows', ['Policies']],
        ['Scale without burnout', ['Capacity math']],
      ]),
    ],
  },
  {
    programId: 'online-coaching',
    modules: [
      mod(1, 'Online vs in-person', [
        ['Constraints', ['Video', 'Async']],
        ['Tech stack lite', ['Forms', 'Check-ins']],
      ]),
      mod(2, 'Programming remote', [
        ['Exercise selection', ['Equipment tiers']],
        ['Feedback loops', ['Form video rules']],
      ]),
      mod(3, 'Client communication', [
        ['Cadence', ['Weekly review']],
        ['Boundaries', ['Response SLAs']],
      ]),
      mod(4, 'Business model', [
        ['Funnels that stay honest', ['Free core lead-in']],
        ['Retention', ['Wins and reports']],
      ]),
    ],
  },
];

export function getCurriculum(programId: string): ProgramCurriculum | undefined {
  return PROGRAM_CURRICULA.find((c) => c.programId === programId);
}
