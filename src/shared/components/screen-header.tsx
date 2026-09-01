/**
 * @fileoverview Consistent heading block for operational screens.
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/src/shared/theme/tokens';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export const ScreenHeader = ({ eyebrow, title, subtitle }: ScreenHeaderProps) => (
  <View style={styles.container}>
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', lineHeight: 36 },
  subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
});
