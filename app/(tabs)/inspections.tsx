/**
 * @fileoverview Searchable list of assigned field inspections.
 */

import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InspectionCard } from '@/src/features/inspections/inspection-card';
import { mockInspections } from '@/src/features/inspections/mock-inspections';
import { ScreenHeader } from '@/src/shared/components/screen-header';
import { colors, radius, spacing } from '@/src/shared/theme/tokens';

export default function InspectionsScreen() {
  const [query, setQuery] = useState('');
  const inspections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mockInspections;
    return mockInspections.filter((inspection) =>
      `${inspection.reference} ${inspection.siteName} ${inspection.location}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea} testID="inspections-page">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader subtitle="Review assignments and continue saved work." title="Inspections" />
        <TextInput
          onChangeText={setQuery}
          placeholder="Search by site, location, or reference"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          testID="inspections-search-input"
          value={query}
        />
        {inspections.map((inspection) => (
          <InspectionCard inspection={inspection} key={inspection.id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: 40 },
  search: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, color: colors.text, height: 44, paddingHorizontal: 12 },
});
