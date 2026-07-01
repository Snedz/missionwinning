import type { ActivityType } from '@/lib/activityLog';

export type TrackProgramSession = {
  title: string;
  type: ActivityType;
  durationMin: number;
  distanceKm?: number;
  notes?: string;
};

export type PremiumTrackProgram = {
  id: string;
  name: string;
  subtitle: string;
  focus: string;
  sessions: TrackProgramSession[];
};

/** Premium Track programs — served via /api/premium/track-programs (Super Bundle). */
export const PREMIUM_TRACK_PROGRAM_DATA: PremiumTrackProgram[] = [
  {
    id: 'couch-to-5k-sampler',
    name: 'Couch to 5K Sampler',
    subtitle: '3 sessions — walk/run intervals, no GPS',
    focus: 'Build run tolerance with timed walk/run blocks',
    sessions: [
      {
        title: 'Walk 5 / Run 1 × 6',
        type: 'run',
        durationMin: 30,
        distanceKm: 3.2,
        notes: 'Alternate 5 min walk, 1 min easy jog — repeat 6 rounds.',
      },
      {
        title: 'Walk 4 / Run 2 × 5',
        type: 'run',
        durationMin: 30,
        distanceKm: 3.5,
        notes: 'Progression week — keep jog conversational.',
      },
      {
        title: 'Continuous easy 20',
        type: 'run',
        durationMin: 28,
        distanceKm: 3.8,
        notes: 'Warm up walk 5 min, then 20 min continuous easy run, cool down walk.',
      },
    ],
  },
  {
    id: 'rural-walk-streak',
    name: 'Rural Walk Streak',
    subtitle: '4 sessions — accessible daily movement',
    focus: 'Consistency for low-equipment and pathfinder users',
    sessions: [
      {
        title: 'Neighborhood loop',
        type: 'walk',
        durationMin: 25,
        distanceKm: 2.0,
        notes: 'Flat route — phone in pocket, breathe through nose when possible.',
      },
      {
        title: 'Brisk walk + stairs',
        type: 'walk',
        durationMin: 30,
        notes: 'Find steps or incline — 5×1 min brisk, 2 min easy between.',
      },
      {
        title: 'Park perimeter',
        type: 'walk',
        durationMin: 35,
        distanceKm: 2.8,
        notes: 'Add arm swing — posture tall, shoulders relaxed.',
      },
      {
        title: 'Long easy walk',
        type: 'walk',
        durationMin: 45,
        distanceKm: 3.5,
        notes: 'Mission volume day — hydrate before and after.',
      },
    ],
  },
  {
    id: 'zone2-cardio',
    name: 'Zone 2 Cardio Week',
    subtitle: '3 sessions — sustainable aerobic base',
    focus: 'Talk-test pace for heart health and recovery between lifts',
    sessions: [
      {
        title: 'Bike or brisk walk 40',
        type: 'bike',
        durationMin: 40,
        distanceKm: 12,
        notes: 'Keep effort easy — full sentences without gasping.',
      },
      {
        title: 'Incline walk 35',
        type: 'walk',
        durationMin: 35,
        distanceKm: 3.0,
        notes: 'Moderate hill or treadmill incline — steady effort.',
      },
      {
        title: 'Easy run or jog-walk 30',
        type: 'run',
        durationMin: 30,
        distanceKm: 4.0,
        notes: 'Zone 2 only — back off if HR spikes into hard breathing.',
      },
    ],
  },
  {
    id: 'hike-builder',
    name: 'Hike Builder',
    subtitle: '3 sessions — prep for elevation and duration',
    focus: 'Leg endurance and pack-ready conditioning',
    sessions: [
      {
        title: 'Hill repeats walk',
        type: 'hike',
        durationMin: 40,
        distanceKm: 4.0,
        notes: 'Find a hill — up 3 min brisk, down easy, repeat 6×.',
      },
      {
        title: 'Mixed terrain 50',
        type: 'hike',
        durationMin: 50,
        distanceKm: 5.5,
        notes: 'Uneven ground if available — ankle stability from Move pillar helps.',
      },
      {
        title: 'Long hike simulation',
        type: 'hike',
        durationMin: 75,
        distanceKm: 8.0,
        notes: 'Steady pace — log Fuel and hydration after.',
      },
    ],
  },
  {
    id: 'active-recovery-mix',
    name: 'Active Recovery Mix',
    subtitle: '4 sessions — light movement between hard training',
    focus: 'Flush soreness without adding training stress',
    sessions: [
      {
        title: 'Easy swim or walk',
        type: 'swim',
        durationMin: 25,
        notes: 'Low intensity — focus on smooth movement.',
      },
      {
        title: 'Recovery walk 20',
        type: 'walk',
        durationMin: 20,
        distanceKm: 1.5,
        notes: 'Day after legs — no incline, conversational pace.',
      },
      {
        title: 'Bike spin easy',
        type: 'bike',
        durationMin: 30,
        distanceKm: 8,
        notes: 'Light gear — spin legs, no heavy breathing.',
      },
      {
        title: 'Nature stroll',
        type: 'other',
        durationMin: 30,
        notes: 'Unstructured — move for joy, log for streak.',
      },
    ],
  },
];
