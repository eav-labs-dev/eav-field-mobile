/**
 * @fileoverview Inspection detail and offline-first multi-section form.
 * @remarks Form edits are debounced and saved to SQLite without requiring connectivity.
 */

import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createDraftRepository } from '@/src/features/inspections/draft-repository';
import { createAssignmentRepository } from '@/src/features/inspections/assignment-repository';
import {
  calculateInspectionProgress,
  emptyInspectionForm,
  normalizeInspectionForm,
  type InspectionFormAnswers,
  type SiteCondition,
} from '@/src/features/inspections/inspection-form';
import { mockInspections } from '@/src/features/inspections/mock-inspections';
import type { Inspection } from '@/src/features/inspections/types';
import { createPhotoAttachment } from '@/src/features/inspections/photo-attachment';
import { deletePersistedPhoto, persistPhotoAsset } from '@/src/features/inspections/photo-storage';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';
import { isDemoModeEnabled } from '@/src/shared/config/demo-mode';

type SaveState = 'loading' | 'ready' | 'saving' | 'saved' | 'error';
type QueueState = 'idle' | 'queueing' | 'queued' | 'error';

const conditionOptions: Array<{ label: string; value: Exclude<SiteCondition, ''> }> = [
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

export default function InspectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const database = useSQLiteContext();
  const repository = useMemo(() => createDraftRepository(database), [database]);
  const assignmentRepository = useMemo(() => createAssignmentRepository(database), [database]);
  const [inspection, setInspection] = useState<Inspection | null | undefined>(() =>
    isDemoModeEnabled() ? mockInspections.find((item) => item.id === id) : undefined,
  );
  const [assignmentLoading, setAssignmentLoading] = useState(true);
  const [answers, setAnswers] = useState<InspectionFormAnswers>(emptyInspectionForm);
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [queueState, setQueueState] = useState<QueueState>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const createdAt = useRef(new Date().toISOString());
  const editVersion = useRef(0);
  const progress = calculateInspectionProgress(answers);

  useEffect(() => {
    if (!id) return;
    let isActive = true;
    assignmentRepository
      .findById(id)
      .then((savedAssignment) => {
        if (isActive && savedAssignment) setInspection(savedAssignment);
      })
      .catch(() => {
        if (isActive) setInspection(null);
      })
      .finally(() => {
        if (isActive) setAssignmentLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [assignmentRepository, id]);

  useEffect(() => {
    if (!inspection) return;

    let isActive = true;
    repository
      .findByInspectionId(inspection.id)
      .then((draft) => {
        if (!isActive) return;
        if (draft) {
          createdAt.current = draft.createdAt;
          setAnswers(normalizeInspectionForm(draft.answers));
          if (draft.syncStatus === 'pending' || draft.syncStatus === 'syncing') {
            setQueueState('queued');
          }
        }
        setSaveState('ready');
      })
      .catch(() => {
        if (isActive) setSaveState('error');
      });

    return () => {
      isActive = false;
    };
  }, [inspection, repository]);

  useEffect(() => {
    if (!inspection || !isDirty) return;

    setSaveState('saving');
    const savingVersion = editVersion.current;
    const timeout = setTimeout(() => {
      repository
        .save({
          inspectionId: inspection.id,
          answers,
          progress,
          syncStatus: 'draft',
          retryCount: 0,
          lastError: null,
          createdAt: createdAt.current,
          updatedAt: new Date().toISOString(),
        })
        .then(() => {
          if (editVersion.current === savingVersion) {
            setIsDirty(false);
            setSaveState('saved');
          }
        })
        .catch(() => setSaveState('error'));
    }, 600);

    return () => clearTimeout(timeout);
  }, [answers, inspection, isDirty, progress, repository]);

  const updateAnswers = (update: Partial<InspectionFormAnswers>) => {
    editVersion.current += 1;
    setAnswers((current) => ({ ...current, ...update }));
    setIsDirty(true);
    setQueueState('idle');
  };

  const addPhoto = async (source: 'camera' | 'library') => {
    if (!inspection) return;

    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera permission required', 'Allow camera access to document this inspection.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });

      if (result.canceled || !result.assets[0]) return;

      const now = new Date().toISOString();
      const asset = result.assets[0];
      const photoId = `${inspection.id}-${Date.now()}`;
      const persistedAsset = await persistPhotoAsset(asset, photoId);
      updateAnswers({
        photos: [
          ...answers.photos,
          createPhotoAttachment(persistedAsset, source, photoId, now),
        ],
      });
    } catch {
      Alert.alert('Photo unavailable', 'The photo could not be attached. Your other draft changes are safe.');
    }
  };

  const removePhoto = (photoId: string) => {
    const photo = answers.photos.find((item) => item.id === photoId);
    if (photo) deletePersistedPhoto(photo.uri);
    updateAnswers({ photos: answers.photos.filter((item) => item.id !== photoId) });
  };

  const queueForUpload = async () => {
    if (!inspection || progress < 100 || isDirty) return;

    setQueueState('queueing');
    try {
      const queued = await repository.queueForUpload(inspection.id, new Date().toISOString());
      setQueueState(queued ? 'queued' : 'error');
    } catch {
      setQueueState('error');
    }
  };

  if (assignmentLoading && !inspection) {
    return (
      <SafeAreaView style={styles.safeArea} testID="inspection-detail-loading-page">
        <View style={styles.notFound}><Text style={styles.notFoundTitle}>Loading assignment…</Text></View>
      </SafeAreaView>
    );
  }

  if (!inspection) {
    return (
      <SafeAreaView style={styles.safeArea} testID="inspection-detail-not-found-page">
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Inspection not found</Text>
          <Pressable
            onPress={() => router.back()}
            style={styles.primaryButton}
            testID="inspection-detail-return-button"
          >
            <Text style={styles.primaryButtonText}>Return to inspections</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="inspection-detail-page">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} testID="inspection-detail-back-button">
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={[styles.saveState, saveState === 'error' && styles.errorText]}>
            {saveState === 'saving' ? 'Saving…' : null}
            {saveState === 'saved' ? 'Saved offline' : null}
            {saveState === 'ready' ? 'Ready offline' : null}
            {saveState === 'loading' ? 'Loading draft…' : null}
            {saveState === 'error' ? 'Draft could not be saved' : null}
          </Text>
        </View>

        <View style={styles.headerCard} testID="inspection-detail-summary-card">
          <Text style={styles.reference}>{inspection.reference}</Text>
          <Text style={styles.title}>{inspection.siteName}</Text>
          <Text style={styles.meta}>{inspection.location}</Text>
          <Text style={styles.meta}>{inspection.dueLabel}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>

        <View style={styles.sectionCard} testID="inspection-form-site-section">
          <Text style={styles.sectionEyebrow}>SECTION 1</Text>
          <Text style={styles.sectionTitle}>Site contact</Text>
          <Text style={styles.label}>Contact name</Text>
          <TextInput
            onChangeText={(contactName) => updateAnswers({ contactName })}
            placeholder="Enter the person met on site"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            testID="inspection-form-contact-name-input"
            value={answers.contactName}
          />
          <Text style={styles.label}>Was the safety briefing completed?</Text>
          <View style={styles.choiceRow}>
            {[true, false].map((value) => (
              <Pressable
                key={String(value)}
                onPress={() => updateAnswers({ safetyBriefingCompleted: value })}
                style={[
                  styles.choice,
                  answers.safetyBriefingCompleted === value && styles.choiceSelected,
                ]}
                testID={`inspection-form-safety-${value ? 'yes' : 'no'}-button`}
              >
                <Text
                  style={
                    answers.safetyBriefingCompleted === value
                      ? styles.choiceSelectedText
                      : styles.choiceText
                  }
                >
                  {value ? 'Yes' : 'No'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard} testID="inspection-form-condition-section">
          <Text style={styles.sectionEyebrow}>SECTION 2</Text>
          <Text style={styles.sectionTitle}>Site condition</Text>
          <Text style={styles.label}>Overall condition</Text>
          <View style={styles.choiceRow}>
            {conditionOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => updateAnswers({ siteCondition: option.value })}
                style={[styles.choice, answers.siteCondition === option.value && styles.choiceSelected]}
                testID={`inspection-form-condition-${option.value}-button`}
              >
                <Text
                  style={
                    answers.siteCondition === option.value
                      ? styles.choiceSelectedText
                      : styles.choiceText
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Inspection notes</Text>
          <TextInput
            multiline
            onChangeText={(notes) => updateAnswers({ notes })}
            placeholder="Record observations and follow-up work"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.notesInput]}
            testID="inspection-form-notes-input"
            textAlignVertical="top"
            value={answers.notes}
          />
        </View>

        <View style={styles.sectionCard} testID="inspection-form-photos-section">
          <Text style={styles.sectionEyebrow}>SECTION 3</Text>
          <Text style={styles.sectionTitle}>Photo evidence</Text>
          <Text style={styles.photoHint}>
            Attached photos are stored on this device and uploaded with the completed inspection.
          </Text>
          <View style={styles.choiceRow}>
            <Pressable
              onPress={() => void addPhoto('camera')}
              style={styles.secondaryButton}
              testID="inspection-form-take-photo-button"
            >
              <Text style={styles.secondaryButtonText}>Take photo</Text>
            </Pressable>
            <Pressable
              onPress={() => void addPhoto('library')}
              style={styles.secondaryButton}
              testID="inspection-form-choose-photo-button"
            >
              <Text style={styles.secondaryButtonText}>Choose photo</Text>
            </Pressable>
          </View>
          {answers.photos.length === 0 ? (
            <Text style={styles.emptyPhotos}>No photos attached.</Text>
          ) : (
            answers.photos.map((photo, index) => (
              <View key={photo.id} style={styles.photoRow} testID={`inspection-photo-${index}`}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <View style={styles.photoDetails}>
                  <Text numberOfLines={1} style={styles.photoName}>
                    {photo.fileName ?? `Inspection photo ${index + 1}`}
                  </Text>
                  <Text style={styles.photoMeta}>
                    {photo.source === 'camera' ? 'Camera' : 'Library'} · {photo.width} × {photo.height}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  onPress={() => removePhoto(photo.id)}
                  style={styles.removeButton}
                  testID={`inspection-photo-remove-${index}-button`}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable
          disabled={progress < 100 || isDirty || queueState === 'queueing' || queueState === 'queued'}
          onPress={() => void queueForUpload()}
          style={[
            styles.primaryButton,
            (progress < 100 || isDirty || queueState === 'queued') && styles.buttonDisabled,
          ]}
          testID="inspection-form-queue-upload-button"
        >
          <Text style={styles.primaryButtonText}>
            {queueState === 'queueing' ? 'Adding to queue…' : null}
            {queueState === 'queued' ? 'Queued for upload' : null}
            {queueState === 'idle' || queueState === 'error' ? 'Queue for upload' : null}
          </Text>
        </Pressable>
        {progress < 100 ? (
          <Text style={styles.queueHint}>Complete all four inspection fields before queueing.</Text>
        ) : null}
        {queueState === 'error' ? (
          <Text style={styles.errorText}>The draft could not be queued. Confirm it has finished saving.</Text>
        ) : null}

        <Text style={styles.offlineNote}>
          Changes stay on this device and are saved automatically. Queue a complete draft, then upload it from the Sync centre.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: 48 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  saveState: { color: colors.success, fontSize: 12, fontWeight: '700' },
  errorText: { color: colors.danger },
  headerCard: { backgroundColor: colors.primary, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  reference: { color: '#7EE2A8', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '800' },
  meta: { color: '#D7E8DF', fontSize: 13 },
  progressRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  progressTrack: { backgroundColor: '#426B5A', borderRadius: 99, flex: 1, height: 6, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.accent, height: '100%' },
  progressText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sectionCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  sectionEyebrow: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  input: { borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, color: colors.text, minHeight: 44, paddingHorizontal: 12 },
  notesInput: { minHeight: 112, paddingTop: 12 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, justifyContent: 'center', minHeight: 40, minWidth: 76, paddingHorizontal: 14 },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  choiceSelectedText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  photoHint: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  secondaryButton: { alignItems: 'center', borderColor: colors.primary, borderRadius: radius.sm, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14 },
  secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  emptyPhotos: { color: colors.textMuted, fontSize: 13 },
  photoRow: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  photoPreview: { backgroundColor: colors.background, borderRadius: radius.sm, height: 64, width: 64 },
  photoDetails: { flex: 1, gap: 4 },
  photoName: { color: colors.text, fontSize: 13, fontWeight: '800' },
  photoMeta: { color: colors.textMuted, fontSize: 11 },
  removeButton: { justifyContent: 'center', minHeight: 40, paddingHorizontal: spacing.sm },
  removeButtonText: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  offlineNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  notFound: { flex: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.lg },
  notFoundTitle: { color: colors.text, fontSize: 25, fontWeight: '800' },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, justifyContent: 'center', minHeight: 48 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  buttonDisabled: { opacity: 0.45 },
  queueHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
