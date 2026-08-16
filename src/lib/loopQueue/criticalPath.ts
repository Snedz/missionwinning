/**
 * Horizon W critical path — what `/harness` takes when GRAPH_LOOP is empty
 * and the idea harvest has nothing to emit.
 *
 * This is not a second queue. The claims live in ORCHESTRATION.md. Each step
 * is proven by an instrument that already exists, or it is the ticket.
 * Taste is not an input.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  EXCELLENCE_RESULT_PATH,
  readExcellenceStatus,
  type ExcellenceStatus,
} from '@/lib/excellenceGate';

export type PathOwner = 'agent' | 'founder';

export type PathStep = {
  id: string;
  claim: string;
  /** Relative to repo root. Must exist and contain `anchor`. */
  instrument: string;
  anchor: string;
  /** Must appear in ORCHESTRATION.md — a step with no home there is a ghost. */
  orchAnchor: string;
  owner: PathOwner;
  accept: string;
  /** Extra files that must exist (second instrument, not a second claim). */
  also?: readonly string[];
};

export type PathGap = PathStep & {
  reason: string;
};

/**
 * Closed checklist. Adding a W-id in ORCHESTRATION without a row here is red
 * (`criticalPath.test.ts` discovers the W-stream rows). Do not grow this by
 * taste.
 */
export const PATH_STEPS: readonly PathStep[] = [
  {
    id: 'W1',
    claim: 'I-Day lands on Today (`/log`), not an Active dump',
    instrument: 'src/lib/orchestrationW1Landing.test.ts',
    anchor: 'W1 Activation lands I-Day on Today',
    orchAnchor: 'W1 Activation',
    owner: 'agent',
    accept: 'npx tsx --test src/lib/orchestrationW1Landing.test.ts',
  },
  {
    id: 'W2',
    claim: 'Today has one next session (train / resume); Just Go does not lie',
    instrument: 'src/lib/todayPrimaryAction.test.ts',
    anchor: 'isTodayTrainReady',
    orchAnchor: 'W2 One boss CTA',
    owner: 'agent',
    accept: 'npx tsx --test src/lib/todayPrimaryAction.test.ts',
  },
  {
    id: 'W3',
    claim: 'Logger stays one-thumb; Victory stays in the train / Coach loop',
    instrument: 'src/lib/gnt1First90.test.ts',
    anchor: 'TAP_BUDGET is 4',
    orchAnchor: 'W3 Logger + Victory',
    owner: 'agent',
    accept: 'npx tsx --test src/lib/gnt1First90.test.ts src/lib/workout/workoutVictory.test.ts',
    also: ['src/lib/workout/workoutVictory.test.ts'],
  },
  {
    id: 'W4',
    claim: 'Missed day → re-entry without shame copy',
    instrument: 'src/lib/reentryCopyGuard.test.ts',
    anchor: 'shame-free',
    orchAnchor: 'W4 Coach continuity',
    owner: 'agent',
    accept: 'npx tsx --test src/lib/reentryCopyGuard.test.ts',
  },
  {
    id: 'C5',
    claim: 'Phone hero ≤90s feels intentional — founder eyes, not a builder brief',
    instrument: 'tests/e2e/first-90.spec.ts',
    anchor: 'First 90 seconds @gate',
    orchAnchor: 'Phone hero ≤90s',
    owner: 'founder',
    accept: 'npx tsx --test src/lib/gnt1First90.test.ts',
  },
];

/** Agent-required workstream rows: `| W1 Activation |` (and the parked `| W1 |` table). */
const W_STREAM = /^\|\s+\*{0,2}W(\d+)\b/;

export function orchestrationWIds(orch: string): string[] {
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(W_STREAM.source, 'gm');
  while ((m = re.exec(orch)) !== null) ids.push(`W${m[1]}`);
  return [...new Set(ids)];
}

function read(root: string, rel: string): string | null {
  const full = path.join(root, rel);
  if (!existsSync(full)) return null;
  try {
    return readFileSync(full, 'utf8');
  } catch {
    return null;
  }
}

export function excellenceStatusAt(root: string): ExcellenceStatus {
  const raw = read(root, EXCELLENCE_RESULT_PATH);
  if (raw === null) return 'unscored';
  return readExcellenceStatus(raw);
}

export function isStepProven(step: PathStep, root: string): boolean {
  const src = read(root, step.instrument);
  if (src === null || !src.includes(step.anchor)) return false;
  for (const extra of step.also ?? []) {
    if (!existsSync(path.join(root, extra))) return false;
  }
  if (step.id === 'C5') return excellenceStatusAt(root) === 'pass';
  return true;
}

/** First unproven step, in path order. C5 stays founder until RESULT is pass. */
export function firstCriticalGap(root: string): PathGap | null {
  for (const step of PATH_STEPS) {
    if (isStepProven(step, root)) continue;
    if (step.owner === 'founder' || step.id === 'C5') {
      return {
        ...step,
        owner: 'founder',
        reason: 'Horizon W phone sign-off is still unscored — founder eyes, not another letter',
      };
    }
    return {
      ...step,
      reason: `${step.instrument} does not prove ${step.id} yet`,
    };
  }
  return null;
}
