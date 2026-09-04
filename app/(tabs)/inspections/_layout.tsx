/**
 * @fileoverview Authentication boundary for inspection detail routes.
 */

import { Redirect, Stack } from 'expo-router';

import { useSessionStore } from '@/src/features/auth/session-store';

export default function InspectionLayout() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
