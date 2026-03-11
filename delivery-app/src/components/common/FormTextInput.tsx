import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface FormTextInputProps extends TextInputProps {
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
  readonly containerStyle?: ViewStyle;
  readonly required?: boolean;
}

/**
 * Reusable Form Text Input Component
 * Eliminates duplicate input styling across 10+ form screens
 *
 * @example
 * <FormTextInput
 *   label="Name"
 *   value={name}
 *   onChangeText={setName}
 *   required
 *   hint="Enter your full name"
 * />
 */
export const FormTextInput: React.FC<FormTextInputProps> = ({
  label,
  error,
  hint,
  containerStyle,
  required = false,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}

      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          textInputProps.style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
        placeholderTextColor={textInputProps.placeholderTextColor || '#9CA3AF'}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputFocused: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
