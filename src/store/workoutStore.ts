/**
 * Zustand store — active workout, history, saved templates, rest timer.
 * Consumers: ActiveWorkoutPage, BuilderPage, HomePage
 * See: src/store/INDEX.md
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ActiveWorkout,
  CompletedWorkoutLog,
  LoggedSet,
  SavedWorkout,
  SetKind,
  WorkoutExerciseTemplate,
} from "@/types";
import { countsTowardVolume } from "@/lib/workout/setKind";
import { parseOptionalRir } from "@/lib/workout/rir";
import { parseOptionalRpe10 } from "@/lib/workout/rpe10";
import { parseOptionalLoadPct } from "@/lib/workout/setRowPercent";
import { lastTempoForExercise, parseOptionalTempo, rememberLastTempo } from "@/lib/workout/tempo";
import { advanceAfterLog, groupWithNext, stripOrphanGroups, unpair } from "@/lib/workout/superset";
import {
  parseSetSide,
  suggestNextSide,
  type SetSide,
} from "@/lib/workout/unilateral";
import { attachSessionNote } from "@/lib/workout/sessionNote";
import { getUserWorkoutHistory, getUserWorkoutsUpdatedSince, getUser } from "@/lib/supabase";
import { recordWorkoutCompleted } from "@/lib/challenges";
import { applyWorkoutRewards } from "@/lib/rewards/apply";
import { scheduleLeaderboardPush } from "@/lib/leaderboardSync";
import { mapCloudToLocal, mergeWorkoutHistoriesDetailed } from "@/lib/workout/workoutMerge";
import { track } from "@/lib/analytics";
import { recordWorkingSetLogged } from "@/lib/week4Logger";
import { setActiveWorkoutFlag } from "@/lib/workout/activeWorkoutPulse";
import { enqueueWorkoutUpsert } from "@/lib/sync/workoutSync";
import { enqueueOpenSession } from "@/lib/sync/openSessionSync";
import { flush as flushOutbox } from "@/lib/sync/outbox";
import { newClientId } from "@/lib/workout/clientId";
import {
  snapshotFromActive,
  tombstoneFromActive,
  touchOpenSession,
  type OpenSessionSnapshot,
} from "@/lib/workout/openSessionContinuity";
import { skipExerciseThisSession, swapExerciseThisSession } from "@/lib/workout/sessionExerciseOnce";
import { reorderSessionExercises } from "@/lib/workout/sessionReorder";
import { loadCustomExercises } from "@/lib/workout/customExercise";
import {
  applyMergeExercises,
  knownIdsForMerge,
  loadMergePrefMaps,
  persistMergedCustoms,
  persistMergedPrefs,
} from "@/lib/workout/mergeExercises";
import {
  applyDeleteFinishedSession,
  applyRestoreFinishedSession,
} from "@/lib/workout/deleteFinishedSession";
import { applyNameFinishedSession } from "@/lib/workout/nameFinishedSession";
import { finishPartialFromActive, protectLiveStart } from "@/lib/workout/sessionResume";
import { readRaw, writeRaw } from "@/lib/storage/safeStorage";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { browserStorage, dedupeWrites } from "@/store/persistDedupe";
import {
  readSessionClock,
  sessionElapsedSeconds,
  startSessionClock,
  toggleSessionClock as applySessionClockToggle,
} from "@/lib/workout/sessionClock";
import {
  IDLE_WORK_CLOCK,
  resolveWorkClockStart,
  tickWorkClock as nextWorkClockTick,
  type WorkClockKind,
} from "@/lib/workout/workClock";
import {
  FALLBACK_REST_SECONDS,
  rememberLastRest,
  rememberedRestAfterAdjust,
  resolveStartRestSeconds,
  type RestLane,
} from "@/lib/workout/restTimer";

/**
 * Set by `onRehydrateStorage`. Declared before `create()` on purpose: with a
 * synchronous storage zustand invokes that callback while `create()` is still
 * running, so anything it touches must already be initialised.
 */
let rehydrateSettled = false;

function syncActiveFlag(active: { exercises?: unknown } | null | undefined) {
  setActiveWorkoutFlag(!!active);
}

interface WorkoutState {
  savedWorkouts: SavedWorkout[];
  workoutHistory: CompletedWorkoutLog[];
  activeWorkout: ActiveWorkout | null;
  restSecondsRemaining: number;
  restTimerActive: boolean;
  restTimerInitialSeconds: number;
  /** Exercise the running rest belongs to — memory only, like other restTimer*. */
  restExerciseId: string | null;
  /** Warmup vs work for the running rest — memory only (`.995`). */
  restLane: RestLane | null;
  /** In-set EMOM / AMRAP — memory only, not rest (`.987`). */
  workClockKind: WorkClockKind | null;
  workClockActive: boolean;
  workClockRemaining: number;
  workClockInitialSeconds: number;
  elapsedSeconds: number;
  /** False until persist finishes merging localStorage (avoids Start wipe race). */
  hasHydrated: boolean;

  addSavedWorkout: (workout: Omit<SavedWorkout, "id" | "createdAt">) => void;
  replaceSavedWorkout: (
    id: string,
    workout: Omit<SavedWorkout, "id" | "createdAt">
  ) => void;
  deleteSavedWorkout: (id: string) => void;
  startWorkout: (name: string, exercises: WorkoutExerciseTemplate[], workoutId?: string) => void;
  startEmptyWorkout: () => void;
  cancelActiveWorkout: () => void;
  completeActiveWorkout: () => CompletedWorkoutLog | null;
  addExerciseToActive: (exerciseId: string, muscleGroups?: import('@/types').MuscleGroup[]) => void;
  logSet: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number,
    rpe?: 'easy' | 'med' | 'hard',
    isPr?: boolean,
    durationSeconds?: number
  ) => void;
  logSetAndAdvance: (
    exerciseIndex: number,
    setIndex: number,
    reps: number,
    weight: number,
    isPr?: boolean,
    durationSeconds?: number
  ) => { exerciseIndex: number; setIndex: number } | null;
  rateSet: (exerciseIndex: number, setIndex: number, rpe: 'easy' | 'med' | 'hard') => void;
  /** Optional 0–5 RIR after log — never stamped by `logSet` (`.725`). */
  rateSetRir: (exerciseIndex: number, setIndex: number, rir: number | undefined) => void;
  /** Optional 1–10 RPE after log — never stamped by `logSet` (`.967`). */
  rateSetRpe10: (exerciseIndex: number, setIndex: number, rpe10: number | undefined) => void;
  /** Optional % of known max — never stamped by `logSet` (`.981`). */
  setSetLoadPct: (exerciseIndex: number, setIndex: number, loadPct: number | undefined) => void;
  /** Optional ecc/pause/con after log — last tempo prefills on `logSet` (`.734`). */
  rateSetTempo: (
    exerciseIndex: number,
    setIndex: number,
    tempo: import('@/types').SetTempo | undefined
  ) => void;
  /** Hold / finish time after log — never stamped by `logSet` (`.994`). */
  setSetDuration: (exerciseIndex: number, setIndex: number, durationSeconds: number | undefined) => void;
  setSetKind: (exerciseIndex: number, setIndex: number, kind: SetKind) => void;
  setSetSide: (exerciseIndex: number, setIndex: number, side: SetSide | undefined) => void;
  toggleSupersetWithNext: (exerciseIndex: number) => void;
  unlinkSuperset: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  /** Insert planned warmup sets before the first incomplete set (free batch). */
  insertWarmupRampOnExercise: (
    exerciseIndex: number,
    ramp: { reps: number; weight: number }[]
  ) => void;
  /** Removes one not-yet-completed set (athlete-owned warmup / extra planned). */
  removePlannedSetAt: (exerciseIndex: number, setIndex: number) => void;
  /** Removes the last not-yet-completed set (planned-too-many case). */
  removeLastPlannedSet: (exerciseIndex: number) => void;
  removeExerciseFromActive: (exerciseIndex: number) => void;
  /** Skip this exercise once — this session. Keeps logged sets. */
  skipExerciseInActive: (exerciseIndex: number) => void;
  /** Move this exercise in the live list — this session (`.998`). */
  reorderExerciseInActive: (fromIndex: number, toIndex: number) => void;
  /** Swap to a different exercise — only while no sets are completed. */
  replaceExerciseInActive: (
    exerciseIndex: number,
    newExerciseId: string,
    muscleGroups?: import('@/types').MuscleGroup[]
  ) => void;
  setExerciseNote: (exerciseIndex: number, note: string) => void;
  /** Session-level jot — stays on this device; copied onto the log at finish (`.982`). */
  setSessionNote: (note: string) => void;
  /** Receipt add / edit of a finished session note. Local only. Empty clears. */
  setHistorySessionNote: (logId: string, note: string) => void;
  /** History Save of a finished session they own. Same id. Never wipes. */
  saveEditedHistoryLog: (log: CompletedWorkoutLog) => CompletedWorkoutLog | null;
  /** History Save of a past session they typed. New id. Leaves the live set. */
  saveBackfillLog: (log: CompletedWorkoutLog) => CompletedWorkoutLog | null;
  /** Confirm-gated merge of two exercise ids. Source identity gone. */
  applyMergedExercises: (sourceId: string, keeperId: string) => boolean;
  /** History delete of one finished session. Confirm lives in the helper. Leaves the live set. */
  deleteFinishedHistoryLog: (sessionId: string) => CompletedWorkoutLog | null;
  /** History restore of one tombstone. Empty / not-deleted / live invents nothing (`.1006`). */
  restoreFinishedHistoryLog: (sessionId: string) => CompletedWorkoutLog | null;
  /** History name of one finished session. Empty title is allowed (`.1007`). */
  nameFinishedHistoryLog: (sessionId: string, title: string) => CompletedWorkoutLog | null;
  /** History confirm-gated import of the diary file `.1011` saved (`.1013`). */
  applyImportedHistory: (next: CompletedWorkoutLog[]) => boolean;
  startRestTimer: (seconds?: number, exerciseId?: string, lane?: RestLane) => void;
  adjustRestTimer: (delta: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  startWorkClock: (kind: WorkClockKind, seconds?: number) => void;
  tickWorkClock: () => void;
  stopWorkClock: () => void;
  tickElapsed: () => void;
  /** Pause / resume the SESSION elapsed clock — not rest, not EMOM (`.1001`). */
  toggleSessionClock: () => void;
  getRecentHistory: (limit?: number) => CompletedWorkoutLog[];
  loadFromCloud: () => Promise<void>;
  syncCurrentHistoryToCloud: () => Promise<void>;
  /** Other-device open session waiting on confirm (memory only — `.958`). */
  pendingRemoteOpenSession: OpenSessionSnapshot | null;
  setPendingRemoteOpenSession: (remote: OpenSessionSnapshot | null) => void;
  restoreActiveWorkout: (active: ActiveWorkout) => void;
  acceptPendingRemoteOpenSession: () => void;
  /** Stamp `clientId` once on a pre-`.958` persist. Never mint a second id. */
  ensureOpenSessionIdentity: () => void;
}

import { templateSetsToLogged } from '@/lib/workout/workoutTemplate';
import { materializeTemplates } from '@/lib/workout/materializeProgram';
import { applyHistoryNote } from '@/lib/workout/exerciseNote';
import {
  insertWarmupSets,
  removePlannedSetAt,
  warmupRampAlreadyPresent,
} from '@/lib/workout/warmupRamp';

function createLoggedSets(count: number, reps = 0, weight = 0): LoggedSet[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `set-${now}-${i}`,
    reps,
    weight,
    completed: false,
    kind: 'normal' as SetKind,
  }));
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      restSecondsRemaining: 0,
      restTimerActive: false,
      restTimerInitialSeconds: FALLBACK_REST_SECONDS,
      restExerciseId: null,
      restLane: null,
      ...IDLE_WORK_CLOCK,
      elapsedSeconds: 0,
      hasHydrated: false,
      pendingRemoteOpenSession: null,

      addSavedWorkout: (workout) => {
        const newWorkout: SavedWorkout = {
          ...workout,
          id: `workout-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ savedWorkouts: [...s.savedWorkouts, newWorkout] }));
      },

      replaceSavedWorkout: (id, workout) => {
        set((s) => ({
          savedWorkouts: s.savedWorkouts.map((row) =>
            row.id === id
              ? {
                  ...row,
                  name: workout.name,
                  exercises: workout.exercises,
                  ...(workout.note !== undefined ? { note: workout.note } : {}),
                }
              : row
          ),
        }));
      },

      deleteSavedWorkout: (id) => {
        set((s) => ({
          savedWorkouts: s.savedWorkouts.filter((w) => w.id !== id),
        }));
      },

      startWorkout: (name, exercises, workoutId) => {
        // `.963` — leave Today / week / Wednesday must not mint a second session.
        if (protectLiveStart(get().activeWorkout) === 'keep') return;
        // %-authored program sets resolve against the athlete's history at start
        // time, so a saved cycle keeps its percentages and re-anchors each run.
        const units = readRaw(STORAGE_KEYS.units) === 'imperial' ? 'imperial' : 'metric';
        const history = get().workoutHistory;
        const resolved = materializeTemplates(exercises, history, units);
        const startedAt = new Date().toISOString();
        const active: ActiveWorkout = touchOpenSession({
          workoutId,
          workoutName: name,
          startedAt,
          sessionClock: startSessionClock(startedAt),
          exercises: stripOrphanGroups(
            resolved.map((ex) =>
              applyHistoryNote(
                {
                  exerciseId: ex.exerciseId,
                  sets: templateSetsToLogged(ex),
                  ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
                  ...(ex.prescribed ? { prescribed: true } : {}),
                  ...(ex.supersetGroup?.trim()
                    ? { supersetGroup: ex.supersetGroup.trim() }
                    : {}),
                },
                history
              )
            )
          ),
        });
        syncActiveFlag(active);
        set({
          activeWorkout: active,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: FALLBACK_REST_SECONDS,
          restExerciseId: null,
          restLane: null,
          ...IDLE_WORK_CLOCK,
          pendingRemoteOpenSession: null,
        });
        enqueueOpenSession(snapshotFromActive(active));
      },

      startEmptyWorkout: () => {
        if (protectLiveStart(get().activeWorkout) === 'keep') return;
        const startedAt = new Date().toISOString();
        const active = touchOpenSession({
          workoutName: "Quick Workout",
          startedAt,
          sessionClock: startSessionClock(startedAt),
          exercises: [] as ActiveWorkout['exercises'],
        });
        syncActiveFlag(active);
        set({
          activeWorkout: active,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: FALLBACK_REST_SECONDS,
          restExerciseId: null,
          restLane: null,
          ...IDLE_WORK_CLOCK,
          pendingRemoteOpenSession: null,
        });
        enqueueOpenSession(snapshotFromActive(active));
      },

      cancelActiveWorkout: () => {
        const tomb = tombstoneFromActive(get().activeWorkout);
        syncActiveFlag(null);
        set({
          activeWorkout: null,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          ...IDLE_WORK_CLOCK,
          restTimerInitialSeconds: FALLBACK_REST_SECONDS,
          restExerciseId: null,
          restLane: null,
          pendingRemoteOpenSession: null,
        });
        if (tomb) enqueueOpenSession(tomb);
      },

      completeActiveWorkout: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return null;

        // Prefer muscle groups already on the active log (set when exercise was added).
        // Avoid importing the full exercise catalog into every page that uses this store.
        // `.963` — Finish-partial: logged work only; leftover empty sets invent no volume.
        const partial = finishPartialFromActive(activeWorkout);
        if (!partial) {
          // Keep the active session — empty Finish is a no-op, not a discard.
          return null;
        }
        const { exercises, volume } = partial;
        const allSets = exercises.flatMap((e) => e.sets).filter((s) => countsTowardVolume(s.kind));
        const completedAt = new Date().toISOString();
        const log: CompletedWorkoutLog = attachSessionNote(
          {
            id: `log-${Date.now()}`,
            clientId: newClientId(),
            revision: 1,
            updatedAt: completedAt,
            workoutName: activeWorkout.workoutName,
            startedAt: activeWorkout.startedAt,
            completedAt,
            durationSeconds: sessionElapsedSeconds(readSessionClock(activeWorkout)),
            exercises,
            totalVolume: volume,
          },
          activeWorkout.sessionNote
        );

        const isFirstWorkout = get().workoutHistory.length === 0;

        const tomb = tombstoneFromActive(activeWorkout);
        syncActiveFlag(null);
        set((s) => ({
          workoutHistory: [log, ...s.workoutHistory],
          activeWorkout: null,
          elapsedSeconds: 0,
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: FALLBACK_REST_SECONDS,
          restExerciseId: null,
          restLane: null,
          ...IDLE_WORK_CLOCK,
          pendingRemoteOpenSession: null,
        }));

        recordWorkoutCompleted(log);
        // Rewards after history includes this log (totalWorkoutsAfter).
        applyWorkoutRewards(log, get().workoutHistory);

        if (isFirstWorkout) track("first_workout_completed");
        track("workout_completed", {
          sets: allSets.length,
          volume: log.totalVolume,
          durationMin: Math.round(log.durationSeconds / 60),
        });

        // Cloud write first so a following leaderboard flush can see this session.
        if (tomb) enqueueOpenSession(tomb);
        enqueueWorkoutUpsert(log);

        const savedCount = get().savedWorkouts.length;
        scheduleLeaderboardPush(get().workoutHistory, savedCount);

        return log;
      },

      addExerciseToActive: (exerciseId, muscleGroups) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return {
            activeWorkout: touchOpenSession({
              ...s.activeWorkout,
              exercises: [
                ...s.activeWorkout.exercises,
                applyHistoryNote(
                  {
                    exerciseId,
                    sets: createLoggedSets(3),
                    ...(muscleGroups?.length ? { muscleGroups: [...muscleGroups] } : {}),
                  },
                  s.workoutHistory
                ),
              ],
            }),
          };
        });
        enqueueOpenSession(snapshotFromActive(get().activeWorkout));
      },

      logSet: (exerciseIndex, setIndex, reps, weight, rpe, isPr, durationSeconds) => {
        // Time-to-first-set is the one number that says whether the first 90
        // seconds works. Fire once, on the very first set this device ever logs.
        const before = get();
        const isFirstEverSet =
          before.workoutHistory.length === 0 &&
          !before.activeWorkout?.exercises.some((ex) => ex.sets.some((x) => x.completed));

        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          const lastTempo = lastTempoForExercise(
            ex.exerciseId,
            sets.filter((x) => x.completed),
            s.workoutHistory
          );
          const hold = Number(durationSeconds);
          sets[setIndex] = {
            ...sets[setIndex],
            reps,
            weight,
            completed: true,
            rpe,
            kind: sets[setIndex].kind ?? 'normal',
            isPr: isPr || undefined,
            ...(lastTempo ? { tempo: lastTempo } : {}),
            ...(Number.isFinite(hold) && hold > 0
              ? { durationSeconds: Math.round(hold) }
              : {}),
          };
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          if (lastTempo) rememberLastTempo(ex.exerciseId, lastTempo);
          return {
            activeWorkout: touchOpenSession({ ...s.activeWorkout, exercises }),
          };
        });
        enqueueOpenSession(snapshotFromActive(get().activeWorkout));

        if (isFirstEverSet) {
          const startedAt = readRaw(STORAGE_KEYS.journeyStarted);
          const started = startedAt ? new Date(startedAt).getTime() : NaN;
          track(
            'first_set_logged',
            Number.isFinite(started)
              ? { secondsFromStart: Math.max(0, Math.round((Date.now() - started) / 1000)) }
              : undefined
          );
        }

        const logged = get().activeWorkout?.exercises[exerciseIndex];
        const saved = logged?.sets[setIndex];
        if (logged && saved) {
          recordWorkingSetLogged({
            kind: saved.kind,
            exerciseId: logged.exerciseId,
            weight,
          });
        }
      },

      /**
       * The only path any UI logs a set through (`ActiveWorkoutPage.tsx`), so
       * whatever it decides about RPE is what the Coach sees for every athlete.
       *
       * It used to pass `'med'`. That one literal made the whole effort signal
       * fiction: `SetLogRow`/`SetLogTable` render the Easy/Med/Hard buttons only
       * when `!set.rpe`, so a stamped set could never offer them — while
       * `ActiveSessionChrome` told the athlete "Rate Easy / Med / Hard after each
       * set so Coach can learn." Downstream, `coach/progression.ts`'s `allEasy` /
       * `anyHardOnTwoPlus` / `allHard` branches and `coach/load.ts`'s `sessionRpe`
       * were structurally unreachable: the load-up and deload decisions could not
       * fire, and session RPE was the constant 7 for everyone forever.
       *
       * `progression.test.ts` was green throughout, because it passes RPE values
       * in directly — the choice was proven while nothing proved the *input*.
       *
       * So: log the set unrated and let the athlete say. An unrated set still has
       * a home — `hasMixedOrMed` treats a missing rating as inconclusive and the
       * plan holds, which is the correct read of "no signal".
       */
      logSetAndAdvance: (exerciseIndex, setIndex, reps, weight, isPr, durationSeconds) => {
        get().logSet(exerciseIndex, setIndex, reps, weight, undefined, isPr, durationSeconds);
        const aw = get().activeWorkout;
        if (!aw) return null;
        const loggedSide = parseSetSide(aw.exercises[exerciseIndex]?.sets[setIndex]?.side);
        const next = advanceAfterLog(aw.exercises, exerciseIndex, setIndex);
        if (
          next &&
          next.exerciseIndex === exerciseIndex &&
          loggedSide
        ) {
          const nxt = aw.exercises[next.exerciseIndex]?.sets[next.setIndex];
          if (nxt && !nxt.completed && !nxt.side) {
            const suggested = suggestNextSide(loggedSide);
            if (suggested) get().setSetSide(next.exerciseIndex, next.setIndex, suggested);
          }
        }
        return next;
      },

      rateSet: (exerciseIndex, setIndex, rpe) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            sets[setIndex] = { ...sets[setIndex], rpe };
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      setSetDuration: (exerciseIndex, setIndex, durationSeconds) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const hold = Number(durationSeconds);
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            const next = { ...sets[setIndex] };
            if (!Number.isFinite(hold) || hold <= 0) delete next.durationSeconds;
            else next.durationSeconds = Math.round(hold);
            sets[setIndex] = next;
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      rateSetRir: (exerciseIndex, setIndex, rir) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const parsed = parseOptionalRir(rir);
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            const next = { ...sets[setIndex] };
            if (parsed === undefined) delete next.rir;
            else next.rir = parsed;
            sets[setIndex] = next;
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      rateSetRpe10: (exerciseIndex, setIndex, rpe10) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const parsed = parseOptionalRpe10(rpe10);
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            const next = { ...sets[setIndex] };
            if (parsed === undefined) delete next.rpe10;
            else next.rpe10 = parsed;
            sets[setIndex] = next;
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      setSetLoadPct: (exerciseIndex, setIndex, loadPct) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const parsed = parseOptionalLoadPct(loadPct);
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            const next = { ...sets[setIndex] };
            if (parsed === undefined) delete next.loadPct;
            else next.loadPct = parsed;
            sets[setIndex] = next;
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      rateSetTempo: (exerciseIndex, setIndex, tempo) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const parsed = parseOptionalTempo(tempo);
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            const next = { ...sets[setIndex] };
            if (parsed === undefined) delete next.tempo;
            else {
              next.tempo = parsed;
              rememberLastTempo(ex.exerciseId, parsed);
            }
            sets[setIndex] = next;
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      setSetKind: (exerciseIndex, setIndex, kind) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex]) {
            sets[setIndex] = { ...sets[setIndex], kind };
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      setSetSide: (exerciseIndex, setIndex, side) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = { ...exercises[exerciseIndex] };
          const sets = [...ex.sets];
          if (sets[setIndex] && !sets[setIndex].completed) {
            const next = { ...sets[setIndex] };
            if (side) next.side = side;
            else delete next.side;
            sets[setIndex] = next;
          }
          ex.sets = sets;
          exercises[exerciseIndex] = ex;
          return {
            activeWorkout: { ...s.activeWorkout, exercises },
          };
        });
      },

      unlinkSuperset: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises: unpair(s.activeWorkout.exercises, exerciseIndex),
            },
          };
        });
      },

      toggleSupersetWithNext: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const nextIdx = exerciseIndex + 1;
          if (nextIdx >= s.activeWorkout.exercises.length) return s;
          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises: groupWithNext(s.activeWorkout.exercises, exerciseIndex),
            },
          };
        });
      },

      addSetToExercise: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          const lastSet = ex.sets[ex.sets.length - 1];
          exercises[exerciseIndex] = {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: `set-${Date.now()}`,
                reps: lastSet?.reps ?? 0,
                weight: lastSet?.weight ?? 0,
                completed: false,
                kind: lastSet?.kind ?? 'normal',
                ...(lastSet?.side ? { side: lastSet.side } : {}),
              },
            ],
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      insertWarmupRampOnExercise: (exerciseIndex, ramp) => {
        set((s) => {
          if (!s.activeWorkout || ramp.length === 0) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex) return s;
          if (warmupRampAlreadyPresent(ex.sets, ramp)) return s;
          const now = Date.now();
          const rampSets: LoggedSet[] = ramp.map((step, i) => ({
            id: `warmup-${now}-${i}`,
            reps: step.reps,
            weight: step.weight,
            completed: false,
            kind: 'warmup' as SetKind,
          }));
          exercises[exerciseIndex] = {
            ...ex,
            sets: insertWarmupSets(ex.sets, rampSets),
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      removePlannedSetAt: (exerciseIndex, setIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex) return s;
          const nextSets = removePlannedSetAt(ex.sets, setIndex);
          if (nextSets === ex.sets) return s;
          exercises[exerciseIndex] = { ...ex, sets: nextSets };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      removeLastPlannedSet: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex) return s;
          const lastPlannedIdx = [...ex.sets].map((x) => x.completed).lastIndexOf(false);
          if (lastPlannedIdx < 0) return s;
          exercises[exerciseIndex] = {
            ...ex,
            sets: ex.sets.filter((_, i) => i !== lastPlannedIdx),
          };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      removeExerciseFromActive: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return {
            activeWorkout: {
              ...s.activeWorkout,
              exercises: unpair(s.activeWorkout.exercises, exerciseIndex).filter(
                (_, i) => i !== exerciseIndex
              ),
            },
          };
        });
      },

      skipExerciseInActive: (exerciseIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = skipExerciseThisSession(s.activeWorkout.exercises, exerciseIndex);
          if (!exercises) return s;
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      reorderExerciseInActive: (fromIndex, toIndex) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = reorderSessionExercises(
            s.activeWorkout.exercises,
            fromIndex,
            toIndex
          );
          if (!exercises) return s;
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      replaceExerciseInActive: (exerciseIndex, newExerciseId, muscleGroups) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const swapped = swapExerciseThisSession(
            s.activeWorkout.exercises,
            exerciseIndex,
            newExerciseId,
            muscleGroups
          );
          if (!swapped) return s;
          const exercises = swapped.map((ex, i) =>
            i === exerciseIndex ? applyHistoryNote(ex, s.workoutHistory) : ex
          );
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      setExerciseNote: (exerciseIndex, note) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          const exercises = [...s.activeWorkout.exercises];
          const ex = exercises[exerciseIndex];
          if (!ex) return s;
          exercises[exerciseIndex] = { ...ex, note };
          return { activeWorkout: { ...s.activeWorkout, exercises } };
        });
      },

      setSessionNote: (note) => {
        set((s) => {
          if (!s.activeWorkout) return s;
          return { activeWorkout: { ...s.activeWorkout, sessionNote: note } };
        });
      },

      setHistorySessionNote: (logId, note) => {
        set((s) => ({
          workoutHistory: s.workoutHistory.map((row) =>
            row.id === logId ? attachSessionNote(row, note) : row
          ),
        }));
      },

      saveEditedHistoryLog: (log) => {
        if (!log || log.deletedAt) return null;
        const existing = get().workoutHistory.find((row) => row.id === log.id);
        if (!existing || existing.deletedAt) return null;
        if (!log.exercises?.some((ex) => (ex.sets ?? []).length > 0)) return null;
        const next = { ...log, deletedAt: null };
        set((s) => ({
          workoutHistory: s.workoutHistory.map((row) => (row.id === log.id ? next : row)),
        }));
        enqueueWorkoutUpsert(next);
        return next;
      },

      saveBackfillLog: (log) => {
        if (!log || log.deletedAt) return null;
        const id = log.id?.trim();
        const clientId = log.clientId?.trim();
        if (!id || !clientId) return null;
        if (
          get().workoutHistory.some(
            (row) => row.id === id || (row.clientId && row.clientId === clientId)
          )
        ) {
          return null;
        }
        if (!log.exercises?.some((ex) => (ex.sets ?? []).length > 0)) return null;
        const next = { ...log, id, clientId, deletedAt: null };
        set((s) => ({
          workoutHistory: [next, ...s.workoutHistory],
        }));
        enqueueWorkoutUpsert(next);
        return next;
      },

      applyMergedExercises: (sourceId, keeperId) => {
        const state = get();
        const customs = loadCustomExercises();
        const prefs = loadMergePrefMaps();
        const knownIds = knownIdsForMerge({
          customs,
          history: state.workoutHistory,
          live: state.activeWorkout?.exercises ?? null,
          saved: state.savedWorkouts,
        });
        const next = applyMergeExercises({
          sourceId,
          keeperId,
          knownIds,
          history: state.workoutHistory,
          live: state.activeWorkout?.exercises ?? null,
          customs,
          saved: state.savedWorkouts,
          rest: prefs.rest,
          pins: prefs.pins,
          tempo: prefs.tempo,
        });
        if (!next) return false;
        persistMergedPrefs({ rest: next.rest, pins: next.pins, tempo: next.tempo });
        persistMergedCustoms(next.customs);
        set((s) => ({
          workoutHistory: next.history,
          savedWorkouts: next.saved,
          activeWorkout:
            s.activeWorkout && next.live
              ? touchOpenSession({ ...s.activeWorkout, exercises: next.live })
              : s.activeWorkout,
          restExerciseId:
            s.restExerciseId && s.restExerciseId === sourceId.trim()
              ? keeperId.trim()
              : s.restExerciseId,
        }));
        const beforeById = new Map(state.workoutHistory.map((row) => [row.id, row]));
        for (const log of next.history) {
          if (beforeById.get(log.id) !== log) enqueueWorkoutUpsert(log);
        }
        if (get().activeWorkout) {
          enqueueOpenSession(snapshotFromActive(get().activeWorkout));
        }
        return true;
      },

      deleteFinishedHistoryLog: (sessionId) => {
        const state = get();
        const applied = applyDeleteFinishedSession({
          sessionId,
          history: state.workoutHistory,
          live: state.activeWorkout,
        });
        if (!applied) return null;
        set({ workoutHistory: applied.history });
        enqueueWorkoutUpsert(applied.next);
        return applied.next;
      },

      restoreFinishedHistoryLog: (sessionId) => {
        const state = get();
        const applied = applyRestoreFinishedSession({
          sessionId,
          history: state.workoutHistory,
          live: state.activeWorkout,
        });
        if (!applied) return null;
        set({ workoutHistory: applied.history });
        enqueueWorkoutUpsert(applied.next);
        return applied.next;
      },

      nameFinishedHistoryLog: (sessionId, title) => {
        const state = get();
        const applied = applyNameFinishedSession({
          sessionId,
          title,
          history: state.workoutHistory,
          live: state.activeWorkout,
        });
        if (!applied) return null;
        set({ workoutHistory: applied.history });
        enqueueWorkoutUpsert(applied.next);
        return applied.next;
      },

      applyImportedHistory: (next) => {
        if (!Array.isArray(next)) return false;
        const before = get().workoutHistory;
        const beforeById = new Map(before.map((row) => [row.id, row]));
        set({ workoutHistory: next });
        for (const log of next) {
          if (beforeById.get(log.id) !== log) enqueueWorkoutUpsert(log);
        }
        return true;
      },

      startRestTimer: (seconds?: number, exerciseId?: string, lane?: RestLane) => {
        // `.292` — never invent 30s. One fallback lives in restTimer.ts.
        const sec = resolveStartRestSeconds(seconds);
        const id = (exerciseId?.trim() || get().restExerciseId || '').trim() || null;
        const restLane = lane ?? get().restLane ?? 'work';
        if (id) rememberLastRest(id, sec, restLane);
        set({
          restSecondsRemaining: sec,
          restTimerInitialSeconds: sec,
          restTimerActive: true,
          restExerciseId: id,
          restLane,
          ...IDLE_WORK_CLOCK,
        });
      },

      adjustRestTimer: (delta) => {
        set((s) => {
          const next = Math.max(0, s.restSecondsRemaining + delta);
          const remembered = rememberedRestAfterAdjust({
            previousInitial: s.restTimerInitialSeconds,
            nextRemaining: next,
          });
          const restLane = s.restLane ?? 'work';
          if (remembered != null && s.restExerciseId) {
            rememberLastRest(s.restExerciseId, remembered, restLane);
          }
          return {
            restSecondsRemaining: next,
            restTimerActive: next > 0,
            restTimerInitialSeconds:
              next > s.restTimerInitialSeconds ? next : s.restTimerInitialSeconds,
            restExerciseId: next > 0 ? s.restExerciseId : null,
            restLane: next > 0 ? restLane : null,
          };
        });
      },

      tickRestTimer: () => {
        set((s) => {
          if (!s.restTimerActive) return s;
          const next = s.restSecondsRemaining - 1;
          if (next <= 0) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([120, 60, 120]);
            }
            return {
              restSecondsRemaining: 0,
              restTimerActive: false,
              restExerciseId: null,
              restLane: null,
            };
          }
          return { restSecondsRemaining: next };
        });
      },

      stopRestTimer: () => {
        // Skip — leftover seconds must not become next rest.
        // One athlete clock: skip/stop rest also clears a leftover work clock.
        set({
          restSecondsRemaining: 0,
          restTimerActive: false,
          restExerciseId: null,
          restLane: null,
          ...IDLE_WORK_CLOCK,
        });
      },

      startWorkClock: (kind, seconds?) => {
        const resolved = resolveWorkClockStart({ kind, seconds });
        if (!resolved) return;
        set({
          restSecondsRemaining: 0,
          restTimerActive: false,
          restExerciseId: null,
          restLane: null,
          workClockKind: resolved.kind,
          workClockActive: true,
          workClockRemaining: resolved.seconds,
          workClockInitialSeconds: resolved.seconds,
        });
      },

      tickWorkClock: () => {
        set((s) => {
          if (!s.workClockActive || !s.workClockKind) return s;
          const next = nextWorkClockTick({
            kind: s.workClockKind,
            remaining: s.workClockRemaining,
          });
          return {
            workClockRemaining: next.remaining,
            workClockActive: next.active,
            workClockKind: next.active ? s.workClockKind : s.workClockKind,
          };
        });
      },

      stopWorkClock: () => {
        set({ ...IDLE_WORK_CLOCK });
      },

      tickElapsed: () => {
        const next = sessionElapsedSeconds(readSessionClock(get().activeWorkout));
        // Only touch state when the displayed second actually changes: every
        // `set()` is a persist write, even when the value is unchanged.
        if (next !== get().elapsedSeconds) set({ elapsedSeconds: next });
      },

      toggleSessionClock: () => {
        const active = get().activeWorkout;
        if (!active) return;
        const now = Date.now();
        const next = applySessionClockToggle(readSessionClock(active), now);
        if (!next) return;
        set({
          activeWorkout: { ...active, sessionClock: next },
          elapsedSeconds: sessionElapsedSeconds(next, now),
        });
      },

      getRecentHistory: (limit = 5) => {
        return get().workoutHistory.filter((log) => !log.deletedAt).slice(0, limit);
      },

      loadFromCloud: async () => {
        const user = await getUser();
        if (!user) return;

        // Two reads, because they see different things. The completed_at read is the
        // backfill: it finds history this device has never seen. The updated_at cursor
        // is the only way an *edit* or a tombstone arrives — a completed_at ordering
        // cannot surface a row whose session date is old but whose contents changed,
        // which is why edits and deletes never used to propagate between devices.
        const since = readRaw(STORAGE_KEYS.cloudPullCursor);
        const [recent, changed] = await Promise.all([
          getUserWorkoutHistory(100),
          since ? getUserWorkoutsUpdatedSince(since) : Promise.resolve([]),
        ]);

        const cloudLogs = [...recent, ...changed];
        const mapped = mapCloudToLocal(cloudLogs);

        const { logs, truncated } = mergeWorkoutHistoriesDetailed(get().workoutHistory, mapped);
        set({ workoutHistory: logs });

        // Advance the cursor to the newest updated_at actually seen, so the next pull
        // is cheap. Only after the merge succeeded — a thrown merge must not skip rows.
        const newest = cloudLogs.reduce<string | null>((max, row) => {
          const u = row.updated_at;
          return u && (!max || u > max) ? u : max;
        }, null);
        if (newest) writeRaw(STORAGE_KEYS.cloudPullCursor, newest);

        // HISTORY_CAP dropping sessions used to be invisible. Say so once per load.
        if (truncated > 0) {
          track('history_truncated', { dropped: truncated });
        }
      },

      setPendingRemoteOpenSession: (remote) => {
        set({ pendingRemoteOpenSession: remote });
      },

      restoreActiveWorkout: (active) => {
        const next = {
          ...active,
          clientId: active.clientId ?? newClientId(),
          revision: active.revision ?? 1,
          updatedAt: active.updatedAt ?? new Date().toISOString(),
        };
        syncActiveFlag(next);
        set({
          activeWorkout: next,
          elapsedSeconds: sessionElapsedSeconds(readSessionClock(next)),
          restSecondsRemaining: 0,
          restTimerActive: false,
          restTimerInitialSeconds: FALLBACK_REST_SECONDS,
          restExerciseId: null,
          restLane: null,
          ...IDLE_WORK_CLOCK,
          pendingRemoteOpenSession: null,
        });
      },

      acceptPendingRemoteOpenSession: () => {
        const remote = get().pendingRemoteOpenSession;
        if (!remote?.workout) return;
        const adopted: ActiveWorkout = {
          workoutId: remote.workout.workoutId,
          workoutName: remote.workout.workoutName,
          startedAt: remote.workout.startedAt,
          exercises: remote.workout.exercises,
          clientId: remote.clientId,
          revision: remote.revision,
          updatedAt: remote.updatedAt,
        };
        get().restoreActiveWorkout(adopted);
      },

      ensureOpenSessionIdentity: () => {
        const active = get().activeWorkout;
        if (!active || active.clientId) return;
        set({ activeWorkout: touchOpenSession(active) });
      },

      syncCurrentHistoryToCloud: async () => {
        const user = await getUser();
        if (!user) return;
        // Queue every locally-owned log, not "the last 5 that look local" — that
        // heuristic re-inserted rows (duplicates) and silently abandoned anything
        // older. The outbox de-duplicates by clientId, so re-queueing is free.
        for (const log of get().workoutHistory) {
          if (log.id.startsWith('cloud-')) continue;
          enqueueWorkoutUpsert(log);
        }
        const open = snapshotFromActive(get().activeWorkout);
        if (open) enqueueOpenSession(open);
        await flushOutbox();
      },
    }),
    {
      name: "workout-tracker-storage",
      /*
       * `.210` — skip a write whose bytes are already on disk. Never defers a
       * real write; see `persistDedupe.ts` for why throttling was deliberately
       * not added to the path that holds the athlete's sessions.
       */
      storage: createJSONStorage(() => dedupeWrites(browserStorage())),
      // v1: backfill sync-v2 identity so pre-existing logs can reach the cloud
      // without duplicating (they had no stable id the server could key on).
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { workoutHistory?: CompletedWorkoutLog[] } | undefined;
        if (!state) return persisted as never;
        if (version >= 1) return state as never;
        return {
          ...state,
          workoutHistory: (state.workoutHistory ?? []).map((log) =>
            log.clientId
              ? log
              : {
                  ...log,
                  clientId: newClientId(),
                  revision: log.revision ?? 1,
                  updatedAt: log.updatedAt ?? log.completedAt,
                }
          ),
        } as never;
      },
      partialize: (state) => ({
        savedWorkouts: state.savedWorkouts,
        workoutHistory: state.workoutHistory,
        activeWorkout: state.activeWorkout,
        /*
         * `.210` — `elapsedSeconds` used to live here, and `tickElapsed` runs
         * `set()` once a second. Zustand's persist writes after **every**
         * `set()` without diffing the partialized slice, so a running session
         * serialised the whole history to localStorage every second: ~3.5 ms of
         * `JSON.stringify` on a 200-session history, plus a synchronous disk
         * write, plus a 4–6x mobile penalty. It is derived from
         * `sessionClock` (`.1001`) now — pause/resume writes the clock on
         * `activeWorkout`; ticks still leave `partialize`.
         */
      }),
      onRehydrateStorage: () => (state, error) => {
        /*
         * `.201` — drop an `activeWorkout` that is not a usable session.
         *
         * `partialize` persists whatever shape the store held, and what comes
         * back is whatever is in device storage — an older build's shape, a
         * half-written record, a value edited by hand. Every consumer then did
         * `activeWorkout.exercises[i]`, so a non-object or a missing
         * `exercises` array threw on the render path, and with no nested
         * `error.tsx` boundary the whole route became the global error screen.
         *
         * Verified by the `@gate` cases in `logger-depth.spec.ts`: before this,
         * `activeWorkout: 42` and `{ id: 'x' }` both blanked `/active` — the
         * logger, which is the product.
         *
         * Sanitising here rather than at each read site is the point: one check
         * covers every consumer, including the ones written next year.
         */
        if (state && !isUsableActiveWorkout(state.activeWorkout)) {
          state.activeWorkout = null;
        }
        if (
          state?.activeWorkout &&
          isUsableActiveWorkout(state.activeWorkout) &&
          !state.activeWorkout.clientId
        ) {
          const stamped = touchOpenSession(state.activeWorkout);
          state.activeWorkout = stamped;
        }
        syncActiveFlag(state?.activeWorkout ?? null);
        // NOTE: with a synchronous storage (i.e. every browser) zustand runs this
        // callback *inside* create(), before `useWorkoutStore` is assigned. Touching
        // the store here throws a TDZ ReferenceError that the persist thenable
        // swallows — which is exactly how `hasHydrated` used to stay false forever
        // and leave "Start Workout" permanently disabled on /active. Record the
        // fact and let the reconciliation below own the flag.
        rehydrateSettled = true;
        if (error) {
          console.warn('[workoutStore] rehydrate error', error);
        }
      },
    }
  )
);

/**
 * Is this something the logger can actually render?
 *
 * Deliberately structural rather than exhaustive: the screens index
 * `exercises[i].sets[j]`, so an array of exercises each with an array of sets is
 * what "usable" means here. Anything else is dropped rather than repaired —
 * a half-restored session that silently loses sets would be worse than a clean
 * empty state, and the athlete can start again in one tap.
 */
export function isUsableActiveWorkout(value: unknown): boolean {
  if (value === null || value === undefined) return true; // no session is fine
  if (typeof value !== 'object') return false;
  const w = value as { exercises?: unknown };
  if (!Array.isArray(w.exercises)) return false;
  return w.exercises.every(
    (ex) => !!ex && typeof ex === 'object' && Array.isArray((ex as { sets?: unknown }).sets)
  );
}

/**
 * Has the athlete actually put work into this session?
 *
 * `.204` — `startWorkout` overwrites `activeWorkout` unconditionally. I-Day
 * finish no longer calls it (F-004 lands on Today), but any other auto-start
 * path still can. `/` renders the marketing landing for anyone past the gate
 * with no "you have journey state, go to /log" branch, so a returning tester
 * opening the site from history can re-enter onboarding — protect logged work.
 *
 * A session that exists is not the same as a session worth protecting: one
 * started and abandoned without a single logged set is noise, and refusing to
 * replace it would strand the athlete on a stale screen. A **completed set** is
 * the line, because that is the first moment the app holds something the
 * athlete cannot reproduce from memory.
 */
export function hasLoggedWork(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const w = value as { exercises?: unknown };
  if (!Array.isArray(w.exercises)) return false;
  return w.exercises.some((ex) => {
    const sets = (ex as { sets?: unknown } | null)?.sets;
    return Array.isArray(sets) && sets.some((s) => !!(s as { completed?: unknown })?.completed);
  });
}

function markHydrated(): void {
  if (useWorkoutStore.getState().hasHydrated) return;
  useWorkoutStore.setState({ hasHydrated: true });
}

/**
 * Own `hasHydrated` here, after the store exists.
 *
 * `Start` stays disabled until this flips, so every path has to end in `true`:
 * sync storage (already done), async storage (wait for the listener), and no usable
 * storage at all (nothing to restore — do not block the logger).
 */
const persistApi = useWorkoutStore.persist;
if (!persistApi) {
  // Storage unavailable (SSR, or a browser refusing it). There is nothing to wait for.
  markHydrated();
} else if (rehydrateSettled || persistApi.hasHydrated()) {
  markHydrated();
} else {
  persistApi.onFinishHydration(markHydrated);
}

if (typeof window !== 'undefined') {
  // Last resort: a disabled logger is the worst failure this app has, so never
  // let an unexpected storage error strand it.
  setTimeout(markHydrated, 1_500);
}
