import { StyleSheet, Text, View } from 'react-native';
import {
  hasCoachAdaptationSignal,
  summarizeCoachAdaptations,
  type CoachPlan,
} from '@missionwinning/mw-core';
import { colors } from '../theme';

export function CoachAdaptBanner({ plan }: { plan: CoachPlan }) {
  if (!hasCoachAdaptationSignal(plan)) return null;
  const beats = summarizeCoachAdaptations(plan);
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.eyebrow}>WEEK ADAPTED · REV {plan.revision}</Text>
      {beats.length === 0 ? (
        <Text style={styles.line}>Plan revised from your logs — no wearable required.</Text>
      ) : (
        beats.map((b) => (
          <Text key={b.key} style={styles.line}>
            {b.defaultMessage}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.navyElevated,
    borderLeftWidth: 3,
    borderLeftColor: colors.brass,
    padding: 14,
    borderRadius: 8,
    gap: 6,
  },
  eyebrow: {
    color: colors.brass,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  line: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
