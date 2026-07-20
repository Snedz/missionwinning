import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Body, Button, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/lib/auth';
import { bundleCheckoutUrl } from '../../src/lib/sync';
import { WEB_APP_URL } from '../../src/lib/supabase';
import { colors } from '../../src/theme';

export default function AccountScreen() {
  const { user, configured, signOut } = useAuth();

  return (
    <View style={styles.wrap}>
      <ScreenTitle>Account</ScreenTitle>
      <Body>
        {configured
          ? user
            ? `Signed in as ${user.email ?? user.id}`
            : 'Sign in to sync Coach + workouts across devices.'
          : 'Offline-first: logging works without an account. Add EXPO_PUBLIC_SUPABASE_* to enable sync.'}
      </Body>

      {!user ? (
        <Button title="Sign in with email" onPress={() => router.push('/auth')} />
      ) : (
        <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
      )}

      <Button
        title="Super Bundle (Stripe on web)"
        variant="secondary"
        onPress={() => WebBrowser.openBrowserAsync(bundleCheckoutUrl())}
      />
      <Button
        title="Open full web app"
        variant="ghost"
        onPress={() => WebBrowser.openBrowserAsync(WEB_APP_URL)}
      />

      <Text style={styles.legal}>
        Privacy · Terms · Refunds on {WEB_APP_URL.replace('https://', '')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 14 },
  legal: { color: colors.textMuted, fontSize: 12, marginTop: 24 },
});
