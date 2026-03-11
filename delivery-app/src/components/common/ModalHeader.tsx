import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalHeaderProps {
  readonly title: string;
  readonly onClose: () => void;
  readonly icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Reusable Modal Header Component
 * Eliminates duplicate modal header patterns
 *
 * @example
 * <ModalHeader title="Payment Options" onClose={() => setVisible(false)} />
 * <ModalHeader title="Select Date" onClose={handleClose} icon="calendar" />
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  icon,
}) => {
  return (
    <View style={styles.header}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#10B981" />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close-circle" size={28} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
});
