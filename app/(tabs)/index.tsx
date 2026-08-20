/**
 * @fileoverview Field officer dashboard with workload and sync summaries.
 */

import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InspectionCard } from '@/src/features/inspections/inspection-card';
import { getInspectionSummary, mockInspections } from '@/src/features/inspections/mock-inspections';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

const summary = getInspectionSummary(mockInspections);

export default function DashboardScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="dashboard-page">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="THURSDAY · ACCRA"
          subtitle="Your assignments are available offline on this device."
          title="Good afternoon, Ama"
        />

        <View style={styles.syncBanner} testID="dashboard-sync-status-card">
          <View>
            <Text style={styles.syncTitle}>Device is ready for field work</Text>
            <Text style={styles.syncText}>Last synced 12 minutes ago · 1 draft waiting</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.metrics}>
          <View style={styles.metricCard} testID="dashboard-assigned-card">
            <Text style={styles.metricValue}>{summary.assigned}</Text>
            <Text style={styles.metricLabel}>Assigned</Text>
          </View>
          <View style={styles.metricCard} testID="dashboard-progress-card">
            <Text style={styles.metricValue}>{summary.inProgress}</Text>
            <Text style={styles.metricLabel}>In progress</Text>
          </View>
          <View style={styles.metricCard} testID="dashboard-drafts-card">
            <Text style={styles.metricValue}>{summary.drafts}</Text>
            <Text style={styles.metricLabel}>Drafts</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Priority assignments</Text>
          <Pressable onPress={() => router.push('/(tabs)/inspections')} testID="dashboard-view-all-button">
            <Text style={styles.link}>View all</Text>
          </Pressable>
        </View>

        {mockInspections.slice(0, 2).map((inspection) => (
          <InspectionCard inspection={inspection} key={inspection.id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.md, paddingBottom: 40 },
  syncBanner: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  syncTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  syncText: { color: '#D7E8DF', fontSize: 12, marginTop: spacing.xs },
  onlineDot: { backgroundColor: '#7EE2A8', borderRadius: 99, height: 12, width: 12 },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metricCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flex: 1, padding: 14 },
  metricValue: { color: colors.text, fontSize: 25, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  link: { color: colors.primary, fontSize: 14, fontWeight: '800' },
});
