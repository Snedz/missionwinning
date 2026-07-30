/**
 * The behavior journal — twelve questions, each with its receipts.
 *
 * WHOOP's journal offers 300+ trackable behaviors and then advises tracking no
 * more than ten. That tension is their defect, not their feature: with a low
 * significance bar and dozens of behavior×outcome pairs, spurious findings are
 * guaranteed, which is why their loudest review complaint is that "every
 * positive action seemed to have negative impacts."
 *
 * So this ships **twelve**, chosen on evidence, each carrying a tier and a
 * one-sentence receipt the athlete can open. Three of them (sleep quality,
 * soreness, stress) already exist as 1–5 ratings on `MindCheckIn` and stay
 * exactly where they are — this module owns the nine that are new.
 *
 * ## Two rules that make the correlations honest later
 *
 * 1. **One pre-registered outcome per behavior** (`outcome`). Choosing the
 *    outcome up front, in code, is what structurally kills the
 *    multiple-comparisons problem — you cannot fish for the metric that happens
 *    to move. v1 registers `sessionLoad` for everything; e1RM trend and
 *    RPE-at-matched-load are future members of that union, added deliberately.
 * 2. **A declared lag** (`lag`). Alcohol tonight is a claim about *tomorrow's*
 *    session, not tonight's. Encoding it here means the pairing code cannot
 *    quietly compare a drink to a session that finished before it.
 *
 * Evidence tiers are shown to the athlete, including the weak one: `lateMeal`
 * is C and says so. Publicly grading our own feature as thinly-evidenced is a
 * trust position no wellness brand with a subscription to defend will copy.
 *
 * Deliberately absent: medication, reproductive health, and recreational
 * substances. Those are special-category data under GDPR and a legal surface
 * this app has no reason to touch — the safest place for that data is a field
 * that never existed.
 */

export type EvidenceTier = 'A' | 'B' | 'C';

export type BehaviorId =
  | 'bedTime'
  | 'wakeTime'
  | 'proteinHit'
  | 'caffeine'
  | 'creatine'
  | 'hydration'
  | 'alcohol'
  | 'screenInBed'
  | 'lateMeal'
  | 'restDay';

/**
 * The behavior half of a day's check-in. One nested object rather than ten flat
 * fields, deliberately: `normalizeCheckIn` is a whitelist reconstruction, so
 * every top-level field is a chance to silently drop data on read. One field is
 * one thing to audit.
 */
export interface BehaviorEntry {
  /** "HH:MM" local, quarter-hour resolution. Self-report — trend only, never a measurement. */
  bedTime?: string;
  wakeTime?: string;
  proteinHit?: boolean;
  /** 0–10 servings. Zero is a real answer ("I had none"), not an absence. */
  caffeineServings?: number;
  /** "HH:MM" of the last serving — the timing is the whole insight. */
  caffeineLastAt?: string;
  creatine?: boolean;
  hydration?: boolean;
  alcoholServings?: number;
  screenInBed?: boolean;
  lateMeal?: boolean;
  restDay?: boolean;
}

/** The single outcome a behavior is registered against. Widening this is a decision, not a detail. */
export type BehaviorOutcome = 'sessionLoad';

export interface BehaviorDef {
  id: BehaviorId;
  tier: EvidenceTier;
  labelKey: string;
  labelDefault: string;
  /** "Why we track this" — the receipt. Every behavior has one; a test asserts it. */
  receiptKey: string;
  receiptDefault: string;
  outcome: BehaviorOutcome;
  lag: 'same-day' | 'next-day';
  kind: 'time' | 'count' | 'boolean';
}

export const MAX_SERVINGS = 10;

/**
 * Receipts describe what the literature found and stop. No second person
 * imperative, no "you should" — LEGAL_SAFETY §3a, and the FDA's 2026 wellness
 * guidance reads UI output as claim text.
 */
export const BEHAVIORS: readonly BehaviorDef[] = [
  {
    id: 'bedTime',
    tier: 'A',
    kind: 'time',
    labelKey: 'behaviorBedTime',
    labelDefault: 'In bed around',
    receiptKey: 'behaviorBedTimeWhy',
    receiptDefault:
      'Sleep regularity predicted health outcomes more strongly than sleep duration in a 60,000-person accelerometry study. Two taps give us consistency, which duration alone cannot.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'wakeTime',
    tier: 'A',
    kind: 'time',
    labelKey: 'behaviorWakeTime',
    labelDefault: 'Up around',
    receiptKey: 'behaviorWakeTimeWhy',
    receiptDefault:
      'The second half of the consistency pair. Bed and wake times together describe the rhythm; either one alone does not.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'proteinHit',
    tier: 'A',
    kind: 'boolean',
    labelKey: 'behaviorProtein',
    labelDefault: 'Hit protein target',
    receiptKey: 'behaviorProteinWhy',
    receiptDefault:
      'Dose-response meta-analysis: strength gains rise with protein intake up to roughly 1.5 g/kg/day, then plateau. One of the few training inputs with a known dose curve.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'caffeine',
    tier: 'A',
    kind: 'count',
    labelKey: 'behaviorCaffeine',
    labelDefault: 'Caffeine servings',
    receiptKey: 'behaviorCaffeineWhy',
    receiptDefault:
      'Caffeine reliably improves power output and lowers perceived effort, and its half-life ranges from 2 to 10 hours between people. That spread is exactly what tracking your own timing can settle.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'creatine',
    tier: 'A',
    kind: 'boolean',
    labelKey: 'behaviorCreatine',
    labelDefault: 'Creatine taken',
    receiptKey: 'behaviorCreatineWhy',
    receiptDefault:
      'The compound is among the best-evidenced in sport; the variable is adherence. Muscle stores decay over weeks without it, and the research is clear that daily consistency matters far more than timing.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'hydration',
    tier: 'B',
    kind: 'boolean',
    labelKey: 'behaviorHydration',
    labelDefault: 'Hit fluid target',
    receiptKey: 'behaviorHydrationWhy',
    receiptDefault:
      'Meta-analysis puts strength around 5% lower when hypohydrated past roughly 2% of body mass — though trained lifters are measurably less affected than untrained ones.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'alcohol',
    tier: 'A',
    kind: 'count',
    labelKey: 'behaviorAlcohol',
    labelDefault: 'Alcoholic drinks',
    receiptKey: 'behaviorAlcoholWhy',
    receiptDefault:
      'At high doses — around twelve drinks in the study — post-exercise muscle protein synthesis fell by a quarter or more. At one or two drinks the evidence is genuinely thin, and we would rather say so than imply otherwise.',
    outcome: 'sessionLoad',
    lag: 'next-day',
  },
  {
    id: 'screenInBed',
    tier: 'B',
    kind: 'boolean',
    labelKey: 'behaviorScreenInBed',
    labelDefault: 'Screen time in bed',
    receiptKey: 'behaviorScreenInBedWhy',
    receiptDefault:
      'Evening light exposure and screen use interfere with sleep-onset signals. The mechanism is well described; the measured effect sizes are modest.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
  {
    id: 'lateMeal',
    tier: 'C',
    kind: 'boolean',
    labelKey: 'behaviorLateMeal',
    labelDefault: 'Ate close to bedtime',
    receiptKey: 'behaviorLateMealWhy',
    receiptDefault:
      'Emerging and mixed. Eating within three hours of bed has been associated with more night waking, but a controlled trial found no effect on overnight recovery markers. We track it because it is asked for, and we are telling you the evidence is unsettled.',
    outcome: 'sessionLoad',
    lag: 'next-day',
  },
  {
    id: 'restDay',
    tier: 'B',
    kind: 'boolean',
    labelKey: 'behaviorRestDay',
    labelDefault: 'Planned rest day',
    receiptKey: 'behaviorRestDayWhy',
    receiptDefault:
      'Recorded so the other behaviors are read against a fair comparison. Without it, a deliberate rest day looks identical to a session that went badly.',
    outcome: 'sessionLoad',
    lag: 'same-day',
  },
] as const;

export function behaviorById(id: BehaviorId): BehaviorDef | undefined {
  return BEHAVIORS.find((b) => b.id === id);
}

/**
 * "HH:MM" → nearest quarter hour, or null for anything unparseable.
 *
 * Never throws: this runs over whatever is in device storage, including data
 * written by an older build. Quarter-hour resolution is a truth claim — the
 * agreement between self-reported and measured sleep timing does not support
 * minutes, let alone the seconds WHOOP prints.
 */
export function roundToQuarterHour(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min)) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  const total = h * 60 + min;
  const rounded = Math.round(total / 15) * 15;
  // 23:53 rounds to 24:00 — that is midnight of the next day, written 00:00.
  const wrapped = rounded % (24 * 60);
  const rh = Math.floor(wrapped / 60);
  const rm = wrapped % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}

function servings(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  // Zero is a real answer ("none today"), which is why this cannot reuse the
  // 1–5 clamp the rating fields use.
  return Math.min(MAX_SERVINGS, Math.max(0, Math.round(value)));
}

function bool(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

/** Undefined when the athlete logged nothing — an empty object is not a day's data. */
export function normalizeBehaviors(raw: unknown): BehaviorEntry | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const entry: BehaviorEntry = {};
  const bed = roundToQuarterHour(r.bedTime);
  if (bed) entry.bedTime = bed;
  const wake = roundToQuarterHour(r.wakeTime);
  if (wake) entry.wakeTime = wake;
  const caffeine = servings(r.caffeineServings);
  if (caffeine !== undefined) entry.caffeineServings = caffeine;
  const caffeineAt = roundToQuarterHour(r.caffeineLastAt);
  if (caffeineAt) entry.caffeineLastAt = caffeineAt;
  const alcohol = servings(r.alcoholServings);
  if (alcohol !== undefined) entry.alcoholServings = alcohol;
  for (const key of ['proteinHit', 'creatine', 'hydration', 'screenInBed', 'lateMeal', 'restDay'] as const) {
    const v = bool(r[key]);
    if (v !== undefined) entry[key] = v;
  }
  return Object.keys(entry).length > 0 ? entry : undefined;
}

/**
 * Merge a partial behavior write over what today already holds.
 *
 * The reason this exists: `upsertTodayPartial` is how a victory-sheet reply chip
 * writes one energy rating, and it reconstructs the whole check-in. Without an
 * explicit merge here, tapping a chip in the evening would erase a morning's
 * behavior log with no error anywhere.
 */
export function mergeBehaviors(
  partial: BehaviorEntry | undefined,
  existing: BehaviorEntry | undefined
): BehaviorEntry | undefined {
  const base = normalizeBehaviors(existing) ?? {};
  const incoming = normalizeBehaviors(partial) ?? {};
  const merged = { ...base, ...incoming };
  return Object.keys(merged).length > 0 ? merged : undefined;
}

/**
 * Footer strings for the journal timeline — "Caffeine 2", never "Caffeine 2/5".
 * The ratings are out of five; a count of servings is not, and rendering it that
 * way would quietly misreport the athlete's own answer.
 */
export function formatBehaviorFooter(entry: BehaviorEntry | undefined): string[] {
  const e = normalizeBehaviors(entry);
  if (!e) return [];
  const out: string[] = [];
  if (e.bedTime) out.push(`Bed ${e.bedTime}`);
  if (e.wakeTime) out.push(`Up ${e.wakeTime}`);
  if (e.caffeineServings !== undefined) {
    out.push(
      e.caffeineLastAt
        ? `Caffeine ${e.caffeineServings} (last ${e.caffeineLastAt})`
        : `Caffeine ${e.caffeineServings}`
    );
  }
  if (e.alcoholServings !== undefined) out.push(`Alcohol ${e.alcoholServings}`);
  const flags: [keyof BehaviorEntry, string][] = [
    ['proteinHit', 'Protein'],
    ['creatine', 'Creatine'],
    ['hydration', 'Hydration'],
    ['screenInBed', 'Screen in bed'],
    ['lateMeal', 'Late meal'],
    ['restDay', 'Rest day'],
  ];
  for (const [key, label] of flags) {
    const v = e[key];
    if (typeof v === 'boolean') out.push(`${label} ${v ? 'yes' : 'no'}`);
  }
  return out;
}
