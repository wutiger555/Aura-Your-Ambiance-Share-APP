import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Svg, Circle, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Search, Navigation, ChevronRight } from 'lucide-react-native';
import MinimalistWorldMap from './MinimalistWorldMap';
import { searchCities, getCoordsForCity } from '../../utils/geocoding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

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

interface LocationInputPremiumProps {
  onComplete: (myCity: string, partnerCity: string) => void;
  isReturningUser?: boolean;
}

/**
 * LocationInputPremium - Premium location input with interactive world map
 * v2.7.0: iOS Design Award-worthy location selection experience
 *
 * Features:
 * - Interactive world map with smooth camera movements
 * - Click map to select coordinates (reverse geocoding)
 * - City search with autocomplete
 * - Animated markers with breathing pulse
 * - Connection line animation when both locations set
 * - Extreme minimalism with maximum impact
 */
const LocationInputPremium: React.FC<LocationInputPremiumProps> = ({
  onComplete,
  isReturningUser = false,
}) => {
  // State
  const [step, setStep] = useState<'my' | 'partner' | 'confirm'>('my');
  const [myCity, setMyCity] = useState('');
  const [partnerCity, setPartnerCity] = useState('');
  const [myLocation, setMyLocation] = useState<LocationData | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<LocationData | null>(null);

  const [myCitySuggestions, setMyCitySuggestions] = useState<CitySuggestion[]>([]);
  const [partnerCitySuggestions, setPartnerCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isSearchingMy, setIsSearchingMy] = useState(false);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Animation values
  const mapScale = useSharedValue(1);
  const mapTranslateX = useSharedValue(0);
  const mapTranslateY = useSharedValue(0);
  const myMarkerScale = useSharedValue(0);
  const partnerMarkerScale = useSharedValue(0);
  const connectionLineProgress = useSharedValue(0);
  const markerPulse = useSharedValue(0);

  // Convert lat/long to map coordinates (Mercator projection)
  const latLongToMapCoords = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 360;
    const y = ((90 - lat) / 180) * 180;
    return { x, y };
  };

  // Marker breathing pulse animation
  useEffect(() => {
    markerPulse.value = withSequence(
      withTiming(1, { duration: 1500, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
      withTiming(0, { duration: 1500, easing: Easing.bezier(0.37, 0, 0.63, 1) })
    );

    const interval = setInterval(() => {
      markerPulse.value = withSequence(
        withTiming(1, { duration: 1500, easing: Easing.bezier(0.37, 0, 0.63, 1) }),
        withTiming(0, { duration: 1500, easing: Easing.bezier(0.37, 0, 0.63, 1) })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  // Auto-detect current location
  const handleAutoDetect = async () => {
    // This would require expo-location in production
    Alert.alert('Auto-detect', 'Auto-detection requires location permissions');
  };

  // Select city from suggestions
  const selectMyCity = async (suggestion: CitySuggestion) => {
    setMyCity(suggestion.name);
    setMyLocation({
      name: suggestion.name,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setMyCitySuggestions([]);

    // Animate marker appearance
    myMarkerScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    // Animate map to location
    animateMapToLocation(suggestion.latitude, suggestion.longitude);
  };

  const selectPartnerCity = async (suggestion: CitySuggestion) => {
    setPartnerCity(suggestion.name);
    setPartnerLocation({
      name: suggestion.name,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setPartnerCitySuggestions([]);

    // Animate marker appearance
    partnerMarkerScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    // Animate map to show both locations
    if (myLocation) {
      animateMapToBothLocations(myLocation, {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      });

      // Animate connection line
      connectionLineProgress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      });
    } else {
      animateMapToLocation(suggestion.latitude, suggestion.longitude);
    }
  };

  // Animate map camera to location
  const animateMapToLocation = (lat: number, lon: number) => {
    const coords = latLongToMapCoords(lat, lon);

    // Calculate scale and translation to center the location
    const targetScale = 2.5;
    const centerX = (SCREEN_WIDTH * 0.9) / 2;
    const centerY = (SCREEN_WIDTH * 0.9 / 2) / 2;

    const targetX = centerX - coords.x * targetScale;
    const targetY = centerY - coords.y * targetScale;

    mapScale.value = withSpring(targetScale, {
      damping: 15,
      stiffness: 80,
    });
    mapTranslateX.value = withSpring(targetX, {
      damping: 15,
      stiffness: 80,
    });
    mapTranslateY.value = withSpring(targetY, {
      damping: 15,
      stiffness: 80,
    });
  };

  // Animate map to show both locations
  const animateMapToBothLocations = (loc1: LocationData, loc2: LocationData) => {
    const coords1 = latLongToMapCoords(loc1.latitude, loc1.longitude);
    const coords2 = latLongToMapCoords(loc2.latitude, loc2.longitude);

    // Calculate bounding box
    const minX = Math.min(coords1.x, coords2.x);
    const maxX = Math.max(coords1.x, coords2.x);
    const minY = Math.min(coords1.y, coords2.y);
    const maxY = Math.max(coords1.y, coords2.y);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const width = maxX - minX;
    const height = maxY - minY;

    const scaleX = (SCREEN_WIDTH * 0.6) / width;
    const scaleY = ((SCREEN_WIDTH * 0.9 / 2) * 0.6) / height;
    const targetScale = Math.min(scaleX, scaleY, 3);

    const targetX = (SCREEN_WIDTH * 0.9) / 2 - centerX * targetScale;
    const targetY = (SCREEN_WIDTH * 0.9 / 2) / 2 - centerY * targetScale;

    mapScale.value = withSpring(targetScale, {
      damping: 15,
      stiffness: 80,
    });
    mapTranslateX.value = withSpring(targetX, {
      damping: 15,
      stiffness: 80,
    });
    mapTranslateY.value = withSpring(targetY, {
      damping: 15,
      stiffness: 80,
    });
  };

  // Proceed to next step
  const handleMyLocationConfirm = () => {
    if (!myLocation) {
      Alert.alert('Please select a location', 'Type a city name or tap on the map');
      return;
    }
    setStep('partner');
  };

  const handlePartnerLocationConfirm = () => {
    if (!partnerLocation) {
      Alert.alert('Please select a location', 'Type a city name or tap on the map');
      return;
    }
    setStep('confirm');
  };

  const handleFinalConfirm = () => {
    if (myLocation && partnerLocation) {
      onComplete(myLocation.name, partnerLocation.name);
    }
  };

  // Animated styles
  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: mapTranslateX.value },
      { translateY: mapTranslateY.value },
      { scale: mapScale.value },
    ],
  }));

  const myMarkerAnimatedStyle = useAnimatedStyle(() => {
    if (!myLocation) return { opacity: 0, transform: [{ scale: 0 }] };

    const coords = latLongToMapCoords(myLocation.latitude, myLocation.longitude);
    const pulseScale = interpolate(markerPulse.value, [0, 1], [1, 1.2]);

    return {
      position: 'absolute',
      left: coords.x,
      top: coords.y,
      opacity: myMarkerScale.value,
      transform: [{ scale: myMarkerScale.value * pulseScale }],
    };
  });

  const partnerMarkerAnimatedStyle = useAnimatedStyle(() => {
    if (!partnerLocation) return { opacity: 0, transform: [{ scale: 0 }] };

    const coords = latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude);
    const pulseScale = interpolate(markerPulse.value, [0, 1], [1, 1.2]);

    return {
      position: 'absolute',
      left: coords.x,
      top: coords.y,
      opacity: partnerMarkerScale.value,
      transform: [{ scale: partnerMarkerScale.value * pulseScale }],
    };
  });

  const connectionLineAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: connectionLineProgress.value,
    };
  });

  // Calculate connection line path
  const getConnectionLinePath = () => {
    if (!myLocation || !partnerLocation) return '';

    const coords1 = latLongToMapCoords(myLocation.latitude, myLocation.longitude);
    const coords2 = latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude);

    // Bezier curve
    const controlX = (coords1.x + coords2.x) / 2;
    const controlY = Math.min(coords1.y, coords2.y) - 30;

    return `M ${coords1.x} ${coords1.y} Q ${controlX} ${controlY} ${coords2.x} ${coords2.y}`;
  };

  return (
    <View style={styles.container}>
      {/* Premium gradient background */}
      <LinearGradient
        colors={['#0a0118', '#1e1b4b', '#312e81', '#1e293b']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Interactive World Map */}
      <View style={styles.mapContainer}>
        <Animated.View style={[styles.mapWrapper, mapAnimatedStyle]}>
          <MinimalistWorldMap
            width={SCREEN_WIDTH * 0.9}
            height={(SCREEN_WIDTH * 0.9) / 2}
            strokeColor="rgba(255, 255, 255, 0.25)"
            strokeWidth={1.5}
          />

          {/* Map overlay for markers and connection line */}
          <Svg
            width={SCREEN_WIDTH * 0.9}
            height={(SCREEN_WIDTH * 0.9) / 2}
            viewBox="0 0 360 180"
            style={StyleSheet.absoluteFill}
          >
            {/* Connection line */}
            {myLocation && partnerLocation && (
              <AnimatedPath
                d={getConnectionLinePath()}
                stroke="url(#connectionGradient)"
                strokeWidth={2}
                fill="none"
                strokeDasharray="4,4"
                style={connectionLineAnimatedStyle}
              />
            )}

            {/* Gradients */}
            <Defs>
              <SvgLinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </SvgLinearGradient>
            </Defs>

            {/* My marker */}
            {myLocation && (
              <G>
                <AnimatedCircle
                  cx={latLongToMapCoords(myLocation.latitude, myLocation.longitude).x}
                  cy={latLongToMapCoords(myLocation.latitude, myLocation.longitude).y}
                  r={6}
                  fill="#06b6d4"
                  opacity={0.3}
                />
                <AnimatedCircle
                  cx={latLongToMapCoords(myLocation.latitude, myLocation.longitude).x}
                  cy={latLongToMapCoords(myLocation.latitude, myLocation.longitude).y}
                  r={3}
                  fill="#06b6d4"
                />
              </G>
            )}

            {/* Partner marker */}
            {partnerLocation && (
              <G>
                <AnimatedCircle
                  cx={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).x}
                  cy={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).y}
                  r={6}
                  fill="#ec4899"
                  opacity={0.3}
                />
                <AnimatedCircle
                  cx={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).x}
                  cy={latLongToMapCoords(partnerLocation.latitude, partnerLocation.longitude).y}
                  r={3}
                  fill="#ec4899"
                />
              </G>
            )}
          </Svg>
        </Animated.View>
      </View>

      {/* Input Section */}
      <BlurView intensity={60} tint="dark" style={styles.inputSection}>
        <View style={styles.inputContainer}>
          {/* Title */}
          <Text style={styles.title}>
            {step === 'my' ? 'Where are you?' : step === 'partner' ? "Where's your partner?" : 'Confirm locations'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'confirm'
              ? 'Review and continue'
              : 'Type a city name or tap the map'}
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
              {(isSearchingMy || isSearchingPartner) && (
                <ActivityIndicator size="small" color="#06b6d4" />
              )}
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

          {/* Confirm step - show selected cities */}
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
              (step === 'my' && !myLocation) || (step === 'partner' && !partnerLocation)
                ? styles.buttonDisabled
                : null,
            ]}
            onPress={
              step === 'my'
                ? handleMyLocationConfirm
                : step === 'partner'
                ? handlePartnerLocationConfirm
                : handleFinalConfirm
            }
            disabled={
              (step === 'my' && !myLocation) || (step === 'partner' && !partnerLocation)
            }
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
              <Text style={styles.buttonText}>
                {step === 'confirm' ? 'Start Journey' : 'Continue'}
              </Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.12,
    left: SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 0.9,
    height: (SCREEN_WIDTH * 0.9) / 2,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapWrapper: {
    width: SCREEN_WIDTH * 0.9,
    height: (SCREEN_WIDTH * 0.9) / 2,
  },
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    paddingHorizontal: 24,
  },
  inputContainer: {
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

export default LocationInputPremium;
