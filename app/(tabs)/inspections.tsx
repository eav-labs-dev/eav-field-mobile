/**
 * @fileoverview Searchable list of assigned field inspections.
 */

import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAssignmentDownloadAdapter } from '@/src/features/inspections/assignment-adapter';
import { createAssignmentRepository } from '@/src/features/inspections/assignment-repository';
import { InspectionCard } from '@/src/features/inspections/inspection-card';
import { mockInspections } from '@/src/features/inspections/mock-inspections';
import { refreshAssignments } from '@/src/features/inspections/refresh-assignments';
import type { Inspection } from '@/src/features/inspections/types';
import { apiClient } from '@/src/shared/api/client';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { isDemoModeEnabled } from '@/src/shared/config/demo-mode';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

export default function InspectionsScreen() {
  const database = useSQLiteContext();
  const repository = useMemo(() => createAssignmentRepository(database), [database]);
  const adapter = useMemo(() => createAssignmentDownloadAdapter(apiClient), []);
  const [query, setQuery] = useState('');
  const demoMode = isDemoModeEnabled();
  const [assignments, setAssignments] = useState<Inspection[]>(demoMode ? mockInspections : []);
  const [refreshState, setRefreshState] = useState<'idle' | 'refreshing' | 'error'>('idle');

  const loadCachedAssignments = useCallback(async () => {
    try {
      const cached = await repository.list();
      if (cached.length > 0 || !demoMode) setAssignments(cached);
    } catch {
      setRefreshState('error');
    }
  }, [demoMode, repository]);

  useFocusEffect(
    useCallback(() => {
      void loadCachedAssignments();
    }, [loadCachedAssignments]),
  );

  const downloadAssignments = async () => {
    setRefreshState('refreshing');
    try {
      setAssignments(await refreshAssignments(repository, adapter));
      setRefreshState('idle');
    } catch {
      setRefreshState('error');
    }
  };

  const inspections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return assignments;
    return assignments.filter((inspection) =>
      `${inspection.reference} ${inspection.siteName} ${inspection.location}`.toLowerCase().includes(normalizedQuery),
    );
  }, [assignments, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="inspections-page">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader subtitle="Review assignments and continue saved work." title="Inspections" />
        <TextInput
          accessibilityLabel="Search inspection assignments"
          onChangeText={setQuery}
          placeholder="Search by site, location, or reference"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          testID="inspections-search-input"
          value={query}
        />
        <Pressable
          accessibilityRole="button"
          disabled={refreshState === 'refreshing'}
          onPress={() => void downloadAssignments()}
          style={styles.refreshButton}
          testID="inspections-refresh-button"
        >
          <Text style={styles.refreshButtonText}>
            {refreshState === 'refreshing' ? 'Downloading…' : 'Download latest assignments'}
          </Text>
        </Pressable>
        {refreshState === 'error' ? (
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>
            Latest assignments could not be downloaded. Showing the saved offline list.
          </Text>
        ) : null}
        {inspections.length === 0 ? (
          <Text style={styles.emptyText}>No assignments are saved on this device.</Text>
        ) : null}
        {inspections.map((inspection) => (
          <InspectionCard
            inspection={inspection}
            key={inspection.id}
            onPress={() => router.push({ pathname: '/inspections/[id]', params: { id: inspection.id } })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: 40 },
  search: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, color: colors.text, height: 44, paddingHorizontal: 12 },
  refreshButton: { alignItems: 'center', borderColor: colors.primary, borderRadius: radius.sm, borderWidth: 1, justifyContent: 'center', minHeight: 44 },
  refreshButtonText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  errorText: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
