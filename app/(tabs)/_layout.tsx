/**
 * @fileoverview Primary tab navigation for field operations.
 */

import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { type ColorValue, StyleSheet, View } from 'react-native';

import { useSessionStore } from '@/src/features/auth/session-store';
import { colors } from '@/src/shared/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TabIcon = ({ color, focused, name }: { color: ColorValue; focused: boolean; name: IconName }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Ionicons color={color} name={name} size={22} />
  </View>
);

export default function TabsLayout() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { paddingTop: 7 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 76,
          paddingBottom: 9,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: 'Overview tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={focused ? 'home' : 'home-outline'} />
          ),
          title: 'Overview',
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          tabBarAccessibilityLabel: 'Inspections tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={focused ? 'clipboard' : 'clipboard-outline'}
            />
          ),
          title: 'Inspections',
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          tabBarAccessibilityLabel: 'Sync tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={focused ? 'cloud-upload' : 'cloud-upload-outline'}
            />
          ),
          title: 'Sync',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarAccessibilityLabel: 'Settings tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={focused ? 'settings' : 'settings-outline'} />
          ),
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    borderRadius: 12,
    height: 30,
    justifyContent: 'center',
    width: 44,
  },
  iconContainerActive: { backgroundColor: colors.surfaceMuted },
});
