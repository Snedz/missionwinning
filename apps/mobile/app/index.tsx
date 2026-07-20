import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isIdayDone } from '../src/lib/storage';
import { colors } from '../src/theme';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    isIdayDone().then((v) => {
      setDone(v);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.navy, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.emerald} />
      </View>
    );
  }

  if (!done) return <Redirect href="/iday" />;
  return <Redirect href="/(tabs)/today" />;
}
