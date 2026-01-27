import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DayFilter = {
  label: string;
  value: string;
  date: Date;
};

interface DayFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDay: (day: DayFilter) => void;
  selectedDay: DayFilter;
}

export default function DayFilterModal({
  visible,
  onClose,
  onSelectDay,
  selectedDay,
}: DayFilterModalProps) {
  const [expandedWeek, setExpandedWeek] = useState(false);

  const getToday = (): DayFilter => {
    const today = new Date();
    return {
      label: 'Today',
      value: 'today',
      date: today,
    };
  };

  const getTomorrow = (): DayFilter => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      label: 'Tomorrow',
      value: 'tomorrow',
      date: tomorrow,
    };
  };

  const getWeekDays = (): DayFilter[] => {
    const days: DayFilter[] = [];
    const today = new Date();

    // Get next 7 days starting from tomorrow
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];

      days.push({
        label: dayName,
        value: `day-${i}`,
        date: date,
      });
    }

    return days;
  };

  const handleSelectDay = (day: DayFilter) => {
    onSelectDay(day);
    setExpandedWeek(false);
    onClose();
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Select Day</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsContainer}>
            {/* Today Option */}
            <TouchableOpacity
              style={[
                styles.option,
                selectedDay.value === 'today' && styles.selectedOption,
              ]}
              onPress={() => handleSelectDay(getToday())}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Today</Text>
                <Text style={styles.optionDate}>{formatDate(new Date())}</Text>
              </View>
              {selectedDay.value === 'today' && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}
            </TouchableOpacity>

            {/* Tomorrow Option */}
            <TouchableOpacity
              style={[
                styles.option,
                selectedDay.value === 'tomorrow' && styles.selectedOption,
              ]}
              onPress={() => handleSelectDay(getTomorrow())}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Tomorrow</Text>
                <Text style={styles.optionDate}>{formatDate(getTomorrow().date)}</Text>
              </View>
              {selectedDay.value === 'tomorrow' && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}
            </TouchableOpacity>

            {/* This Week Dropdown */}
            <View style={styles.weekContainer}>
              <TouchableOpacity
                style={styles.weekHeader}
                onPress={() => setExpandedWeek(!expandedWeek)}
              >
                <Text style={styles.optionLabel}>This Week</Text>
                <Ionicons
                  name={expandedWeek ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {expandedWeek && (
                <View style={styles.weekDaysContainer}>
                  {getWeekDays().map((day, index) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.weekDayOption,
                        selectedDay.value === day.value && styles.selectedOption,
                      ]}
                      onPress={() => handleSelectDay(day)}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.weekDayLabel}>{day.label}</Text>
                        <Text style={styles.optionDate}>{formatDate(day.date)}</Text>
                      </View>
                      {selectedDay.value === day.value && (
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  optionsContainer: {
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#E6F4F0',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  optionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  weekContainer: {
    marginTop: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  weekDaysContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },
  weekDayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 8,
  },
  weekDayLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
});
