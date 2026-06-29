import type { FormGuide } from '@/types/formGuide';

/** Structured text form guides — no video budget required. */
const GUIDES: Record<string, FormGuide> = {
  'push-ups': {
    readyPosition: 'Plank position',
    setup: ['Hands shoulder-width, fingers forward', 'Body straight head to heels', 'Core braced'],
    execute: ['Lower chest toward floor', 'Elbows ~45° from ribs', 'Push floor away to top'],
    commonErrors: ['Hips sag or pike up', 'Partial range of motion'],
    breathing: 'In down · Out up',
  },
  'air-squat': {
    readyPosition: 'Athletic stance',
    setup: ['Feet shoulder-width, toes slightly out', 'Chest up, weight mid-foot', 'Arms forward for balance'],
    execute: ['Sit hips back and down', 'Knees track over toes', 'Stand by driving through floor'],
    commonErrors: ['Heels lift', 'Knees collapse inward'],
    breathing: 'In down · Out up',
  },
  squats: {
    readyPosition: 'Athletic stance',
    setup: ['Bar or body stable, feet planted', 'Brace core, neutral spine', 'Eyes forward'],
    execute: ['Hinge hips then bend knees', 'Depth as mobility allows', 'Drive up through mid-foot'],
    commonErrors: ['Good-morning out of the hole', 'Knees cave'],
    breathing: 'Brace at top · Exhale through sticking point',
  },
  deadlift: {
    readyPosition: 'Setup over the bar',
    setup: ['Shins near bar, hips hinged', 'Flat back, lats tight', 'Grip just outside legs'],
    execute: ['Push floor away with legs', 'Bar stays close to body', 'Lock hips and knees together at top'],
    commonErrors: ['Rounded lower back', 'Bar drifts forward'],
    breathing: 'Big breath and brace before pull · Exhale at lockout',
  },
  'pull-ups': {
    readyPosition: 'Dead hang',
    setup: ['Full hang, shoulders engaged (not shrugged)', 'Grip shoulder-width or slightly wider', 'Legs still or crossed'],
    execute: ['Pull chest toward bar', 'Elbows down and back', 'Lower with control to full extension'],
    commonErrors: ['Kipping when testing strict reps', 'Half reps at bottom'],
    breathing: 'Exhale up · In down',
  },
  plank: {
    readyPosition: 'Forearm plank',
    setup: ['Elbows under shoulders', 'Straight line head to heels', 'Glutes and quads engaged'],
    execute: ['Hold position without sagging', 'Breathe steadily', 'Stop when form breaks'],
    commonErrors: ['Hips drop', 'Looking up and straining neck'],
    breathing: 'Steady nasal breaths',
  },
  'glute-bridge': {
    readyPosition: 'Supine setup',
    setup: ['Back flat, feet hip-width', 'Heels close enough to touch fingertips', 'Ribs down'],
    execute: ['Drive hips up', 'Squeeze glutes at top', 'Lower with control'],
    commonErrors: ['Over-arching lower back', 'Pushing through toes only'],
    breathing: 'Exhale up · In down',
  },
  lunges: {
    readyPosition: 'Split stance',
    setup: ['Torso tall, core braced', 'Step long enough for vertical shin', 'Front foot flat'],
    execute: ['Lower back knee toward floor', 'Front knee stays over foot', 'Push through front heel to stand'],
    commonErrors: ['Front knee caves in', 'Torso falls forward'],
    breathing: 'In down · Out up',
  },
  'overhead-press': {
    readyPosition: 'Rack or clean position',
    setup: ['Ribs down, glutes tight', 'Bar at collarbone or dumbbells at shoulders', 'Wrists stacked over elbows'],
    execute: ['Press straight up', 'Head moves back then through at top', 'Lock out without leaning back'],
    commonErrors: ['Excessive back arch', 'Pressing forward in an arc'],
    breathing: 'Brace · Exhale through top',
  },
  'barbell-row': {
    readyPosition: 'Hinge position',
    setup: ['Hip hinge, flat back', 'Bar hanging at arms length', 'Shoulders packed'],
    execute: ['Row bar to lower ribs', 'Elbows back along body', 'Lower under control'],
    commonErrors: ['Using momentum', 'Rounding spine'],
    breathing: 'Exhale pull · In return',
  },
  burpees: {
    readyPosition: 'Standing',
    setup: ['Feet hip-width', 'Plan path: squat → plank → push → jump'],
    execute: ['Drop to hands, jump feet back', 'Chest to floor if able', 'Jump feet in and stand or hop'],
    commonErrors: ['Skipping push-up phase', 'Landing with locked knees'],
    breathing: 'Rhythm with movement — do not hold breath entire rep',
  },
  'inverted-row': {
    readyPosition: 'Under bar',
    setup: ['Body straight, heels on floor', 'Grip shoulder-width', 'Shoulders away from ears'],
    execute: ['Pull chest to bar', 'Squeeze shoulder blades', 'Lower fully'],
    commonErrors: ['Hips sag', 'Partial range'],
    breathing: 'Exhale up · In down',
  },
};

/** Military test prep — structured cues with readiness terminology (benchmarks only). */
const MILITARY_GUIDES: Record<string, FormGuide> = {
  'push-ups': {
    readyPosition: 'Front-leaning rest',
    setup: [
      'Hands shoulder-width, body straight',
      'Feet together or up to 12 inches apart',
      'Start at up position — arms extended',
    ],
    execute: [
      'Lower until upper arms parallel to ground',
      'Push up to full extension in one body line',
      'Rep counts only with correct form',
    ],
    commonErrors: ['Sagging hips', 'Partial depth', 'Resting on floor between reps if test forbids'],
    breathing: 'Steady — do not hold breath entire set',
    militaryStyle: true,
  },
  'pull-ups': {
    readyPosition: 'Dead hang — arms extended',
    setup: ['Overhand grip, shoulders engaged', 'No kipping for strict test', 'Chin must clear bar'],
    execute: ['Pull until chin over bar', 'Lower to full extension each rep', 'No swinging'],
    commonErrors: ['Chin does not clear bar', 'Half reps at bottom'],
    breathing: 'Exhale on pull',
    militaryStyle: true,
  },
  deadlift: {
    readyPosition: 'Bar over mid-foot',
    setup: ['Neutral spine, chest up', 'Hands just outside legs', 'Slack out of bar before pull'],
    execute: ['Drive through floor', 'Hips and shoulders rise together', 'Full lockout at top'],
    commonErrors: ['Hitched rep', 'Soft lockout'],
    breathing: 'Brace before pull',
    militaryStyle: true,
  },
};

export function getFormGuide(exerciseId: string, opts?: { military?: boolean }): FormGuide | null {
  if (opts?.military && MILITARY_GUIDES[exerciseId]) {
    return MILITARY_GUIDES[exerciseId];
  }
  return GUIDES[exerciseId] ?? null;
}

export function hasFormGuide(exerciseId: string): boolean {
  return exerciseId in GUIDES || exerciseId in MILITARY_GUIDES;
}
