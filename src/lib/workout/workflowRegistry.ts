/**
 * Workflow registry for AI-assisted workout features.
 * Pure data module — no UI, network, or external imports.
 */

export type WorkflowId = 'set-logging' | 'rest-timing' | 'plan-publish' | 'session-review';

export interface WorkflowEntry {
  readonly id: WorkflowId;
  readonly label: string;
  readonly requiredTools: readonly string[];
  readonly maxLatencyMs: number;
  readonly contextTokens: number;
  readonly qualityThreshold: number; // 0..1
  readonly fallbackProviders: readonly string[];
  readonly lastReviewed: string; // YYYY-MM-DD
}

export const WORKFLOW_REGISTRY: readonly WorkflowEntry[] = [
  {
    id: 'set-logging',
    label: 'Set Logging',
    requiredTools: ['exercise-db', 'rep-counter'],
    maxLatencyMs: 2000,
    contextTokens: 256,
    qualityThreshold: 0.85,
    fallbackProviders: ['on-device'],
    lastReviewed: '2025-01-15',
  },
  {
    id: 'rest-timing',
    label: 'Rest Timer',
    requiredTools: ['timer', 'notification'],
    maxLatencyMs: 500,
    contextTokens: 64,
    qualityThreshold: 0.95,
    fallbackProviders: ['on-device'],
    lastReviewed: '2025-01-20',
  },
  {
    id: 'plan-publish',
    label: 'Plan Publish',
    requiredTools: ['workout-db', 'share'],
    maxLatencyMs: 5000,
    contextTokens: 1024,
    qualityThreshold: 0.9,
    fallbackProviders: ['free-lane', 'low-cost-lane'],
    lastReviewed: '2025-02-01',
  },
  {
    id: 'session-review',
    label: 'Session Review',
    requiredTools: ['history-db', 'insight-gen'],
    maxLatencyMs: 8000,
    contextTokens: 2048,
    qualityThreshold: 0.8,
    fallbackProviders: ['free-lane', 'low-cost-lane'],
    lastReviewed: '2025-01-28',
  },
];

export function getWorkflow(id: string): WorkflowEntry | undefined {
  return WORKFLOW_REGISTRY.find((entry) => entry.id === id);
}

export function registryProblems(
  entries: readonly WorkflowEntry[],
  today: string,
  staleDays = 90
): string[] {
  const messages: string[] = [];
  const todayDate = new Date(today);

  for (const entry of entries) {
    // Check for empty fallbackProviders
    if (entry.fallbackProviders.length === 0) {
      messages.push(`${entry.id}: missing fallback`);
    }

    // Check for stale entry
    const reviewedDate = new Date(entry.lastReviewed);
    const diffTime = todayDate.getTime() - reviewedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > staleDays) {
      messages.push(`${entry.id}: stale entry`);
    }

    // Check for quality threshold outside 0..1
    if (entry.qualityThreshold < 0 || entry.qualityThreshold > 1) {
      messages.push(`${entry.id}: bad threshold`);
    }
  }

  return messages;
}
