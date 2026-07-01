/** Week 1 Presidential Fitness Test challenge — printable PE plan. */

export type PftChallengeDay = {
  day: number;
  title: string;
  move: string;
  testPrep: string;
  minutes: number;
};

export const PFT_WEEK_ONE_CHALLENGE: PftChallengeDay[] = [
  {
    day: 1,
    title: 'Baseline & curl-ups',
    move: '4-min hip opener flow (/move)',
    testPrep: 'Practice curl-ups — 2 sets of max reps with rest',
    minutes: 15,
  },
  {
    day: 2,
    title: 'Push strength',
    move: '10-min bodyweight strength (/log → Train)',
    testPrep: 'Push-up test prep — strict form, 1-min trial',
    minutes: 15,
  },
  {
    day: 3,
    title: 'Active recovery',
    move: 'Guided breathing + 6-min mobility (/mind + /move)',
    testPrep: 'Sit-and-reach stretch routine — log best reach',
    minutes: 12,
  },
  {
    day: 4,
    title: 'Mini test #1',
    move: 'Warm-up jog or march in place 5 min',
    testPrep: 'Take the mini fitness test in the app (/fitness-test?mode=mini)',
    minutes: 20,
  },
  {
    day: 5,
    title: 'Pull & core',
    move: 'Track a 15-min walk or bike (/track)',
    testPrep: 'Flexed-arm hang or assisted pull-ups — 3 attempts',
    minutes: 15,
  },
  {
    day: 6,
    title: 'Endurance',
    move: 'Move flow of choice — pick one from /move',
    testPrep: 'Mile prep: walk-run intervals — note your time',
    minutes: 20,
  },
  {
    day: 7,
    title: 'Test day',
    move: 'Dynamic warm-up 5 min',
    testPrep: 'Full Presidential Fitness Test — log all events in the app',
    minutes: 30,
  },
];

export function formatWeekOneChallengeText(className: string, classCode: string): string {
  const lines = [
    'Mission Winning — Week 1 Presidential Fitness Challenge',
    `Class: ${className} · Code: ${classCode}`,
    '',
    ...PFT_WEEK_ONE_CHALLENGE.map(
      (d) =>
        `Day ${d.day}: ${d.title} (~${d.minutes} min)\n  Move: ${d.move}\n  Test prep: ${d.testPrep}`
    ),
    '',
    'Free app: https://www.missionwinning.com/fitness-test',
    'Educational tool — not an official U.S. government test.',
  ];
  return lines.join('\n');
}
