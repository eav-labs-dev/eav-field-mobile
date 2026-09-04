/**
 * @fileoverview Entry route for the EAV Field application.
 * @remarks Restored sessions enter the app without exposing persisted credentials.
 */

import { Redirect } from 'expo-router';

import { useSessionStore } from '@/src/features/auth/session-store';

export default function IndexRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
