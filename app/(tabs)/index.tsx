/**
 * @fileoverview Field officer dashboard with workload and sync summaries.
 */

import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InspectionCard } from '@/src/features/inspections/inspection-card';
import { createAssignmentRepository } from '@/src/features/inspections/assignment-repository';
import { createDraftRepository } from '@/src/features/inspections/draft-repository';
import { getInspectionSummary, mockInspections } from '@/src/features/inspections/mock-inspections';
import type { Inspection } from '@/src/features/inspections/types';
import { useSessionStore } from '@/src/features/auth/session-store';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { isDemoModeEnabled } from '@/src/shared/config/demo-mode';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

export default function DashboardScreen() {
  const database = useSQLiteContext();
  const assignmentRepository = useMemo(() => createAssignmentRepository(database), [database]);
  const draftRepository = useMemo(() => createDraftRepository(database), [database]);
  const displayName = useSessionStore((state) => state.displayName);
  const demoMode = isDemoModeEnabled();
  const [assignments, setAssignments] = useState<Inspection[]>(demoMode ? mockInspections : []);
  const [waitingDrafts, setWaitingDrafts] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([assignmentRepository.list(), draftRepository.listPending()])
        .then(([cachedAssignments, pendingDrafts]) => {
          if (!isActive) return;
          if (cachedAssignments.length > 0 || !demoMode) setAssignments(cachedAssignments);
          setWaitingDrafts(pendingDrafts.length);
        })
        .catch(() => {
          // Keep the last usable local snapshot on screen.
        });
      return () => {
        isActive = false;
      };
    }, [assignmentRepository, demoMode, draftRepository]),
  );

  const summary = getInspectionSummary(assignments);
  const firstName = displayName.trim().split(/\s+/)[0] || 'Field officer';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="dashboard-page">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          subtitle="Your assignments are available offline on this device."
          title={`Welcome, ${firstName}`}
        />

        <View style={styles.syncBanner} testID="dashboard-sync-status-card">
          <View>
            <Text style={styles.syncTitle}>Device is ready for field work</Text>
            <Text style={styles.syncText}>
              {waitingDrafts === 0
                ? 'No drafts are waiting to sync'
                : `${waitingDrafts} draft${waitingDrafts === 1 ? '' : 's'} waiting to sync`}
            </Text>
          </View>
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

        {assignments.slice(0, 2).map((inspection) => (
          <InspectionCard
            inspection={inspection}
            key={inspection.id}
            onPress={() => router.push({ pathname: '/inspections/[id]', params: { id: inspection.id } })}
          />
        ))}
        {assignments.length === 0 ? (
          <Text style={styles.emptyText}>No assignments are saved on this device.</Text>
        ) : null}
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
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metricCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flex: 1, padding: 14 },
  metricValue: { color: colors.text, fontSize: 25, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  link: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
