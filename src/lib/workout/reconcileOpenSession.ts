/**
 * Pull the signed-in open session and apply `decideOpenSession` (`.958`).
 * No Force Sync tap. Guest / no cloud is a no-op besides enqueue-ACK.
 */
import { useWorkoutStore } from '@/store/workoutStore';
import { enqueueOpenSession, pullOpenSession } from '@/lib/sync/openSessionSync';
import {
  activeFromSnapshot,
  decideOpenSession,
  snapshotFromActive,
  type OpenSessionDecision,
} from '@/lib/workout/openSessionContinuity';

export async function reconcileOpenSession(): Promise<OpenSessionDecision> {
  const store = useWorkoutStore.getState();
  store.ensureOpenSessionIdentity();
  const local = snapshotFromActive(useWorkoutStore.getState().activeWorkout);
  const remote = await pullOpenSession();
  const decision = decideOpenSession(local, remote);

  switch (decision.action) {
    case 'adopt-remote': {
      const next = remote ? activeFromSnapshot(remote) : null;
      if (next) store.restoreActiveWorkout(next);
      break;
    }
    case 'apply-tombstone':
      store.cancelActiveWorkout();
      void store.loadFromCloud();
      break;
    case 'push-local':
      if (local) enqueueOpenSession(local);
      break;
    case 'needs-confirm':
      store.setPendingRemoteOpenSession(remote);
      break;
    default:
      if (decision.action !== 'keep-local') {
        store.setPendingRemoteOpenSession(null);
      }
      break;
  }

  return decision;
}
