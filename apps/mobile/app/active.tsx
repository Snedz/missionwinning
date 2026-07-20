import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { markSessionDone } from '@missionwinning/mw-core';
import { Body, Button, ScreenTitle } from '../src/components/ui';
import { useAuth } from '../src/lib/auth';
import { loadCoachPlan, saveCoachPlan } from '../src/lib/storage';
import { finishWorkoutAndPersist, pushCoachPlanToCloud } from '../src/lib/sync';
import { colors } from '../src/theme';

type SetRow = { id: number; reps: number; done: boolean };

export default function ActiveScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ sessionId?: string; name?: string; sets?: string }>();
  const workoutName = params.name || 'Workout';
  const sessionId = params.sessionId;
  const targetSets = Math.max(3, Math.min(12, Number(params.sets) || 6));

  const initial = useMemo(
    () =>
      Array.from({ length: targetSets }, (_, i) => ({
        id: i,
        reps: 10,
        done: false,
      })),
    [targetSets]
  );

  const [sets, setSets] = useState<SetRow[]>(initial);
  const [startedAt] = useState(() => Date.now());
  const [restLeft, setRestLeft] = useState(0);

  useEffect(() => {
    if (restLeft <= 0) return;
    const t = setTimeout(() => setRestLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restLeft]);

  function toggleSet(id: number) {
    setSets((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = !s.done;
        if (next) setRestLeft(60);
        return { ...s, done: next };
      })
    );
  }

  async function finish() {
    const doneCount = sets.filter((s) => s.done).length || sets.length;
    const durationSeconds = Math.max(30, Math.round((Date.now() - startedAt) / 1000));
    const history = await finishWorkoutAndPersist({
      userId: user?.id ?? null,
      workoutName,
      durationSeconds,
      setCount: doneCount,
      totalVolume: doneCount * 10,
      sessionId,
    });

    if (sessionId) {
      const plan = await loadCoachPlan();
      if (plan) {
        const next = markSessionDone(plan, sessionId);
        await saveCoachPlan(next);
        if (user) await pushCoachPlanToCloud(user.id, next);
      }
    }

    router.replace({
      pathname: '/victory',
      params: {
        name: workoutName,
        sets: String(doneCount),
        duration: String(durationSeconds),
        workouts: String(history.length),
      },
    });
  }

  return (
    <View style={styles.wrap}>
      <ScreenTitle>{workoutName}</ScreenTitle>
      <Body>Log sets offline. Rest timer starts when you check a set.</Body>
      {restLeft > 0 ? (
        <Text style={styles.rest}>Rest {restLeft}s</Text>
      ) : (
        <Text style={styles.restIdle}>Ready</Text>
      )}

      {sets.map((s) => (
        <Button
          key={s.id}
          title={s.done ? `✓ Set ${s.id + 1} · ${s.reps} reps` : `Set ${s.id + 1} · ${s.reps} reps`}
          variant={s.done ? 'secondary' : 'primary'}
          onPress={() => toggleSet(s.id)}
          style={styles.setBtn}
        />
      ))}

      <Button title="Finish workout" onPress={finish} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 10, backgroundColor: colors.navy },
  rest: { color: colors.brass, fontSize: 22, fontWeight: '800' },
  restIdle: { color: colors.textMuted, fontSize: 16 },
  setBtn: { marginVertical: 2 },
});
