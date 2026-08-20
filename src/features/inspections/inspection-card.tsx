/**
 * @fileoverview Summary card for a field inspection assignment.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/shared/theme/tokens';

import type { Inspection, InspectionStatus } from './types';

const statusLabels: Record<InspectionStatus, string> = {
  assigned: 'Assigned',
  'in-progress': 'In progress',
  draft: 'Offline draft',
  submitted: 'Submitted',
};

type InspectionCardProps = {
  inspection: Inspection;
  onPress?: () => void;
};

export const InspectionCard = ({ inspection, onPress }: InspectionCardProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    testID={`inspections-card-${inspection.id}`}
  >
    <View style={styles.topRow}>
      <Text style={styles.reference}>{inspection.reference}</Text>
      <Text style={[styles.status, inspection.status === 'draft' && styles.draftStatus]}>
        {statusLabels[inspection.status]}
      </Text>
    </View>
    <Text style={styles.siteName}>{inspection.siteName}</Text>
    <Text style={styles.meta}>{inspection.location}</Text>
    <Text style={styles.meta}>{inspection.dueLabel}</Text>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${inspection.progress}%` }]} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  cardPressed: { backgroundColor: colors.surfaceMuted },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  reference: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  status: { backgroundColor: colors.surfaceMuted, borderRadius: 99, color: colors.primary, fontSize: 12, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  draftStatus: { color: colors.warning },
  siteName: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.xs },
  meta: { color: colors.textMuted, fontSize: 13 },
  progressTrack: { backgroundColor: colors.border, borderRadius: 99, height: 5, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.accent, height: '100%' },
});
