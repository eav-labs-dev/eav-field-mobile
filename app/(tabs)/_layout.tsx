/**
 * @fileoverview Primary tab navigation for field operations.
 */

import { Redirect, Tabs } from 'expo-router';

import { useSessionStore } from '@/src/features/auth/session-store';
import { colors } from '@/src/shared/theme/tokens';

export default function TabsLayout() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: { borderTopColor: colors.border, height: 68, paddingBottom: 10, paddingTop: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview' }} />
      <Tabs.Screen name="inspections" options={{ title: 'Inspections' }} />
      <Tabs.Screen name="sync" options={{ title: 'Sync' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
