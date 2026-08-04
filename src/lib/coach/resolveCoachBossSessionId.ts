/**
 * Which session gets the filled Start on `/coach` — today if still pending,
 * else the next upcoming pending day (D12 one-red rule). Pure SoT for the grid (.442).
 */

export type BossSessionRef = {
  id: string;
  dayOffset: number;
  status: string;
};

export function resolveCoachBossSessionId(
  sessions: BossSessionRef[],
  todayOffset: number
): string | undefined {
  const pending = sessions
    .filter((s) => s.status !== 'done')
    .slice()
    .sort((a, b) => a.dayOffset - b.dayOffset);
  const todayPending = pending.find((s) => s.dayOffset === todayOffset);
  const nextPending =
    pending.find((s) => s.dayOffset >= todayOffset) ?? pending[0];
  return (todayPending ?? nextPending)?.id;
}
