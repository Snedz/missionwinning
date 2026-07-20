import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { pickVictoryNextAction } from '@missionwinning/mw-core';
import { Body, Button, ScreenTitle } from '../src/components/ui';
import { colors } from '../src/theme';

export default function VictoryScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    sets?: string;
    duration?: string;
    workouts?: string;
  }>();
  const completed = Number(params.workouts) || 1;
  const next = pickVictoryNextAction({
    completedWorkouts: completed,
    hasCoachPlan: true,
  });

  return (
    <View style={styles.wrap}>
      <ScreenTitle>Session locked</ScreenTitle>
      <Text style={styles.stat}>{params.name ?? 'Workout'}</Text>
      <Body>
        {params.sets ?? '0'} sets · {params.duration ?? '0'}s · workout #{completed}
      </Body>
      <View style={styles.card}>
        <Text style={styles.reason}>{next.defaultReason}</Text>
      </View>
      <Button
        title={next.defaultLabel}
        onPress={() => {
          if (next.href === '/coach') router.replace('/(tabs)/coach');
          else router.replace('/(tabs)/today');
        }}
      />
      <Button title="Today" variant="ghost" onPress={() => router.replace('/(tabs)/today')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 14, backgroundColor: colors.navy, justifyContent: 'center' },
  stat: { color: colors.emerald, fontSize: 22, fontWeight: '800' },
  card: {
    backgroundColor: colors.navyElevated,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.brass,
  },
  reason: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
