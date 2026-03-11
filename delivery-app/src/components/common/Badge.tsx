import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  readonly label: string;
  readonly variant?: BadgeVariant;
  readonly style?: ViewStyle;
  readonly textStyle?: TextStyle;
}

/**
 * Reusable Badge Component
 * Eliminates duplicate badge styling across card components
 *
 * @example
 * <Badge label="Active" variant="success" />
 * <Badge label="Pending" variant="warning" />
 * <Badge label="Error" variant="error" />
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
}) => {
  const variantStyles = {
    success: { container: styles.successBadge, text: styles.successText },
    warning: { container: styles.warningBadge, text: styles.warningText },
    error: { container: styles.errorBadge, text: styles.errorText },
    info: { container: styles.infoBadge, text: styles.infoText },
    neutral: { container: styles.neutralBadge, text: styles.neutralText },
  };

  const selectedVariant = variantStyles[variant];

  return (
    <View style={[styles.badge, selectedVariant.container, style]}>
      <Text style={[styles.badgeText, selectedVariant.text, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Success variant (green)
  successBadge: {
    backgroundColor: '#F0FDF4',
  },
  successText: {
    color: '#16A34A',
  },
  // Warning variant (yellow)
  warningBadge: {
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    color: '#CA8A04',
  },
  // Error variant (red)
  errorBadge: {
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
  },
  // Info variant (blue)
  infoBadge: {
    backgroundColor: '#EFF6FF',
  },
  infoText: {
    color: '#2563EB',
  },
  // Neutral variant (gray)
  neutralBadge: {
    backgroundColor: '#F3F4F6',
  },
  neutralText: {
    color: '#6B7280',
  },
});
