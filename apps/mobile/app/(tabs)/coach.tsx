import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CoachPlan } from '@missionwinning/mw-core';
import { createSeedCoachPlan } from '@missionwinning/mw-core';
import { CoachAdaptBanner } from '../../src/components/CoachAdaptBanner';
import { Body, Button, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/lib/auth';
import { ensureCoachPlan, saveCoachPlan } from '../../src/lib/storage';
import { pushCoachPlanToCloud, syncCoachPlanFromCloud } from '../../src/lib/sync';
import { colors } from '../../src/theme';

export default function CoachScreen() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<CoachPlan | null>(null);

  const refresh = useCallback(async () => {
    const p = user
      ? (await syncCoachPlanFromCloud(user.id)) ?? (await ensureCoachPlan())
      : await ensureCoachPlan();
    setPlan(p);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function seedAdaptDemo() {
    const demo = createSeedCoachPlan({ withAdaptDemo: true, revision: 2 });
    await saveCoachPlan(demo);
    if (user) await pushCoachPlanToCloud(user.id, demo);
    setPlan(demo);
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <ScreenTitle>Mission Coach</ScreenTitle>
      <Body>Weekly plan from your logs — adapts when life happens. No wearable.</Body>

      {plan ? <CoachAdaptBanner plan={plan} /> : null}

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          Week of {plan?.weekStart ?? '—'} · {plan?.daysPerWeek ?? 0} days · rev {plan?.revision ?? 0}
        </Text>
        <Text style={styles.metaText}>Equipment: {plan?.equipmentProfile ?? 'bodyweight'}</Text>
      </View>

      {(plan?.sessions ?? []).map((s) => (
        <Pressable
          key={s.id}
          style={styles.session}
          onPress={() => {
            if (s.status === 'planned' || s.status === 'swapped') {
              router.push({
                pathname: '/active',
                params: {
                  sessionId: s.id,
                  name: s.name,
                  sets: String(s.exercises.reduce((n, e) => n + e.sets, 0) || 9),
                },
              });
            }
          }}
        >
          <Text style={styles.sessionName}>{s.name}</Text>
          <Text style={styles.sessionMeta}>
            Day +{s.dayOffset} · {s.status} · {s.estMinutes}m
          </Text>
          {s.exercises.map((e) => (
            <Text key={`${s.id}-${e.exerciseId}`} style={styles.ex}>
              {e.exerciseId} · {e.sets}×{e.reps}
            </Text>
          ))}
        </Pressable>
      ))}

      <Button title="Seed adapt demo (miss + swap)" variant="secondary" onPress={seedAdaptDemo} />
      <Button title="Refresh" variant="ghost" onPress={refresh} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 14, paddingBottom: 48 },
  meta: { gap: 4 },
  metaText: { color: colors.textMuted, fontSize: 13 },
  session: {
    backgroundColor: colors.navyElevated,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  sessionName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sessionMeta: { color: colors.brass, fontSize: 12, marginBottom: 4 },
  ex: { color: colors.textMuted, fontSize: 13 },
});
