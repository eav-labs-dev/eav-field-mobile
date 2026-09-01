/**
 * @fileoverview Field officer profile and device settings summary.
 */

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessionStore } from '@/src/features/auth/session-store';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

export default function SettingsScreen() {
  const displayName = useSessionStore((state) => state.displayName);
  const signOut = useSessionStore((state) => state.signOut);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="settings-page">
      <View style={styles.content}>
        <ScreenHeader subtitle="Account, device storage, and sync preferences." title="Settings" />
        <View style={styles.profileCard} testID="settings-profile-card">
          <View style={styles.avatar}><Text style={styles.avatarText}>AM</Text></View>
          <View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>Field inspection officer</Text>
          </View>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Offline storage</Text>
          <Text style={styles.detailValue}>Enabled · 1 draft stored</Text>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>API environment</Text>
          <Text style={styles.detailValue}>Portfolio demo</Text>
        </View>
        <Pressable onPress={handleSignOut} style={styles.signOutButton} testID="settings-sign-out-button">
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
