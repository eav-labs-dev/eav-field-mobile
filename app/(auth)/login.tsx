/**
 * @fileoverview API-backed sign-in screen for field officers.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessionStore } from '@/src/features/auth/session-store';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('ama.mensah@demo.eavlabs.dev');
  const [password, setPassword] = useState('');
  const errorMessage = useSessionStore((state) => state.errorMessage);
  const isSigningIn = useSessionStore((state) => state.isSigningIn);
  const signIn = useSessionStore((state) => state.signIn);

  const handleSignIn = async () => {
    if (await signIn(email, password)) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="auth-login-page">
      <View style={styles.content}>
        <View>
          <Text style={styles.eyebrow}>EAV LABS</Text>
          <Text style={styles.title}>Field work, without the connectivity risk.</Text>
          <Text style={styles.subtitle}>
            Capture inspections offline and sync them when your connection returns.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Work email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              style={styles.input}
              testID="auth-login-email-input"
              value={email}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              testID="auth-login-password-input"
              value={password}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!email || !password || isSigningIn}
            onPress={() => void handleSignIn()}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            testID="auth-login-submit-button"
          >
            <Text style={styles.buttonText}>
              {isSigningIn ? 'Signing in…' : 'Continue to assignments'}
            </Text>
          </Pressable>
          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.error} testID="auth-login-error-message">
              {errorMessage}
            </Text>
          ) : null}
          <Text style={styles.demoNote}>Use the field-officer account configured by the API.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'space-between', padding: spacing.lg, paddingVertical: 48 },
  eyebrow: { color: colors.primary, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 38, fontWeight: '800', lineHeight: 44, marginTop: spacing.md },
  subtitle: { color: colors.textMuted, fontSize: 17, lineHeight: 25, marginTop: spacing.md },
  form: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: spacing.md, padding: spacing.lg },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  input: { borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, color: colors.text, height: 44, paddingHorizontal: 12 },
  button: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, minHeight: 48, justifyContent: 'center', marginTop: spacing.sm },
  buttonPressed: { backgroundColor: colors.primaryStrong },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  demoNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
