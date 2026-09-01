/**
 * @fileoverview Root navigation and application providers for EAV Field.
 * @remarks Keeps shared query state and status-bar configuration in one place.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrateDatabase } from '@/src/shared/database/migrations';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="eav-field.db" onInit={migrateDatabase}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
