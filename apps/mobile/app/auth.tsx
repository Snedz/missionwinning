import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Body, Button, ScreenTitle } from '../src/components/ui';
import { useAuth } from '../src/lib/auth';
import { colors } from '../src/theme';

export default function AuthScreen() {
  const { signInWithEmail, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage(null);
    const { error } = await signInWithEmail(email);
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage('Check your email for the magic link, then return here.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenTitle>Sign in</ScreenTitle>
      <Body>Magic link via Supabase — same account as the web app.</Body>
      {!configured ? (
        <Text style={styles.warn}>Supabase env not set — continue offline.</Text>
      ) : null}
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@email.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
      />
      <Button title={busy ? 'Sending…' : 'Send magic link'} onPress={submit} disabled={busy} />
      {message ? <Text style={styles.msg}>{message}</Text> : null}
      <Button title="Close" variant="ghost" onPress={() => router.back()} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 14, backgroundColor: colors.navy },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    color: colors.text,
    backgroundColor: colors.navyElevated,
    fontSize: 16,
  },
  msg: { color: colors.emerald, fontSize: 14 },
  warn: { color: colors.brass, fontSize: 13 },
});
