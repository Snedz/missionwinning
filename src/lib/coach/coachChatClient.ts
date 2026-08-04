/**
 * Pure Coach chat client helpers — status → copy keys + stream error tags (.445).
 * UI still owns fetch/SSE; these keep HTTP and [[error:…]] mapping one-home.
 */

export type CoachChatCopy = {
  key: string;
  defaultValue: string;
  /** When true, the panel should mark the coach voice offline. */
  markOffline?: boolean;
};

const STATUS_COPY: Record<number, CoachChatCopy> = {
  429: {
    key: 'coachChatRateLimited',
    defaultValue: 'Too many messages — wait a moment and try again.',
  },
  401: {
    key: 'coachChatUnauthorized',
    defaultValue: 'Sign in again to keep chatting with your coach.',
  },
  402: {
    key: 'coachChatPremium',
    defaultValue: 'Coach chat needs an active Super Bundle.',
  },
  503: {
    key: 'coachChatOffline',
    defaultValue: 'Coach voice offline — your plan and adjustments still work.',
    markOffline: true,
  },
};

const FALLBACK_COPY: CoachChatCopy = {
  key: 'coachChatError',
  defaultValue: 'Could not reach the coach. Try again.',
};

export function coachChatCopyForStatus(status: number): CoachChatCopy {
  return STATUS_COPY[status] ?? FALLBACK_COPY;
}

export type CoachChatStreamErrorKind = 'offline' | 'quota' | 'generic';

export type CoachChatStreamError = {
  kind: CoachChatStreamErrorKind;
  copy: CoachChatCopy;
};

const STREAM_OFFLINE: CoachChatStreamError = {
  kind: 'offline',
  copy: {
    key: 'coachChatOffline',
    defaultValue: 'Coach voice offline — your plan and adjustments still work.',
    markOffline: true,
  },
};

const STREAM_QUOTA: CoachChatStreamError = {
  kind: 'quota',
  copy: {
    key: 'coachChatQuota',
    defaultValue:
      "Today's chat limit reached — resets tomorrow. Your plan and logger are unaffected.",
    markOffline: true,
  },
};

const STREAM_GENERIC: CoachChatStreamError = {
  kind: 'generic',
  copy: FALLBACK_COPY,
};

/**
 * Classify an SSE/text chunk for embedded coach error tags.
 * Returns null when the chunk is normal coach text.
 */
export function classifyCoachChatStreamChunk(chunk: string): CoachChatStreamError | null {
  if (chunk.includes('[[error:coach_offline]]')) return STREAM_OFFLINE;
  if (chunk.includes('[[error:coach_quota]]')) return STREAM_QUOTA;
  if (chunk.includes('[[error:')) return STREAM_GENERIC;
  return null;
}

export type CoachChatSessionSlim = {
  name: string;
  kind: string;
  estMinutes: number;
  exercises: { exerciseId: string }[];
};

/**
 * Request context body for `/api/coach/chat` — keeps exercise name resolve out of send().
 */
export function buildCoachChatRequestContext(params: {
  readiness: number;
  strain: number;
  recovery: number;
  exerciseId?: string | null;
  todaySession?: CoachChatSessionSlim | null;
  resolveExerciseName: (id: string) => string;
}): {
  readiness: number;
  strain: number;
  recovery: number;
  trainDays14: number;
  exerciseId?: string | null;
  todaySession?: {
    name: string;
    kind: string;
    estMinutes: number;
    exercises: { id: string; name: string }[];
  };
} {
  const { readiness, strain, recovery, exerciseId, todaySession, resolveExerciseName } = params;
  return {
    readiness,
    strain,
    recovery,
    trainDays14: 0,
    exerciseId,
    todaySession: todaySession
      ? {
          name: todaySession.name,
          kind: todaySession.kind,
          estMinutes: todaySession.estMinutes,
          exercises: todaySession.exercises.slice(0, 12).map((e) => ({
            id: e.exerciseId,
            name: resolveExerciseName(e.exerciseId),
          })),
        }
      : undefined,
  };
}
