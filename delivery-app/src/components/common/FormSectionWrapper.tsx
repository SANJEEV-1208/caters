import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface FormSectionWrapperProps {
  readonly title: string;
  readonly hint?: string;
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
}

/**
 * Reusable form section wrapper with title and hint
 * Eliminates section layout duplication across 20+ files
 *
 * @example
 * <FormSectionWrapper title="Name" hint="Enter your full name">
 *   <TextInput ... />
 * </FormSectionWrapper>
 */
export const FormSectionWrapper: React.FC<FormSectionWrapperProps> = ({
  title,
  hint,
  children,
  style,
}) => {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint && <Text style={styles.sectionHint}>{hint}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
});
