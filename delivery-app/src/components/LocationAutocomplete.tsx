import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface Props {
  value: string;
  onSelect: (address: string) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ value, onSelect, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // LocationIQ API key (Free tier: 5,000 requests/day)
  const API_KEY = 'pk.b7b47c05118a2a3bdaa6b9c520516df9';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length > 2) {
        void fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400); // Debounce: wait 400ms after user stops typing

    return () => { clearTimeout(timer); };
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    if (API_KEY === null || API_KEY === undefined || API_KEY === '') {
      console.warn('⚠️ LocationIQ API key not configured. Please add your API key.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${API_KEY}&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&format=json`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        console.error('LocationIQ API error:', response.status);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onSelect(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleTextChange = (text: string) => {
    onSelect(text);
    if (text.length <= 2) {
      setShowSuggestions(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder || "Enter your address"}
          value={value}
          onChangeText={handleTextChange}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#10B981"
            style={styles.loader}
          />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsList}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.suggestionItem}
                onPress={() => { handleSelectSuggestion(item); }}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={18} color="#10B981" />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    paddingRight: 40,
  },
  loader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 250,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
});
