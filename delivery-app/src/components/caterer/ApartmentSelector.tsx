import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Apartment = {
  id: number;
  name: string;
  address: string;
};

type ApartmentSelectorProps = {
  readonly apartments: Apartment[];
  readonly selectedApartmentId: number | null;
  readonly addDirectly: boolean;
  readonly onSelectApartment: (id: number) => void;
  readonly onToggleDirectAdd: () => void;
};

/**
 * Reusable Apartment Selector Component
 * Eliminates 57 lines of duplicate code in customer-add.tsx
 */
export default function ApartmentSelector({
  apartments,
  selectedApartmentId,
  addDirectly,
  onSelectApartment,
  onToggleDirectAdd,
}: ApartmentSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link to Apartment</Text>
      <Text style={styles.hint}>
        Select an apartment or add customer directly
      </Text>

      {apartments.length > 0 ? (
        <>
          {apartments.map((apt) => (
            <TouchableOpacity
              key={apt.id}
              style={[
                styles.apartmentOption,
                selectedApartmentId === apt.id && styles.apartmentOptionActive,
                addDirectly && styles.apartmentOptionDisabled,
              ]}
              onPress={() => onSelectApartment(apt.id)}
              disabled={addDirectly}
            >
              <View style={styles.radioCircle}>
                {selectedApartmentId === apt.id && !addDirectly && (
                  <View style={styles.radioCircleInner} />
                )}
              </View>
              <View style={styles.apartmentInfo}>
                <Text style={styles.apartmentName}>{apt.name}</Text>
                <Text style={styles.apartmentAddress}>{apt.address}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />
        </>
      ) : (
        <View style={styles.noApartmentsCard}>
          <Ionicons name="business-outline" size={32} color="#9CA3AF" />
          <Text style={styles.noApartmentsText}>No apartments created yet</Text>
        </View>
      )}

      {/* Direct Add Option */}
      <TouchableOpacity
        style={[
          styles.directOption,
          addDirectly && styles.directOptionActive,
        ]}
        onPress={onToggleDirectAdd}
      >
        <View style={styles.radioCircle}>
          {addDirectly && <View style={styles.radioCircleInner} />}
        </View>
        <View style={styles.directInfo}>
          <Text style={styles.directTitle}>Add Directly (No Apartment)</Text>
          <Text style={styles.directSubtitle}>
            Customer will be added without apartment linkage
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  apartmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  apartmentOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  apartmentOptionDisabled: {
    opacity: 0.4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  apartmentAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  directOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },
  directOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  directInfo: {
    flex: 1,
  },
  directTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  directSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  noApartmentsCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  noApartmentsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
