import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Search, ChevronRight } from 'lucide-react-native';
import { Svg, Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import MinimalistWorldMap from './MinimalistWorldMap';
import { searchCities, getCoordsForCity } from '../../utils/geocoding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

interface CitySuggestion {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface LocationInputSimpleProps {
  onComplete: (myCity: string, partnerCity: string) => void;
  isReturningUser?: boolean;
}

/**
 * LocationInputSimple - Memory-efficient location input with static map
 * v2.7.0: Simplified version without animations to prevent memory crashes
 *
 * Changes from LocationInputPremium:
 * - NO Reanimated shared values (0 vs 7)
 * - Static map display (no camera animations)
 * - Simple marker display (no pulse animations)
 * - Instant transitions (no spring/timing animations)
 */
const LocationInputSimple: React.FC<LocationInputSimpleProps> = ({
  onComplete,
  isReturningUser = false,
}) => {
  const [step, setStep] = useState<'my' | 'partner' | 'confirm'>('my');
  const [myCity, setMyCity] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [myLocation, setMyLocation] = useState<LocationData | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<LocationData | null>(null);

  const [myCitySuggestions, setMyCitySuggestions] = useState<CitySuggestion[]>([]);
  const [partnerCitySuggestions, setPartnerCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isSearchingMy, setIsSearchingMy] = useState(false);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);

  // Convert lat/long to map coordinates
  const latLongToMapCoords = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 360;
    const y = ((90 - lat) / 180) * 180;
    return { x, y };
  };

  // City search debounce
  useEffect(() => {
    if (step === 'my' && myCity.trim().length >= 2) {
      const timer = setTimeout(async () => {
        setIsSearchingMy(true);
        try {
          const results = await searchCities(myCity);
          setMyCitySuggestions(results);
        } catch (error) {
          console.error('Search failed:', error);
        }
        setIsSearchingMy(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setMyCitySuggestions([]);
    }
  }, [myCity, step]);

  useEffect(() => {
    if (step === 'partner' && partnerCity.trim().length >= 2) {
      const timer = setTimeout(async () => {
        setIsSearchingPartner(true);
        try {
          const results = await searchCities(partnerCity);
          setPartnerCitySuggestions(results);
        } catch (error) {
          console.error('Search failed:', error);
        }
        setIsSearchingPartner(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setPartnerCitySuggestions([]);
    }
  }, [partnerCity, step]);

  const selectMyCity = (suggestion: CitySuggestion) => {
    setMyCity(suggestion.name);
    setMyLocation({
      name: suggestion.name,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setMyCitySuggestions([]);
  };

  const selectPartnerCity = (suggestion: CitySuggestion) => {
    setPartnerCity(suggestion.name);
    setPartnerLocation({
      name: suggestion.name,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setPartnerCitySuggestions([]);
  };

  const handleMyLocationConfirm = () => {
    if (!myLocation) {
      Alert.alert('Please select a location', 'Type a city name');
      return;
    }
    setStep('partner');
  };

  const handlePartnerLocationConfirm = () => {
    if (!partnerLocation) {
      Alert.alert('Please select a location', 'Type a city name');
      return;
    }
    setStep('confirm');
  };

  const handleFinalConfirm = () => {
    if (myLocation && partnerLocation) {
      onComplete(myLocation.name, partnerLocation.name);
    }
  };

  // Connection line path
  const getConnectionLinePath = () => {
    if (!myLocation || !partnerLocation) return '';

    const coords1 = latLongToMapCoords(myLocation.latitude, myLocation.longitude);
    const coords2 = latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude);

    const controlX = (coords1.x + coords2.x) / 2;
    const controlY = Math.min(coords1.y, coords2.y) - 30;

    return `M ${coords1.x} ${coords1.y} Q ${controlX} ${controlY} ${coords2.x} ${coords2.y}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Static World Map */}
      <View style={styles.mapContainer}>
        <MinimalistWorldMap
          width={SCREEN_WIDTH * 0.9}
          height={(SCREEN_WIDTH * 0.9) / 2}
          strokeColor="rgba(255, 255, 255, 0.25)"
          strokeWidth={1.5}
        />

        {/* Map overlay - NO ANIMATIONS */}
        <Svg
          width={SCREEN_WIDTH * 0.9}
          height={(SCREEN_WIDTH * 0.9) / 2}
          viewBox="0 0 360 180"
          style={StyleSheet.absoluteFill}
        >
          {/* Connection line */}
          {myLocation && partnerLocation && (
            <Path
              d={getConnectionLinePath()}
              stroke="url(#connectionGradient)"
              strokeWidth={2}
              fill="none"
              strokeDasharray="4,4"
              opacity={0.8}
            />
          )}

          <Defs>
            <SvgLinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </SvgLinearGradient>
          </Defs>

          {/* My marker - STATIC */}
          {myLocation && (
            <>
              <Circle
                cx={latLongToMapCoords(myLocation.latitude, myLocation.longitude).x}
                cy={latLongToMapCoords(myLocation.latitude, myLocation.longitude).y}
                r={6}
                fill="#06b6d4"
                opacity={0.3}
              />
              <Circle
                cx={latLongToMapCoords(myLocation.latitude, myLocation.longitude).x}
                cy={latLongToMapCoords(myLocation.latitude, myLocation.longitude).y}
                r={3}
                fill="#06b6d4"
              />
            </>
          )}

          {/* Partner marker - STATIC */}
          {partnerLocation && (
            <>
              <Circle
                cx={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).x}
                cy={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).y}
                r={6}
                fill="#ec4899"
                opacity={0.3}
              />
              <Circle
                cx={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).x}
                cy={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).y}
                r={3}
                fill="#ec4899"
              />
            </>
          )}
        </Svg>
      </View>

      {/* Input Section with Keyboard Avoidance */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <BlurView intensity={60} tint="dark" style={styles.inputSection}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={styles.title}>
            {step === 'my' ? 'Where are you?' : step === 'partner' ? "Where's your partner?" : 'Confirm locations'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'confirm' ? 'Review and continue' : 'Type a city name'}
          </Text>

          {/* City input */}
          {step !== 'confirm' && (
            <View style={styles.searchContainer}>
              <View style={styles.searchIcon}>
                <Search size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder={step === 'my' ? 'Your city...' : "Partner's city..."}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={step === 'my' ? myCity : partnerCity}
                onChangeText={step === 'my' ? setMyCity : setPartnerCity}
                autoCapitalize="words"
              />
              {(isSearchingMy || isSearchingPartner) && <ActivityIndicator size="small" color="#06b6d4" />}
            </View>
          )}

          {/* Suggestions */}
          {step === 'my' && myCitySuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {myCitySuggestions.slice(0, 4).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectMyCity(suggestion)}
                >
                  <MapPin size={16} color="#06b6d4" />
                  <Text style={styles.suggestionText}>
                    {suggestion.name}, {suggestion.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 'partner' && partnerCitySuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {partnerCitySuggestions.slice(0, 4).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectPartnerCity(suggestion)}
                >
                  <MapPin size={16} color="#ec4899" />
                  <Text style={styles.suggestionText}>
                    {suggestion.name}, {suggestion.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Confirm step */}
          {step === 'confirm' && (
            <View style={styles.confirmContainer}>
              <View style={styles.confirmCard}>
                <View style={[styles.confirmDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.confirmLabel}>You</Text>
                <Text style={styles.confirmCity}>{myLocation?.name}</Text>
              </View>
              <View style={styles.confirmCard}>
                <View style={[styles.confirmDot, { backgroundColor: '#ec4899' }]} />
                <Text style={styles.confirmLabel}>Partner</Text>
                <Text style={styles.confirmCity}>{partnerLocation?.name}</Text>
              </View>
            </View>
          )}

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (step === 'my' && !myLocation) || (step === 'partner' && !partnerLocation) ? styles.buttonDisabled : null,
            ]}
            onPress={step === 'my' ? handleMyLocationConfirm : step === 'partner' ? handlePartnerLocationConfirm : handleFinalConfirm}
            disabled={(step === 'my' && !myLocation) || (step === 'partner' && !partnerLocation)}
          >
            <LinearGradient
              colors={
                (step === 'my' && !myLocation) || (step === 'partner' && !partnerLocation)
                  ? ['#475569', '#475569']
                  : ['#06b6d4', '#a78bfa', '#ec4899']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{step === 'confirm' ? 'Start Journey' : 'Continue'}</Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    position: 'absolute',
    top: 80,
    left: SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 0.9,
    height: (SCREEN_WIDTH * 0.9) / 2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '65%', // Increased to give more space when keyboard appears
  },
  inputSection: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    flex: 1,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: -12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  suggestionsContainer: {
    gap: 8,
    marginTop: -8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },
  confirmContainer: {
    gap: 12,
  },
  confirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  confirmDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  confirmLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  confirmCity: {
    flex: 1,
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
});

export default LocationInputSimple;
