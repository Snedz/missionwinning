import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Body, Button, ScreenTitle } from '../src/components/ui';
import { ensureCoachPlan, markIdayDone } from '../src/lib/storage';
import { colors } from '../src/theme';

export default function IdayScreen() {
  async function complete() {
    await markIdayDone();
    await ensureCoachPlan(false);
    router.replace('/(tabs)/today');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <ScreenTitle>Mission Winning</ScreenTitle>
        <Body style={styles.lead}>
          Adaptive AI coach for people who train at home or in a park — free offline logging, weekly
          plans from logs alone. No wearable required.
        </Body>
        <View style={styles.card}>
          <Body style={styles.cardText}>
            I-Day is short: pick equipment later on web if you want. Native v1 ships Train + Coach.
            Everything else stays on missionwinning.com until we deepen the app.
          </Body>
        </View>
        <Button title="Start mission" onPress={complete} />
        <Button title="I already train — skip" variant="ghost" onPress={complete} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  wrap: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  lead: { marginTop: 8 },
  card: {
    backgroundColor: colors.navyElevated,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
  cardText: { color: colors.text },
});
