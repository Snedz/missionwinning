/**
 * The session debrief — the numbers from `load.ts` / `progress.ts` turned into
 * sentences an athlete can argue with.
 *
 * The reference is the WHOOP message that prompted this work: *"15.3 strain against
 * your 11.8 upper bound"*. What makes that land is not the model behind it — it is
 * that every clause is checkable. A number, the athlete's own baseline, a mechanism,
 * and one action. This composes the same shape out of a logbook.
 *
 * ## Rules, not prose generation
 *
 * Every line here is a template over computed values, which is the point:
 *
 * - It works offline, free, with no account and no API key. The LLM voice
 *   (`coachLlmClient`) is a Bundle-tier *rewrite* of these lines, never their source.
 *   If the model is unconfigured, unreachable or slow, the athlete still gets the
 *   debrief.
 * - It can be **tested for tone**. `reentryTone.ts` can assert that no line names an
 *   absence length or leans on a lost streak; you cannot assert that about a
 *   sentence a model will generate tomorrow.
 *
 * ## Nothing is said that is not known
 *
 * Each line is emitted only when its inputs exist. No baseline under three prior
 * sessions, no load band under 14 days of history, no PR without a previous best to
 * beat. The alternative — a confident sentence resting on two data points — is the
 * defect this repo has now removed three times.
 */

import type { CompletedWorkoutLog } from '@/types';
import { compareToBaseline, loadBands, sessionLoad } from '@/lib/coach/load';
import type { LoadZone, SessionLoad } from '@/lib/coach/load';
import { personalRecordsFor } from '@/lib/coach/progress';
import type { PersonalRecord } from '@/lib/coach/progress';
import { checkInReasons } from '@/lib/mindCheckIns';
import type { MindCheckIn, ReadinessReason } from '@/lib/mindCheckIns';

export type DebriefLineKind =
  | 'effort'
  | 'record'
  | 'band'
  | 'readiness'
  | 'action'
  | 'question';

export interface DebriefLine {
  kind: DebriefLineKind;
  text: string;
}

export interface Debrief {
  lines: DebriefLine[];
  session: SessionLoad;
  records: PersonalRecord[];
  zone: LoadZone;
  /** Reply chips for the closing question — these feed the next plan adaptation. */
  replies: string[];
}

export interface DebriefInput {
  log: CompletedWorkoutLog;
  history: CompletedWorkoutLog[];
  checkIn?: Pick<MindCheckIn, 'sleep' | 'stress' | 'energy' | 'soreness'> | null;
  /** Weight unit label for display, e.g. "kg". */
  unit?: string;
  now?: Date;
}

const FACTOR_WORD: Record<ReadinessReason['factor'], string> = {
  sleep: 'sleep',
  soreness: 'soreness',
  energy: 'energy',
  stress: 'stress',
};

function effortLine(session: SessionLoad, deltaPct: number | null, unit: string): string {
  const moved = session.tonnage > 0 ? `${session.tonnage.toLocaleString()} ${unit} moved` : null;
  const setWord = session.workingSets === 1 ? 'working set' : 'working sets';
  const shape = `${session.workingSets} ${setWord} in ${session.durationMinutes} min`;
  const head = moved ? `${moved}, ${shape}` : shape;

  if (deltaPct === null) return `${head}.`;
  // Deliberately not "you're slacking" / "beast mode" — the number carries it.
  if (deltaPct >= 15) return `${head} — about ${deltaPct}% above your recent average.`;
  if (deltaPct <= -15) return `${head} — around ${Math.abs(deltaPct)}% lighter than usual.`;
  return `${head} — right around your usual.`;
}

function recordLine(pr: PersonalRecord, unit: string): string | null {
  const name = pr.exerciseId.replace(/-/g, ' ');
  if (pr.previous === null) return null; // first-ever is not a record broken
  if (pr.kind === 'weight') return `Best ${name} weight: ${pr.value} ${unit}, past ${pr.previous}.`;
  if (pr.kind === 'reps') return `Most ${name} reps at a working weight: ${pr.value}.`;
  return `Estimated ${name} 1RM now ${pr.value} ${unit}, up from ${pr.previous}.`;
}

/**
 * The band sentence — the closest analogue to WHOOP's "against your upper bound",
 * and the one most at risk of sounding like a diagnosis. It describes the comparison
 * and stops. `load.ts` explains at length why it must not predict.
 */
function bandLine(zone: LoadZone, ratio: number | null): string | null {
  if (zone === 'unknown' || ratio === null) return null;
  if (zone === 'high') {
    return `Your last week is running heavier than your month — worth a lighter session next, or an extra rest day.`;
  }
  if (zone === 'light') {
    return `Your last week is lighter than your month. Room to add a set or a session when you want it.`;
  }
  return `Your week is tracking with your month. Steady is what makes this work.`;
}

function readinessLine(reasons: ReadinessReason[]): string | null {
  const negatives = reasons.filter((r) => r.points < 0);
  if (negatives.length === 0) return null;
  const lead = negatives[0];
  const word = FACTOR_WORD[lead.factor];
  return `You rated ${word} ${lead.rating}/5 today, so the next session is scaled to match.`;
}

/** One action, and only when there is something specific to say. */
function actionLine(zone: LoadZone, hadHardCheckIn: boolean): string | null {
  if (hadHardCheckIn) return `Tonight: food, water, and an earlier night than usual.`;
  if (zone === 'high') return `Tonight: hydrate, and protect your sleep window.`;
  return null;
}

export function buildDebrief(input: DebriefInput): Debrief {
  const now = input.now ?? new Date();
  const unit = input.unit ?? 'kg';
  const session = sessionLoad(input.log);

  // The session must not land in its own baseline, or nothing ever looks unusual.
  // That guard lives in `compareToBaseline`, which only counts sessions dated
  // strictly before this one — verified by falsification: an id-filter here as well
  // changed no test outcome, because it was guarding something already guarded.
  // Left as a comment rather than dead defensive code with a confident claim on it.
  const { deltaPct } = compareToBaseline(session, input.history, now);
  const bands = loadBands(input.history, now);
  const records = personalRecordsFor(input.log, input.history);
  const reasons = checkInReasons(input.checkIn ?? null);
  const hadHardCheckIn = reasons.some((r) => r.points <= -4);

  const lines: DebriefLine[] = [
    { kind: 'effort', text: effortLine(session, deltaPct, unit) },
  ];

  for (const pr of records) {
    const text = recordLine(pr, unit);
    if (text) lines.push({ kind: 'record', text });
  }

  const band = bandLine(bands.zone, bands.ratio);
  if (band) lines.push({ kind: 'band', text: band });

  const readiness = readinessLine(reasons);
  if (readiness) lines.push({ kind: 'readiness', text: readiness });

  const action = actionLine(bands.zone, hadHardCheckIn);
  if (action) lines.push({ kind: 'action', text: action });

  lines.push({
    kind: 'question',
    text: 'Did that run hotter than planned, or was it the work you wanted?',
  });

  return {
    lines,
    session,
    records,
    zone: bands.zone,
    replies: ['Harder than expected', 'Exactly what I wanted', 'Too easy'],
  };
}
