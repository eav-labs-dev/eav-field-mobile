/**
 * @fileoverview Root navigation and application providers for EAV Field.
 * @remarks Keeps shared query state and status-bar configuration in one place.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSessionStore } from '@/src/features/auth/session-store';
import { initializeDatabase } from '@/src/shared/database/migrations';
import { colors } from '@/src/shared/theme/tokens';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const restoreSession = useSessionStore((state) => state.restoreSession);
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    if (status === 'idle') void restoreSession();
  }, [restoreSession, status]);

  if (status === 'idle' || status === 'restoring') {
    return (
      <SafeAreaProvider>
        <View style={styles.loading} testID="auth-session-loading-state">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="eav-field.db" onInit={initializeDatabase}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="inspections" />
          </Stack>
        </QueryClientProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
});
