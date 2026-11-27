/**
 * Personal trainer facts for the set in front of the athlete.
 * Library cue + next set + week plan. The model may speak a line;
 * it may not change the lift or the load. No other product name.
 */

export type TrainerUnit = 'kg' | 'lb';

export type SessionTrainerSeed = {
  exerciseId: string | null;
  exerciseName: string | null;
  weight: number | null;
  reps: number | null;
  unit: TrainerUnit;
  setsLeft: number | null;
  planLabel: string | null;
};

export type SessionTrainerFacts = SessionTrainerSeed & {
  formCue: string | null;
};

type PlanLike = {
  sessions: {
    dayOffset: number;
    status: string;
    name: string;
    exercises: { exerciseId: string; sets: number; reps: number; weight: number }[];
  }[];
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function emptyTrainerSeed(unit: TrainerUnit = 'kg'): SessionTrainerSeed {
  return {
    exerciseId: null,
    exerciseName: null,
    weight: null,
    reps: null,
    unit,
    setsLeft: null,
    planLabel: null,
  };
}

/**
 * Today's open session, else the next planned session that has a lift.
 * A missing plan invents no exercise.
 */
export function sessionTrainerSeedFromPlan(
  plan: PlanLike | null | undefined,
  todayOffset: number,
  unit: TrainerUnit
): SessionTrainerSeed {
  const empty = emptyTrainerSeed(unit);
  if (!plan) return empty;
  const openToday = plan.sessions.find(
    (s) => s.dayOffset === todayOffset && s.status !== 'done' && s.exercises.length > 0
  );
  const nextPlanned = plan.sessions.find(
    (s) => s.status === 'planned' && s.exercises.length > 0
  );
  const session = openToday ?? nextPlanned ?? null;
  if (!session) return empty;
  const ex = session.exercises[0];
  if (!ex?.exerciseId) return { ...empty, planLabel: session.name };
  return {
    exerciseId: ex.exerciseId,
    exerciseName: null,
    weight: Number.isFinite(ex.weight) ? ex.weight : null,
    reps: Number.isFinite(ex.reps) ? ex.reps : null,
    unit,
    setsLeft: Number.isFinite(ex.sets) ? ex.sets : null,
    planLabel: session.name,
  };
}

/** Execute cue, else setup, else the catalog cue string. Empty invents nothing. */
export function libraryFormCue(input: {
  setup?: string[] | null;
  execute?: string[] | null;
  cues?: string | null;
}): string | null {
  const first = (lines?: string[] | null) => {
    for (const line of lines ?? []) {
      const trimmed = line.trim();
      if (trimmed) return trimmed;
    }
    return null;
  };
  return first(input.execute) ?? first(input.setup) ?? (input.cues?.trim() || null);
}

export function libraryHrefForExercise(id: string | null | undefined): string | null {
  if (!id || !SLUG.test(id)) return null;
  return `/exercises/${id}`;
}

function formatNum(n: number): string {
  if (!Number.isFinite(n)) return '';
  return Number.isInteger(n) ? String(n) : String(n);
}

/** Load the athlete can log. Zero weight is bodyweight — reps only, never "0 kg". */
export function formatTrainerLoad(facts: Pick<SessionTrainerFacts, 'weight' | 'reps' | 'unit'>): string | null {
  const reps = facts.reps != null && facts.reps > 0 ? facts.reps : null;
  const weight = facts.weight != null && facts.weight > 0 ? facts.weight : null;
  const unitWord = facts.unit === 'lb' ? 'lbs' : 'kg';
  if (weight != null && reps != null) return `${formatNum(weight)} ${unitWord} × ${formatNum(reps)}`;
  if (weight != null) return `${formatNum(weight)} ${unitWord}`;
  if (reps != null) return `${formatNum(reps)} reps`;
  return null;
}

export const TRAINER_SYSTEM_PROMPT = [
  "You are Mission Winning's personal trainer on the gym floor.",
  'One sentence, max 28 words. Second person. No medical claims.',
  'Do not name any other product. Do not change the exercise, the weight, or the reps.',
  'Use the form cue when one is given.',
  'Reply JSON only: {"line":"..."}',
].join(' ');

export function trainerUserPrompt(facts: SessionTrainerFacts): string {
  const load = formatTrainerLoad(facts);
  return [
    `Exercise: ${facts.exerciseName?.trim() || 'none'}`,
    `Next set: ${load ?? 'none'}`,
    `Form cue: ${facts.formCue?.trim() || 'none'}`,
    `Plan: ${facts.planLabel?.trim() || 'none'}`,
    `Sets left: ${facts.setsLeft != null ? String(facts.setsLeft) : 'none'}`,
  ].join('\n');
}

function numbersIn(text: string): number[] {
  const out: number[] = [];
  for (const match of text.matchAll(/-?\d+(?:\.\d+)?/g)) {
    const n = Number(match[0]);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

function sameNumber(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

function allowedNumbers(facts: SessionTrainerFacts): number[] {
  const bag: number[] = [];
  if (facts.weight != null && facts.weight > 0) bag.push(facts.weight);
  if (facts.reps != null && facts.reps > 0) bag.push(facts.reps);
  if (facts.setsLeft != null && facts.setsLeft > 0) bag.push(facts.setsLeft);
  const prose = [facts.formCue, facts.planLabel, facts.exerciseName].filter(Boolean).join(' ');
  bag.push(...numbersIn(prose));
  return bag;
}

function namesTheLift(line: string, exerciseName: string): boolean {
  const lower = line.toLowerCase();
  const name = exerciseName.trim().toLowerCase();
  if (name.length >= 3 && lower.includes(name)) return true;
  const word = name
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4)
    .sort((a, b) => b.length - a.length)[0];
  return Boolean(word && lower.includes(word));
}

/**
 * Keep a model line only when it stays on the given lift and does not
 * introduce a load we did not hand it. Other product names are refused.
 */
export function acceptTrainerLine(raw: string, facts: SessionTrainerFacts): string | null {
  const line = raw.replace(/\s+/g, ' ').trim();
  if (line.length < 8 || line.length > 220) return null;
  if (/\bmuse\b/i.test(line)) return null;
  const name = facts.exerciseName?.trim();
  if (name && !namesTheLift(line, name)) return null;
  const allowed = allowedNumbers(facts);
  for (const n of numbersIn(line)) {
    if (!allowed.some((a) => sameNumber(a, n))) return null;
  }
  return line;
}

export function readTrainerLine(raw: string, facts: SessionTrainerFacts): string | null {
  const trimmed = raw.trim();
  let candidate = trimmed;
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(trimmed.slice(start, end + 1)) as { line?: unknown };
      if (typeof parsed.line === 'string') candidate = parsed.line;
    } catch {
      candidate = trimmed;
    }
  }
  return acceptTrainerLine(candidate, facts);
}
