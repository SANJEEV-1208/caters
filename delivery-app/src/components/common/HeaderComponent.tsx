import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface HeaderComponentProps {
  readonly title: string;
  readonly showBack?: boolean;
  readonly onBackPress?: () => void;
  readonly rightComponent?: React.ReactNode;
}

/**
 * Reusable header component with back button
 * Eliminates header duplication across 29+ files
 *
 * @example
 * <HeaderComponent title="Screen Title" />
 * <HeaderComponent title="Screen Title" showBack={false} />
 * <HeaderComponent title="Screen Title" rightComponent={<CustomButton />} />
 */
export const HeaderComponent: React.FC<HeaderComponentProps> = ({
  title,
  showBack = true,
  onBackPress,
  rightComponent,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.headerTitle}>{title}</Text>

      {rightComponent ? (
        <View style={styles.rightComponentContainer}>{rightComponent}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 24,
  },
  rightComponentContainer: {
    minWidth: 24,
    alignItems: 'flex-end',
  },
});
