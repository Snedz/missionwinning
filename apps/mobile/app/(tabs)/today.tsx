import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CoachPlan } from '@missionwinning/mw-core';
import { CoachAdaptBanner } from '../../src/components/CoachAdaptBanner';
import { Body, Button, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/lib/auth';
import { ensureCoachPlan, loadWorkoutHistory } from '../../src/lib/storage';
import { syncCoachPlanFromCloud } from '../../src/lib/sync';
import { colors } from '../../src/theme';

export default function TodayScreen() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [workouts, setWorkouts] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const p = user
          ? (await syncCoachPlanFromCloud(user.id)) ?? (await ensureCoachPlan())
          : await ensureCoachPlan();
        const hist = await loadWorkoutHistory();
        if (alive) {
          setPlan(p);
          setWorkouts(hist.length);
        }
      })();
      return () => {
        alive = false;
      };
    }, [user])
  );

  const next = plan?.sessions.find((s) => s.status === 'planned' || s.status === 'swapped');

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenTitle>Today</ScreenTitle>
      <Body>
        Free forever logger + Mission Coach. {workouts} workout{workouts === 1 ? '' : 's'} on this
        device.
      </Body>

      {plan ? <CoachAdaptBanner plan={plan} /> : null}

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>NEXT SESSION</Text>
        <Text style={styles.cardTitle}>{next?.name ?? 'Open Coach for your week'}</Text>
        <Body>
          {next
            ? `${next.estMinutes} min · ${next.kind} · ${next.exercises.length} exercises`
            : 'Generate or review your week on Coach.'}
        </Body>
      </View>

      <Button
        title={next ? 'Start workout' : 'Open Coach'}
        onPress={() => {
          if (next) {
            router.push({
              pathname: '/active',
              params: {
                sessionId: next.id,
                name: next.name,
                sets: String(
                  next.exercises.reduce((n, e) => n + e.sets, 0) || next.exercises.length * 3
                ),
              },
            });
          } else {
            router.push('/(tabs)/coach');
          }
        }}
      />
      <Button title="Mission Coach" variant="secondary" onPress={() => router.push('/(tabs)/coach')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.navyElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardEyebrow: {
    color: colors.brass,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
});
