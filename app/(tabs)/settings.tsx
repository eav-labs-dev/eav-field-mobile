/**
 * @fileoverview Field officer profile and device settings summary.
 */

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessionStore } from '@/src/features/auth/session-store';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';
import { isDemoModeEnabled } from '@/src/shared/config/demo-mode';

export default function SettingsScreen() {
  const displayName = useSessionStore((state) => state.displayName);
  const email = useSessionStore((state) => state.email);
  const signOut = useSessionStore((state) => state.signOut);
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'FO';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="settings-page">
      <View style={styles.content}>
        <ScreenHeader subtitle="Account, device storage, and sync preferences." title="Settings" />
        <View style={styles.profileCard} testID="settings-profile-card">
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>{email}</Text>
          </View>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Offline storage</Text>
          <Text style={styles.detailValue}>Enabled on this device</Text>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>API environment</Text>
          <Text style={styles.detailValue}>
            {isDemoModeEnabled() ? 'Demo assignments enabled' : 'Configured API only'}
          </Text>
        </View>
        <Pressable onPress={() => void handleSignOut()} style={styles.signOutButton} testID="settings-sign-out-button">
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.md },
  profileCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  avatar: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 99, height: 52, justifyContent: 'center', width: 52 },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  name: { color: colors.text, fontSize: 17, fontWeight: '800' },
  role: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  detailCard: { backgroundColor: colors.surface, borderRadius: radius.sm, gap: spacing.xs, padding: spacing.md },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
  signOutButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, minHeight: 48, justifyContent: 'center', marginTop: spacing.sm },
  signOutText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
});
