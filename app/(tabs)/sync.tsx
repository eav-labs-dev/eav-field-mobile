/**
 * @fileoverview Local upload queue with visible retry states.
 * @remarks This screen manages persisted queue state; network transport is a separate milestone.
 */

import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createDraftRepository,
  type InspectionDraft,
} from '@/src/features/inspections/draft-repository';
import { createAssignmentRepository } from '@/src/features/inspections/assignment-repository';
import type { Inspection } from '@/src/features/inspections/types';
import { processUploadQueue, type UploadQueueSummary } from '@/src/features/sync/process-upload-queue';
import { createInspectionUploadAdapter } from '@/src/features/sync/upload-adapter';
import { apiClient } from '@/src/shared/api/client';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

type LoadState = 'loading' | 'ready' | 'error';

const statusLabels = {
  pending: 'Waiting',
  syncing: 'Uploading',
  failed: 'Needs retry',
} as const;

export default function SyncScreen() {
  const database = useSQLiteContext();
  const repository = useMemo(() => createDraftRepository(database), [database]);
  const assignmentRepository = useMemo(() => createAssignmentRepository(database), [database]);
  const uploadAdapter = useMemo(() => createInspectionUploadAdapter(apiClient), []);
  const [drafts, setDrafts] = useState<InspectionDraft[]>([]);
  const [assignments, setAssignments] = useState<Inspection[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [lastSummary, setLastSummary] = useState<UploadQueueSummary | null>(null);

  const loadQueue = useCallback(async () => {
    setLoadState('loading');
    try {
      const [pendingDrafts, cachedAssignments] = await Promise.all([
        repository.listPending(),
        assignmentRepository.list(),
      ]);
      setDrafts(pendingDrafts);
      setAssignments(cachedAssignments);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [assignmentRepository, repository]);

  useFocusEffect(
    useCallback(() => {
      void loadQueue();
    }, [loadQueue]),
  );

  const uploadMutation = useMutation({
    mutationFn: () => processUploadQueue(repository, uploadAdapter),
    onSuccess: setLastSummary,
    onSettled: () => void loadQueue(),
  });

  const retry = async (inspectionId: string) => {
    await repository.retry(inspectionId, new Date().toISOString());
    await loadQueue();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="sync-page">
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader subtitle="Drafts remain on this device until upload succeeds." title="Sync centre" />
        <View style={styles.statusCard} testID="sync-connectivity-card">
          <Text style={styles.statusLabel}>LOCAL QUEUE</Text>
          <Text style={styles.statusTitle}>
            {drafts.length === 0
              ? 'No uploads waiting'
              : `${drafts.length} upload${drafts.length === 1 ? '' : 's'} waiting`}
          </Text>
          <Text style={styles.statusText}>
            Uploads use the configured API and remain local when the server cannot be reached.
          </Text>
        </View>

        {lastSummary ? (
          <Text style={styles.summaryText} testID="sync-last-result-text">
            Last run: {lastSummary.synced} uploaded · {lastSummary.failed} failed
            {lastSummary.unresolved > 0 ? ` · ${lastSummary.unresolved} needs review` : ''}
          </Text>
        ) : null}

        {loadState === 'loading' ? <Text style={styles.emptyText}>Loading local queue…</Text> : null}
        {loadState === 'error' ? (
          <Text style={styles.errorText}>The local queue could not be loaded.</Text>
        ) : null}
        {loadState === 'ready' && drafts.length === 0 ? (
          <Text style={styles.emptyText}>Complete an inspection and choose “Queue for upload”.</Text>
        ) : null}

        {drafts.map((draft) => {
          const inspection = assignments.find((item) => item.id === draft.inspectionId);
          return (
            <View
              key={draft.inspectionId}
              style={styles.queueCard}
              testID={`sync-queue-${draft.inspectionId}-card`}
            >
              <View style={styles.queueHeader}>
                <Text style={styles.queueTitle}>
                  {inspection?.reference ?? draft.inspectionId} · {inspection?.siteName ?? 'Inspection'}
                </Text>
                <Text style={[styles.badge, draft.syncStatus === 'failed' && styles.failedBadge]}>
                  {statusLabels[draft.syncStatus as keyof typeof statusLabels]}
                </Text>
              </View>
              <Text style={styles.queueText}>
                {draft.progress}% complete · {draft.retryCount} retries
              </Text>
              {draft.lastError ? <Text style={styles.errorText}>{draft.lastError}</Text> : null}
              {draft.syncStatus === 'failed' ? (
                <Pressable
                  onPress={() => void retry(draft.inspectionId)}
                  style={styles.retryButton}
                  testID={`sync-queue-${draft.inspectionId}-retry-button`}
                >
                  <Text style={styles.retryButtonText}>Retry upload</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}

        <Pressable
          disabled={uploadMutation.isPending || !drafts.some((draft) => draft.syncStatus === 'pending')}
          onPress={() => uploadMutation.mutate()}
          style={[
            styles.button,
            (uploadMutation.isPending || !drafts.some((draft) => draft.syncStatus === 'pending')) &&
              styles.buttonDisabled,
          ]}
          testID="sync-now-button"
        >
          <Text style={styles.buttonText}>
            {uploadMutation.isPending ? 'Uploading…' : 'Sync now'}
          </Text>
        </Pressable>
        <Pressable onPress={() => void loadQueue()} style={styles.refreshButton} testID="sync-refresh-button">
          <Text style={styles.refreshButtonText}>Refresh queue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.md, paddingBottom: 48 },
  statusCard: { backgroundColor: colors.primary, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  statusLabel: { color: '#7EE2A8', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  statusTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  statusText: { color: '#D7E8DF', fontSize: 14, lineHeight: 20 },
  summaryText: { color: colors.primary, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  queueCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  queueHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  queueTitle: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '800' },
  queueText: { color: colors.textMuted, fontSize: 13 },
  badge: { backgroundColor: colors.background, borderRadius: 99, color: colors.primary, fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  failedBadge: { color: colors.danger },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  errorText: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  retryButton: { alignItems: 'center', borderColor: colors.danger, borderRadius: radius.sm, borderWidth: 1, justifyContent: 'center', minHeight: 42 },
  retryButtonText: { color: colors.danger, fontSize: 13, fontWeight: '800' },
  button: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.sm, minHeight: 48, justifyContent: 'center' },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  buttonDisabled: { opacity: 0.45 },
  refreshButton: { alignItems: 'center', justifyContent: 'center', minHeight: 42 },
  refreshButtonText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});
