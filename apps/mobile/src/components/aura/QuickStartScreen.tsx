import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Loader, ChevronDown, ChevronUp } from 'lucide-react-native';
import { autoDetectCity, LocationResult } from '../../utils/locationService';
import { searchCities, CitySuggestion, debounce } from '../../utils/cityAutocomplete';

interface QuickStartScreenProps {
  onComplete: (myCity: string, partnerCity: string, coupleNames?: { myName: string; partnerName: string }) => void;
}

/**
 * QuickStartScreen - Streamlined onboarding
 * v2.6.0: Single-page setup to reduce friction
 *
 * Features:
 * - Auto-detect user's location (one tap)
 * - Manual input for partner's city
 * - Optional: Expand personalization (names, emojis)
 * - Aura narrative: "Two worlds, about to connect..."
 */
export default function QuickStartScreen({ onComplete }: QuickStartScreenProps) {
  // Location states
  const [myCity, setMyCity] = useState('');
  const [myLocation, setMyLocation] = useState<LocationResult | null>(null);
  const [partnerCity, setPartnerCity] = useState('');

  // Auto-detect states
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState('');

  // City autocomplete states
  const [myCitySuggestions, setMyCitySuggestions] = useState<CitySuggestion[]>([]);
  const [partnerCitySuggestions, setPartnerCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isSearchingMy, setIsSearchingMy] = useState(false);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [activeInput, setActiveInput] = useState<'my' | 'partner' | null>(null);

  // Optional personalization
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Debounced search for city suggestions
  const debouncedSearchMy = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setMyCitySuggestions([]);
        setIsSearchingMy(false);
        return;
      }
      setIsSearchingMy(true);
      const suggestions = await searchCities(query);
      setMyCitySuggestions(suggestions);
      setIsSearchingMy(false);
    }, 500)
  ).current;

  const debouncedSearchPartner = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setPartnerCitySuggestions([]);
        setIsSearchingPartner(false);
        return;
      }
      setIsSearchingPartner(true);
      const suggestions = await searchCities(query);
      setPartnerCitySuggestions(suggestions);
      setIsSearchingPartner(false);
    }, 500)
  ).current;

  // Handle city input changes with autocomplete
  const handleMyCityChange = (text: string) => {
    setMyCity(text);
    setMyLocation(null); // Clear auto-detected location if user types
    setActiveInput('my');
    if (text.trim()) {
      debouncedSearchMy(text);
    } else {
      setMyCitySuggestions([]);
    }
  };

  const handlePartnerCityChange = (text: string) => {
    setPartnerCity(text);
    setActiveInput('partner');
    if (text.trim()) {
      debouncedSearchPartner(text);
    } else {
      setPartnerCitySuggestions([]);
    }
  };

  // Handle suggestion selection
  const selectMyCitySuggestion = (suggestion: CitySuggestion) => {
    setMyCity(suggestion.name);
    setMyLocation({
      city: suggestion.name,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setMyCitySuggestions([]);
    setActiveInput(null);
    Keyboard.dismiss();
  };

  const selectPartnerCitySuggestion = (suggestion: CitySuggestion) => {
    setPartnerCity(suggestion.name);
    setPartnerCitySuggestions([]);
    setActiveInput(null);
    Keyboard.dismiss();
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setDetectionError('');

    try {
      const result = await autoDetectCity();

      if (result) {
        setMyCity(result.city);
        setMyLocation(result);
        Alert.alert(
          '📍 Location Detected',
          `We found you in ${result.city}. Is this correct?`,
          [
            {
              text: 'Change',
              style: 'cancel',
              onPress: () => {
                setMyCity('');
                setMyLocation(null);
              },
            },
            { text: 'Correct', style: 'default' },
          ]
        );
      } else {
        setDetectionError('Unable to detect location. Please enter manually.');
        Alert.alert(
          'Location Detection Failed',
          'We couldn\'t detect your location. Please enter your city manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setDetectionError('Auto-detection failed. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleConnect = () => {
    // Validation
    if (!myCity.trim()) {
      Alert.alert('Missing Information', 'Please enter or detect your location');
      return;
    }

    if (!partnerCity.trim()) {
      Alert.alert('Missing Information', 'Please enter your partner\'s city');
      return;
    }

    // Optional: Pass couple names if provided
    const coupleNames = myName.trim() && partnerName.trim()
      ? { myName: myName.trim(), partnerName: partnerName.trim() }
      : undefined;

    onComplete(myCity, partnerCity, coupleNames);
  };

  return (
    <LinearGradient
      colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header - Aura narrative */}
          <View style={styles.header}>
            <Text style={styles.title}>Two worlds,{'\n'}one atmosphere</Text>
            <Text style={styles.subtitle}>Let's connect your skies</Text>

            {/* Visual: Two glowing markers */}
            <View style={styles.markers}>
              <View style={[styles.marker, styles.markerCyan]}>
                <View style={styles.markerDot} />
              </View>
              <View style={styles.connectionLine} />
              <View style={[styles.marker, styles.markerPink]}>
                <View style={styles.markerDot} />
              </View>
            </View>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            <BlurView intensity={60} tint="dark" style={styles.cardBlur}>
              <View style={styles.cardContent}>
                {/* My Location */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Where are you?</Text>

                  {myCity ? (
                    <View style={styles.detectedLocation}>
                      <MapPin size={18} color="#06b6d4" />
                      <Text style={styles.detectedText}>{myCity}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setMyCity('');
                          setMyLocation(null);
                        }}
                        style={styles.changeButton}
                      >
                        <Text style={styles.changeButtonText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.autoDetectButton}
                        onPress={handleAutoDetect}
                        disabled={isDetecting}
                      >
                        {isDetecting ? (
                          <ActivityIndicator size="small" color="#06b6d4" />
                        ) : (
                          <MapPin size={20} color="#06b6d4" />
                        )}
                        <Text style={styles.autoDetectText}>
                          {isDetecting ? 'Detecting...' : 'Auto-detect my location'}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.orText}>or</Text>

                      <View>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your city... (e.g., Taipei)"
                          placeholderTextColor="rgba(255, 255, 255, 0.3)"
                          value={myCity}
                          onChangeText={handleMyCityChange}
                          onFocus={() => setActiveInput('my')}
                          autoCapitalize="words"
                          returnKeyType="next"
                        />
                        {isSearchingMy && (
                          <View style={styles.searchingIndicator}>
                            <ActivityIndicator size="small" color="#06b6d4" />
                          </View>
                        )}
                      </View>

                      {/* My City Suggestions Dropdown */}
                      {activeInput === 'my' && myCitySuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                          <BlurView intensity={80} tint="dark" style={styles.suggestionsBlur}>
                            <FlatList
                              data={myCitySuggestions}
                              keyExtractor={(item, index) => `${item.name}-${index}`}
                              renderItem={({ item }) => (
                                <TouchableOpacity
                                  style={styles.suggestionItem}
                                  onPress={() => selectMyCitySuggestion(item)}
                                >
                                  <MapPin size={14} color="#06b6d4" />
                                  <View style={styles.suggestionTextContainer}>
                                    <Text style={styles.suggestionName}>{item.name}</Text>
                                    <Text style={styles.suggestionCountry}>{item.country}</Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                            />
                          </BlurView>
                        </View>
                      )}
                    </>
                  )}

                  {detectionError ? (
                    <Text style={styles.errorText}>{detectionError}</Text>
                  ) : null}
                </View>

                <View style={styles.divider} />

                {/* Partner's Location */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Where is your person?</Text>
                  <View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter their city... (e.g., Tokyo)"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={partnerCity}
                      onChangeText={handlePartnerCityChange}
                      onFocus={() => setActiveInput('partner')}
                      autoCapitalize="words"
                      returnKeyType="done"
                      onSubmitEditing={handleConnect}
                    />
                    {isSearchingPartner && (
                      <View style={styles.searchingIndicator}>
                        <ActivityIndicator size="small" color="#ec4899" />
                      </View>
                    )}
                  </View>

                  {/* Partner City Suggestions Dropdown */}
                  {activeInput === 'partner' && partnerCitySuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <BlurView intensity={80} tint="dark" style={styles.suggestionsBlur}>
                        <FlatList
                          data={partnerCitySuggestions}
                          keyExtractor={(item, index) => `${item.name}-${index}`}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.suggestionItem}
                              onPress={() => selectPartnerCitySuggestion(item)}
                            >
                              <MapPin size={14} color="#ec4899" />
                              <View style={styles.suggestionTextContainer}>
                                <Text style={styles.suggestionName}>{item.name}</Text>
                                <Text style={styles.suggestionCountry}>{item.country}</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        />
                      </BlurView>
                    </View>
                  )}
                </View>

                {/* Optional: Personalization */}
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setShowPersonalization(!showPersonalization)}
                >
                  {showPersonalization ? (
                    <ChevronUp size={18} color="rgba(255, 255, 255, 0.5)" />
                  ) : (
                    <ChevronDown size={18} color="rgba(255, 255, 255, 0.5)" />
                  )}
                  <Text style={styles.expandText}>
                    {showPersonalization ? 'Hide' : 'Add names (optional)'}
                  </Text>
                </TouchableOpacity>

                {showPersonalization && (
                  <View style={styles.personalizationSection}>
                    <View style={styles.divider} />
                    <TextInput
                      style={styles.input}
                      placeholder="Your name..."
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={myName}
                      onChangeText={setMyName}
                      autoCapitalize="words"
                    />
                    <TextInput
                      style={[styles.input, { marginTop: 12 }]}
                      placeholder="Partner's name..."
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={partnerName}
                      onChangeText={setPartnerName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {/* Connect Button */}
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    (!myCity || !partnerCity) && styles.connectButtonDisabled,
                  ]}
                  onPress={handleConnect}
                  disabled={!myCity || !partnerCity}
                >
                  <LinearGradient
                    colors={
                      myCity && partnerCity
                        ? ['#06b6d4', '#a78bfa', '#ec4899']
                        : ['#334155', '#475569']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.connectButtonGradient}
                  >
                    <Text style={styles.connectButtonText}>Connect Our Worlds</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          {/* Footer hint */}
          <Text style={styles.footerHint}>
            You can always personalize more in settings later
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Visual markers
  markers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCyan: {
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
  },
  markerPink: {
    backgroundColor: 'rgba(236, 72, 153, 0.3)',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  connectionLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Card
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    padding: 20,
  },
  // Sections
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  // Auto-detect
  autoDetectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  autoDetectText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#06b6d4',
  },
  detectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  detectedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  changeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  changeButtonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  orText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginVertical: 12,
  },
  // Input
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 15,
    color: 'white',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  // Personalization
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 12,
  },
  expandText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  personalizationSection: {
    marginTop: 8,
  },
  // Connect button
  connectButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
  },
  connectButtonDisabled: {
    opacity: 0.5,
  },
  connectButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  // Footer
  footerHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  // Autocomplete suggestions
  searchingIndicator: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 200,
  },
  suggestionsBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
  },
  suggestionCountry: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
