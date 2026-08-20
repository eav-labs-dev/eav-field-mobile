/**
 * @fileoverview Offline queue and connectivity status screen.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/shared/components/screen-header';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

export default function SyncScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="sync-page">
      <View style={styles.content}>
        <ScreenHeader subtitle="Drafts remain on this device until upload succeeds." title="Sync centre" />
        <View style={styles.statusCard} testID="sync-connectivity-card">
          <Text style={styles.statusLabel}>ONLINE</Text>
          <Text style={styles.statusTitle}>Connection available</Text>
          <Text style={styles.statusText}>One offline draft is ready to upload.</Text>
        </View>
        <View style={styles.queueCard} testID="sync-queue-card">
          <Text style={styles.queueTitle}>INS-2038 · Kasoa Service Centre</Text>
          <Text style={styles.queueText}>Draft · 35% complete · Saved locally</Text>
        </View>
        <Pressable style={styles.button} testID="sync-now-button">
          <Text style={styles.buttonText}>Sync now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.md },
  statusCard: { backgroundColor: colors.primary, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  statusLabel: { color: '#7EE2A8', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  statusTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  statusText: { color: '#D7E8DF', fontSize: 14 },
  queueCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  queueTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  queueText: { color: colors.textMuted, fontSize: 13 },
  button: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.sm, minHeight: 48, justifyContent: 'center' },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: '800' },
});
