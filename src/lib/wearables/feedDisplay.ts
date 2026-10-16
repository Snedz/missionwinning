export type FeedReading = {
  value: number | null;
  source: string;
  observedAt: string | null;
};

export type FeedState = 'live' | 'stale' | 'no_feed' | 'disagrees';

export type FeedDisplay = {
  state: FeedState;
  label: 'NO FEED' | 'STALE' | 'DIFFERS FROM LOG' | null;
  dimmed: boolean;
  value: number | null;
  source: string | null;
  observedAt: string | null;
};

export function feedDisplay(
  reading: FeedReading | null,
  nowMs: number,
  maxAgeMs: number,
  loggedValue: number | null = null
): FeedDisplay {
  // Case 1: null reading, null value, null observedAt, or invalid observedAt
  if (
    reading === null ||
    reading.value === null ||
    reading.observedAt === null ||
    isNaN(Date.parse(reading.observedAt))
  ) {
    return {
      state: 'no_feed',
      label: 'NO FEED',
      dimmed: true,
      value: null,
      source: reading?.source ?? null,
      observedAt: null,
    };
  }

  const observedMs = Date.parse(reading.observedAt);

  // Case 2: stale reading
  if (nowMs - observedMs > maxAgeMs) {
    return {
      state: 'stale',
      label: 'STALE',
      dimmed: true,
      value: reading.value,
      source: reading.source,
      observedAt: reading.observedAt,
    };
  }

  // Case 3: disagrees with logged value
  if (loggedValue !== null && loggedValue !== reading.value) {
    return {
      state: 'disagrees',
      label: 'DIFFERS FROM LOG',
      dimmed: true,
      value: reading.value,
      source: reading.source,
      observedAt: reading.observedAt,
    };
  }

  // Case 4: live
  return {
    state: 'live',
    label: null,
    dimmed: false,
    value: reading.value,
    source: reading.source,
    observedAt: reading.observedAt,
  };
}
